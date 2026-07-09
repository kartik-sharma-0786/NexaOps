import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import DashboardClient from "./dashboard-client";
import type { IncidentPage, IncidentStats } from "./incident-list";

const EMPTY_PAGE: IncidentPage = { data: [], total: 0, page: 1, pageCount: 1 };
const EMPTY_STATS: IncidentStats = {
  total: 0,
  active: 0,
  CRITICAL: 0,
  HIGH: 0,
  MEDIUM: 0,
  LOW: 0,
};

async function getDashboardData(): Promise<{
  incidents: IncidentPage;
  stats: IncidentStats;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.jwt) {
    return { incidents: EMPTY_PAGE, stats: EMPTY_STATS };
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const headers = { Authorization: `Bearer ${session.user.jwt}` };

  try {
    const [incidentsRes, statsRes] = await Promise.all([
      fetch(`${apiUrl}/incidents?page=1&limit=20`, {
        headers,
        cache: "no-store",
      }),
      fetch(`${apiUrl}/incidents/stats`, { headers, cache: "no-store" }),
    ]);

    return {
      incidents: incidentsRes.ok ? await incidentsRes.json() : EMPTY_PAGE,
      stats: statsRes.ok ? await statsRes.json() : EMPTY_STATS,
    };
  } catch (error) {
    console.error(error);
    return { incidents: EMPTY_PAGE, stats: EMPTY_STATS };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const { incidents, stats } = await getDashboardData();

  return (
    <DashboardClient
      initialIncidents={incidents}
      stats={stats}
      userRole={session?.user?.role}
    />
  );
}
