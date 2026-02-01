"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useLanguage } from "../../../../contexts/language-context";

interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  tenantId?: string;
  jwt?: string;
  role?: string;
}

interface IncidentEvent {
  id: string;
  message: string;
  createdAt: string;
  actor?: {
    email: string;
  };
}

interface Incident {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  creator?: {
    email: string;
  };
  createdAt: string;
  events?: IncidentEvent[];
}

export default function IncidentDetail({
  initialIncident,
}: {
  initialIncident: Incident;
}) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [incident, setIncident] = useState<Incident>(initialIncident);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper to safely access extended session properties
  const user = session?.user as ExtendedUser;

  useEffect(() => {
    if (!user?.tenantId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const socket = io(apiUrl);

    socket.on("connect", () => {
      socket.emit("joinTenantRoom", user.tenantId);
    });

    socket.on("incidentUpdated", (updatedIncident: Incident) => {
      if (updatedIncident.id === incident.id) {
        setIncident(updatedIncident);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [session, incident.id, user?.tenantId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!user?.jwt) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      await fetch(`${apiUrl}/incidents/${incident.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.jwt}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      // State updates via socket
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.jwt || !comment.trim()) return;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      await fetch(`${apiUrl}/incidents/${incident.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.jwt}`,
        },
        body: JSON.stringify({ message: comment }),
      });
      setComment("");
    } catch (error) {
      console.error("Failed to add comment", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {incident.title}
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t.incidentDetail.reportedBy} {incident.creator?.email}{" "}
              {t.incidentDetail.on}{" "}
              {new Date(incident.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            {["ADMIN", "RESPONDER"].includes(user?.role || "") ? (
              <select
                aria-label="Status"
                value={incident.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="OPEN">{t.dashboard.status.OPEN}</option>
                <option value="ACKNOWLEDGED">
                  {t.dashboard.status.ACKNOWLEDGED}
                </option>
                <option value="RESOLVED">{t.dashboard.status.RESOLVED}</option>
              </select>
            ) : (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-sm font-medium">
                {t.dashboard.status[
                  incident.status as keyof typeof t.dashboard.status
                ] || incident.status}
              </span>
            )}
          </div>
        </div>
        <p className="mt-4 text-gray-700 dark:text-gray-200">
          {incident.description}
        </p>
        <div className="mt-4">
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
            {t.dashboard.severity[
              incident.severity as keyof typeof t.dashboard.severity
            ] || incident.severity}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
          {t.incidentDetail.timeline}
        </h3>

        <div className="space-y-4 mb-6">
          {incident.events?.map((event) => (
            <div
              key={event.id}
              className="border-l-4 border-gray-200 dark:border-gray-600 pl-4 py-2"
            >
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {event.actor?.email}
                </span>{" "}
                - {new Date(event.createdAt).toLocaleString()}
              </p>
              <p className="text-gray-800 dark:text-gray-100 mt-1">
                {event.message}
              </p>
            </div>
          ))}
          {(!incident.events || incident.events.length === 0) && (
            <p className="text-gray-500 italic">
              {t.incidentDetail.noActivity}
            </p>
          )}
        </div>

        {["ADMIN", "RESPONDER"].includes(user?.role || "") && (
          <form onSubmit={handleAddComment}>
            <div>
              <label htmlFor="comment" className="sr-only">
                Add comment
              </label>
              <textarea
                id="comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={t.incidentDetail.placeholder}
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? t.incidentDetail.posting : t.incidentDetail.post}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
