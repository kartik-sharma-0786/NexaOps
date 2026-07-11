"use client";

import { Activity, AlertTriangle, Layers, Zap } from "lucide-react";
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
      icon: Layers,
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      valueColor: "text-slate-900 dark:text-white",
    },
    {
      label: t.dashboard.activeNow,
      value: stats.active,
      icon: Activity,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      valueColor: "text-amber-700 dark:text-amber-400",
    },
    {
      label: t.dashboard.critical,
      value: stats.CRITICAL,
      icon: Zap,
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      valueColor: "text-red-700 dark:text-red-400",
    },
    {
      label: t.dashboard.high,
      value: stats.HIGH,
      icon: AlertTriangle,
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      valueColor: "text-orange-700 dark:text-orange-400",
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
            {t.dashboard.overview}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t.dashboard.incidents}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
          {canManageIncidents(userRole) && (
            <Link
              href="/dashboard/incidents/create"
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <span className="text-base leading-none font-bold">+</span>
              {t.dashboard.createIncident}
            </Link>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg}`}
                >
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
              <p className={`text-3xl font-bold ${card.valueColor}`}>
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <IncidentList initialData={initialIncidents} />
    </div>
  );
}
