"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Logo } from "../../../components/logo";
import { useLanguage } from "../../../contexts/language-context";

type Preview = {
  tenantName: string;
  email: string;
  role: string;
  userExists: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function AcceptInviteForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [preview, setPreview] = useState<Preview | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setInvalid(true);
      return;
    }
    fetch(`${API_URL}/invitations/preview?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("invalid");
        setPreview(await res.json());
      })
      .catch(() => setInvalid(true));
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/invitations/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
          ...(preview.userExists ? {} : { name }),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(
          (Array.isArray(body?.message)
            ? body.message.join(", ")
            : body?.message) ?? t.team.errorGeneric,
        );
        return;
      }

      // Membership created — sign straight into the dashboard.
      const signin = await signIn("credentials", {
        email: preview.email,
        password,
        redirect: false,
      });
      if (signin?.error) {
        router.push("/auth/login");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError(t.team.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  if (invalid) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-600 dark:text-red-400 text-sm">
          {t.team.inviteInvalid}
        </div>
        <Link
          href="/auth/login"
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm"
        >
          {t.auth.backToLogin}
        </Link>
      </div>
    );
  }

  if (!preview) {
    return (
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        {t.incidentForm.loading}
      </p>
    );
  }

  const roleLabel =
    t.team.roles[preview.role as keyof typeof t.team.roles] ?? preview.role;

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-md text-sm text-indigo-800 dark:text-indigo-300">
        {t.team.invitedToJoin} <strong>{preview.tenantName}</strong>{" "}
        {t.team.asRole} <strong>{roleLabel}</strong>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t.auth.emailLabel}
        </label>
        <input
          type="email"
          value={preview.email}
          disabled
          className="mt-1 block w-full rounded-md border-gray-300 sm:text-sm p-2 border bg-gray-100 dark:bg-gray-900 dark:border-gray-600 text-gray-500 dark:text-gray-400"
        />
      </div>

      {!preview.userExists && (
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t.auth.fullNameLabel}
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {preview.userExists ? t.auth.passwordLabel : t.auth.newPasswordLabel}
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 dark:focus:ring-offset-gray-900"
      >
        {loading ? t.team.joining : t.team.joinTeam}
      </button>
    </form>
  );
}

export default function AcceptInvitePage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block">
          <Logo className="mx-auto w-12 h-12" />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t.team.acceptTitle}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 dark:border-gray-700">
          <Suspense fallback={null}>
            <AcceptInviteForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
