"use client";

import { ArrowRight, Book, Clock, FileText, Search, Video } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { LandingNavbar } from "../../components/landing/navbar";
import { useLanguage } from "../../contexts/language-context";
import { RESOURCE_ARTICLES } from "../../lib/resources-content";

const TYPE_ASSETS: Record<string, { icon: React.ReactNode; color: string }> = {
  Guide: {
    icon: <Book className="w-4 h-4" />,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
  },
  Webinar: {
    icon: <Video className="w-4 h-4" />,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
  },
  Article: {
    icon: <FileText className="w-4 h-4" />,
    color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
  },
};

const FILTERS = ["All", "Guide", "Article", "Webinar"] as const;

export default function ResourcesPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESOURCE_ARTICLES.filter((a) => {
      if (filter !== "All" && a.type !== filter) return false;
      if (!q) return true;
      const localized = t.resources.items[a.key as keyof typeof t.resources.items];
      const haystack = `${a.title} ${a.description} ${localized?.title ?? ""} ${
        localized?.desc ?? ""
      }`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, filter, t]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <LandingNavbar />

      {/* Hero */}
      <div className="bg-indigo-900 dark:bg-indigo-950 py-20 sm:py-24 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl mb-6">
            {t.resources.heroTitle}
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-indigo-200">
            {t.resources.heroSubtitle}
          </p>
          <div className="mt-10 max-w-xl mx-auto">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                placeholder={t.resources.searchPlaceholder}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Type filter */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No resources match “{query}”.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((article) => {
              const localized =
                t.resources.items[article.key as keyof typeof t.resources.items];
              const assets = TYPE_ASSETS[article.type];
              return (
                <Link
                  key={article.slug}
                  href={`/resources/${article.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700"
                >
                  <div className={`h-1.5 bg-gradient-to-r ${article.gradient}`} />
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${assets.color}`}
                      >
                        {assets.icon}
                        <span className="ml-1.5">
                          {localized?.type ?? article.type}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        {article.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {localized?.title ?? article.title}
                    </h3>
                    <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                      {localized?.desc ?? article.description}
                    </p>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 flex items-center transition-colors">
                      {t.resources.readMore}
                      <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
