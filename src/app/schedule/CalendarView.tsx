"use client";
import { useMemo, useState } from "react";
import {
  addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay,
  isSameMonth, parseISO, startOfMonth, startOfWeek,
} from "date-fns";
import { useI18n } from "@/components/I18nProvider";
import type { Exam, Topic, StudySession } from "@/lib/supabase/types";

export default function CalendarView({
  exams, topics, sessions,
}: { exams: Exam[]; topics: Topic[]; sessions: StudySession[] }) {
  const { t } = useI18n();
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(new Date());

  const topicById = useMemo(() => new Map(topics.map((tp) => [tp.id, tp])), [topics]);
  const examById = useMemo(() => new Map(exams.map((e) => [e.id, e])), [exams]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const examDateSet = useMemo(() => {
    const m = new Map<string, Exam>();
    for (const e of exams) m.set(e.exam_date, e);
    return m;
  }, [exams]);

  const sessionsByDay = useMemo(() => {
    const m = new Map<string, StudySession[]>();
    for (const s of sessions) {
      const arr = m.get(s.scheduled_date) ?? [];
      arr.push(s);
      m.set(s.scheduled_date, arr);
    }
    return m;
  }, [sessions]);

  const selectedKey = selected ? format(selected, "yyyy-MM-dd") : null;
  const selectedSessions = selectedKey ? sessionsByDay.get(selectedKey) ?? [] : [];

  const weekdays = [t.mon, t.tue, t.wed, t.thu, t.fri, t.sat, t.sun];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={() => setCursor(addMonths(cursor, -1))} className="px-2 py-1 text-slate-500 hover:text-slate-900">←</button>
          <h2 className="font-semibold text-slate-900">{format(cursor, "MMMM yyyy")}</h2>
          <button onClick={() => setCursor(addMonths(cursor, 1))} className="px-2 py-1 text-slate-500 hover:text-slate-900">→</button>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
          {weekdays.map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {days.map((d) => {
            const key = format(d, "yyyy-MM-dd");
            const sess = sessionsByDay.get(key) ?? [];
            const exam = examDateSet.get(key);
            const isToday = isSameDay(d, new Date());
            const isSel = selected && isSameDay(d, selected);
            const inMonth = isSameMonth(d, cursor);
            const subjectColors = Array.from(new Set(
              sess.map((s) => examById.get(topicById.get(s.topic_id)?.exam_id ?? "")?.color).filter(Boolean) as string[],
            )).slice(0, 4);
            return (
              <button key={key} onClick={() => setSelected(d)}
                className={`min-h-[72px] rounded-lg border p-1.5 text-left text-sm ${
                  isSel ? "ring-2 ring-primary" : ""} ${isToday ? "ring-1 ring-slate-700" : ""}
                ${inMonth ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 text-slate-400"}`}>
                <div className="flex items-center justify-between">
                  <span>{format(d, "d")}</span>
                  {exam && <span title={exam.subject} style={{ color: exam.color }}>★</span>}
                </div>
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {subjectColors.map((c) => (
                    <span key={c} className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="font-semibold text-slate-900">
          {selected ? format(selected, "EEEE d MMM") : t.schedule_pick_day}
        </h3>
        {selectedSessions.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{t.schedule_no_sessions}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {selectedSessions.map((s) => {
              const topic = topicById.get(s.topic_id);
              const exam = topic ? examById.get(topic.exam_id) : undefined;
              if (!topic || !exam) return null;
              return (
                <li key={s.id} className="rounded-lg border border-slate-200 p-2"
                  style={{ borderLeft: `4px solid ${exam.color}` }}>
                  <p className="text-xs text-slate-500">{exam.subject}</p>
                  <p className="text-sm text-slate-900">{topic.name}</p>
                  <p className="text-xs text-slate-400">
                    {s.completed ? t.schedule_completed : s.skipped ? t.schedule_skipped : t.schedule_pending}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        {selectedKey && examDateSet.get(selectedKey) && (
          <p className="mt-3 rounded-lg bg-amber-50 p-2 text-sm text-amber-800">
            ★ {examDateSet.get(selectedKey)!.subject} {t.schedule_exam_today}
          </p>
        )}
      </aside>
    </div>
  );
}
