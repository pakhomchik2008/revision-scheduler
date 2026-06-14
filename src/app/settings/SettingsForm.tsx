"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateScheduleForExam } from "@/lib/generateSchedule";
import type { UserSettings } from "@/lib/supabase/types";

export default function SettingsForm({ initial, isFirstRun }: { initial: UserSettings; isFirstRun: boolean }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [askRegen, setAskRegen] = useState(false);

  async function save() {
    setSaving(true); setMsg(null);
    const supabase = createClient();
    const hoursChanged = s.daily_study_hours !== initial.daily_study_hours
      || s.include_weekends !== initial.include_weekends;
    const { error } = await supabase
      .from("user_settings").upsert(s, { onConflict: "user_id" });
    setSaving(false);
    if (error) return setMsg(error.message);
    setMsg("Saved.");
    if (isFirstRun) return router.push("/exams");
    if (hoursChanged) setAskRegen(true);
    else router.refresh();
  }

  async function regenerateAll() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setSaving(false);
    const { data: exams } = await supabase
      .from("exams").select("id, exam_date").eq("user_id", user.id);
    const future = (exams ?? []).filter(
      (e: { exam_date: string }) => new Date(e.exam_date) > new Date(),
    );
    for (const e of future) {
      try { await generateScheduleForExam(supabase, e.id, user.id); } catch {}
    }
    setSaving(false);
    setAskRegen(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mt-6 max-w-lg space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Daily study hours: <span className="font-bold">{s.daily_study_hours}</span>
        </label>
        <input
          type="range" min={1} max={8} value={s.daily_study_hours}
          onChange={(e) => setS({ ...s, daily_study_hours: Number(e.target.value) })}
          className="mt-2 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Study start time</label>
        <input
          type="time"
          value={`${String(s.study_start_hour).padStart(2, "0")}:00`}
          onChange={(e) => setS({ ...s, study_start_hour: Number(e.target.value.split(":")[0]) })}
          className="mt-1 rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox" checked={s.include_weekends}
          onChange={(e) => setS({ ...s, include_weekends: e.target.checked })}
        />
        Include weekends in my schedule
      </label>
      <div>
        <label className="block text-sm font-medium text-slate-700">Timezone</label>
        <input
          type="text" value={s.timezone}
          onChange={(e) => setS({ ...s, timezone: e.target.value })}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>
      {msg && <p className="text-sm text-slate-600">{msg}</p>}
      <button
        onClick={save} disabled={saving}
        className="rounded-lg bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : isFirstRun ? "Save & continue" : "Save"}
      </button>

      {askRegen && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Your daily hours / weekend setting changed. Regenerate the schedule for all upcoming exams?
          <div className="mt-2 flex gap-2">
            <button onClick={regenerateAll} disabled={saving}
              className="rounded-lg bg-warn px-3 py-1 text-white disabled:opacity-50">
              Regenerate all
            </button>
            <button onClick={() => setAskRegen(false)} className="rounded-lg border border-amber-400 px-3 py-1">
              Keep current schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
