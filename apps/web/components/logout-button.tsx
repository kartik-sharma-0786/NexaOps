"use client";

import { signOut } from "next-auth/react";
import { useLanguage } from "../contexts/language-context";

export function LogoutButton() {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full text-left px-6 py-3 text-red-600 hover:bg-gray-50 dark:text-red-400 dark:hover:bg-gray-700 transition"
    >
      {t.nav.signOut}
    </button>
  );
}
