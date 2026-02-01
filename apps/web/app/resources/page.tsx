"use client";

import { ArrowRight, Book, FileText, Search, Video } from "lucide-react";
import Link from "next/link";
import { LanguageSelector } from "../../components/language-selector";
import { Logo } from "../../components/logo";
import { ThemeToggle } from "../../components/theme-toggle";
import { useLanguage } from "../../contexts/language-context";

const resourceKeys = [
  "guideIncidentManagement",
  "webinarResilientSystems",
  "articlePostMortem",
  "guideOnCallHealth",
  "articleSLO",
  "webinarAutomation",
] as const;

const resourceAssets: Record<string, { icon: React.ReactNode; color: string }> =
  {
    guideIncidentManagement: {
      icon: <Book className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
    },
    webinarResilientSystems: {
      icon: <Video className="w-5 h-5" />,
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
    },
    articlePostMortem: {
      icon: <FileText className="w-5 h-5" />,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
    },
    guideOnCallHealth: {
      icon: <Book className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
    },
    articleSLO: {
      icon: <FileText className="w-5 h-5" />,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
    },
    webinarAutomation: {
      icon: <Video className="w-5 h-5" />,
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
    },
  };

export default function ResourcesPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Navigation (Simplified for sub-page) */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {t.brandName}
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <ThemeToggle />
              <Link
                href="/dashboard"
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
              >
                {t.resources.goToDashboard}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-indigo-900 dark:bg-indigo-950 py-24 transition-colors">
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
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                placeholder={t.resources.searchPlaceholder}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {resourceKeys.map((key) => (
            <div
              key={key}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700"
            >
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${resourceAssets[key].color}`}
                  >
                    {resourceAssets[key].icon}
                    <span className="ml-2">{t.resources.items[key].type}</span>
                  </span>
                </div>
                <Link href="#" className="block mt-2 group">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {t.resources.items[key].title}
                  </h3>
                  <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                    {t.resources.items[key].desc}
                  </p>
                </Link>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
                <Link
                  href="#"
                  className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center transition-colors"
                >
                  {t.resources.readMore} <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
