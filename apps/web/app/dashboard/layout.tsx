import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import { DashboardSidebar } from "./sidebar";

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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardSidebar
        userRole={session.user.role}
        tenantId={session.user.tenantId}
        tenantName={session.user.tenantName ?? undefined}
        userEmail={session.user.email}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 lg:px-8 lg:py-7 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
