"use client";

import Link from "next/link";
import { LanguageSelector } from "../../components/language-selector";
import { ThemeToggle } from "../../components/theme-toggle";
import { useLanguage } from "../../contexts/language-context";
import IncidentList from "./incident-list";

interface Incident {
  id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: string;
  creator?: {
    email: string;
  };
}

interface DashboardClientProps {
  incidents: Incident[];
  userRole?: string;
}

export default function DashboardClient({
  incidents,
  userRole,
}: DashboardClientProps) {
  const { t } = useLanguage();

  const counts = incidents.reduce(
    (acc, inc) => {
      acc.total += 1;
      acc[inc.severity] = (acc[inc.severity] || 0) + 1;
      if (inc.status === "OPEN" || inc.status === "IN_PROGRESS") {
        acc.active += 1;
      }
      return acc;
    },
    { total: 0, CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, active: 0 } as Record<
      string,
      number
    >,
  );

  const summaryCards = [
    {
      label: t.dashboard.totalIncidents,
      value: counts.total,
      tone: "bg-indigo-50 text-indigo-700",
    },
    {
      label: t.dashboard.activeNow,
      value: counts.active,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: t.dashboard.critical,
      value: counts.CRITICAL,
      tone: "bg-red-50 text-red-700",
    },
    {
      label: t.dashboard.high,
      value: counts.HIGH,
      tone: "bg-orange-50 text-orange-700",
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500">
              {t.dashboard.overview}
            </p>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {t.dashboard.incidents}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <ThemeToggle />
            {["ADMIN", "RESPONDER"].includes(userRole || "") && (
              <Link
                href="/dashboard/incidents/create"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
              >
                {t.dashboard.createIncident}
              </Link>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                {card.label}
              </p>
              <div className={`text-2xl font-bold ${card.tone}`}>
                {card.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <IncidentList initialIncidents={incidents} />
    </div>
  );
}
