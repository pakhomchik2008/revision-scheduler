"use client";
import { useI18n } from "@/components/I18nProvider";

export default function ScheduleHeader() {
  const { t } = useI18n();
  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900">{t.schedule_title}</h1>
      <p className="text-slate-500">{t.schedule_subtitle}</p>
    </>
  );
}
