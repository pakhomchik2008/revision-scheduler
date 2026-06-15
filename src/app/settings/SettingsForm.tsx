"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateScheduleForExam } from "@/lib/generateSchedule";
import { useI18n } from "@/components/I18nProvider";
import { useToast } from "@/components/Toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { UserSettings } from "@/lib/supabase/types";

const VALID_TIMEZONES = Intl.supportedValuesOf ? Intl.supportedValuesOf("timeZone") : [];

export default function SettingsForm({ initial, isFirstRun }: { initial: UserSettings; isFirstRun: boolean }) {
  const router = useRouter();
  const { t } = useI18n();
  const { toast } = useToast();
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [askRegen, setAskRegen] = useState(false);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const hoursChanged = s.daily_study_hours !== initial.daily_study_hours
      || s.include_weekends !== initial.include_weekends;

    // Validate timezone
    if (VALID_TIMEZONES.length > 0 && s.timezone && !VALID_TIMEZONES.includes(s.timezone)) {
      toast("Invalid timezone. Please use a valid IANA timezone.", "error");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("user_settings").upsert(s, { onConflict: "user_id" });
    setSaving(false);
    if (error) { toast(error.message, "error"); return; }
    toast(t.settings_saved);
    if (isFirstRun) return router.push("/exams");
    if (hoursChanged) setAskRegen(true);
    else router.refresh();
  }

  async function regenerateAll() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setSaving(false);
    const { data: exams } = await supabase.from("exams").select("id, exam_date").eq("user_id", user.id);
    const future = (exams ?? []).filter((e: { exam_date: string }) => new Date(e.exam_date) > new Date());
    for (const e of future) { try { await generateScheduleForExam(supabase, e.id, user.id); } catch {} }
    setSaving(false); setAskRegen(false);
    toast(t.toast_updated);
    router.push("/dashboard"); router.refresh();
  }

  return (
    <div className="mt-6 max-w-lg space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="daily-hours" className="block text-sm font-medium text-slate-700">
          {t.settings_daily_hours}: <span className="font-bold">{s.daily_study_hours}</span>
        </label>
        <input
          id="daily-hours"
          type="range" min={1} max={8} value={s.daily_study_hours}
          onChange={(e) => setS({ ...s, daily_study_hours: Number(e.target.value) })}
          className="mt-2 w-full"
          aria-valuemin={1} aria-valuemax={8} aria-valuenow={s.daily_study_hours}
        />
      </div>
      <div>
        <label htmlFor="start-time" className="block text-sm font-medium text-slate-700">{t.settings_start_time}</label>
        <input
          id="start-time"
          type="time" value={`${String(s.study_start_hour).padStart(2, "0")}:00`}
          onChange={(e) => setS({ ...s, study_start_hour: Number(e.target.value.split(":")[0]) })}
          className="mt-1 rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>
      <label htmlFor="include-weekends" className="flex items-center gap-2 text-sm text-slate-700">
        <input
          id="include-weekends"
          type="checkbox" checked={s.include_weekends}
          onChange={(e) => setS({ ...s, include_weekends: e.target.checked })}
        />
        {t.settings_include_weekends}
      </label>
      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-slate-700">{t.settings_timezone}</label>
        <input
          id="timezone"
          type="text" value={s.timezone}
          onChange={(e) => setS({ ...s, timezone: e.target.value })}
          list="tz-suggestions"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <datalist id="tz-suggestions">
          {["America/New_York", "America/Chicago", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Europe/Kyiv", "Europe/Moscow", "Asia/Tokyo", "Australia/Sydney"].map((tz) => (
            <option key={tz} value={tz} />
          ))}
        </datalist>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">{t.settings_language}</label>
        <LanguageSwitcher />
      </div>
      <button onClick={save} disabled={saving}
        className="rounded-lg bg-primary px-4 py-2 font-medium text-white disabled:opacity-50">
        {saving ? t.settings_saving : isFirstRun ? t.settings_save_continue : t.settings_save}
      </button>
      {askRegen && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" role="alert">
          {t.settings_hours_changed}
          <div className="mt-2 flex gap-2">
            <button onClick={regenerateAll} disabled={saving}
              className="rounded-lg bg-warn px-3 py-1 text-white disabled:opacity-50">{t.settings_regen_all}</button>
            <button onClick={() => setAskRegen(false)}
              className="rounded-lg border border-amber-400 px-3 py-1">{t.settings_keep_current}</button>
          </div>
        </div>
      )}
    </div>
  );
}
