"use client";

import {
    BellRing,
    Clock3,
    ShieldCheck,
    Sparkles,
    Workflow,
} from "lucide-react";
import Link from "next/link";
import { LandingNavbar } from "../../components/landing/navbar";
import { useLanguage } from "../../contexts/language-context";

const highlights = [
  {
    key: "alerting",
    icon: <BellRing className="w-6 h-6 text-amber-500" />,
  },
  {
    key: "runbooks",
    icon: <Workflow className="w-6 h-6 text-indigo-500" />,
  },
  {
    key: "rbac",
    icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
  },
  {
    key: "insights",
    icon: <Clock3 className="w-6 h-6 text-blue-500" />,
  },
] as const;

const deepDiveKeys = [
  "incidentTimeline",
  "onCall",
  "collaboration",
  "guardrails",
] as const;

const teamKeys = ["sre", "platform", "security"] as const;

export default function FeaturesPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 transition-colors">
      <LandingNavbar />

      <main>
        <section className="py-16 bg-gradient-to-br from-indigo-50 via-white to-slate-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 transition-colors">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4 transition-colors">
                <Sparkles className="w-4 h-4" /> {t.features.badge}
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                {t.features.heroTitle}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 transition-colors">
                {t.features.heroSubtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-lg hover:shadow-xl"
                >
                  {t.features.tryDashboard}
                </Link>
                <Link
                  href="/resources"
                  className="inline-flex items-center px-6 py-3 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 rounded-lg font-semibold hover:border-indigo-400 dark:hover:border-indigo-500 transition"
                >
                  {t.features.exploreResources}
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {highlights.map((item) => (
                <div
                  key={item.key}
                  className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center mb-4 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {t.features.highlights[item.key].title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed transition-colors">
                    {t.features.highlights[item.key].copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t.features.howTeamsUseTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl transition-colors">
                {t.features.howTeamsUseSubtitle}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {deepDiveKeys.map((key) => (
                <div
                  key={key}
                  className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-slate-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-semibold transition-colors">
                      {t.features.deepDives[key].title.split(" ")[0]}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {t.features.deepDives[key].title}
                    </h3>
                  </div>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm transition-colors">
                    {t.features.deepDives[key].points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span className="mt-[6px] h-2 w-2 rounded-full bg-indigo-500" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-900 dark:bg-slate-950 text-white transition-colors">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
            {teamKeys.map((key) => (
              <div
                key={key}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <p className="text-sm uppercase tracking-wide text-slate-300 mb-2">
                  {t.features.teams[key].label}
                </p>
                <h3 className="text-xl font-semibold mb-3">
                  {t.features.teams[key].title}
                </h3>
                <p className="text-slate-200 text-sm leading-relaxed">
                  {t.features.teams[key].desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition shadow-lg hover:shadow-xl hover:scale-105 transform duration-200"
            >
              {t.features.seeItInAction}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
