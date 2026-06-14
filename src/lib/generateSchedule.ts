import { addDays, differenceInCalendarDays, format, isWeekend, parseISO } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Exam, Topic, UserSettings } from "./supabase/types";
import { DEFAULT_EASE } from "./sm2";

const INITIAL_SESSIONS_BY_DIFFICULTY: Record<1 | 2 | 3, number> = { 1: 1, 2: 2, 3: 3 };

interface PlannedSession {
  topic_id: string;
  scheduled_date: string;
}

/**
 * Build available study days (today .. exam_date - 1), honoring weekends setting.
 */
function buildAvailableDays(examDate: Date, includeWeekends: boolean): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = addDays(examDate, -1);
  const totalDays = differenceInCalendarDays(last, today);
  if (totalDays < 0) return [];
  const days: Date[] = [];
  for (let i = 0; i <= totalDays; i++) {
    const d = addDays(today, i);
    if (!includeWeekends && isWeekend(d)) continue;
    days.push(d);
  }
  return days;
}

interface TopicWithExam {
  topic: Topic;
  exam: Exam;
}

/**
 * Distribute initial study sessions for a single exam's topics across the
 * exam's available days, honoring daily-hour limits (1 session per hour).
 *
 * Topics ordered hardest-first; sessions for the same topic are spaced.
 */
export function planExamSessions(
  topicsWithExam: TopicWithExam[],
  settings: UserSettings,
  perDayUsage: Map<string, number>,
): PlannedSession[] {
  // Group by exam, plan per-exam.
  const byExam = new Map<string, TopicWithExam[]>();
  for (const tw of topicsWithExam) {
    const list = byExam.get(tw.exam.id) ?? [];
    list.push(tw);
    byExam.set(tw.exam.id, list);
  }

  // Order exams by exam_date asc.
  const examOrder = [...byExam.entries()].sort(
    ([, a], [, b]) => parseISO(a[0].exam.exam_date).getTime() - parseISO(b[0].exam.exam_date).getTime(),
  );

  const planned: PlannedSession[] = [];

  for (const [, items] of examOrder) {
    const exam = items[0].exam;
    const examDate = parseISO(exam.exam_date);
    const days = buildAvailableDays(examDate, settings.include_weekends);
    if (days.length === 0) continue;

    // Hardest first, then by order_index.
    const ordered = [...items].sort((a, b) => {
      if (b.topic.difficulty !== a.topic.difficulty) return b.topic.difficulty - a.topic.difficulty;
      return a.topic.order_index - b.topic.order_index;
    });

    // Build the queue: each topic appears N times based on difficulty.
    const queue: string[] = [];
    let maxSessions = 0;
    const sessionLists: Map<string, number> = new Map();
    for (const { topic } of ordered) {
      const n = INITIAL_SESSIONS_BY_DIFFICULTY[topic.difficulty as 1 | 2 | 3];
      sessionLists.set(topic.id, n);
      maxSessions = Math.max(maxSessions, n);
    }
    // Interleave to spread practice across days.
    for (let round = 0; round < maxSessions; round++) {
      for (const { topic } of ordered) {
        if ((sessionLists.get(topic.id) ?? 0) > round) queue.push(topic.id);
      }
    }

    // Assign to days respecting daily_study_hours.
    let dayIdx = 0;
    for (const topicId of queue) {
      let placed = false;
      for (let probe = 0; probe < days.length; probe++) {
        const idx = (dayIdx + probe) % days.length;
        const key = format(days[idx], "yyyy-MM-dd");
        const used = perDayUsage.get(key) ?? 0;
        if (used < settings.daily_study_hours) {
          planned.push({ topic_id: topicId, scheduled_date: key });
          perDayUsage.set(key, used + 1);
          dayIdx = (idx + 1) % days.length;
          placed = true;
          break;
        }
      }
      if (!placed) break; // No capacity left before this exam.
    }
  }

  return planned;
}

/**
 * Regenerate the schedule for a single exam.
 * - Deletes existing incomplete sessions for the exam's topics (avoids dupes).
 * - Inserts fresh planned sessions.
 */
export async function generateScheduleForExam(
  supabase: SupabaseClient,
  examId: string,
  userId: string,
): Promise<{ inserted: number }> {
  const { data: exam, error: examErr } = await supabase
    .from("exams")
    .select("*")
    .eq("id", examId)
    .eq("user_id", userId)
    .single<Exam>();
  if (examErr || !exam) throw examErr ?? new Error("Exam not found");

  const { data: topics, error: tErr } = await supabase
    .from("topics")
    .select("*")
    .eq("exam_id", examId)
    .eq("user_id", userId)
    .order("order_index", { ascending: true });
  if (tErr) throw tErr;
  if (!topics || topics.length === 0) return { inserted: 0 };

  const { data: settings, error: sErr } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single<UserSettings>();
  if (sErr || !settings) throw sErr ?? new Error("Settings missing");

  const topicIds = topics.map((t) => t.id);

  // Delete existing incomplete sessions to avoid duplicates.
  const { error: dErr } = await supabase
    .from("study_sessions")
    .delete()
    .eq("user_id", userId)
    .eq("completed", false)
    .in("topic_id", topicIds);
  if (dErr) throw dErr;

  // Compute usage from other exams' already-scheduled, incomplete sessions
  // so we don't double-book days.
  const { data: existing } = await supabase
    .from("study_sessions")
    .select("scheduled_date")
    .eq("user_id", userId)
    .eq("completed", false);
  const perDayUsage = new Map<string, number>();
  for (const s of existing ?? []) {
    perDayUsage.set(s.scheduled_date, (perDayUsage.get(s.scheduled_date) ?? 0) + 1);
  }

  const planned = planExamSessions(
    (topics as Topic[]).map((topic) => ({ topic, exam })),
    settings,
    perDayUsage,
  );

  if (planned.length === 0) return { inserted: 0 };

  const rows = planned.map((p) => ({
    user_id: userId,
    topic_id: p.topic_id,
    scheduled_date: p.scheduled_date,
    completed: false,
    skipped: false,
    repetition_count: 0,
    ease_factor: DEFAULT_EASE,
  }));

  const { error: iErr } = await supabase.from("study_sessions").insert(rows);
  if (iErr) throw iErr;

  return { inserted: rows.length };
}
