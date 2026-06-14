import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudyClient from "./StudyClient";
import type { StudySession, Topic, Exam } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function StudyPage({ params }: { params: { sessionId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: session } = await supabase
    .from("study_sessions").select("*")
    .eq("id", params.sessionId).eq("user_id", user.id).maybeSingle<StudySession>();
  if (!session) notFound();

  const { data: topic } = await supabase
    .from("topics").select("*").eq("id", session.topic_id).maybeSingle<Topic>();
  if (!topic) notFound();

  const { data: exam } = await supabase
    .from("exams").select("*").eq("id", topic.exam_id).maybeSingle<Exam>();
  if (!exam) notFound();

  return <StudyClient session={session} topic={topic} exam={exam} />;
}
