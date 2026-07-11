"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSelector } from "../../components/language-selector";
import { LogoutButton } from "../../components/logout-button";
import { ThemeToggle } from "../../components/theme-toggle";
import { useLanguage } from "../../contexts/language-context";

interface SidebarProps {
  userRole?: string;
  tenantId?: string;
  tenantName?: string;
  userEmail?: string | null;
}

const ROLE_BADGE: Record<string, string> = {
  OWNER: "bg-violet-500/20 text-violet-300",
  ADMIN: "bg-blue-500/20 text-blue-300",
  RESPONDER: "bg-emerald-500/20 text-emerald-300",
  OBSERVER: "bg-slate-500/20 text-slate-400",
  VIEWER: "bg-slate-500/20 text-slate-400",
};

export function DashboardSidebar({
  userRole,
  tenantId,
  tenantName,
  userEmail,
}: SidebarProps) {
  const { t } = useLanguage();
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: t.dashboard.incidents, icon: AlertTriangle, exact: true },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, exact: false },
    { href: "/dashboard/oncall", label: "On-Call", icon: Clock, exact: false },
    { href: "/dashboard/team", label: t.team.title, icon: Users, exact: false },
    { href: "/dashboard/settings", label: t.dashboard.settings, icon: Settings, exact: false },
  ];

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const initials = (userEmail?.charAt(0) ?? "?").toUpperCase();

  return (
    <aside className="w-60 bg-slate-900 flex flex-col shrink-0 h-screen">
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2.5 mb-4 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-500 transition-colors">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-white tracking-tight leading-none">
            {t.brandName}
          </span>
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-xs text-slate-400 truncate font-medium">
            {tenantName ?? tenantId}
          </span>
        </div>

        <span
          className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
            ROLE_BADGE[userRole ?? ""] ?? "bg-slate-700 text-slate-400"
          }`}
        >
          {userRole}
        </span>

        <div className="mt-3 flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-100 ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-slate-500"}`} />
              <span className="truncate">{label}</span>
              {active && (
                <span className="ml-auto w-1 h-1 rounded-full bg-indigo-300 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-800 px-3 py-3">
        <div className="flex items-center gap-2.5 mb-3 px-1">
          <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-slate-200">{initials}</span>
          </div>
          <p className="text-xs text-slate-400 truncate flex-1 leading-tight">{userEmail}</p>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
