"use client";
import { useI18n } from "@/components/I18nProvider";

export default function ExamsHeader() {
  const { t } = useI18n();
  return <h1 className="text-2xl font-semibold text-slate-900">{t.exams_title}</h1>;
}
