"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, format, parseISO, isBefore } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import RatingButtons from "@/components/RatingButtons";
import { useI18n } from "@/components/I18nProvider";
import { useToast } from "@/components/Toast";
import { noteStudySessionCompleted } from "@/components/FeedbackWidget";
import { calculateNextReview } from "@/lib/sm2";
import type { StudySession, Topic, Exam, Rating } from "@/lib/supabase/types";

const MAX_SECONDS = 60 * 60;

export default function StudyClient({
  session, topic, exam,
}: { session: StudySession; topic: Topic; exam: Exam }) {
  const router = useRouter();
  const { t } = useI18n();
  const { toast } = useToast();
  const [seconds, setSeconds] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (showRating) return;
    const i = setInterval(() => {
      setSeconds((s) => {
        if (s >= MAX_SECONDS - 1) { clearInterval(i); return MAX_SECONDS; }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(i);
  }, [showRating]);

  async function cancelSession() {
    if (!confirm(t.study_cancel_confirm)) return;
    setSubmitting(true);
    try {
      const supabase = createClient();
      await supabase.from("study_sessions").update({ skipped: true }).eq("id", session.id);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setSubmitting(false);
    }
  }

  async function submit(rating: Rating) {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { nextInterval, newEaseFactor, newRepetitionCount } = calculateNextReview(
        session.repetition_count, session.ease_factor, rating,
      );
      const nextDate = format(addDays(new Date(), nextInterval), "yyyy-MM-dd");
      await supabase.from("study_sessions").update({
        completed: true, rating, duration_minutes: Math.round(seconds / 60),
        repetition_count: newRepetitionCount, ease_factor: newEaseFactor, next_review_date: nextDate,
      }).eq("id", session.id);
      const insertions: Array<{ date: string }> = [];
      if (isBefore(parseISO(nextDate), parseISO(exam.exam_date))) insertions.push({ date: nextDate });
      if (rating === 1) {
        const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
        if (!insertions.find((i) => i.date === tomorrow) && isBefore(parseISO(tomorrow), parseISO(exam.exam_date))) {
          insertions.push({ date: tomorrow });
        }
      }
      if (insertions.length) {
        await supabase.from("study_sessions").insert(insertions.map((i) => ({
          user_id: user.id, topic_id: topic.id, scheduled_date: i.date,
          completed: false, skipped: false, repetition_count: newRepetitionCount, ease_factor: newEaseFactor,
        })));
      }
      toast(t.toast_success);
      noteStudySessionCompleted();
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed", "error");
      setSubmitting(false);
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" style={{ borderLeft: `6px solid ${exam.color}` }}>
        <p className="text-sm uppercase tracking-wide text-slate-500" style={{ color: exam.color }}>{exam.subject}</p>
        <p className="text-xs text-slate-500">{t.study_review} {session.repetition_count + 1}</p>
      </div>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">{topic.name}</h1>
        {topic.notes && <p className="mt-4 whitespace-pre-wrap text-slate-600">{topic.notes}</p>}
        <p className="mt-8 font-mono text-4xl text-slate-700" aria-label={`${mm} minutes ${ss} seconds`}>{mm}:{ss}</p>
        <p className="mt-1 text-xs text-slate-500">{t.study_auto_stop}</p>
      </div>
      {!showRating ? (
        <div className="mt-6 flex gap-3">
          <button onClick={() => setShowRating(true)}
            className="flex-1 rounded-xl bg-primary py-4 text-lg font-semibold text-white">
            {t.study_finished}
          </button>
          <button onClick={cancelSession} disabled={submitting}
            className="rounded-xl border border-slate-300 px-6 py-4 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            {t.study_cancel}
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <p className="mb-3 text-center text-slate-700">{t.study_how_well}</p>
          <RatingButtons onRate={submit} disabled={submitting} />
        </div>
      )}
    </div>
  );
}
