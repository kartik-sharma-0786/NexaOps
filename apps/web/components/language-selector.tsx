"use client";

import { Check, Globe } from "lucide-react";
import { useLanguage } from "../contexts/language-context";

const languages = [
  { code: "en", label: "English", native: "English" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
] as const;

export function LanguageSelector() {
  const { language: currentLang, setLanguage: setCurrentLang } = useLanguage();

  return (
    <div className="relative group z-50">
      <button
        className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200"
        aria-label="Select Language"
      >
        <Globe className="w-4 h-4" />
        <span className="uppercase">{currentLang}</span>
      </button>

      {/* Dropdown Menu (Hover) */}
      <div className="absolute right-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out transform origin-top-right scale-95 group-hover:scale-100 z-50">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden ring-1 ring-black/5">
          <ul className="py-2">
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  onClick={() => setCurrentLang(lang.code)}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors
                    ${
                      currentLang === lang.code
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <div className="flex flex-col">
                    <span className="font-medium truncate">{lang.native}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {lang.label}
                    </span>
                  </div>
                  {currentLang === lang.code && (
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
