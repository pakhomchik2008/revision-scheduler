"use client";
import ExamCard from "@/components/ExamCard";
import { useI18n } from "@/components/I18nProvider";
import type { Exam } from "@/lib/supabase/types";

interface ExamData {
  exam: Exam;
  topicCount: number;
  completionPct: number;
}

export default function ExamsList({
  upcoming, past, hasExams,
}: { upcoming: ExamData[]; past: ExamData[]; hasExams: boolean }) {
  const { t } = useI18n();

  if (!hasExams) {
    return (
      <div className="mt-16 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-slate-600">{t.exams_no_exams}</p>
        <p className="mt-1 text-sm text-slate-500">{t.exams_no_exams_hint}</p>
      </div>
    );
  }

  return (
    <>
      {upcoming.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t.exams_upcoming}</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((d) => (
              <ExamCard key={d.exam.id} exam={d.exam} topicCount={d.topicCount} completionPct={d.completionPct} />
            ))}
          </div>
        </section>
      )}
      {past.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t.exams_past}</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((d) => (
              <ExamCard key={d.exam.id} exam={d.exam} topicCount={d.topicCount} completionPct={d.completionPct} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
