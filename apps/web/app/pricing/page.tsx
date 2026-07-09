"use client";

import { Check, Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LandingNavbar } from "../../components/landing/navbar";
import { useLanguage } from "../../contexts/language-context";

export default function PricingPage() {
  const { t } = useLanguage();
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <LandingNavbar />
      <main className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            {t.pricing.heroTitle}
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            {t.pricing.heroSubtitle}
          </p>
        </div>

        <div className="max-w-3xl mx-auto rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 border border-indigo-100 dark:border-gray-700 shadow-xl overflow-hidden mb-16">
          <div className="px-6 py-8 sm:p-10 sm:pb-6">
            <div className="flex justify-center">
              <span className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                {t.pricing.earlyAccess}
              </span>
            </div>
            <div className="mt-4 flex justify-center text-6xl font-extrabold text-gray-900 dark:text-white">
              $50
              <span className="ml-2 text-2xl font-medium text-gray-500 self-end mb-2">
                {t.pricing.perMonth}
              </span>
            </div>
            <p className="mt-4 text-center text-lg text-gray-500 dark:text-gray-400">
              {t.pricing.freeForever}
            </p>
          </div>
          <div className="px-6 pt-6 pb-8 bg-gray-50 dark:bg-gray-800/50 sm:px-10 sm:py-10">
            <ul className="space-y-4">
              {t.pricing.planFeatures.map((feature) => (
                <li key={feature} className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="ml-3 text-base text-gray-700 dark:text-gray-300 capitalize">
                    {feature}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link
                href={isAuthed ? "/dashboard/settings" : "/auth/register"}
                className="block w-full text-center rounded-lg border border-transparent bg-indigo-600 px-6 py-4 text-xl font-medium text-white hover:bg-indigo-700 shadow-md transition-all"
              >
                {isAuthed ? t.pricing.upgradeCta : t.pricing.startFree}
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto text-center" id="support">
          <span className="inline-block p-3 rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300 mb-4">
            <Heart className="w-6 h-6 fill-current" />
          </span>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t.pricing.supportTitle}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t.pricing.supportText}
          </p>

          <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner inline-block">
            <div className="w-64 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 p-6 text-center mx-auto">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.pricing.invoiceTitle}
              </p>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {t.pricing.invoiceText}
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition"
              >
                {t.pricing.contactSales}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
