"use client";
import Link from "next/link";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { useI18n } from "./I18nProvider";
import type { Exam } from "@/lib/supabase/types";

interface Props {
  exam: Exam;
  topicCount: number;
  completionPct: number;
}

export default function ExamCard({ exam, topicCount, completionPct }: Props) {
  const { t } = useI18n();
  const days = differenceInCalendarDays(parseISO(exam.exam_date), new Date());
  const past = days < 0;
  const soon = days >= 0 && days <= 7;
  return (
    <Link
      href={`/exams/${exam.id}`}
      className={`block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition ${past ? "opacity-60" : ""}`}
      style={{ borderLeft: `6px solid ${exam.color}` }}
      aria-label={`${exam.subject} — ${past ? t.exams_past_label : `${days} ${t.exams_days_away}`}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 truncate">{exam.subject}</h3>
          <p className="text-sm text-slate-500">{format(parseISO(exam.exam_date), "EEE d MMM yyyy")}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
          past ? "bg-slate-100 text-slate-500"
          : soon ? "bg-amber-100 text-amber-700"
          : "bg-emerald-100 text-emerald-700"
        }`}>
          {past ? t.exams_past_label : `${days}${t.exams_days_away}`}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">{topicCount} {t.exams_topics}</p>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-100" role="progressbar" aria-valuenow={Math.round(completionPct)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, completionPct)}%` }} />
      </div>
    </Link>
  );
}
