"use client";

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
  creator?: {
    email: string;
  };
  assignee?: {
    id: string;
    email: string;
    name?: string;
  } | null;
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

  // Refetch when filters/page change (debounced for typing); the server
  // already provided the initial unfiltered first page.
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

    // The server verifies this JWT on connect and joins the tenant room itself.
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
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <div className="px-4 pt-4 sm:px-6 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex gap-2">
          {([false, true] as const).map((mineOption) => (
            <button
              key={String(mineOption)}
              type="button"
              onClick={() => {
                setMine(mineOption);
                resetToFirstPage();
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                mine === mineOption
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {mineOption ? t.dashboard.filterMine : t.dashboard.filterAll}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            resetToFirstPage();
          }}
          placeholder={t.dashboard.searchPlaceholder}
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <select
          aria-label={t.dashboard.allStatuses}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            resetToFirstPage();
          }}
          className="rounded-md border-gray-300 text-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
          className="rounded-md border-gray-300 text-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">{t.dashboard.allSeverities}</option>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {t.dashboard.severity[s]}
            </option>
          ))}
        </select>
      </div>

      <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
        {pageData.data.length === 0 ? (
          <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
            {t.dashboard.noIncidents}
          </li>
        ) : (
          pageData.data.map((incident) => (
            <li key={incident.id}>
              <Link
                href={`/dashboard/incidents/${incident.id}`}
                className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 ease-in-out"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {incident.title}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${
                          incident.severity === "CRITICAL"
                            ? "bg-red-100 text-red-800"
                            : incident.severity === "HIGH"
                              ? "bg-orange-100 text-orange-800"
                              : incident.severity === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {t.dashboard.severity[
                          incident.severity as keyof typeof t.dashboard.severity
                        ] || incident.severity}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        {t.dashboard.statusLabel}{" "}
                        {t.dashboard.status[
                          incident.status as keyof typeof t.dashboard.status
                        ] || incident.status}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6">
                        {t.dashboard.createdBy}{" "}
                        {incident.creator?.email || t.dashboard.unknown}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6">
                        {t.dashboard.assignedTo}{" "}
                        {incident.assignee
                          ? incident.assignee.name || incident.assignee.email
                          : t.dashboard.unassigned}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>

      {pageData.pageCount > 1 && (
        <div className="px-4 py-3 sm:px-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center gap-4 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded-md border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            ‹
          </button>
          <span className="text-gray-600 dark:text-gray-300">
            {pageData.page} / {pageData.pageCount}
          </span>
          <button
            type="button"
            disabled={page >= pageData.pageCount}
            onClick={() => setPage((p) => Math.min(pageData.pageCount, p + 1))}
            className="px-3 py-1 rounded-md border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
