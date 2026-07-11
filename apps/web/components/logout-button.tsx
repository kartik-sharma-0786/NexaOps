"use client";

import { signOut } from "next-auth/react";
import { useLanguage } from "../contexts/language-context";

export function LogoutButton() {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
    >
      {t.nav.signOut}
    </button>
  );
}
