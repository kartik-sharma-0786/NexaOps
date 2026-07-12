"use client";

import {
    ArrowRight,
    BarChart,
    BookOpen,
    Globe,
    Play,
    Shield,
    Users,
    Zap,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChatWidget } from "../components/landing/chat-widget";
import { FeatureStatusBadge } from "../components/landing/feature-status-badge";
import { LandingNavbar } from "../components/landing/navbar";
import { useLanguage } from "../contexts/language-context";

export default function Home() {
  const { t } = useLanguage();
  const { status } = useSession();
  const signupHref = status === "authenticated" ? "/dashboard" : "/auth/register";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Navigation */}
      <LandingNavbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-6">
                {t.hero.titleStart}{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  {t.hero.titleEnd}
                </span>
              </h1>
              <p className="text-xl text-gray-500 dark:text-gray-400 mb-8 max-w-2xl leading-relaxed">
                {t.hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href={signupHref}
                  className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  {t.hero.ctaPrimary}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <Play className="mr-2 w-4 h-4 text-gray-900 dark:text-white" />
                  {t.hero.ctaSecondary}
                </Link>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white dark:border-gray-800"></div>
                  <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-white dark:border-gray-800"></div>
                  <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white dark:border-gray-800"></div>
                </div>
                <p>{t.hero.trustedBy}</p>
              </div>
            </div>
          </div>

          {/* Decorative background blob */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/4 w-[800px] h-[800px] bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        </section>

        {/* Clients Section */}
        <section className="py-10 border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-8">
              {t.landing.poweringReliability}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {["Acme Corp", "GlobalTech", "Nebula", "Vertex", "Horizon"].map(
                (name) => (
                  <div
                    key={name}
                    className="flex justify-center items-center h-8"
                  >
                    <span className="text-xl font-bold text-gray-400 font-serif italic">
                      {name}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        {/* Why NexaOps / Features */}
        <section className="py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t.landing.whyTitle}
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                {t.landing.whySubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="w-6 h-6 text-yellow-500" />,
                  ...t.landing.cards.incidentManagement,
                  status: "live" as const,
                },
                {
                  icon: <BarChart className="w-6 h-6 text-purple-500" />,
                  ...t.landing.cards.timeline,
                  status: "live" as const,
                },
                {
                  icon: <Shield className="w-6 h-6 text-green-500" />,
                  ...t.landing.cards.rbac,
                  status: "live" as const,
                },
                {
                  icon: <Users className="w-6 h-6 text-blue-500" />,
                  ...t.landing.cards.onCall,
                  status: "coming_soon" as const,
                },
                {
                  icon: <Globe className="w-6 h-6 text-indigo-500" />,
                  ...t.landing.cards.integrations,
                  status: "coming_soon" as const,
                },
                {
                  icon: <BookOpen className="w-6 h-6 text-pink-500" />,
                  ...t.landing.cards.runbooks,
                  status: "coming_soon" as const,
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-6">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <FeatureStatusBadge status={feature.status} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="py-24 bg-gray-50 dark:bg-gray-800/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t.landing.resourcesTitle}
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  {t.landing.resourcesSubtitle}
                </p>
              </div>
              <Link
                href="/resources"
                className="hidden md:flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                {t.landing.viewAllResources}{" "}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  ...t.landing.resourceCards.guide,
                  color: "bg-blue-600",
                  href: "/resources/incident-management-guide",
                },
                {
                  ...t.landing.resourceCards.webinar,
                  color: "bg-purple-600",
                  href: "/resources/resilient-systems-at-scale",
                },
                {
                  ...t.landing.resourceCards.caseStudy,
                  color: "bg-green-600",
                  href: "/resources/post-mortem-best-practices",
                },
              ].map((resource, idx) => (
                <Link key={idx} href={resource.href} className="group block">
                  <div
                    className={`h-48 ${resource.color} rounded-t-2xl relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-800 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-2xl shadow-sm group-hover:shadow-md transition-all">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2 block">
                      {resource.category}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                      {resource.desc}
                    </p>
                    <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                      {t.landing.readMore} <ArrowRight className="ml-2 w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {t.landing.ctaTitle}
            </h2>
            <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
              {t.landing.ctaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={signupHref}
                className="px-8 py-4 bg-white text-indigo-900 font-bold rounded-lg hover:bg-gray-100 transition shadow-lg"
              >
                {t.landing.ctaPrimary}
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 bg-transparent border border-indigo-400 text-white font-medium rounded-lg hover:bg-indigo-800 transition"
              >
                {t.landing.ctaSecondary}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                {t.footer.product}
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {t.footer.incidents}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {t.footer.onCall}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/resources"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {t.footer.postMortems}
                  </Link>
                </li>
                <li>
                  <span className="text-gray-500 dark:text-gray-500">
                    {t.footer.statusPages}
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                {t.footer.company}
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {t.footer.aboutUs}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {t.footer.careers}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/resources"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {t.footer.customers}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {t.footer.contact}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                {t.footer.resources}
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link
                    href="/resources"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {t.footer.blog}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {t.footer.documentation}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {t.footer.community}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {t.footer.partners}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                {t.footer.legal}
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy#security"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {t.footer.security}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white text-xs font-bold">
                N
              </div>
              <span className="text-gray-900 dark:text-white font-bold">
                {t.brandName}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} NexaOps Inc. {t.footer.rights}
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
