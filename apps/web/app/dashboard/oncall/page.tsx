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
  const [current, setCurrent] = useState<CurrentOnCall>(undefined as any);
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

  useEffect(() => { if (user?.jwt) load(); }, [user?.jwt]);

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
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading…</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">On-Call Schedule</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage rotation and temporary overrides for your on-call team.
        </p>
      </div>

      {/* Current on-call hero card */}
      <div className={`rounded-xl p-6 border-2 ${
        current
          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      }`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
          Currently On-Call
        </p>
        {current?.user ? (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-200 dark:bg-green-700 flex items-center justify-center text-2xl font-bold text-green-800 dark:text-green-100">
              {(current.user.name || current.user.email)[0].toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {current.user.name || current.user.email}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {current.user.email} &middot; via {current.via}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-lg text-gray-400 italic">No one assigned — set up your rotation below.</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Rotation builder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Rotation Order
          </h2>
          <div className="space-y-2 mb-4">
            {memberOrder.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No members in rotation. Add members below.</p>
            ) : (
              memberOrder.map((uid, idx) => {
                const m = memberById(uid);
                return (
                  <div
                    key={uid}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600"
                  >
                    <span className="text-xs font-bold text-gray-400 w-5 text-center">{idx + 1}</span>
                    <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">
                      {m?.name || m?.email || uid}
                    </span>
                    {canEdit && (
                      <div className="flex gap-1">
                        <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 text-xs px-1">▲</button>
                        <button onClick={() => moveDown(idx)} disabled={idx === memberOrder.length - 1} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 text-xs px-1">▼</button>
                        <button onClick={() => toggleMember(uid)} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          {canEdit && members.filter((m) => !memberOrder.includes(m.userId)).length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Add to rotation:</p>
              <div className="flex flex-wrap gap-1">
                {members
                  .filter((m) => !memberOrder.includes(m.userId))
                  .map((m) => (
                    <button
                      key={m.userId}
                      onClick={() => toggleMember(m.userId)}
                      className="text-xs px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700"
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
                <label className="block text-xs text-gray-500 mb-1">Shift Duration (days)</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={shiftDays}
                  onChange={(e) => setShiftDays(Number(e.target.value))}
                  className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 p-1.5 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Rotation Start</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 p-1.5 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}
          {canEdit && (
            <button
              onClick={saveSchedule}
              disabled={saving}
              className="w-full text-sm py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save Schedule"}
            </button>
          )}
        </div>

        {/* Overrides */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Temporary Overrides
          </h2>

          {canEdit && (
            <form onSubmit={addOverride} className="mb-4 space-y-2">
              <div className="grid grid-cols-1 gap-2">
                <select
                  value={overrideUserId}
                  onChange={(e) => setOverrideUserId(e.target.value)}
                  className="text-sm rounded-md border border-gray-300 dark:border-gray-600 p-1.5 bg-white dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select member…</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.name || m.email}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="datetime-local"
                      value={overrideStart}
                      onChange={(e) => setOverrideStart(e.target.value)}
                      className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 p-1.5 bg-white dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="datetime-local"
                      value={overrideEnd}
                      onChange={(e) => setOverrideEnd(e.target.value)}
                      className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 p-1.5 bg-white dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={savingOverride}
                className="w-full text-sm py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-50"
              >
                {savingOverride ? "Adding…" : "Add Override"}
              </button>
            </form>
          )}

          <div className="space-y-2">
            {!schedule?.overrides?.length ? (
              <p className="text-sm text-gray-400 italic text-center py-4">No overrides scheduled.</p>
            ) : (
              schedule.overrides.map((o) => {
                const now = new Date();
                const active = new Date(o.startsAt) <= now && new Date(o.endsAt) >= now;
                return (
                  <div
                    key={o.id}
                    className={`flex items-start gap-2 p-2.5 rounded-lg border ${
                      active
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {o.user?.name || o.user?.email || o.userId}
                        {active && <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-semibold">● ACTIVE</span>}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {fmtDate(o.startsAt)} → {fmtDate(o.endsAt)}
                      </p>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => removeOverride(o.id)}
                        className="text-xs text-red-400 hover:text-red-600 flex-shrink-0"
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
