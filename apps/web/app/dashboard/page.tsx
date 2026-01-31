import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import DashboardClient from "./dashboard-client";

async function getIncidents() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.jwt) return [];

  try {
    const res = await fetch("http://localhost:4000/incidents", {
      headers: {
        Authorization: `Bearer ${session.user.jwt}`,
      },
      cache: "no-store", // Dynamic data
    });

    if (!res.ok) {
      throw new Error("Failed to fetch incidents");
    }

    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

interface Incident {
  id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: string;
  creator?: {
    email: string;
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const incidents: Incident[] = await getIncidents();

  return (
    <DashboardClient incidents={incidents} userRole={session?.user?.role} />
  );
}
