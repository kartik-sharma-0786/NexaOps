import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "../../../components/logout-button";
import { authOptions } from "../../../lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            NexaOps
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tenant: {session.user.tenantId}
          </p>
          <div className="mt-2 text-xs font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded px-2 inline-block">
            {session.user.role}
          </div>
        </div>
        <nav className="mt-6 flex-1">
          <Link
            href="/dashboard"
            className="block px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Incidents
          </Link>
          <Link
            href="/dashboard/settings"
            className="block px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Settings
          </Link>
        </nav>
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="px-2 mb-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {session.user.email}
            </p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
