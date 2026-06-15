"use client";
import { useI18n } from "@/components/I18nProvider";

export default function SettingsHeader({ isFirstRun }: { isFirstRun: boolean }) {
  const { t } = useI18n();
  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900">{t.settings_title}</h1>
      {isFirstRun && <p className="mt-1 text-slate-600">{t.settings_welcome}</p>}
    </>
  );
}
