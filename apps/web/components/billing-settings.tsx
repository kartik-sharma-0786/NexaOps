"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/language-context";

type BillingStatus = {
  plan: "FREE" | "PRO";
  currentPeriodEnd: string | null;
  configured: boolean;
  hasCustomer: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function BillingSettings() {
  const { data: session } = useSession();
  const { t, locale } = useLanguage();
  const user = session?.user as { jwt?: string } | undefined;
  const jwt = user?.jwt;

  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    // Stripe redirects back with ?billing=success|cancelled
    const flag = new URLSearchParams(window.location.search).get("billing");
    if (flag === "success") {
      setNotice({ kind: "ok", text: t.billing.success });
    } else if (flag === "cancelled") {
      setNotice({ kind: "error", text: t.billing.cancelled });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!jwt) return;
    fetch(`${API_URL}/billing`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then(async (res) => {
        if (res.ok) setStatus(await res.json());
      })
      .catch(() => {});
  }, [jwt]);

  const startSession = async (path: "checkout" | "portal") => {
    if (!jwt) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`${API_URL}/billing/${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const body = await res.json();
      if (res.ok && body.url) {
        window.location.href = body.url;
        return;
      }
      setNotice({
        kind: "error",
        text: body.message ?? t.team.errorGeneric,
      });
    } catch {
      setNotice({ kind: "error", text: t.team.errorGeneric });
    } finally {
      setBusy(false);
    }
  };

  if (!status) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-100 dark:border-gray-700 md:col-span-2">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
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
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t.billing.currentPlan}
          </p>
          <p className="mt-1 flex items-center gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                status.plan === "PRO"
                  ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {status.plan === "PRO" ? t.billing.pro : t.billing.free}
            </span>
            {status.plan === "PRO" && status.currentPeriodEnd && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t.billing.renews}{" "}
                {new Date(status.currentPeriodEnd).toLocaleDateString(locale)}
              </span>
            )}
          </p>
        </div>

        <div>
          {!status.configured ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.billing.notConfigured}
            </p>
          ) : status.plan === "FREE" ? (
            <button
              type="button"
              onClick={() => startSession("checkout")}
              disabled={busy}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {busy ? t.billing.redirecting : t.billing.upgrade}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startSession("portal")}
              disabled={busy}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              {busy ? t.billing.redirecting : t.billing.manage}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
