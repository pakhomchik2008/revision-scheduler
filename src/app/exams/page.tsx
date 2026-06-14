import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ExamCard from "@/components/ExamCard";
import AddExamButton from "./AddExamButton";
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

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Your exams</h1>
        <AddExamButton />
      </div>

      {examList.length === 0 ? (
        <div className="mt-16 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-600">No exams yet.</p>
          <p className="mt-1 text-sm text-slate-500">Add your first exam to get started.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {examList.map((exam) => {
            const tIds = topicByExam.get(exam.id) ?? [];
            let total = 0, done = 0;
            for (const id of tIds) {
              const c = completionByTopic.get(id);
              if (c) { total += c.total; done += c.done; }
            }
            const pct = total > 0 ? (done / total) * 100 : 0;
            return (
              <ExamCard
                key={exam.id}
                exam={exam}
                topicCount={tIds.length}
                completionPct={pct}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
