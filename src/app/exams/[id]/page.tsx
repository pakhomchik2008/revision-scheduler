import { redirect, notFound } from "next/navigation";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import TopicEditor from "./TopicEditor";
import GenerateScheduleButton from "./GenerateScheduleButton";
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

  const days = differenceInCalendarDays(parseISO(exam.exam_date), new Date());

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900" style={{ color: exam.color }}>{exam.subject}</h1>
          <p className="text-slate-500">
            {format(parseISO(exam.exam_date), "EEEE d MMMM yyyy")} — {days >= 0 ? `${days} days away` : "Past"}
          </p>
        </div>
        <GenerateScheduleButton examId={exam.id} hasTopics={(topics ?? []).length > 0} />
      </div>

      <div className="mt-6">
        <TopicEditor examId={exam.id} initial={(topics ?? []) as Topic[]} />
      </div>
    </div>
  );
}
