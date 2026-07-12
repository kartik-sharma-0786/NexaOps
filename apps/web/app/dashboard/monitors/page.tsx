"use client";

import { Globe, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { PageSkeleton } from "../../../components/skeleton";
import { canManageTeam } from "../../../lib/roles";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Monitor = {
  id: string;
  name: string;
  url: string;
  intervalMinutes: number;
  enabled: boolean;
  isPublic: boolean;
  status: "UP" | "DOWN" | "PENDING";
  lastCheckedAt: string | null;
  lastResponseMs: number | null;
  lastError: string | null;
};

const STATUS_STYLE: Record<
  Monitor["status"],
  { dot: string; label: string; text: string }
> = {
  UP: { dot: "bg-emerald-500", label: "Up", text: "text-emerald-600 dark:text-emerald-400" },
  DOWN: { dot: "bg-red-500 animate-pulse", label: "Down", text: "text-red-600 dark:text-red-400" },
  PENDING: { dot: "bg-slate-300 dark:bg-slate-600", label: "Pending", text: "text-slate-400" },
};

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}

export default function MonitorsPage() {
  const { data: session } = useSession();
  const user = session?.user as { jwt?: string; role?: string } | undefined;
  const canEdit = canManageTeam(user?.role);

  const [items, setItems] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [interval, setIntervalMin] = useState(5);
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.jwt) return;
    try {
      const res = await fetch(`${API_URL}/monitors`, {
        headers: { Authorization: `Bearer ${user.jwt}` },
      });
      if (res.ok) setItems(await res.json());
    } catch {
      // keep current data on transient errors
    } finally {
      setLoading(false);
    }
  }, [user?.jwt]);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 30_000);
    return () => clearInterval(t);
  }, [load]);

  const addMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.jwt) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/monitors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.jwt}`,
        },
        body: JSON.stringify({ name, url, intervalMinutes: interval, isPublic }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(
          Array.isArray(body?.message) ? body.message.join(", ") : body?.message ?? "Failed to add monitor",
        );
        return;
      }
      setName("");
      setUrl("");
      await load();
    } catch {
      setError("Network error — try again");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (m: Monitor) => {
    if (!user?.jwt) return;
    await fetch(`${API_URL}/monitors/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.jwt}` },
      body: JSON.stringify({ enabled: !m.enabled }),
    }).catch(() => {});
    await load();
  };

  const remove = async (m: Monitor) => {
    if (!user?.jwt) return;
    if (!window.confirm(`Delete monitor "${m.name}"?`)) return;
    await fetch(`${API_URL}/monitors/${m.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.jwt}` },
    }).catch(() => {});
    await load();
  };

  if (loading) return <PageSkeleton />;

  const downCount = items.filter((m) => m.enabled && m.status === "DOWN").length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
          Operations
        </p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Uptime Monitors
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          NexaOps checks these URLs and opens an incident automatically when one
          goes down — it auto-resolves on recovery.
        </p>
      </div>

      {/* Summary strip */}
      {items.length > 0 && (
        <div
          className={`rounded-xl px-5 py-4 border flex items-center gap-3 ${
            downCount > 0
              ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
              : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${downCount > 0 ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`}
          />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {downCount > 0
              ? `${downCount} monitor${downCount > 1 ? "s" : ""} down`
              : "All systems operational"}
            <span className="text-slate-400 font-normal ml-2">
              {items.filter((m) => m.enabled).length} active check
              {items.filter((m) => m.enabled).length === 1 ? "" : "s"}
            </span>
          </p>
        </div>
      )}

      {/* Add form */}
      {canEdit && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            Add Monitor
          </h2>
          {error && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
          <form onSubmit={addMonitor} className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_auto_auto] gap-2">
            <input
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="API server"
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
            />
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/health"
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
            />
            <select
              value={interval}
              onChange={(e) => setIntervalMin(Number(e.target.value))}
              aria-label="Check interval"
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
            >
              {[1, 5, 10, 15, 30, 60].map((m) => (
                <option key={m} value={m}>every {m}m</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              {saving ? "Adding…" : "Add"}
            </button>
          </form>
          <label className="mt-3 flex items-center gap-2 text-xs text-slate-500 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30"
            />
            Show on public status page
          </label>
        </div>
      )}

      {/* Monitor list */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Globe className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">
              No monitors yet. Add your first URL above — your API, your site,
              anything with an HTTP endpoint.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((m) => {
              const style = STATUS_STYLE[m.status] ?? STATUS_STYLE.PENDING;
              return (
                <li key={m.id} className={`px-4 sm:px-5 py-4 ${!m.enabled ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${style.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {m.name}
                        </p>
                        <span className={`text-xs font-semibold ${style.text}`}>
                          {m.enabled ? style.label : "Paused"}
                        </span>
                        {m.isPublic && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400">
                            public
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{m.url}</p>
                      {m.status === "DOWN" && m.lastError && (
                        <p className="text-xs text-red-500 mt-0.5 truncate">{m.lastError}</p>
                      )}
                    </div>
                    <div className="hidden sm:block text-right shrink-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {m.lastResponseMs != null ? `${m.lastResponseMs}ms` : "—"}
                      </p>
                      <p className="text-[11px] text-slate-400 tabular-nums">
                        {timeAgo(m.lastCheckedAt)} · every {m.intervalMinutes}m
                      </p>
                    </div>
                    {canEdit && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggle(m)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            m.enabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                          }`}
                          aria-label={m.enabled ? "Pause monitor" : "Resume monitor"}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              m.enabled ? "translate-x-[18px]" : "translate-x-[3px]"
                            }`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(m)}
                          aria-label="Delete monitor"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
