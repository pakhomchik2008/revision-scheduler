"use client";
import { useI18n } from "./I18nProvider";

export default function StreakCounter({ days }: { days: number }) {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <p className="text-sm uppercase tracking-wide text-slate-500">{t.progress_streak}</p>
      <p className="mt-1 text-5xl font-bold text-primary">{days}</p>
      <p className="text-sm text-slate-500">{t.progress_streak_days}</p>
    </div>
  );
}
