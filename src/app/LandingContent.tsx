"use client";
import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const features = [
  { icon: "🎯", key: "landing_f1" as const },
  { icon: "📅", key: "landing_f2" as const },
  { icon: "📊", key: "landing_f3" as const },
] as const;

export default function LandingContent() {
  const { t } = useI18n();
  return (
    <div className="mx-auto mt-12 max-w-2xl">
      <div className="mb-6 flex justify-center">
        <LanguageSwitcher />
      </div>
      <div className="text-center">
        <div className="mb-4 text-5xl" aria-hidden="true">&#128218;</div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">{t.landing_title}</h1>
        <p className="mt-3 text-lg text-slate-600">{t.landing_subtitle}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/auth/signup" className="rounded-lg bg-primary px-6 py-3 text-white font-semibold shadow-md hover:shadow-lg transition">
            {t.landing_get_started}
          </Link>
          <Link href="/auth/login" className="rounded-lg border border-slate-300 px-6 py-3 text-slate-700 hover:bg-slate-50 transition">
            {t.landing_login}
          </Link>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <div className="text-3xl mb-2" aria-hidden="true">&#127919;</div>
          <h3 className="font-semibold text-slate-900">SM-2 Algorithm</h3>
          <p className="mt-1 text-sm text-slate-600">Science-backed spaced repetition adapts to how well you know each topic.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <div className="text-3xl mb-2" aria-hidden="true">&#128197;</div>
          <h3 className="font-semibold text-slate-900">Smart Scheduling</h3>
          <p className="mt-1 text-sm text-slate-600">Auto-generated daily plans that fit your available hours and preferences.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <div className="text-3xl mb-2" aria-hidden="true">&#128200;</div>
          <h3 className="font-semibold text-slate-900">Track Progress</h3>
          <p className="mt-1 text-sm text-slate-600">Visualise your study streak, confidence per subject, and topic mastery.</p>
        </div>
      </div>

      <p className="mt-12 text-center text-xs text-slate-400">
        Free &middot; Open Source &middot; No ads
      </p>
    </div>
  );
}
