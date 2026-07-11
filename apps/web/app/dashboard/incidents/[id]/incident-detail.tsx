"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useLanguage } from "../../../../contexts/language-context";
import { canManageIncidents } from "../../../../lib/roles";

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
  actor?: { email: string };
}

interface Incident {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  creator?: { email: string };
  assignee?: { id: string; email: string; name?: string } | null;
  createdAt: string;
  events?: IncidentEvent[];
}

type Member = { userId: string; name: string; email: string };

const SEVERITY_STYLES: Record<string, { pill: string; border: string }> = {
  CRITICAL: {
    pill: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    border: "border-l-red-500",
  },
  HIGH: {
    pill: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    border: "border-l-orange-500",
  },
  MEDIUM: {
    pill: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    border: "border-l-yellow-500",
  },
  LOW: {
    pill: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    border: "border-l-blue-400",
  },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; icon: typeof Circle }
> = {
  OPEN: { label: "Open", dot: "bg-red-500", icon: AlertTriangle },
  ACKNOWLEDGED: { label: "Acknowledged", dot: "bg-amber-500", icon: Clock },
  RESOLVED: { label: "Resolved", dot: "bg-emerald-500", icon: CheckCircle2 },
};

export default function IncidentDetail({
  initialIncident,
}: {
  initialIncident: Incident;
}) {
  const { data: session } = useSession();
  const { t, locale } = useLanguage();
  const [incident, setIncident] = useState<Incident>(initialIncident);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  const user = session?.user as ExtendedUser;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const severityStyle = SEVERITY_STYLES[incident.severity] ?? {
    pill: "bg-slate-100 text-slate-600",
    border: "border-l-slate-300",
  };
  const statusCfg = STATUS_CONFIG[incident.status] ?? {
    label: incident.status,
    dot: "bg-slate-400",
    icon: Circle,
  };

  useEffect(() => {
    if (!user?.jwt || !canManageIncidents(user?.role)) return;
    fetch(`${apiUrl}/members`, {
      headers: { Authorization: `Bearer ${user.jwt}` },
    })
      .then(async (res) => { if (res.ok) setMembers(await res.json()); })
      .catch(() => {});
  }, [user?.jwt, user?.role]);

  useEffect(() => {
    if (!user?.jwt) return;
    const socket = io(apiUrl, { auth: { token: user.jwt } });
    socket.on("incidentUpdated", (updated: Incident) => {
      if (updated.id === incident.id) setIncident(updated);
    });
    return () => { socket.disconnect(); };
  }, [session, incident.id, user?.jwt]);

  const handleStatusChange = async (newStatus: string) => {
    if (!user?.jwt) return;
    await fetch(`${apiUrl}/incidents/${incident.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.jwt}` },
      body: JSON.stringify({ status: newStatus }),
    }).catch(console.error);
  };

  const handleAssign = async (assigneeId: string) => {
    if (!user?.jwt) return;
    await fetch(`${apiUrl}/incidents/${incident.id}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.jwt}` },
      body: JSON.stringify({ assigneeId: assigneeId || null }),
    }).catch(console.error);
  };

  const handleSummarize = async () => {
    if (!user?.jwt) return;
    setSummarizing(true);
    try {
      const res = await fetch(`${apiUrl}/incidents/${incident.id}/summarize`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.jwt}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.summary);
      }
    } catch (error) {
      console.error("Failed to summarize", error);
    } finally {
      setSummarizing(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.jwt || !comment.trim()) return;
    setLoading(true);
    try {
      await fetch(`${apiUrl}/incidents/${incident.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.jwt}` },
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
    <div className="max-w-4xl space-y-5">
      {/* Back nav */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Incidents
      </Link>

      {/* Header card */}
      <div
        className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden border-l-4 ${severityStyle.border}`}
      >
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityStyle.pill}`}
                >
                  {t.dashboard.severity[
                    incident.severity as keyof typeof t.dashboard.severity
                  ] ?? incident.severity}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                  {t.dashboard.status[
                    incident.status as keyof typeof t.dashboard.status
                  ] ?? incident.status}
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                {incident.title}
              </h1>
              <p className="mt-1 text-xs text-slate-400">
                {t.incidentDetail.reportedBy}{" "}
                <span className="text-slate-500">{incident.creator?.email}</span>{" "}
                {t.incidentDetail.on}{" "}
                {new Date(incident.createdAt).toLocaleString(locale)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              {canManageIncidents(user?.role) ? (
                <select
                  aria-label={t.dashboard.statusLabel}
                  value={incident.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                >
                  <option value="OPEN">{t.dashboard.status.OPEN}</option>
                  <option value="ACKNOWLEDGED">{t.dashboard.status.ACKNOWLEDGED}</option>
                  <option value="RESOLVED">{t.dashboard.status.RESOLVED}</option>
                </select>
              ) : (
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  {t.dashboard.status[
                    incident.status as keyof typeof t.dashboard.status
                  ] ?? incident.status}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {incident.description && (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700/50">
              {incident.description}
            </p>
          )}

          {/* Assignee */}
          <div className="mt-4 flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-500">{t.dashboard.assignedTo}</span>
            {canManageIncidents(user?.role) ? (
              <select
                aria-label={t.dashboard.assignedTo}
                value={incident.assignee?.id ?? ""}
                onChange={(e) => handleAssign(e.target.value)}
                className="text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
              >
                <option value="">{t.dashboard.unassigned}</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name || m.email}
                  </option>
                ))}
              </select>
            ) : (
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {incident.assignee
                  ? incident.assignee.name ?? incident.assignee.email
                  : t.dashboard.unassigned}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              AI Summary
            </h3>
          </div>
          <button
            onClick={handleSummarize}
            disabled={summarizing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors shadow-sm"
          >
            {summarizing ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Summarizing…
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                Summarize with AI
              </>
            )}
          </button>
        </div>
        {aiSummary ? (
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800">
            {aiSummary}
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Click &quot;Summarize with AI&quot; to generate an incident summary using the event timeline.
          </p>
        )}
      </div>

      {/* Timeline + comment */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">
          {t.incidentDetail.timeline}
        </h3>

        <div className="relative">
          {/* Vertical line */}
          {incident.events && incident.events.length > 0 && (
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />
          )}

          <div className="space-y-5 mb-6">
            {incident.events?.map((event) => (
              <div key={event.id} className="flex gap-3 relative">
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 shrink-0 mt-0.5 z-10" />
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {event.actor?.email ?? "System"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(event.createdAt).toLocaleString(locale)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {event.message}
                  </p>
                </div>
              </div>
            ))}
            {(!incident.events || incident.events.length === 0) && (
              <p className="text-sm text-slate-400 italic ml-8">
                {t.incidentDetail.noActivity}
              </p>
            )}
          </div>
        </div>

        {canManageIncidents(user?.role) && (
          <form onSubmit={handleAddComment} className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <textarea
              id="comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition resize-none"
              placeholder={t.incidentDetail.placeholder}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading || !comment.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors shadow-sm"
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
