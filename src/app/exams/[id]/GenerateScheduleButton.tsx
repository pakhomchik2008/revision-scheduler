"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateScheduleForExam } from "@/lib/generateSchedule";
import { useI18n } from "@/components/I18nProvider";

export default function GenerateScheduleButton({
  examId, hasTopics,
}: { examId: string; hasTopics: boolean }) {
  const router = useRouter();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function go() {
    setBusy(true); setMsg(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { inserted } = await generateScheduleForExam(supabase, examId, user.id);
      setMsg(`${inserted} ${t.exam_scheduled_sessions}`);
      router.push("/dashboard");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  }

  if (!hasTopics) return null;
  return (
    <div className="text-right">
      <button onClick={go} disabled={busy}
        className="rounded-lg bg-primary px-4 py-2 font-medium text-white disabled:opacity-50">
        {busy ? t.exam_generating : t.exam_generate}
      </button>
      {msg && <p className="mt-1 text-xs text-slate-500">{msg}</p>}
    </div>
  );
}
