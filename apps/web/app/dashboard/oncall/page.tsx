"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Member = { userId: string; name: string; email: string };
type Override = { id: string; userId: string; user: { name: string; email: string }; startsAt: string; endsAt: string };
type Schedule = {
  id: string;
  name: string;
  memberOrder: string[];
  shiftDays: number;
  startDate: string;
  currentUserId: string | null;
  overrides: Override[];
};
type CurrentOnCall = {
  userId: string;
  user: { id: string; name: string; email: string } | null;
  via: "rotation" | "override";
} | null;

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function OnCallPage() {
  const { data: session } = useSession();
  const user = session?.user as { jwt?: string; role?: string } | undefined;

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [current, setCurrent] = useState<CurrentOnCall>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [shiftDays, setShiftDays] = useState(7);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [memberOrder, setMemberOrder] = useState<string[]>([]);

  const [overrideUserId, setOverrideUserId] = useState("");
  const [overrideStart, setOverrideStart] = useState("");
  const [overrideEnd, setOverrideEnd] = useState("");
  const [savingOverride, setSavingOverride] = useState(false);

  const canEdit = user?.role === "OWNER" || user?.role === "ADMIN";

  const load = async () => {
    if (!user?.jwt) return;
    const headers = { Authorization: `Bearer ${user.jwt}` };
    const [schedRes, curRes, memRes] = await Promise.all([
      fetch(`${API_URL}/oncall/schedule`, { headers }),
      fetch(`${API_URL}/oncall/current`, { headers }),
      fetch(`${API_URL}/oncall/members`, { headers }),
    ]);

    const sched: Schedule | null = schedRes.ok ? await schedRes.json() : null;
    const cur: CurrentOnCall = curRes.ok ? await curRes.json() : null;
    const mems: Member[] = memRes.ok ? await memRes.json() : [];

    setSchedule(sched);
    setCurrent(cur);
    setMembers(mems);
    if (sched) {
      setShiftDays(sched.shiftDays);
      setStartDate(new Date(sched.startDate).toISOString().split("T")[0]);
      setMemberOrder(sched.memberOrder);
    } else {
      setMemberOrder(mems.map((m) => m.userId));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.jwt) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load is stable per jwt
  }, [user?.jwt]);

  const saveSchedule = async () => {
    if (!user?.jwt) return;
    setSaving(true);
    try {
      await fetch(`${API_URL}/oncall/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.jwt}` },
        body: JSON.stringify({ memberOrder, shiftDays, startDate }),
      });
      await load();
    } finally { setSaving(false); }
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...memberOrder];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setMemberOrder(next);
  };

  const moveDown = (idx: number) => {
    if (idx === memberOrder.length - 1) return;
    const next = [...memberOrder];
    [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
    setMemberOrder(next);
  };

  const toggleMember = (userId: string) => {
    setMemberOrder((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const addOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.jwt || !overrideUserId || !overrideStart || !overrideEnd) return;
    setSavingOverride(true);
    try {
      await fetch(`${API_URL}/oncall/overrides`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.jwt}` },
        body: JSON.stringify({ userId: overrideUserId, startsAt: overrideStart, endsAt: overrideEnd }),
      });
      setOverrideUserId(""); setOverrideStart(""); setOverrideEnd("");
      await load();
    } finally { setSavingOverride(false); }
  };

  const removeOverride = async (id: string) => {
    if (!user?.jwt) return;
    await fetch(`${API_URL}/oncall/overrides/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.jwt}` },
    });
    await load();
  };

  const memberById = (id: string) => members.find((m) => m.userId === id);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading…</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Operations</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">On-Call Schedule</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage rotation and temporary overrides for your on-call team.
        </p>
      </div>

      {/* Current on-call hero card */}
      <div className={`rounded-xl p-5 border ${
        current
          ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      }`}>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
          Currently On-Call
        </p>
        {current?.user ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center text-lg font-bold text-emerald-800 dark:text-emerald-100 shrink-0">
              {(current.user.name || current.user.email)[0].toUpperCase()}
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                {current.user.name || current.user.email}
              </p>
              <p className="text-xs text-slate-400">
                {current.user.email} · via {current.via}
              </p>
            </div>
            <span className="ml-auto text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
              ACTIVE
            </span>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No one assigned — set up your rotation below.</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Rotation builder */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            Rotation Order
          </h2>
          <div className="space-y-1.5 mb-4">
            {memberOrder.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No members in rotation. Add members below.</p>
            ) : (
              memberOrder.map((uid, idx) => {
                const m = memberById(uid);
                return (
                  <div
                    key={uid}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                  >
                    <span className="text-xs font-bold text-slate-300 w-4 text-center tabular-nums">{idx + 1}</span>
                    <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">
                      {m?.name || m?.email || uid}
                    </span>
                    {canEdit && (
                      <div className="flex gap-0.5">
                        <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 text-xs w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition">▲</button>
                        <button onClick={() => moveDown(idx)} disabled={idx === memberOrder.length - 1} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 text-xs w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition">▼</button>
                        <button onClick={() => toggleMember(uid)} className="text-red-400 hover:text-red-600 text-xs w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition">✕</button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          {canEdit && members.filter((m) => !memberOrder.includes(m.userId)).length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-1.5">Add to rotation:</p>
              <div className="flex flex-wrap gap-1">
                {members
                  .filter((m) => !memberOrder.includes(m.userId))
                  .map((m) => (
                    <button
                      key={m.userId}
                      onClick={() => toggleMember(m.userId)}
                      className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 transition"
                    >
                      + {m.name || m.email}
                    </button>
                  ))}
              </div>
            </div>
          )}
          {canEdit && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Shift Duration (days)</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={shiftDays}
                  onChange={(e) => setShiftDays(Number(e.target.value))}
                  className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Rotation Start</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                />
              </div>
            </div>
          )}
          {canEdit && (
            <button
              onClick={saveSchedule}
              disabled={saving}
              className="w-full text-sm py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-50 transition-colors shadow-sm"
            >
              {saving ? "Saving…" : "Save Schedule"}
            </button>
          )}
        </div>

        {/* Overrides */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            Temporary Overrides
          </h2>

          {canEdit && (
            <form onSubmit={addOverride} className="mb-4 space-y-2">
              <select
                value={overrideUserId}
                onChange={(e) => setOverrideUserId(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                required
              >
                <option value="">Select member…</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>{m.name || m.email}</option>
                ))}
              </select>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">From</label>
                  <input
                    type="datetime-local"
                    value={overrideStart}
                    onChange={(e) => setOverrideStart(e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">To</label>
                  <input
                    type="datetime-local"
                    value={overrideEnd}
                    onChange={(e) => setOverrideEnd(e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={savingOverride}
                className="w-full text-sm py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-50 transition-colors shadow-sm"
              >
                {savingOverride ? "Adding…" : "Add Override"}
              </button>
            </form>
          )}

          <div className="space-y-1.5">
            {!schedule?.overrides?.length ? (
              <p className="text-sm text-slate-400 italic text-center py-4">No overrides scheduled.</p>
            ) : (
              schedule.overrides.map((o) => {
                const now = new Date();
                const active = new Date(o.startsAt) <= now && new Date(o.endsAt) >= now;
                return (
                  <div
                    key={o.id}
                    className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border ${
                      active
                        ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                        {o.user?.name || o.user?.email || o.userId}
                        {active && <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">ACTIVE</span>}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {fmtDate(o.startsAt)} → {fmtDate(o.endsAt)}
                      </p>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => removeOverride(o.id)}
                        className="text-xs font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors shrink-0"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
