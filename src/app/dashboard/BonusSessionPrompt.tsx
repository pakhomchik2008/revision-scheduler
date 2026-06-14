"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, startOfDay } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import type { Topic } from "@/lib/supabase/types";

export default function BonusSessionPrompt({ topic, examColor }: { topic: Topic; examColor: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setBusy(false);
    const { data, error } = await supabase.from("study_sessions").insert({
      user_id: user.id, topic_id: topic.id,
      scheduled_date: format(startOfDay(new Date()), "yyyy-MM-dd"),
      completed: false, skipped: false,
      repetition_count: 0, ease_factor: 2.5,
    }).select("id").single<{ id: string }>();
    setBusy(false);
    if (error || !data) return;
    router.push(`/study/${data.id}`);
  }

  return (
    <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4">
      <p className="text-emerald-900">
        ✨ Bonus session? Your weakest topic right now is{" "}
        <strong style={{ color: examColor }}>{topic.name}</strong>.
      </p>
      <button onClick={start} disabled={busy}
        className="mt-2 rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50">
        {busy ? "Loading…" : "Start bonus session"}
      </button>
    </div>
  );
}
