import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "../../lib/auth";

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
  severity: string;
  status: string;
  creator?: {
    email: string;
  };
}

export default async function DashboardPage() {
  const incidents: Incident[] = await getIncidents();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Incidents
        </h2>
        <Link
          href="/dashboard/incidents/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Create Incident
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Created By
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No incidents found.
                </td>
              </tr>
            ) : (
              incidents.map((incident) => (
                <tr key={incident.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {incident.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        incident.severity === "CRITICAL"
                          ? "bg-red-100 text-red-800"
                          : incident.severity === "HIGH"
                            ? "bg-orange-100 text-orange-800"
                            : incident.severity === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {incident.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {incident.creator?.email}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
