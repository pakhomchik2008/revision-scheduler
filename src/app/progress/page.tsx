import { redirect } from "next/navigation";
import { format, parseISO, startOfDay, subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import ProgressClient from "./ProgressClient";
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

  const today = startOfDay(new Date());
  const completedByDay = new Set(sessionList.filter((s) => s.completed).map((s) => s.scheduled_date));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const key = format(subDays(today, i), "yyyy-MM-dd");
    if (completedByDay.has(key)) streak++;
    else if (i > 0) break;
  }

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const key = format(d, "yyyy-MM-dd");
    const list = sessionList.filter((s) => s.scheduled_date === key);
    return { day: format(d, "EEE"), scheduled: list.length, completed: list.filter((s) => s.completed).length };
  });

  const examConfidence = examList.map((e) => {
    const examTopics = topicList.filter((tp) => tp.exam_id === e.id);
    const eases: number[] = [];
    for (const tp of examTopics) {
      const tSessions = sessionList.filter((s) => s.topic_id === tp.id && s.completed);
      if (tSessions.length === 0) continue;
      eases.push(tSessions.reduce((a, s) => a + s.ease_factor, 0) / tSessions.length);
    }
    return { id: e.id, subject: e.subject, ease: eases.length > 0 ? eases.reduce((a, b) => a + b, 0) / eases.length : 2.5 };
  });

  const masteryRows = topicList.map((tp) => {
    const completed = sessionList.filter((s) => s.topic_id === tp.id && s.completed)
      .sort((a, b) => parseISO(b.scheduled_date).getTime() - parseISO(a.scheduled_date).getTime());
    const latest = completed[0];
    const exam = examList.find((e) => e.id === tp.exam_id);
    return {
      id: tp.id, name: tp.name, subject: exam?.subject ?? "",
      lastStudied: latest?.scheduled_date ?? null,
      ease: latest?.ease_factor ?? 2.5,
      next: latest?.next_review_date ?? null,
    };
  });

  return <ProgressClient streak={streak} week={week} examConfidence={examConfidence} masteryRows={masteryRows} />;
}
