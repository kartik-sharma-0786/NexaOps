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
      setInviteEmail("");
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

  const roleLabel = (role: string) =>
    t.team.roles[role as keyof typeof t.team.roles] ?? role;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t.team.title}
      </h1>

      {notice && (
        <div
          className={`p-3 rounded-md text-sm ${
            notice.kind === "ok"
              ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
          }`}
        >
          {notice.text}
        </div>
      )}

      {manager && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t.team.inviteMember}
          </h2>
          <form
            onSubmit={sendInvite}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {ROLE_OPTIONS.filter(
                (r) => r !== "OWNER" || user?.role === "OWNER",
              ).map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {busy ? t.team.sending : t.team.sendInvite}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white p-6 pb-3">
          {t.team.members}
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <th className="px-6 py-3">{t.team.member}</th>
                <th className="px-6 py-3">{t.team.role}</th>
                <th className="px-6 py-3">{t.team.joined}</th>
                {manager && <th className="px-6 py-3">{t.team.actions}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {members.map((m) => {
                const isSelf = m.userId === user?.id;
                return (
                  <tr key={m.userId}>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {m.name}
                        {isSelf && (
                          <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">
                            ({t.team.you})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {m.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {manager && !isSelf ? (
                        <select
                          value={m.role}
                          onChange={(e) => changeRole(m.userId, e.target.value)}
                          className="rounded-md border-gray-300 text-sm p-1 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {roleLabel(r)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          {roleLabel(m.role)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(m.joinedAt).toLocaleDateString(locale)}
                    </td>
                    {manager && (
                      <td className="px-6 py-4">
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => removeMember(m.userId)}
                            className="text-sm text-red-600 dark:text-red-400 hover:underline"
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
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white p-6 pb-3">
            {t.team.invitations}
          </h2>
          {invitations.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-gray-500 dark:text-gray-400">
              {t.team.noInvitations}
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {invitations.map((inv) => (
                <li
                  key={inv.id}
                  className="px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {inv.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {roleLabel(inv.role)} · {t.team.expires}{" "}
                      {new Date(inv.expiresAt).toLocaleDateString(locale)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => revokeInvite(inv.id)}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
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
