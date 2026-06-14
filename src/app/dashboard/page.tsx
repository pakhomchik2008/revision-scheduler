import Link from "next/link";
import { redirect } from "next/navigation";
import { format, parseISO, isAfter, isBefore, startOfDay, subDays, differenceInCalendarDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import SessionCard from "@/components/SessionCard";
import WeekStrip, { buildWeek } from "@/components/WeekStrip";
import RescheduleBanner from "./RescheduleBanner";
import type { Exam, Topic, StudySession } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const today = startOfDay(new Date());
  const todayIso = format(today, "yyyy-MM-dd");
  const weekDays = buildWeek();
  const weekStart = format(weekDays[0], "yyyy-MM-dd");
  const weekEnd = format(weekDays[6], "yyyy-MM-dd");

  const [{ data: exams }, { data: topics }, { data: sessions }, { data: missed }] = await Promise.all([
    supabase.from("exams").select("*").eq("user_id", user.id),
    supabase.from("topics").select("*").eq("user_id", user.id),
    supabase.from("study_sessions").select("*")
      .eq("user_id", user.id)
      .gte("scheduled_date", weekStart)
      .lte("scheduled_date", weekEnd),
    supabase.from("study_sessions").select("id, scheduled_date")
      .eq("user_id", user.id).eq("completed", false).eq("skipped", false)
      .lt("scheduled_date", todayIso),
  ]);

  const examById = new Map<string, Exam>();
  for (const e of (exams ?? []) as Exam[]) examById.set(e.id, e);
  const topicById = new Map<string, Topic>();
  for (const t of (topics ?? []) as Topic[]) topicById.set(t.id, t);

  const allSessions = (sessions ?? []) as StudySession[];
  const todaySessions = allSessions.filter((s) => s.scheduled_date === todayIso && !s.completed && !s.skipped);
  const doneToday = allSessions.filter((s) => s.scheduled_date === todayIso && s.completed);

  // Week strip data
  const weekInfo = weekDays.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    const list = allSessions.filter((s) => s.scheduled_date === key);
    return {
      date: d,
      scheduled: list.length,
      completed: list.filter((s) => s.completed).length,
    };
  });

  // Upcoming exams (next 30 days) with confidence-based progress
  const upcoming = ((exams ?? []) as Exam[])
    .filter((e) => differenceInCalendarDays(parseISO(e.exam_date), today) >= 0)
    .sort((a, b) => parseISO(a.exam_date).getTime() - parseISO(b.exam_date).getTime())
    .slice(0, 4);

  // For each upcoming exam, compute % of topics with avg ease > 2.0.
  const { data: allSessionsAllTime } = await supabase
    .from("study_sessions").select("topic_id, ease_factor, completed")
    .eq("user_id", user.id);
  const easeByTopic = new Map<string, number[]>();
  for (const s of (allSessionsAllTime ?? []) as Pick<StudySession, "topic_id" | "ease_factor" | "completed">[]) {
    if (!s.completed) continue;
    const arr = easeByTopic.get(s.topic_id) ?? [];
    arr.push(s.ease_factor);
    easeByTopic.set(s.topic_id, arr);
  }

  return (
    <div className="space-y-8">
      {(missed ?? []).length > 0 && (
        <RescheduleBanner count={(missed ?? []).length} />
      )}

      <section>
        <h2 className="text-2xl font-semibold text-slate-900">
          Today — {format(today, "EEEE d MMM")}
        </h2>
        {todaySessions.length === 0 ? (
          doneToday.length > 0 ? (
            <p className="mt-3 text-emerald-700">🎉 All done for today. Great work!</p>
          ) : (
            <p className="mt-3 text-slate-600">You&apos;re free today.</p>
          )
        ) : (
          <div className="mt-4 space-y-3">
            {todaySessions.map((s) => {
              const topic = topicById.get(s.topic_id);
              const exam = topic ? examById.get(topic.exam_id) : undefined;
              if (!topic || !exam) return null;
              return (
                <SessionCard
                  key={s.id}
                  sessionId={s.id}
                  subject={exam.subject}
                  subjectColor={exam.color}
                  topicName={topic.name}
                  difficulty={topic.difficulty}
                  reviewNumber={s.repetition_count + 1}
                />
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Upcoming exams</h2>
        {upcoming.length === 0 ? (
          <Link href="/exams" className="mt-3 inline-block text-primary">Add your first exam →</Link>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {upcoming.map((exam) => {
              const examTopics = ((topics ?? []) as Topic[]).filter((t) => t.exam_id === exam.id);
              const confidentCount = examTopics.filter((t) => {
                const eases = easeByTopic.get(t.id);
                if (!eases || eases.length === 0) return false;
                const avg = eases.reduce((a, b) => a + b, 0) / eases.length;
                return avg > 2.0;
              }).length;
              const pct = examTopics.length === 0 ? 0 : (confidentCount / examTopics.length) * 100;
              const daysAway = differenceInCalendarDays(parseISO(exam.exam_date), today);
              return (
                <Link key={exam.id} href={`/exams/${exam.id}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  style={{ borderLeft: `6px solid ${exam.color}` }}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{exam.subject}</p>
                    <span className="text-sm text-slate-500">{daysAway}d</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{confidentCount}/{examTopics.length} topics confident</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">This week</h2>
        <div className="mt-3">
          <WeekStrip days={weekInfo} />
        </div>
      </section>
    </div>
  );
}
