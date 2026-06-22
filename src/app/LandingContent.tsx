"use client";
import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Brain, CalendarDays, BarChart3, ListChecks, Clock, Star } from "lucide-react";

export default function LandingContent() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-3xl py-12">
      {/* Language toggle */}
      <div className="mb-8 flex justify-center">
        <LanguageSwitcher />
      </div>

      {/* Hero */}
      <section className="text-center">
        <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Brain className="h-8 w-8 text-primary" aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {t.landing_title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
          Build your exam schedule in 2 minutes. Enter your subjects and exam dates
          — we generate a day-by-day revision plan using the same SM-2 algorithm behind Anki,
          proven across 40 years of memory research.
        </p>

        {/* Trust signals — hero position */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 text-primary" aria-hidden="true" /> Free forever
          </span>
          <span aria-hidden="true">&middot;</span>
          <a href="https://github.com/pakhomchik2008/revision-scheduler" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
            Open source on GitHub
          </a>
          <span aria-hidden="true">&middot;</span>
          <span>No ads</span>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/auth/signup"
            className="w-full rounded-lg bg-primary px-8 py-3.5 text-center font-semibold text-white shadow-md transition hover:shadow-lg sm:w-auto"
          >
            {t.landing_get_started}
          </Link>
          <Link
            href="/auth/login"
            className="w-full rounded-lg border border-slate-300 px-8 py-3.5 text-center font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            {t.landing_login}
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-20">
        <h2 className="text-center text-2xl font-bold text-slate-900">How it works</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { step: "1", title: "Add exams", desc: "Enter your subjects and exam dates. That's it — no flashcard decks to build." },
            { step: "2", title: "Get your schedule", desc: "We fill your calendar with the right topics at the right time, based on your available hours." },
            { step: "3", title: "Study & adapt", desc: "Rate your confidence after each session. SM-2 reschedules weaker topics sooner." },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-white">
                {item.step}
              </div>
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Revision Scheduler */}
      <section className="mt-20">
        <h2 className="text-center text-2xl font-bold text-slate-900">Why Revision Scheduler</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Brain className="mb-3 h-7 w-7 text-primary" aria-hidden="true" />
            <h3 className="font-semibold text-slate-900">SM-2 Algorithm</h3>
            <p className="mt-1.5 text-sm text-slate-600">
              The same algorithm used by millions of Anki users. Topics you struggle
              with appear more often; topics you know get spaced further out.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <CalendarDays className="mb-3 h-7 w-7 text-primary" aria-hidden="true" />
            <h3 className="font-semibold text-slate-900">Auto Scheduling</h3>
            <p className="mt-1.5 text-sm text-slate-600">
              Tell us when you&apos;re free — we fill your calendar with the right topics at the
              right time. No manual planning needed.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <BarChart3 className="mb-3 h-7 w-7 text-primary" aria-hidden="true" />
            <h3 className="font-semibold text-slate-900">Track Progress</h3>
            <p className="mt-1.5 text-sm text-slate-600">
              See exactly which topics need work. Confidence scores and streaks keep you
              honest about what you actually know.
            </p>
          </div>
        </div>
      </section>

      {/* Differentiator */}
      <section className="mt-16 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Unlike Anki, you don&apos;t build decks</h2>
        <p className="mt-2 text-sm text-slate-600">
          Anki is great for flashcards, but it requires hours of card creation before you start studying.
          Revision Scheduler takes a different approach: just list your exam topics and we handle the
          scheduling. Rate your confidence after each session and the algorithm adapts — no cards, no
          setup overhead, just a daily plan that works.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-slate-700">Topic-level scheduling, not individual flashcards</span>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-slate-700">Set up in 2 minutes, not 2 hours</span>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-16 text-center">
        <Link
          href="/auth/signup"
          className="inline-block rounded-lg bg-primary px-8 py-3.5 font-semibold text-white shadow-md transition hover:shadow-lg"
        >
          {t.landing_get_started} — it&apos;s free
        </Link>
      </section>

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Revision Scheduler",
            applicationCategory: "EducationalApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description:
              "Free spaced-repetition study planner using the SM-2 algorithm. Generate day-by-day revision schedules for university exams.",
            url: "https://github.com/pakhomchik2008/revision-scheduler",
          }),
        }}
      />
    </div>
  );
}
