import { redirect } from "next/navigation";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import AddExamButton from "./AddExamButton";
import ExamsHeader from "./ExamsHeader";
import ExamsList from "./ExamsList";
import type { Exam, Topic, StudySession } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: exams } = await supabase
    .from("exams")
    .select("*")
    .eq("user_id", user.id)
    .order("exam_date", { ascending: true });

  const examList = (exams ?? []) as Exam[];
  const examIds = examList.map((e) => e.id);

  const { data: topics } = examIds.length
    ? await supabase.from("topics").select("id, exam_id").in("exam_id", examIds)
    : { data: [] as Pick<Topic, "id" | "exam_id">[] };

  const { data: sessions } = examIds.length
    ? await supabase
        .from("study_sessions")
        .select("topic_id, completed")
        .eq("user_id", user.id)
    : { data: [] as Pick<StudySession, "topic_id" | "completed">[] };

  const topicByExam = new Map<string, string[]>();
  for (const t of topics ?? []) {
    const arr = topicByExam.get(t.exam_id) ?? [];
    arr.push(t.id);
    topicByExam.set(t.exam_id, arr);
  }

  const completionByTopic = new Map<string, { total: number; done: number }>();
  for (const s of sessions ?? []) {
    const c = completionByTopic.get(s.topic_id) ?? { total: 0, done: 0 };
    c.total++;
    if (s.completed) c.done++;
    completionByTopic.set(s.topic_id, c);
  }

  // Compute completion data per exam
  const examData = examList.map((exam) => {
    const tIds = topicByExam.get(exam.id) ?? [];
    let total = 0, done = 0;
    for (const id of tIds) {
      const c = completionByTopic.get(id);
      if (c) { total += c.total; done += c.done; }
    }
    const pct = total > 0 ? (done / total) * 100 : 0;
    return { exam, topicCount: tIds.length, completionPct: pct };
  });

  const upcoming = examData.filter(
    (d) => differenceInCalendarDays(parseISO(d.exam.exam_date), new Date()) >= 0,
  );
  const past = examData.filter(
    (d) => differenceInCalendarDays(parseISO(d.exam.exam_date), new Date()) < 0,
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <ExamsHeader />
        <AddExamButton />
      </div>
      <ExamsList upcoming={upcoming} past={past} hasExams={examList.length > 0} />
    </div>
  );
}
