import { redirect, notFound } from "next/navigation";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import TopicEditor from "./TopicEditor";
import GenerateScheduleButton from "./GenerateScheduleButton";
import ExamActions from "./ExamActions";
import type { Exam, Topic } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function ExamDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: exam } = await supabase
    .from("exams").select("*").eq("id", params.id).eq("user_id", user.id).maybeSingle<Exam>();
  if (!exam) notFound();

  const { data: topics } = await supabase
    .from("topics").select("*")
    .eq("exam_id", exam.id).eq("user_id", user.id)
    .order("order_index", { ascending: true });

  const topicIds = (topics ?? []).map((t) => t.id);
  const { count: scheduledCount } = topicIds.length
    ? await supabase
        .from("study_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id).eq("completed", false)
        .in("topic_id", topicIds)
    : { count: 0 };
  const hasSchedule = (scheduledCount ?? 0) > 0;

  const days = differenceInCalendarDays(parseISO(exam.exam_date), new Date());

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-slate-900" style={{ color: exam.color }}>{exam.subject}</h1>
          <p className="text-slate-500">
            {format(parseISO(exam.exam_date), "EEEE d MMMM yyyy")} — {days >= 0 ? `${days} days away` : "Past"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <ExamActions exam={exam} />
          <GenerateScheduleButton examId={exam.id} hasTopics={(topics ?? []).length > 0} />
        </div>
      </div>

      <div className="mt-6">
        <TopicEditor examId={exam.id} initial={(topics ?? []) as Topic[]} hasSchedule={hasSchedule} />
      </div>
    </div>
  );
}
