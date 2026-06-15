"use client";
import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-bold text-slate-300">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">{t.not_found_title}</h1>
      <p className="mt-2 text-slate-600">{t.not_found_message}</p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-lg bg-primary px-5 py-2.5 font-medium text-white"
      >
        {t.not_found_go_home}
      </Link>
    </div>
  );
}
