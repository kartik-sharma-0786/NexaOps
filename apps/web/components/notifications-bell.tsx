"use client";

import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const MAX_ITEMS = 20;

type Notice = {
  key: string;
  incidentId: string;
  text: string;
  severity?: string;
  at: number;
  read: boolean;
};

const SEV_DOT: Record<string, string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-blue-400",
};

function timeAgo(at: number): string {
  const mins = Math.floor((Date.now() - at) / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
}

export function NotificationsBell({
  align = "right",
}: {
  align?: "left" | "right";
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const jwt = (session?.user as { jwt?: string } | undefined)?.jwt;

  const [items, setItems] = useState<Notice[]>([]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!jwt) return;
    const socket = io(API_URL, { auth: { token: jwt } });

    const push = (n: Omit<Notice, "key" | "at" | "read">) =>
      setItems((prev) =>
        [
          { ...n, key: `${n.incidentId}-${Date.now()}`, at: Date.now(), read: false },
          ...prev,
        ].slice(0, MAX_ITEMS),
      );

    socket.on(
      "incidentCreated",
      (inc: { id: string; title: string; severity: string }) => {
        push({
          incidentId: inc.id,
          text: `New incident: ${inc.title}`,
          severity: inc.severity,
        });
      },
    );
    socket.on(
      "incidentUpdated",
      (inc: { id: string; title: string; severity: string; status: string }) => {
        push({
          incidentId: inc.id,
          text: `${inc.title} — ${inc.status}`,
          severity: inc.severity,
        });
      },
    );
    return () => {
      socket.disconnect();
    };
  }, [jwt]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = items.filter((i) => !i.read).length;

  const openItem = (n: Notice) => {
    setItems((prev) =>
      prev.map((i) => (i.key === n.key ? { ...i, read: true } : i)),
    );
    setOpen(false);
    router.push(`/dashboard/incidents/${n.incidentId}`);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute top-10 z-50 w-80 max-w-[85vw] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
              Notifications
            </p>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setItems((prev) => prev.map((i) => ({ ...i, read: true })))
                }
                className="text-[11px] font-medium text-indigo-500 hover:text-indigo-600"
              >
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-slate-400">
              No notifications yet — incident activity shows up here live.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
              {items.map((n) => (
                <li key={n.key}>
                  <button
                    type="button"
                    onClick={() => openItem(n)}
                    className={`w-full text-left px-4 py-2.5 flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                      n.read ? "opacity-60" : ""
                    }`}
                  >
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                        SEV_DOT[n.severity ?? ""] ?? "bg-slate-300"
                      }`}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-xs text-slate-700 dark:text-slate-200 truncate">
                        {n.text}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {timeAgo(n.at)} ago
                      </span>
                    </span>
                    {!n.read && (
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
