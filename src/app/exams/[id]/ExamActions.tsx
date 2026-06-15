"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/components/I18nProvider";
import { useToast } from "@/components/Toast";
import { SUBJECT_COLORS } from "@/lib/colors";
import type { Exam } from "@/lib/supabase/types";

export default function ExamActions({ exam }: { exam: Exam }) {
  const router = useRouter();
  const { t } = useI18n();
  const { toast } = useToast();
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [busy, setBusy] = useState(false);

  // Edit state
  const [subject, setSubject] = useState(exam.subject);
  const [date, setDate] = useState(exam.exam_date);
  const [color, setColor] = useState(exam.color);

  async function deleteExam() {
    setBusy(true);
    const supabase = createClient();
    // Delete study sessions for this exam's topics first
    const { data: topicRows } = await supabase
      .from("topics").select("id").eq("exam_id", exam.id);
    const topicIds = (topicRows ?? []).map((t: { id: string }) => t.id);
    if (topicIds.length > 0) {
      await supabase.from("study_sessions").delete().in("topic_id", topicIds);
    }
    // Delete topics
    await supabase.from("topics").delete().eq("exam_id", exam.id);
    // Delete exam
    await supabase.from("exams").delete().eq("id", exam.id);
    toast(t.toast_deleted);
    router.push("/exams");
    router.refresh();
  }

  async function saveEdit() {
    if (!subject.trim()) return;
    if (subject.length > 100) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("exams")
      .update({ subject: subject.trim(), exam_date: date, color })
      .eq("id", exam.id);
    setBusy(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    toast(t.toast_updated);
    setShowEdit(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setShowEdit(true)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          aria-label={t.exam_edit}
        >
          {t.exam_edit}
        </button>
        <button
          onClick={() => setShowDelete(true)}
          className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
          aria-label={t.exam_delete}
        >
          {t.exam_delete}
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDelete && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">{t.exam_delete}</h2>
            <p className="mt-2 text-sm text-slate-600">{t.exam_delete_confirm}</p>
            <p className="mt-1 text-xs text-red-600">{t.exam_delete_warning}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowDelete(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
              >
                {t.exams_cancel}
              </button>
              <button
                onClick={deleteExam}
                disabled={busy}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {busy ? "..." : t.exam_delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">{t.exam_edit_title}</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="edit-subject" className="block text-sm font-medium text-slate-700">
                  {t.exams_subject_placeholder}
                </label>
                <input
                  id="edit-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value.slice(0, 100))}
                  maxLength={100}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                {subject.length > 80 && (
                  <p className="mt-1 text-xs text-amber-600">{subject.length}/100</p>
                )}
              </div>
              <div>
                <label htmlFor="edit-date" className="block text-sm font-medium text-slate-700">
                  Exam date
                </label>
                <input
                  id="edit-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">{t.exams_colour}</p>
                <div className="flex gap-2">
                  {SUBJECT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-8 w-8 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-slate-700" : ""}`}
                      style={{ background: c }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => { setShowEdit(false); setSubject(exam.subject); setDate(exam.exam_date); setColor(exam.color); }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
                >
                  {t.exams_cancel}
                </button>
                <button
                  onClick={saveEdit}
                  disabled={!subject.trim() || !date || busy}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {busy ? t.exams_saving : t.exam_save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
