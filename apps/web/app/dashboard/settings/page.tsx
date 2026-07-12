"use client";

import { useSession } from "next-auth/react";
import { BillingSettings } from "../../../components/billing-settings";
import { EscalationSettings } from "../../../components/escalation-settings";
import { IntegrationsSettings } from "../../../components/integrations-settings";
import { LanguageSelector } from "../../../components/language-selector";
import { ThemeToggle } from "../../../components/theme-toggle";
import { useLanguage } from "../../../contexts/language-context";
import { canManageTeam } from "../../../lib/roles";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();

  const user = session?.user as
    | {
        name?: string;
        email?: string;
        role?: string;
        tenantId?: string;
        tenantName?: string;
      }
    | undefined;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t.settings.title}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Section */}
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 border border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            {t.settings.profile}
          </h2>
          <dl className="divide-y divide-slate-100 dark:divide-slate-700">
            <div className="py-3 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t.settings.fullName}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white col-span-2 sm:mt-0">
                {user?.name || t.dashboard.unknown}
              </dd>
            </div>
            <div className="py-3 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t.settings.email}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white col-span-2 sm:mt-0">
                {user?.email || t.dashboard.unknown}
              </dd>
            </div>
            <div className="py-3 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t.settings.role}
              </dt>
              <dd className="text-sm text-slate-900 dark:text-white col-span-2 sm:mt-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  {user?.role || t.dashboard.unknown}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 border border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            {t.settings.preferences}
          </h2>
          <dl className="divide-y divide-slate-100 dark:divide-slate-700">
            <div className="py-4 flex justify-between items-center">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t.settings.language}
              </dt>
              <dd>
                <LanguageSelector />
              </dd>
            </div>
            <div className="py-4 flex justify-between items-center">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t.settings.theme}
              </dt>
              <dd>
                <ThemeToggle />
              </dd>
            </div>
          </dl>
        </div>

        {/* Billing (managers only) */}
        {canManageTeam(user?.role) && <BillingSettings />}

        {/* Integrations (managers only) */}
        {canManageTeam(user?.role) && <IntegrationsSettings />}

        {/* Escalation Policies */}
        {canManageTeam(user?.role) && <EscalationSettings />}

        {/* Account/Tenant Section */}
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 border border-slate-100 dark:border-slate-700 md:col-span-2">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            {t.settings.accountReference}
          </h2>
          <dl className="divide-y divide-slate-100 dark:divide-slate-700">
            <div className="py-3 grid grid-cols-3 gap-4">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t.settings.tenantId}
              </dt>
              <dd className="text-sm font-mono text-slate-900 dark:text-white col-span-2 sm:mt-0 bg-slate-50 dark:bg-slate-900 p-2 rounded break-all">
                {user?.tenantId || t.dashboard.unknown}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
