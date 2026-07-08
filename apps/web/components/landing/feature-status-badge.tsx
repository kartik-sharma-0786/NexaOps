"use client";

import { useLanguage } from "../../contexts/language-context";

type FeatureStatus = "live" | "coming_soon";

const styles: Record<FeatureStatus, string> = {
  live: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  coming_soon:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

export function FeatureStatusBadge({ status }: { status: FeatureStatus }) {
  const { t } = useLanguage();
  const labels: Record<FeatureStatus, string> = {
    live: t.featureBadge.live,
    coming_soon: t.featureBadge.comingSoon,
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export type { FeatureStatus };
