import Link from "next/link";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import type { Exam } from "@/lib/supabase/types";

interface Props {
  exam: Exam;
  topicCount: number;
  completionPct: number;
}

export default function ExamCard({ exam, topicCount, completionPct }: Props) {
  const days = differenceInCalendarDays(parseISO(exam.exam_date), new Date());
  const past = days < 0;
  const soon = days >= 0 && days <= 7;
  return (
    <Link
      href={`/exams/${exam.id}`}
      className={`block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition ${past ? "opacity-60" : ""}`}
      style={{ borderLeft: `6px solid ${exam.color}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">{exam.subject}</h3>
          <p className="text-sm text-slate-500">{format(parseISO(exam.exam_date), "EEE d MMM yyyy")}</p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs ${
          past ? "bg-slate-100 text-slate-500"
          : soon ? "bg-amber-100 text-amber-700"
          : "bg-emerald-100 text-emerald-700"
        }`}>
          {past ? "Past" : `${days}d`}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">{topicCount} topic{topicCount === 1 ? "" : "s"}</p>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, completionPct)}%` }} />
      </div>
    </Link>
  );
}
