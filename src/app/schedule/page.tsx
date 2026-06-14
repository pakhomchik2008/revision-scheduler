import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CalendarView from "./CalendarView";
import type { Exam, Topic, StudySession } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: exams }, { data: topics }, { data: sessions }] = await Promise.all([
    supabase.from("exams").select("*").eq("user_id", user.id),
    supabase.from("topics").select("*").eq("user_id", user.id),
    supabase.from("study_sessions").select("*").eq("user_id", user.id),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Schedule</h1>
      <p className="text-slate-500">All your study days at a glance.</p>
      <div className="mt-4">
        <CalendarView
          exams={(exams ?? []) as Exam[]}
          topics={(topics ?? []) as Topic[]}
          sessions={(sessions ?? []) as StudySession[]}
        />
      </div>
    </div>
  );
}
