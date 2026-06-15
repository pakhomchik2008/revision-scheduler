"use client";
import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LandingContent() {
  const { t } = useI18n();
  return (
    <div className="mx-auto mt-16 max-w-xl text-center">
      <div className="mb-6 flex justify-center">
        <LanguageSwitcher />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">{t.landing_title}</h1>
      <p className="mt-3 text-slate-600">{t.landing_subtitle}</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/auth/signup" className="rounded-lg bg-primary px-5 py-2.5 text-white font-medium">
          {t.landing_get_started}
        </Link>
        <Link href="/auth/login" className="rounded-lg border border-slate-300 px-5 py-2.5 text-slate-700">
          {t.landing_login}
        </Link>
      </div>
    </div>
  );
}
