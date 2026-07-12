"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "../contexts/language-context";

type ApiKey = {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function IntegrationsSettings() {
  const { data: session } = useSession();
  const { t, locale } = useLanguage();
  const user = session?.user as { jwt?: string } | undefined;
  const jwt = user?.jwt;

  const [slackUrl, setSlackUrl] = useState("");
  const [discordUrl, setDiscordUrl] = useState("");
  const [configured, setConfigured] = useState({ slack: false, discord: false });
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [keyName, setKeyName] = useState("");
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"save" | "generate" | null>(null);
  const [notice, setNotice] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);

  const headers = useCallback(
    (): Record<string, string> => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    }),
    [jwt],
  );

  useEffect(() => {
    if (!jwt) return;
    void (async () => {
      try {
        const [settingsRes, keysRes] = await Promise.all([
          fetch(`${API_URL}/integrations`, { headers: headers() }),
          fetch(`${API_URL}/integrations/api-keys`, { headers: headers() }),
        ]);
        if (settingsRes.ok) {
          const s = await settingsRes.json();
          setConfigured({
            slack: s.slackConfigured,
            discord: s.discordConfigured,
          });
        }
        if (keysRes.ok) setKeys(await keysRes.json());
      } catch {
        // non-managers or transient failures: leave defaults
      }
    })();
  }, [jwt, headers]);

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

  const saveWebhooks = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("save");
    setNotice(null);
    try {
      const res = await fetch(`${API_URL}/integrations`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({
          slackWebhookUrl: slackUrl,
          discordWebhookUrl: discordUrl,
        }),
      });
      if (!res.ok) {
        await showError(res);
        return;
      }
      const s = await res.json();
      setConfigured({ slack: s.slackConfigured, discord: s.discordConfigured });
      setSlackUrl("");
      setDiscordUrl("");
      setNotice({ kind: "ok", text: t.integrations.saved });
    } catch {
      setNotice({ kind: "error", text: t.team.errorGeneric });
    } finally {
      setBusy(null);
    }
  };

  const generateKey = async () => {
    setBusy("generate");
    setNotice(null);
    setFreshKey(null);
    setCopied(false);
    try {
      const res = await fetch(`${API_URL}/integrations/api-keys`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(keyName.trim() ? { name: keyName.trim() } : {}),
      });
      if (!res.ok) {
        await showError(res);
        return;
      }
      const body = await res.json();
      setFreshKey(body.key);
      setKeyName("");
      const listRes = await fetch(`${API_URL}/integrations/api-keys`, {
        headers: headers(),
      });
      if (listRes.ok) setKeys(await listRes.json());
    } catch {
      setNotice({ kind: "error", text: t.team.errorGeneric });
    } finally {
      setBusy(null);
    }
  };

  const revokeKey = async (id: string) => {
    setNotice(null);
    const res = await fetch(`${API_URL}/integrations/api-keys/${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    if (!res.ok) await showError(res);
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const copyKey = async () => {
    if (!freshKey) return;
    await navigator.clipboard.writeText(freshKey);
    setCopied(true);
  };

  const curlSample = `curl -X POST ${API_URL}/alerts/ingest \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_KEY" \\
  -d '{"title":"Disk usage above 90%","severity":"HIGH"}'`;

  return (
    <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6 border border-slate-100 dark:border-slate-700 md:col-span-2 space-y-8">
      <div>
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-1 border-b border-slate-100 dark:border-slate-700 pb-2">
          {t.integrations.title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          {t.integrations.webhookHelp}
        </p>
      </div>

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

      <form onSubmit={saveWebhooks} className="space-y-4">
        {(
          [
            {
              key: "slack" as const,
              label: t.integrations.slackLabel,
              value: slackUrl,
              set: setSlackUrl,
              placeholder: "https://hooks.slack.com/services/...",
            },
            {
              key: "discord" as const,
              label: t.integrations.discordLabel,
              value: discordUrl,
              set: setDiscordUrl,
              placeholder: "https://discord.com/api/webhooks/...",
            },
          ]
        ).map((field) => (
          <div key={field.key}>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor={`${field.key}-webhook`}
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {field.label}
              </label>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  configured[field.key]
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                }`}
              >
                {configured[field.key]
                  ? t.integrations.configured
                  : t.integrations.notConfigured}
              </span>
            </div>
            <input
              id={`${field.key}-webhook`}
              type="url"
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
              placeholder={field.placeholder}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={busy === "save"}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {busy === "save" ? t.integrations.saving : t.integrations.save}
        </button>
      </form>

      <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
        <h3 className="text-md font-medium text-slate-900 dark:text-white mb-1">
          {t.integrations.apiKeysTitle}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {t.integrations.apiKeysHelp}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder={t.integrations.keyNamePlaceholder}
            className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />
          <button
            type="button"
            onClick={generateKey}
            disabled={busy === "generate"}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {busy === "generate"
              ? t.integrations.generating
              : t.integrations.generateKey}
          </button>
        </div>

        {freshKey && (
          <div className="mb-4 p-4 rounded-md bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
              {t.integrations.keyOnceWarning}
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono bg-white dark:bg-slate-900 p-2 rounded border border-amber-200 dark:border-amber-800 break-all">
                {freshKey}
              </code>
              <button
                type="button"
                onClick={copyKey}
                className="px-3 py-2 rounded-md bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition"
              >
                {copied ? t.integrations.copied : t.integrations.copy}
              </button>
            </div>
          </div>
        )}

        {keys.length > 0 && (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700 mb-4">
            {keys.map((k) => (
              <li
                key={k.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {k.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.integrations.created}{" "}
                    {new Date(k.createdAt).toLocaleDateString(locale)} ·{" "}
                    {t.integrations.lastUsed}{" "}
                    {k.lastUsedAt
                      ? new Date(k.lastUsedAt).toLocaleString(locale)
                      : t.integrations.never}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => revokeKey(k.id)}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  {t.integrations.revoke}
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {t.integrations.endpointTitle}
        </p>
        <pre className="text-xs font-mono bg-slate-50 dark:bg-slate-900 p-3 rounded-md border border-slate-100 dark:border-slate-700 overflow-x-auto">
          {curlSample}
        </pre>
      </div>
    </div>
  );
}
