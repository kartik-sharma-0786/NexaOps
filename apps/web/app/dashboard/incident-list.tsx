"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type Incident = {
  id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: string;
  creator?: {
    email: string;
  };
};

export default function IncidentList({
  initialIncidents,
}: {
  initialIncidents: Incident[];
}) {
  const { data: session } = useSession();
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);

  // Helper to safely access extended session properties
  const user = session?.user as
    | { tenantId?: string; email?: string }
    | undefined;

  useEffect(() => {
    if (!user?.tenantId) return;

    const socket = io("http://localhost:4000");

    socket.on("connect", () => {
      socket.emit("joinTenantRoom", user.tenantId);
    });

    socket.on("incidentCreated", (newIncident: Incident) => {
      setIncidents((prev) => [newIncident, ...prev]);
    });

    socket.on("incidentUpdated", (updatedIncident: Incident) => {
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === updatedIncident.id ? updatedIncident : inc,
        ),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [session, user?.tenantId]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
        {incidents.length === 0 ? (
          <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
            No incidents found.
          </li>
        ) : (
          incidents.map((incident) => (
            <li key={incident.id}>
              <Link
                href={`/dashboard/incidents/${incident.id}`}
                className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 ease-in-out"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {incident.title}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p
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
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        Status: {incident.status}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6">
                        Created by {incident.creator?.email || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
