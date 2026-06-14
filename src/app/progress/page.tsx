import { redirect } from "next/navigation";
import { differenceInCalendarDays, format, parseISO, startOfDay, subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import StreakCounter from "@/components/StreakCounter";
import ConfidenceBar from "@/components/ConfidenceBar";
import WeekBarChart from "./WeekBarChart";
import type { Exam, Topic, StudySession } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: exams }, { data: topics }, { data: sessions }] = await Promise.all([
    supabase.from("exams").select("*").eq("user_id", user.id),
    supabase.from("topics").select("*").eq("user_id", user.id),
    supabase.from("study_sessions").select("*").eq("user_id", user.id),
  ]);

  const examList = (exams ?? []) as Exam[];
  const topicList = (topics ?? []) as Topic[];
  const sessionList = (sessions ?? []) as StudySession[];

  // Streak: count back from today while a day has >=1 completed session.
  const today = startOfDay(new Date());
  const completedByDay = new Set(
    sessionList.filter((s) => s.completed).map((s) => s.scheduled_date),
  );
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const key = format(subDays(today, i), "yyyy-MM-dd");
    if (completedByDay.has(key)) streak++;
    else if (i > 0) break; // allow today to be empty without breaking streak
  }

  // Week chart: scheduled vs completed per day for last 7 days.
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const key = format(d, "yyyy-MM-dd");
    const list = sessionList.filter((s) => s.scheduled_date === key);
    return {
      day: format(d, "EEE"),
      scheduled: list.length,
      completed: list.filter((s) => s.completed).length,
    };
  });

  // Per-subject confidence: avg ease across topics.
  const examConfidence = examList.map((e) => {
    const examTopics = topicList.filter((t) => t.exam_id === e.id);
    const eases: number[] = [];
    for (const t of examTopics) {
      const tSessions = sessionList.filter((s) => s.topic_id === t.id && s.completed);
      if (tSessions.length === 0) continue;
      const avg = tSessions.reduce((a, s) => a + s.ease_factor, 0) / tSessions.length;
      eases.push(avg);
    }
    const ease = eases.length > 0 ? eases.reduce((a, b) => a + b, 0) / eases.length : 2.5;
    return { id: e.id, subject: e.subject, ease };
  });

  // Topic mastery table.
  const masteryRows = topicList.map((t) => {
    const tSessions = sessionList.filter((s) => s.topic_id === t.id);
    const completed = tSessions.filter((s) => s.completed);
    const latest = completed.sort((a, b) => parseISO(b.scheduled_date).getTime() - parseISO(a.scheduled_date).getTime())[0];
    const exam = examList.find((e) => e.id === t.exam_id);
    return {
      id: t.id,
      name: t.name,
      subject: exam?.subject ?? "",
      lastStudied: latest?.scheduled_date ?? null,
      ease: latest?.ease_factor ?? 2.5,
      next: latest?.next_review_date ?? null,
    };
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-slate-900">Progress</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <StreakCounter days={streak} />
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-slate-500">This week</p>
          <WeekBarChart data={week} />
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Per-subject confidence</h2>
        {examConfidence.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No data yet.</p>
        ) : (
          <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {examConfidence.map((c) => (
              <ConfidenceBar key={c.id} label={c.subject} ease={c.ease} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Topic mastery</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-3 py-2">Topic</th>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">Last studied</th>
                <th className="px-3 py-2">Ease</th>
                <th className="px-3 py-2">Next review</th>
              </tr>
            </thead>
            <tbody>
              {masteryRows.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-4 text-center text-slate-500">No topics yet.</td></tr>
              ) : masteryRows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-900">{r.name}</td>
                  <td className="px-3 py-2 text-slate-600">{r.subject}</td>
                  <td className="px-3 py-2 text-slate-600">{r.lastStudied ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-600">{r.ease.toFixed(2)}</td>
                  <td className="px-3 py-2 text-slate-600">{r.next ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
