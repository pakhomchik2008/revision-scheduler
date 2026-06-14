"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserSettings } from "@/lib/supabase/types";

export default function SettingsForm({ initial, isFirstRun }: { initial: UserSettings; isFirstRun: boolean }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    const { error } = await createClient()
      .from("user_settings")
      .upsert(s, { onConflict: "user_id" });
    setSaving(false);
    if (error) return setMsg(error.message);
    setMsg("Saved.");
    if (isFirstRun) router.push("/exams");
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
    </div>
  );
}
