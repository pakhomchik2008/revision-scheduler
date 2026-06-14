"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, format, startOfDay } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import type { UserSettings, StudySession } from "@/lib/supabase/types";

export default function RescheduleBanner({ count }: { count: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function reschedule() {
    setBusy(true); setMsg(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      const today = startOfDay(new Date());
      const todayIso = format(today, "yyyy-MM-dd");

      const { data: missed } = await supabase.from("study_sessions").select("id")
        .eq("user_id", user.id).eq("completed", false).eq("skipped", false)
        .lt("scheduled_date", todayIso);

      const { data: settings } = await supabase
        .from("user_settings").select("*").eq("user_id", user.id).single<UserSettings>();
      const dailyMax = settings?.daily_study_hours ?? 3;

      const { data: future } = await supabase.from("study_sessions").select("scheduled_date")
        .eq("user_id", user.id).eq("completed", false).gte("scheduled_date", todayIso);
      const usage = new Map<string, number>();
      for (const r of (future ?? []) as Pick<StudySession, "scheduled_date">[]) {
        usage.set(r.scheduled_date, (usage.get(r.scheduled_date) ?? 0) + 1);
      }

      let dayOffset = 0;
      for (const m of missed ?? []) {
        let placed = false;
        for (let probe = 0; probe < 60 && !placed; probe++) {
          const candidate = format(addDays(today, dayOffset + probe), "yyyy-MM-dd");
          const used = usage.get(candidate) ?? 0;
          if (used < dailyMax) {
            await supabase.from("study_sessions").update({ scheduled_date: candidate }).eq("id", m.id);
            usage.set(candidate, used + 1);
            dayOffset = probe;
            placed = true;
          }
        }
      }

      setMsg("Rescheduled.");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function dismiss() {
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const todayIso = format(startOfDay(new Date()), "yyyy-MM-dd");
    await supabase.from("study_sessions").update({ skipped: true })
      .eq("user_id", user.id).eq("completed", false).eq("skipped", false)
      .lt("scheduled_date", todayIso);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
      <p className="text-amber-900 font-medium">You have {count} missed session{count === 1 ? "" : "s"}.</p>
      <div className="mt-2 flex gap-2">
        <button onClick={reschedule} disabled={busy}
          className="rounded-lg bg-warn px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50">
          {busy ? "Working…" : "Reschedule"}
        </button>
        <button onClick={dismiss} disabled={busy}
          className="rounded-lg border border-amber-300 px-4 py-1.5 text-sm text-amber-900">
          Dismiss
        </button>
      </div>
      {msg && <p className="mt-1 text-xs text-amber-700">{msg}</p>}
    </div>
  );
}
