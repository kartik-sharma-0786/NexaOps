import Link from "next/link";

type StatusLevel = "operational" | "degraded" | "outage";

type Incident = {
  id: string;
  title: string;
  status: string;
  severity: string;
  createdAt: string;
  resolvedAt: string | null;
  latestUpdate: string | null;
};

type StatusData = {
  tenant: { name: string; slug: string };
  status: StatusLevel;
  activeCount: number;
  incidents: Incident[];
  updatedAt: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function fetchStatus(slug: string): Promise<StatusData | null> {
  try {
    const res = await fetch(`${API_URL}/status/${slug}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const STATUS_CONFIG: Record<
  StatusLevel,
  { label: string; color: string; dot: string; bg: string }
> = {
  operational: {
    label: "All Systems Operational",
    color: "text-green-700 dark:text-green-400",
    dot: "bg-green-500",
    bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  },
  degraded: {
    label: "Partial Degradation",
    color: "text-yellow-700 dark:text-yellow-400",
    dot: "bg-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
  },
  outage: {
    label: "Major Outage",
    color: "text-red-700 dark:text-red-400",
    dot: "bg-red-500 animate-pulse",
    bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  },
};

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  MEDIUM:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Investigating",
  ACKNOWLEDGED: "Identified",
  RESOLVED: "Resolved",
};

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function duration(start: string, end: string | null) {
  if (!end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default async function StatusPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await fetchStatus(slug);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Status page not found
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            No tenant with this slug exists.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-indigo-600 hover:underline"
          >
            Back to NexaOps
          </Link>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[data.status];
  const active = data.incidents.filter(
    (i) => i.status === "OPEN" || i.status === "ACKNOWLEDGED",
  );
  const resolved = data.incidents.filter((i) => i.status === "RESOLVED");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.tenant.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              System Status
            </p>
          </div>
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            Powered by NexaOps
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Overall status banner */}
        <div
          className={`flex items-center gap-3 p-5 rounded-xl border ${cfg.bg}`}
        >
          <span
            className={`w-3 h-3 rounded-full flex-shrink-0 ${cfg.dot}`}
          />
          <span className={`text-lg font-semibold ${cfg.color}`}>
            {cfg.label}
          </span>
          <span className="ml-auto text-xs text-gray-400">
            Updated {fmt(data.updatedAt)}
          </span>
        </div>

        {/* Active incidents */}
        {active.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
              Active Incidents ({active.length})
            </h2>
            <ul className="space-y-3">
              {active.map((inc) => (
                <li
                  key={inc.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {inc.title}
                      </p>
                      {inc.latestUpdate && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {inc.latestUpdate}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEVERITY_COLORS[inc.severity]}`}
                      >
                        {inc.severity}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {STATUS_LABELS[inc.status] ?? inc.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Started {fmt(inc.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Past 7 days */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            Past 7 Days
          </h2>
          {resolved.length === 0 && active.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No incidents in the past 7 days.
            </div>
          ) : (
            <ul className="space-y-2">
              {resolved.map((inc) => (
                <li
                  key={inc.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {inc.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 text-xs text-gray-400">
                    {duration(inc.createdAt, inc.resolvedAt) && (
                      <span>
                        Resolved in {duration(inc.createdAt, inc.resolvedAt)}
                      </span>
                    )}
                    <span>{fmt(inc.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Uptime summary */}
        <div className="text-center text-xs text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-800">
          This page auto-refreshes every 30 seconds.
        </div>
      </main>
    </div>
  );
}
