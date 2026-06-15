"use client";
import { useI18n } from "./I18nProvider";
import { locales, type Locale } from "@/lib/i18n";

export default function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();

  if (compact) {
    return (
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
      >
        {(Object.keys(locales) as Locale[]).map((l) => (
          <option key={l} value={l}>{locales[l].label}</option>
        ))}
      </select>
    );
  }

  return (
    <div className="flex gap-1">
      {(Object.keys(locales) as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`rounded-md px-2 py-1 text-xs transition ${
            locale === l
              ? "bg-slate-900 text-white"
              : "border border-slate-300 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {locales[l].label}
        </button>
      ))}
    </div>
  );
}
