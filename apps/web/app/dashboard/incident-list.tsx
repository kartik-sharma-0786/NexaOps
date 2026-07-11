"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useLanguage } from "../../contexts/language-context";

type Incident = {
  id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: string;
  creator?: { email: string };
  assignee?: { id: string; email: string; name?: string } | null;
};

export type IncidentPage = {
  data: Incident[];
  total: number;
  page: number;
  pageCount: number;
};

export type IncidentStats = {
  total: number;
  active: number;
  CRITICAL: number;
  HIGH: number;
  MEDIUM: number;
  LOW: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const STATUSES = ["OPEN", "ACKNOWLEDGED", "RESOLVED"] as const;
const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

const SEVERITY_LEFT: Record<string, string> = {
  CRITICAL: "border-l-red-500",
  HIGH: "border-l-orange-500",
  MEDIUM: "border-l-yellow-500",
  LOW: "border-l-blue-400",
};

const SEVERITY_PILL: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  LOW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const STATUS_DOT: Record<string, string> = {
  OPEN: "bg-red-500",
  ACKNOWLEDGED: "bg-amber-500",
  RESOLVED: "bg-emerald-500",
};

export default function IncidentList({
  initialData,
}: {
  initialData: IncidentPage;
}) {
  const { data: session } = useSession();
  const { t } = useLanguage();

  const [pageData, setPageData] = useState<IncidentPage>(initialData);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [mine, setMine] = useState(false);
  const isFirstQuery = useRef(true);

  const user = session?.user as
    | { id?: string; tenantId?: string; email?: string; jwt?: string }
    | undefined;
  const jwt = user?.jwt;

  useEffect(() => {
    if (isFirstQuery.current) {
      isFirstQuery.current = false;
      return;
    }
    if (!jwt) return;

    const timer = setTimeout(async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (q.trim()) params.set("q", q.trim());
      if (status) params.set("status", status);
      if (severity) params.set("severity", severity);
      if (mine) params.set("assignee", "me");

      try {
        const res = await fetch(`${API_URL}/incidents?${params.toString()}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (res.ok) setPageData(await res.json());
      } catch {
        // keep showing the current data on transient errors
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [jwt, page, q, status, severity, mine]);

  useEffect(() => {
    if (!user?.jwt) return;
    const socket = io(API_URL, { auth: { token: user.jwt } });

    socket.on("incidentCreated", (newIncident: Incident) => {
      setPageData((prev) => ({
        ...prev,
        total: prev.total + 1,
        data: [newIncident, ...prev.data],
      }));
    });

    socket.on("incidentUpdated", (updatedIncident: Incident) => {
      setPageData((prev) => ({
        ...prev,
        data: prev.data.map((inc) =>
          inc.id === updatedIncident.id ? updatedIncident : inc,
        ),
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.jwt]);

  const resetToFirstPage = () => setPage(1);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 items-center">
        {/* Mine/All toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 shrink-0">
          {([false, true] as const).map((opt) => (
            <button
              key={String(opt)}
              type="button"
              onClick={() => {
                setMine(opt);
                resetToFirstPage();
              }}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                mine === opt
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {opt ? t.dashboard.filterMine : t.dashboard.filterAll}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              resetToFirstPage();
            }}
            placeholder={t.dashboard.searchPlaceholder}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            aria-label={t.dashboard.allStatuses}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              resetToFirstPage();
            }}
            className="text-sm py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
          >
            <option value="">{t.dashboard.allStatuses}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t.dashboard.status[s]}
              </option>
            ))}
          </select>
          <select
            aria-label={t.dashboard.allSeverities}
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value);
              resetToFirstPage();
            }}
            className="text-sm py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
          >
            <option value="">{t.dashboard.allSeverities}</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {t.dashboard.severity[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Column headers */}
      <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 pl-3">
          Incident
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 w-28 text-center">
          Status
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 w-20 text-center">
          Severity
        </span>
      </div>

      {/* Incident rows */}
      <ul role="list" className="divide-y divide-slate-100 dark:divide-slate-800">
        {pageData.data.length === 0 ? (
          <li className="px-6 py-12 text-center">
            <p className="text-sm text-slate-400">{t.dashboard.noIncidents}</p>
          </li>
        ) : (
          pageData.data.map((incident) => (
            <li key={incident.id}>
              <Link
                href={`/dashboard/incidents/${incident.id}`}
                className={`flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-l-[3px] ${
                  SEVERITY_LEFT[incident.severity] ?? "border-l-slate-200"
                }`}
              >
                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate mb-0.5">
                    {incident.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <span className="truncate">
                      {t.dashboard.createdBy}{" "}
                      <span className="text-slate-500 dark:text-slate-400">
                        {incident.creator?.email ?? t.dashboard.unknown}
                      </span>
                    </span>
                    {incident.assignee && (
                      <>
                        <span className="w-0.5 h-0.5 rounded-full bg-slate-300 shrink-0" />
                        <span className="truncate">
                          {t.dashboard.assignedTo}{" "}
                          <span className="text-slate-500 dark:text-slate-400">
                            {incident.assignee.name ?? incident.assignee.email}
                          </span>
                        </span>
                      </>
                    )}
                    {!incident.assignee && (
                      <>
                        <span className="w-0.5 h-0.5 rounded-full bg-slate-300 shrink-0" />
                        <span className="italic">{t.dashboard.unassigned}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-1.5 w-28 justify-center shrink-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      STATUS_DOT[incident.status] ?? "bg-slate-400"
                    }`}
                  />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {t.dashboard.status[
                      incident.status as keyof typeof t.dashboard.status
                    ] ?? incident.status}
                  </span>
                </div>

                {/* Severity pill */}
                <div className="w-20 flex justify-center shrink-0">
                  <span
                    className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      SEVERITY_PILL[incident.severity] ??
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {t.dashboard.severity[
                      incident.severity as keyof typeof t.dashboard.severity
                    ] ?? incident.severity}
                  </span>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>

      {/* Pagination */}
      {pageData.pageCount > 1 && (
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm font-medium"
          >
            ‹
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {pageData.page} / {pageData.pageCount}
          </span>
          <button
            type="button"
            disabled={page >= pageData.pageCount}
            onClick={() =>
              setPage((p) => Math.min(pageData.pageCount, p + 1))
            }
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm font-medium"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
