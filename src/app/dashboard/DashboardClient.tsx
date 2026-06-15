"use client";
import Link from "next/link";
import { format } from "date-fns";
import { useI18n } from "@/components/I18nProvider";
import SessionCard from "@/components/SessionCard";
import WeekStrip from "@/components/WeekStrip";
import RescheduleBanner from "./RescheduleBanner";
import BonusSessionPrompt from "./BonusSessionPrompt";
import type { Exam, Topic, StudySession } from "@/lib/supabase/types";

interface Props {
  todayDate: string;
  todaySessions: Array<{ s: StudySession; topic: Topic; exam: Exam }>;
  doneCount: number;
  missedCount: number;
  weekInfo: Array<{ date: string; scheduled: number; completed: number }>;
  upcoming: Array<{ exam: Exam; confidentCount: number; topicTotal: number; daysAway: number }>;
  boostInserted: number;
  boostNames: string[];
  examTomorrow: Exam | null;
  bonusTopic: Topic | null;
  bonusExamColor: string;
}

export default function DashboardClient(p: Props) {
  const { t } = useI18n();
  const today = new Date(p.todayDate);

  return (
    <div className="space-y-8">
      {p.boostInserted > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          ⚠️ {t.dash_struggling_boost} {p.boostInserted} {p.boostNames.slice(0, 3).join(", ")}
          {p.boostNames.length > 3 ? "…" : ""}.
        </div>
      )}

      {p.examTomorrow && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">
          🔥 <strong>{p.examTomorrow.subject}</strong> {t.dash_exam_tomorrow}
        </div>
      )}

      {p.missedCount > 0 && <RescheduleBanner count={p.missedCount} />}

      <section>
        <h2 className="text-2xl font-semibold text-slate-900">
          {t.dash_today} — {format(today, "EEEE d MMM")}
        </h2>
        {p.todaySessions.length === 0 ? (
          p.doneCount > 0 ? (
            <>
              <p className="mt-3 text-emerald-700">🎉 {t.dash_all_done}</p>
              {p.bonusTopic && <BonusSessionPrompt topic={p.bonusTopic} examColor={p.bonusExamColor} />}
            </>
          ) : (
            <p className="mt-3 text-slate-600">{t.dash_free_today}</p>
          )
        ) : (
          <div className="mt-4 space-y-3">
            {p.todaySessions.map(({ s, topic, exam }) => (
              <SessionCard
                key={s.id} sessionId={s.id}
                subject={exam.subject} subjectColor={exam.color}
                topicName={topic.name} difficulty={topic.difficulty}
                reviewNumber={s.repetition_count + 1}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">{t.dash_upcoming_exams}</h2>
        {p.upcoming.length === 0 ? (
          <Link href="/exams" className="mt-3 inline-block text-primary">{t.dash_add_first_exam}</Link>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {p.upcoming.map(({ exam, confidentCount, topicTotal, daysAway }) => {
              const pct = topicTotal === 0 ? 0 : (confidentCount / topicTotal) * 100;
              return (
                <Link key={exam.id} href={`/exams/${exam.id}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  style={{ borderLeft: `6px solid ${exam.color}` }}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{exam.subject}</p>
                    <span className="text-sm text-slate-500">{daysAway}d</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{confidentCount}/{topicTotal} {t.dash_topics_confident}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">{t.dash_this_week}</h2>
        <div className="mt-3">
          <WeekStrip days={p.weekInfo.map((d) => ({ ...d, date: new Date(d.date) }))} />
        </div>
      </section>
    </div>
  );
}
