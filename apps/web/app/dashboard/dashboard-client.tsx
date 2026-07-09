"use client";

import Link from "next/link";
import { LanguageSelector } from "../../components/language-selector";
import { ThemeToggle } from "../../components/theme-toggle";
import { useLanguage } from "../../contexts/language-context";
import { canManageIncidents } from "../../lib/roles";
import IncidentList, { IncidentPage, IncidentStats } from "./incident-list";

interface DashboardClientProps {
  initialIncidents: IncidentPage;
  stats: IncidentStats;
  userRole?: string;
}

export default function DashboardClient({
  initialIncidents,
  stats,
  userRole,
}: DashboardClientProps) {
  const { t } = useLanguage();

  const summaryCards = [
    {
      label: t.dashboard.totalIncidents,
      value: stats.total,
      tone: "bg-indigo-50 text-indigo-700",
    },
    {
      label: t.dashboard.activeNow,
      value: stats.active,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: t.dashboard.critical,
      value: stats.CRITICAL,
      tone: "bg-red-50 text-red-700",
    },
    {
      label: t.dashboard.high,
      value: stats.HIGH,
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
            {canManageIncidents(userRole) && (
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

      <IncidentList initialData={initialIncidents} />
    </div>
  );
}
