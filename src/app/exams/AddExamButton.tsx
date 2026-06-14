"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SUBJECT_COLORS } from "@/lib/colors";

export default function AddExamButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [color, setColor] = useState(SUBJECT_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setErr(null); setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErr("Not signed in"); setSaving(false); return; }
    const { error } = await supabase
      .from("exams")
      .insert({ user_id: user.id, subject, exam_date: date, color });
    setSaving(false);
    if (error) return setErr(error.message);
    setOpen(false);
    setSubject(""); setDate("");
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg bg-primary px-4 py-2 text-white font-medium">
        + Add exam
      </button>
      {open && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Add exam</h2>
            <div className="mt-4 space-y-3">
              <input
                value={subject} onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject (e.g. Linear Algebra)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <div>
                <p className="text-xs text-slate-500 mb-1">Colour</p>
                <div className="flex gap-2">
                  {SUBJECT_COLORS.map((c) => (
                    <button
                      key={c} type="button" onClick={() => setColor(c)}
                      className={`h-8 w-8 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-slate-700" : ""}`}
                      style={{ background: c }}
                      aria-label={c}
                    />
                  ))}
                </div>
              </div>
              {err && <p className="text-sm text-danger">{err}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700">Cancel</button>
                <button
                  onClick={save} disabled={!subject || !date || saving}
                  className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50"
                >{saving ? "Saving…" : "Add"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
