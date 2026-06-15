import { redirect } from "next/navigation";
import { format, parseISO, startOfDay, differenceInCalendarDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { buildWeek } from "@/components/WeekStrip";
import { insertStrugglingTopicBoost, detectExamTomorrow, pickWeakestTopic } from "@/lib/adaptive";
import DashboardClient from "./DashboardClient";
import type { Exam, Topic, StudySession } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const boost = await insertStrugglingTopicBoost(supabase, user.id);

  const today = startOfDay(new Date());
  const todayIso = format(today, "yyyy-MM-dd");
  const weekDays = buildWeek();
  const weekStart = format(weekDays[0], "yyyy-MM-dd");
  const weekEnd = format(weekDays[6], "yyyy-MM-dd");

  const [{ data: exams }, { data: topics }, { data: sessions }, { data: missed }, { data: allSessions }] = await Promise.all([
    supabase.from("exams").select("*").eq("user_id", user.id),
    supabase.from("topics").select("*").eq("user_id", user.id),
    supabase.from("study_sessions").select("*").eq("user_id", user.id)
      .gte("scheduled_date", weekStart).lte("scheduled_date", weekEnd),
    supabase.from("study_sessions").select("id, scheduled_date")
      .eq("user_id", user.id).eq("completed", false).eq("skipped", false)
      .lt("scheduled_date", todayIso),
    supabase.from("study_sessions").select("topic_id, ease_factor, completed, scheduled_date")
      .eq("user_id", user.id),
  ]);

  const examList = (exams ?? []) as Exam[];
  const topicList = (topics ?? []) as Topic[];
  const examById = new Map(examList.map((e) => [e.id, e]));
  const topicById = new Map(topicList.map((t) => [t.id, t]));
  const weekSessions = (sessions ?? []) as StudySession[];

  const todaySess = weekSessions.filter((s) => s.scheduled_date === todayIso && !s.completed && !s.skipped);
  const doneToday = weekSessions.filter((s) => s.scheduled_date === todayIso && s.completed);

  const todayCards = todaySess.map((s) => {
    const topic = topicById.get(s.topic_id)!;
    const exam = examById.get(topic?.exam_id ?? "")!;
    return { s, topic, exam };
  }).filter((x) => x.topic && x.exam);

  const weekInfo = weekDays.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    const list = weekSessions.filter((s) => s.scheduled_date === key);
    return { date: d.toISOString(), scheduled: list.length, completed: list.filter((s) => s.completed).length };
  });

  const easeByTopic = new Map<string, number[]>();
  for (const s of (allSessions ?? []) as Pick<StudySession, "topic_id" | "ease_factor" | "completed">[]) {
    if (!s.completed) continue;
    const arr = easeByTopic.get(s.topic_id) ?? [];
    arr.push(s.ease_factor);
    easeByTopic.set(s.topic_id, arr);
  }

  const upcoming = examList
    .filter((e) => differenceInCalendarDays(parseISO(e.exam_date), today) >= 0)
    .sort((a, b) => parseISO(a.exam_date).getTime() - parseISO(b.exam_date).getTime())
    .slice(0, 4)
    .map((exam) => {
      const examTopics = topicList.filter((t) => t.exam_id === exam.id);
      const confidentCount = examTopics.filter((t) => {
        const eases = easeByTopic.get(t.id);
        if (!eases || eases.length === 0) return false;
        return eases.reduce((a, b) => a + b, 0) / eases.length > 2.0;
      }).length;
      return {
        exam, confidentCount, topicTotal: examTopics.length,
        daysAway: differenceInCalendarDays(parseISO(exam.exam_date), today),
      };
    });

  const examTomorrow = detectExamTomorrow(examList);
  const hour = new Date().getHours();
  let bonusTopic: Topic | null = null;
  let bonusExamColor = "#10B981";
  if (hour < 12 && todaySess.length === 0 && doneToday.length > 0) {
    bonusTopic = pickWeakestTopic(topicList, (allSessions ?? []) as StudySession[], todayIso);
    if (bonusTopic) bonusExamColor = examById.get(bonusTopic.exam_id)?.color ?? "#10B981";
  }

  return (
    <DashboardClient
      todayDate={today.toISOString()}
      todaySessions={todayCards}
      doneCount={doneToday.length}
      missedCount={(missed ?? []).length}
      weekInfo={weekInfo}
      upcoming={upcoming}
      boostInserted={boost.inserted}
      boostNames={boost.topicNames}
      examTomorrow={examTomorrow?.exam ?? null}
      bonusTopic={bonusTopic}
      bonusExamColor={bonusExamColor}
    />
  );
}
