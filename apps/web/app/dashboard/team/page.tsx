"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "../../../contexts/language-context";
import { canManageTeam } from "../../../lib/roles";

type Member = {
  userId: string;
  role: string;
  joinedAt: string;
  name: string;
  email: string;
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
};

const ROLE_OPTIONS = [
  "OWNER",
  "ADMIN",
  "RESPONDER",
  "OBSERVER",
  "VIEWER",
] as const;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function TeamPage() {
  const { data: session } = useSession();
  const { t, locale } = useLanguage();
  const user = session?.user as
    | { id?: string; role?: string; jwt?: string }
    | undefined;

  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("RESPONDER");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);

  const manager = canManageTeam(user?.role);

  const authHeaders = useCallback(
    (): Record<string, string> => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${user?.jwt}`,
    }),
    [user?.jwt],
  );

  const refresh = useCallback(async () => {
    if (!user?.jwt) return;
    const requests: Promise<Response>[] = [
      fetch(`${API_URL}/members`, { headers: authHeaders() }),
    ];
    if (canManageTeam(user.role)) {
      requests.push(
        fetch(`${API_URL}/invitations`, { headers: authHeaders() }),
      );
    }
    const [membersRes, invitesRes] = await Promise.all(requests);
    if (membersRes.ok) setMembers(await membersRes.json());
    if (invitesRes?.ok) setInvitations(await invitesRes.json());
  }, [user?.jwt, user?.role, authHeaders]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const showError = async (res: Response) => {
    try {
      const body = await res.json();
      setNotice({
        kind: "error",
        text: Array.isArray(body.message)
          ? body.message.join(", ")
          : (body.message ?? t.team.errorGeneric),
      });
    } catch {
      setNotice({ kind: "error", text: t.team.errorGeneric });
    }
  };

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`${API_URL}/invitations`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (!res.ok) {
        await showError(res);
        return;
      }
      const body = (await res.json()) as { inviteUrl?: string };
      setInviteEmail("");
      setInviteLink(body.inviteUrl ?? null);
      setCopied(false);
      setNotice({ kind: "ok", text: t.team.inviteSent });
      await refresh();
    } catch {
      setNotice({ kind: "error", text: t.team.errorGeneric });
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (userId: string, role: string) => {
    setNotice(null);
    const res = await fetch(`${API_URL}/members/${userId}/role`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      await showError(res);
    }
    await refresh();
  };

  const removeMember = async (userId: string) => {
    if (!window.confirm(t.team.confirmRemove)) return;
    setNotice(null);
    const res = await fetch(`${API_URL}/members/${userId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) {
      await showError(res);
    }
    await refresh();
  };

  const revokeInvite = async (id: string) => {
    setNotice(null);
    const res = await fetch(`${API_URL}/invitations/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) {
      await showError(res);
    }
    await refresh();
  };

  const copyInviteLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — the link is
      // visible and selectable, so the user can still copy it manually.
    }
  };

  const roleLabel = (role: string) =>
    t.team.roles[role as keyof typeof t.team.roles] ?? role;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Workspace</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t.team.title}
        </h1>
      </div>

      {notice && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium ${
            notice.kind === "ok"
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
          }`}
        >
          {notice.text}
        </div>
      )}

      {manager && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            {t.team.inviteMember}
          </h2>
          <form onSubmit={sendInvite} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
            >
              {ROLE_OPTIONS.filter(
                (r) => r !== "OWNER" || user?.role === "OWNER",
              ).map((r) => (
                <option key={r} value={r}>{roleLabel(r)}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm whitespace-nowrap"
            >
              {busy ? t.team.sending : t.team.sendInvite}
            </button>
          </form>
          {inviteLink && (
            <div className="mt-4 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-4">
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-2">
                {t.team.inviteLinkHint}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  onFocus={(e) => e.target.select()}
                  className="flex-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-mono px-3 py-2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  {copied ? t.team.copied : t.team.copyLink}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t.team.members}
            <span className="ml-2 text-xs font-normal text-slate-400">({members.length})</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400 bg-slate-50/70 dark:bg-slate-900/50">
                <th className="px-6 py-3">{t.team.member}</th>
                <th className="px-6 py-3">{t.team.role}</th>
                <th className="px-6 py-3">{t.team.joined}</th>
                {manager && <th className="px-6 py-3">{t.team.actions}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {members.map((m) => {
                const isSelf = m.userId === user?.id;
                return (
                  <tr key={m.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            {(m.name || m.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {m.name}
                            {isSelf && (
                              <span className="ml-1.5 text-xs text-indigo-500 dark:text-indigo-400">
                                ({t.team.you})
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      {manager && !isSelf ? (
                        <select
                          value={m.role}
                          onChange={(e) => changeRole(m.userId, e.target.value)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>{roleLabel(r)}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                          {roleLabel(m.role)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-400">
                      {new Date(m.joinedAt).toLocaleDateString(locale)}
                    </td>
                    {manager && (
                      <td className="px-6 py-3.5">
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => removeMember(m.userId)}
                            className="text-xs font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                          >
                            {t.team.remove}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {manager && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t.team.invitations}
              {invitations.length > 0 && (
                <span className="ml-2 text-xs font-normal text-slate-400">({invitations.length} pending)</span>
              )}
            </h2>
          </div>
          {invitations.length === 0 ? (
            <p className="px-6 py-5 text-sm text-slate-400 italic">
              {t.team.noInvitations}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {invitations.map((inv) => (
                <li key={inv.id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {inv.email}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {roleLabel(inv.role)} · {t.team.expires}{" "}
                      {new Date(inv.expiresAt).toLocaleDateString(locale)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => revokeInvite(inv.id)}
                    className="text-xs font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                  >
                    {t.team.revoke}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
