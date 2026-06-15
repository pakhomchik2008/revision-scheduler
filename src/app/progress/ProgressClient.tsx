"use client";
import { useI18n } from "@/components/I18nProvider";
import StreakCounter from "@/components/StreakCounter";
import ConfidenceBar from "@/components/ConfidenceBar";
import WeekBarChart from "./WeekBarChart";

interface Props {
  streak: number;
  week: Array<{ day: string; scheduled: number; completed: number }>;
  examConfidence: Array<{ id: string; subject: string; ease: number }>;
  masteryRows: Array<{
    id: string; name: string; subject: string;
    lastStudied: string | null; ease: number; next: string | null;
  }>;
}

export default function ProgressClient({ streak, week, examConfidence, masteryRows }: Props) {
  const { t } = useI18n();
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-slate-900">{t.progress_title}</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <StreakCounter days={streak} />
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-slate-500">{t.progress_this_week}</p>
          <WeekBarChart data={week} scheduledLabel={t.progress_scheduled} completedLabel={t.progress_completed} />
        </div>
      </div>
      <section>
        <h2 className="text-lg font-semibold text-slate-900">{t.progress_confidence}</h2>
        {examConfidence.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{t.progress_no_data}</p>
        ) : (
          <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {examConfidence.map((c) => <ConfidenceBar key={c.id} label={c.subject} ease={c.ease} />)}
          </div>
        )}
      </section>
      <section>
        <h2 className="text-lg font-semibold text-slate-900">{t.progress_mastery}</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-3 py-2">{t.progress_topic}</th>
                <th className="px-3 py-2">{t.progress_subject}</th>
                <th className="px-3 py-2">{t.progress_last_studied}</th>
                <th className="px-3 py-2">{t.progress_ease}</th>
                <th className="px-3 py-2">{t.progress_next_review}</th>
              </tr>
            </thead>
            <tbody>
              {masteryRows.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-4 text-center text-slate-500">{t.progress_no_topics}</td></tr>
              ) : masteryRows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-900">{r.name}</td>
                  <td className="px-3 py-2 text-slate-600">{r.subject}</td>
                  <td className="px-3 py-2 text-slate-600">{r.lastStudied ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-600">{r.ease.toFixed(2)}</td>
                  <td className="px-3 py-2 text-slate-600">{r.next ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
