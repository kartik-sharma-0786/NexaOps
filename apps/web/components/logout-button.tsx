"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full text-left px-6 py-3 text-red-600 hover:bg-gray-50 dark:text-red-400 dark:hover:bg-gray-700 transition"
    >
      Sign Out
    </button>
  );
}
