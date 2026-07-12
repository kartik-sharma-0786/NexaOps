"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/language-context";

type BillingStatus = {
  plan: "FREE" | "PRO";
  currentPeriodEnd: string | null;
  configured: boolean;
  hasSubscription: boolean;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function BillingSettings() {
  const { data: session } = useSession();
  const { t, locale } = useLanguage();
  const user = session?.user as
    | { jwt?: string; email?: string; name?: string }
    | undefined;
  const jwt = user?.jwt;

  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);

  const refreshStatus = async () => {
    if (!jwt) return;
    try {
      const res = await fetch(`${API_URL}/billing`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        setStatus(await res.json());
        setLoadFailed(false);
      }
    } catch {
      // handled by the retry loop / retry button
    }
  };

  useEffect(() => {
    if (!jwt) return;
    let cancelled = false;
    // Retry through API cold starts (Render free tier can take ~60s to wake):
    // 6 attempts, 8s apart, then surface a visible error instead of vanishing.
    void (async () => {
      for (let attempt = 0; attempt < 6 && !cancelled; attempt++) {
        try {
          const res = await fetch(`${API_URL}/billing`, {
            headers: { Authorization: `Bearer ${jwt}` },
          });
          if (res.ok) {
            if (!cancelled) setStatus(await res.json());
            return;
          }
        } catch {
          // transient failure — keep retrying
        }
        await new Promise((r) => setTimeout(r, 8000));
      }
      if (!cancelled) setLoadFailed(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwt]);

  const showError = async (res: Response) => {
    try {
      const body = await res.json();
      setNotice({
        kind: "error",
        text: Array.isArray(body.message)
          ? body.message.join(", ")
          : (body.message ?? t.team.errorGeneric),
      });
    } catch {
      setNotice({ kind: "error", text: t.team.errorGeneric });
    }
  };

  const upgrade = async () => {
    if (!jwt) return;
    setBusy(true);
    setNotice(null);
    try {
      const [checkoutRes, scriptLoaded] = await Promise.all([
        fetch(`${API_URL}/billing/checkout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${jwt}` },
        }),
        loadRazorpayScript(),
      ]);

      if (!checkoutRes.ok) {
        await showError(checkoutRes);
        return;
      }
      if (!scriptLoaded || !window.Razorpay) {
        setNotice({ kind: "error", text: t.team.errorGeneric });
        return;
      }

      const { subscriptionId, keyId } = await checkoutRes.json();

      const razorpay = new window.Razorpay({
        key: keyId,
        subscription_id: subscriptionId,
        name: "NexaOps",
        description: "NexaOps Pro — ₹1,000/mo",
        prefill: { email: user?.email, name: user?.name },
        theme: { color: "#4f46e5" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_subscription_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch(`${API_URL}/billing/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify(response),
          });
          if (verifyRes.ok) {
            setNotice({ kind: "ok", text: t.billing.success });
            await refreshStatus();
          } else {
            await showError(verifyRes);
          }
        },
        modal: {
          ondismiss: () => setNotice({ kind: "error", text: t.billing.cancelled }),
        },
      });
      razorpay.open();
    } catch {
      setNotice({ kind: "error", text: t.team.errorGeneric });
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!jwt || !window.confirm(t.billing.confirmCancel)) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`${API_URL}/billing/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) {
        await showError(res);
        return;
      }
      await refreshStatus();
    } catch {
      setNotice({ kind: "error", text: t.team.errorGeneric });
    } finally {
      setBusy(false);
    }
  };

  if (!status) {
    return (
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 border border-slate-100 dark:border-slate-700 md:col-span-2">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
          {t.billing.title}
        </h2>
        {loadFailed ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Couldn&apos;t load billing — the server may be waking up.
            </p>
            <button
              type="button"
              onClick={() => {
                setLoadFailed(false);
                void refreshStatus();
              }}
              className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-8 w-40 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 border border-slate-100 dark:border-slate-700 md:col-span-2">
      <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
        {t.billing.title}
      </h2>

      {notice && (
        <div
          className={`mb-4 p-3 rounded-md text-sm ${
            notice.kind === "ok"
              ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t.billing.currentPlan}
          </p>
          <p className="mt-1 flex items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                status.plan === "PRO"
                  ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
              }`}
            >
              {status.plan === "PRO" ? t.billing.pro : t.billing.free}
            </span>
            {status.plan === "PRO" && status.currentPeriodEnd && (
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {t.billing.renews}{" "}
                {new Date(status.currentPeriodEnd).toLocaleDateString(locale)}
              </span>
            )}
          </p>
        </div>

        <div>
          {!status.configured ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.billing.notConfigured}
            </p>
          ) : status.plan === "FREE" ? (
            <button
              type="button"
              onClick={upgrade}
              disabled={busy}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {busy ? t.billing.redirecting : t.billing.upgrade}
            </button>
          ) : (
            <button
              type="button"
              onClick={cancel}
              disabled={busy}
              className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
            >
              {busy ? t.billing.redirecting : t.billing.cancelSubscription}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
