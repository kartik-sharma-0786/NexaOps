"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useLanguage } from "../../contexts/language-context";
import { LanguageSelector } from "../language-selector";
import { Logo } from "../logo";
import { ThemeToggle } from "../theme-toggle";

export function LandingNavbar() {
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const isAuthed = status === "authenticated";
  const userEmail = (session?.user as { email?: string } | undefined)?.email;

  return (
    <nav className="border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {t.brandName}
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
              <Link
                href="/features"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {t.nav.features}
              </Link>
              <Link
                href="/resources"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {t.nav.resources}
              </Link>
              <Link
                href="/pricing"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {t.nav.pricing}
              </Link>
              <Link
                href="#"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {t.nav.docs}
              </Link>
              <Link
                href="/contact"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {t.nav.contact}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSelector />
            <ThemeToggle />
            {isAuthed ? (
              <>
                <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-300">
                  {userEmail || "Signed in"}
                </span>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
                >
                  {t.nav.dashboard}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {t.nav.signOut}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm font-medium"
                >
                  {t.nav.signIn}
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
                >
                  {t.nav.getStarted}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
