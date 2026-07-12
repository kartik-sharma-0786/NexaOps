"use client";

import { Activity, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NotificationsBell } from "../../components/notifications-bell";
import { useLanguage } from "../../contexts/language-context";
import { DashboardSidebar } from "./sidebar";

interface DashboardShellProps {
  userRole?: string;
  tenantId?: string;
  tenantName?: string;
  userEmail?: string | null;
  children: React.ReactNode;
}

export function DashboardShell({
  userRole,
  tenantId,
  tenantName,
  userEmail,
  children,
}: DashboardShellProps) {
  const { t } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lock body scroll and close on Escape while the drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="flex h-dvh bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <DashboardSidebar
          userRole={userRole}
          tenantId={tenantId}
          tenantName={tenantName}
          userEmail={userEmail}
        />
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-200 ${
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!drawerOpen}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 shadow-2xl transition-transform duration-200 ease-out ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <DashboardSidebar
            userRole={userRole}
            tenantId={tenantId}
            tenantName={tenantName}
            userEmail={userEmail}
            onClose={() => setDrawerOpen(false)}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden h-14 bg-slate-900 flex items-center gap-3 px-4 shrink-0">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="w-9 h-9 -ml-1.5 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">
              {t.brandName}
            </span>
          </Link>
          <div className="ml-auto">
            <NotificationsBell align="right" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7 max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
