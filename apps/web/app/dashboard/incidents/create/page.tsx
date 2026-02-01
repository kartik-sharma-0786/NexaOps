"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLanguage } from "../../../../contexts/language-context";

type IncidentFormData = {
  title: string;
  description?: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
};

export default function CreateIncidentPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IncidentFormData>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const user = session?.user as { role?: string; jwt?: string } | undefined;

  if (status === "loading") {
    return <p className="text-center p-8">{t.incidentForm.loading}</p>;
  }

  if (!["ADMIN", "RESPONDER"].includes(user?.role || "")) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
        <h1 className="text-xl font-bold text-red-600 mb-4">
          {t.incidentForm.accessDenied}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t.incidentForm.permissionDenied}
        </p>
      </div>
    );
  }

  const onSubmit = async (data: IncidentFormData) => {
    if (!user?.jwt) return;
    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.jwt}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to create incident");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(t.incidentForm.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {t.incidentForm.createTitle}
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.incidentForm.title}
          </label>
          <input
            {...register("title", { required: t.incidentForm.titleRequired })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.incidentForm.description}
          </label>
          <textarea
            {...register("description")}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.incidentForm.severity}
          </label>
          <select
            {...register("severity")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="LOW">{t.dashboard.severity.LOW}</option>
            <option value="MEDIUM">{t.dashboard.severity.MEDIUM}</option>
            <option value="HIGH">{t.dashboard.severity.HIGH}</option>
            <option value="CRITICAL">{t.dashboard.severity.CRITICAL}</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
          >
            {t.incidentForm.cancel}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? t.incidentForm.creating : t.incidentForm.create}
          </button>
        </div>
      </form>
    </div>
  );
}
