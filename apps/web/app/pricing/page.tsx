"use client";

import { Check, Heart } from "lucide-react";
import Link from "next/link";
import { LanguageSelector } from "../../components/language-selector";
import { ThemeToggle } from "../../components/theme-toggle";
import { useLanguage } from "../../contexts/language-context";

export default function PricingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <header className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-30 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              N
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.brandName}
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <LanguageSelector />
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
            >
              {t.pricing.getStarted}
            </Link>
          </div>
        </div>
      </header>
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
              $0
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
              {[
                "Unlimited Incidents",
                "Unlimited Team Members",
                "Slack & Discord Integration",
                "Post-Mortem Generator",
                "Basic On-Call Scheduling",
              ].map((feature) => (
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
                href="/dashboard"
                className="block w-full text-center rounded-lg border border-transparent bg-indigo-600 px-6 py-4 text-xl font-medium text-white hover:bg-indigo-700 shadow-md transition-all"
              >
                {t.pricing.startFree}
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
            <div className="w-64 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-gray-400 dark:text-gray-500 text-sm">
                QR Code Placeholder
              </span>
              {/* Replace this div with your actual QR code image */}
              {/* <img src="/your-qr-code.png" alt="Payment QR Code" className="w-full h-full object-contain" /> */}
            </div>
            <p className="text-sm font-mono text-gray-500 dark:text-gray-400">
              Scan to pay via UPI/Payment App
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
