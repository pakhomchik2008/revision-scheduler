import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from "date-fns";
import type { Exam, StudySession, Topic } from "./supabase/types";
import { DEFAULT_EASE } from "./sm2";

const STRUGGLING_EASE_THRESHOLD = 2.0;
const NEAR_EXAM_DAYS = 7;

/**
 * For each upcoming exam within NEAR_EXAM_DAYS, find topics whose latest
 * completed session has ease_factor < threshold. If they don't already have
 * a future incomplete session, insert one for tomorrow.
 *
 * Returns the number of extra sessions inserted and the affected topic names.
 */
export async function insertStrugglingTopicBoost(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ inserted: number; topicNames: string[] }> {
  const today = startOfDay(new Date());

  const [{ data: exams }, { data: topics }, { data: sessions }] = await Promise.all([
    supabase.from("exams").select("*").eq("user_id", userId),
    supabase.from("topics").select("*").eq("user_id", userId),
    supabase.from("study_sessions").select("*").eq("user_id", userId),
  ]);

  const examList = (exams ?? []) as Exam[];
  const topicList = (topics ?? []) as Topic[];
  const sessionList = (sessions ?? []) as StudySession[];

  const nearExams = examList.filter((e) => {
    const days = differenceInCalendarDays(parseISO(e.exam_date), today);
    return days > 0 && days <= NEAR_EXAM_DAYS;
  });

  const inserts: Array<Partial<StudySession>> = [];
  const names: string[] = [];

  for (const exam of nearExams) {
    const examTopics = topicList.filter((t) => t.exam_id === exam.id);
    for (const t of examTopics) {
      const completed = sessionList
        .filter((s) => s.topic_id === t.id && s.completed)
        .sort((a, b) => parseISO(b.scheduled_date).getTime() - parseISO(a.scheduled_date).getTime());
      if (completed.length === 0) continue;
      const latestEase = completed[0].ease_factor;
      if (latestEase >= STRUGGLING_EASE_THRESHOLD) continue;

      const alreadyScheduled = sessionList.some(
        (s) => s.topic_id === t.id && !s.completed && !s.skipped &&
          parseISO(s.scheduled_date) >= today,
      );
      if (alreadyScheduled) continue;

      inserts.push({
        user_id: userId,
        topic_id: t.id,
        scheduled_date: format(addDays(today, 1), "yyyy-MM-dd"),
        completed: false,
        skipped: false,
        repetition_count: completed[0].repetition_count,
        ease_factor: latestEase,
      });
      names.push(t.name);
    }
  }

  if (inserts.length === 0) return { inserted: 0, topicNames: [] };
  const { error } = await supabase.from("study_sessions").insert(inserts);
  if (error) return { inserted: 0, topicNames: [] };
  return { inserted: inserts.length, topicNames: names };
}

export interface ExamTomorrowAlert {
  exam: Exam;
  topicIds: string[];
}

export function detectExamTomorrow(exams: Exam[]): ExamTomorrowAlert | null {
  const today = startOfDay(new Date());
  for (const e of exams) {
    if (differenceInCalendarDays(parseISO(e.exam_date), today) === 1) {
      return { exam: e, topicIds: [] };
    }
  }
  return null;
}

/**
 * Suggest a bonus topic when the user finished early in the day. Returns the
 * topic with the lowest avg ease_factor that isn't already scheduled for today.
 */
export function pickWeakestTopic(
  topics: Topic[],
  sessions: StudySession[],
  todayIso: string,
): Topic | null {
  const easeByTopic = new Map<string, number[]>();
  for (const s of sessions) {
    if (!s.completed) continue;
    const arr = easeByTopic.get(s.topic_id) ?? [];
    arr.push(s.ease_factor);
    easeByTopic.set(s.topic_id, arr);
  }
  const todayTopicIds = new Set(
    sessions.filter((s) => s.scheduled_date === todayIso).map((s) => s.topic_id),
  );
  const ranked = topics
    .filter((t) => !todayTopicIds.has(t.id))
    .map((t) => {
      const eases = easeByTopic.get(t.id) ?? [DEFAULT_EASE];
      return { topic: t, avg: eases.reduce((a, b) => a + b, 0) / eases.length };
    })
    .sort((a, b) => a.avg - b.avg);
  return ranked[0]?.topic ?? null;
}
