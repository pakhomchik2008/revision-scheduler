"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/components/I18nProvider";
import { useToast } from "@/components/Toast";
import { SUBJECT_COLORS } from "@/lib/colors";

export default function AddExamButton() {
  const router = useRouter();
  const { t } = useI18n();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [color, setColor] = useState(SUBJECT_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setErr(null);
    const trimmed = subject.trim();
    if (!trimmed) { setErr(t.validation_required); return; }
    if (trimmed.length > 100) { setErr(t.validation_too_long); return; }
    if (!date) { setErr(t.validation_required); return; }
    const examDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (examDate < today) { setErr(t.validation_future_date); return; }

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErr("Not signed in"); setSaving(false); return; }
    const { error } = await supabase.from("exams").insert({ user_id: user.id, subject: trimmed, exam_date: date, color });
    setSaving(false);
    if (error) return setErr(error.message);
    setOpen(false); setSubject(""); setDate("");
    toast(t.toast_success);
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg bg-primary px-4 py-2 text-white font-medium">
        {t.exams_add}
      </button>
      {open && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">{t.exams_add_modal_title}</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="exam-subject" className="block text-sm font-medium text-slate-700 mb-1">
                  {t.exams_subject_placeholder}
                </label>
                <input
                  id="exam-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value.slice(0, 100))}
                  maxLength={100}
                  placeholder={t.exams_subject_placeholder}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                {subject.length > 80 && (
                  <p className="mt-1 text-xs text-amber-600">{subject.length}/100</p>
                )}
              </div>
              <div>
                <label htmlFor="exam-date" className="block text-sm font-medium text-slate-700 mb-1">
                  Exam date
                </label>
                <input
                  id="exam-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">{t.exams_colour}</p>
                <div className="flex gap-2" role="radiogroup" aria-label={t.exams_colour}>
                  {SUBJECT_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      role="radio" aria-checked={color === c}
                      className={`h-8 w-8 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-slate-700" : ""}`}
                      style={{ background: c }} aria-label={`Color ${c}`} />
                  ))}
                </div>
              </div>
              {err && <p className="text-sm text-danger" role="alert">{err}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => { setOpen(false); setErr(null); }} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700">
                  {t.exams_cancel}
                </button>
                <button onClick={save} disabled={!subject.trim() || !date || saving}
                  className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50">
                  {saving ? t.exams_saving : t.exams_add}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
