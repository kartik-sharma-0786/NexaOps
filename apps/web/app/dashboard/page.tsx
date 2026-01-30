import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "../../lib/auth";
import IncidentList from "./incident-list";

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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Incidents
        </h2>
        {["ADMIN", "RESPONDER"].includes(session?.user?.role || "") && (
          <Link
            href="/dashboard/incidents/create"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Create Incident
          </Link>
        )}
      </div>

      <IncidentList initialIncidents={incidents} />
    </div>
  );
}
