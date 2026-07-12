"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Policy = {
  id: string;
  name: string;
  severity: string;
  delayMinutes: number;
  notifyRole: string;
  enabled: boolean;
};

type FormState = {
  name: string;
  severity: string;
  delayMinutes: number;
  notifyRole: string;
};

const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const ROLES = ["OWNER", "ADMIN", "RESPONDER"];

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  LOW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export function EscalationSettings() {
  const { data: session } = useSession();
  const user = session?.user as { jwt?: string; role?: string } | undefined;

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "Default",
    severity: "CRITICAL",
    delayMinutes: 15,
    notifyRole: "OWNER",
  });

  const canEdit = user?.role === "OWNER" || user?.role === "ADMIN";

  const load = () => {
    if (!user?.jwt) return;
    fetch(`${API_URL}/escalation-policies`, {
      headers: { Authorization: `Bearer ${user.jwt}` },
    })
      .then(async (res) => {
        if (res.ok) setPolicies(await res.json());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [user?.jwt]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.jwt) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/escalation-policies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.jwt}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setAdding(false);
        setForm({ name: "Default", severity: "CRITICAL", delayMinutes: 15, notifyRole: "OWNER" });
        load();
      }
    } catch (_err) {
      // network/server error — setSaving resets in finally
    } finally { setSaving(false); }
  };

  const toggleEnabled = async (policy: Policy) => {
    if (!user?.jwt) return;
    await fetch(`${API_URL}/escalation-policies/${policy.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.jwt}`,
      },
      body: JSON.stringify({ enabled: !policy.enabled }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!user?.jwt) return;
    await fetch(`${API_URL}/escalation-policies/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.jwt}` },
    });
    load();
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 border border-slate-100 dark:border-slate-700 md:col-span-2">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
        <div>
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">
            Escalation Policies
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-notify team members when a critical incident remains unresolved.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setAdding((v) => !v)}
            className="text-sm px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
          >
            {adding ? "Cancel" : "+ Add Policy"}
          </button>
        )}
      </div>

      {/* Add policy form */}
      {adding && (
        <form
          onSubmit={handleCreate}
          className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 space-y-3"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full text-sm rounded-md border border-slate-300 dark:border-slate-600 p-1.5 bg-white dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Severity
              </label>
              <select
                value={form.severity}
                onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
                className="w-full text-sm rounded-md border border-slate-300 dark:border-slate-600 p-1.5 bg-white dark:bg-slate-700 dark:text-white"
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Delay (min)
              </label>
              <input
                type="number"
                min={1}
                max={1440}
                value={form.delayMinutes}
                onChange={(e) => setForm((f) => ({ ...f, delayMinutes: Number(e.target.value) }))}
                className="w-full text-sm rounded-md border border-slate-300 dark:border-slate-600 p-1.5 bg-white dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Notify Role
              </label>
              <select
                value={form.notifyRole}
                onChange={(e) => setForm((f) => ({ ...f, notifyRole: e.target.value }))}
                className="w-full text-sm rounded-md border border-slate-300 dark:border-slate-600 p-1.5 bg-white dark:bg-slate-700 dark:text-white"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="text-sm px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-50"
            >
              {saving ? "Saving…" : "Create Policy"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-400 py-4 text-center">Loading…</p>
      ) : policies.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center italic">
          No escalation policies yet. Add one to auto-escalate unresolved incidents.
        </p>
      ) : (
        <div className="space-y-2">
          {policies.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                p.enabled
                  ? "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/30"
                  : "border-dashed border-slate-200 dark:border-slate-700 opacity-60"
              }`}
            >
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SEVERITY_COLORS[p.severity] ?? ""}`}
              >
                {p.severity}
              </span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 flex-1">
                {p.name}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                after <strong>{p.delayMinutes}m</strong> → notify <strong>{p.notifyRole}</strong>
              </span>
              {canEdit && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleEnabled(p)}
                    title={p.enabled ? "Disable" : "Enable"}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      p.enabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        p.enabled ? "translate-x-4" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
