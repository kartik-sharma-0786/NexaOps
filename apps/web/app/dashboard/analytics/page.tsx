"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Analytics = {
  days: number;
  dailyCounts: { day: string; count: number }[];
  mttr: { severity: string; avgMinutes: number; resolved: number }[];
  severityDistribution: { severity: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
};

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#3b82f6",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "#ef4444",
  ACKNOWLEDGED: "#f97316",
  RESOLVED: "#22c55e",
};

function fmtDay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function fmtDuration(mins: number) {
  if (!mins) return "—";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const user = session?.user as { jwt?: string } | undefined;
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.jwt) return;
    fetch(`${API_URL}/incidents/analytics`, {
      headers: { Authorization: `Bearer ${user.jwt}` },
    })
      .then(async (res) => {
        if (res.ok) setData(await res.json());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.jwt]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading analytics…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        No analytics data yet.
      </div>
    );
  }

  const totalResolved = data.mttr.reduce((s, r) => s + r.resolved, 0);
  const overallMttr =
    totalResolved === 0
      ? 0
      : Math.round(
          data.mttr.reduce((s, r) => s + r.avgMinutes * r.resolved, 0) /
            totalResolved,
        );

  const totalIncidents = data.statusDistribution.reduce(
    (s, r) => s + r.count,
    0,
  );

  const statCards = [
    {
      label: "Total Incidents",
      value: totalIncidents,
      tone: "text-indigo-600",
    },
    {
      label: "Resolved (30d)",
      value: totalResolved,
      tone: "text-green-600",
    },
    {
      label: "Avg MTTR",
      value: fmtDuration(overallMttr),
      tone: "text-amber-600",
    },
    {
      label: "Critical",
      value:
        data.severityDistribution.find((r) => r.severity === "CRITICAL")
          ?.count ?? 0,
      tone: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Reports</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Last {data.days} days
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <div
            key={c.label}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              {c.label}
            </p>
            <p className={`text-3xl font-bold ${c.tone}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Daily incidents bar chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          Incidents per Day
        </h2>
        {data.dailyCounts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No data yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.dailyCounts}>
              <XAxis
                dataKey="day"
                tickFormatter={fmtDay}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => [v, "Incidents"]}
                labelFormatter={(label) => fmtDay(String(label))}
                contentStyle={{
                  background: "var(--tw-bg-opacity, #fff)",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* MTTR by severity */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            Avg Time to Resolve (MTTR)
          </h2>
          {data.mttr.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No resolved incidents yet.
            </p>
          ) : (
            <div className="space-y-3">
              {data.mttr.map((row) => (
                <div key={row.severity} className="flex items-center gap-3">
                  <span
                    className="w-20 text-xs font-semibold"
                    style={{ color: SEVERITY_COLORS[row.severity] }}
                  >
                    {row.severity}
                  </span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (row.avgMinutes / 480) * 100)}%`,
                        background: SEVERITY_COLORS[row.severity],
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16 text-right">
                    {fmtDuration(row.avgMinutes)}
                  </span>
                  <span className="text-xs text-gray-400 w-16">
                    ({row.resolved} resolved)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Severity distribution pie */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            Severity Distribution
          </h2>
          {data.severityDistribution.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No data yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.severityDistribution}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={(props) =>
                    `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {data.severityDistribution.map((entry) => (
                    <Cell
                      key={entry.severity}
                      fill={SEVERITY_COLORS[entry.severity] ?? "#6366f1"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, name) => [v, name]}
                  contentStyle={{
                    borderRadius: 8,
                    fontSize: 12,
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
