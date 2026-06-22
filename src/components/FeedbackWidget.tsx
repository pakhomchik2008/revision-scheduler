"use client";
import { useEffect, useState } from "react";
import { MessageSquarePlus, Star, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "./I18nProvider";
import { useToast } from "./Toast";

const DISMISSED_KEY = "feedback_dismissed";
const SUBMITTED_KEY = "feedback_submitted";
const SESSIONS_KEY = "feedback_sessions_completed";
const AUTO_OPEN_THRESHOLD = 1;

export function noteStudySessionCompleted() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SUBMITTED_KEY) || localStorage.getItem(DISMISSED_KEY)) return;
  const count = Number(localStorage.getItem(SESSIONS_KEY) || "0") + 1;
  localStorage.setItem(SESSIONS_KEY, String(count));
  if (count >= AUTO_OPEN_THRESHOLD) {
    window.dispatchEvent(new Event("feedback:auto-open"));
  }
}

export default function FeedbackWidget({ userId }: { userId: string }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    function onAutoOpen() {
      if (!localStorage.getItem(SUBMITTED_KEY) && !localStorage.getItem(DISMISSED_KEY)) {
        setOpen(true);
      }
    }
    window.addEventListener("feedback:auto-open", onAutoOpen);
    return () => window.removeEventListener("feedback:auto-open", onAutoOpen);
  }, []);

  function close(persistDismiss: boolean) {
    setOpen(false);
    setRating(0);
    setMessage("");
    if (persistDismiss) localStorage.setItem(DISMISSED_KEY, "1");
  }

  async function submit() {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("feedback").insert({
        user_id: userId,
        rating,
        message: message.trim(),
        context: typeof window !== "undefined" ? window.location.pathname : "",
      });
      if (error) throw error;
      localStorage.setItem(SUBMITTED_KEY, "1");
      setSubmitted(true);
      toast(t.feedback_thanks, "success");
      setTimeout(() => close(false), 1200);
    } catch (e) {
      toast(e instanceof Error ? e.message : t.toast_error, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 left-4 z-40 flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-lg hover:opacity-90 md:bottom-4"
        aria-label={t.feedback_button}
      >
        <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
        {t.feedback_button}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 id="feedback-title" className="text-lg font-semibold text-slate-900">{t.feedback_title}</h2>
                <p className="mt-1 text-sm text-slate-600">{t.feedback_subtitle}</p>
              </div>
              <button onClick={() => close(false)} aria-label="Close" className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              <p className="mt-6 text-center text-sm font-medium text-emerald-600" role="status">{t.feedback_thanks}</p>
            ) : (
              <>
                <fieldset className="mt-4">
                  <legend className="block text-sm font-medium text-slate-700">{t.feedback_rate_label}</legend>
                  <div className="mt-2 flex gap-1" role="radiogroup" aria-label={t.feedback_rate_label}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`${star} ${t.feedback_star_label}`}
                        aria-pressed={rating === star}
                        className="p-0.5"
                      >
                        <Star
                          className={`h-7 w-7 ${
                            star <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="mt-4">
                  <label htmlFor="feedback-message" className="block text-sm font-medium text-slate-700">
                    {t.feedback_message_label}
                  </label>
                  <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.feedback_message_placeholder}
                    rows={3}
                    maxLength={500}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <button onClick={() => close(true)} className="text-sm text-slate-500 hover:text-slate-700">
                    {t.feedback_later}
                  </button>
                  <button
                    onClick={submit}
                    disabled={rating === 0 || submitting}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {submitting ? t.feedback_submitting : t.feedback_submit}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
