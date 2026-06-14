import { addDays, format, isSameDay, startOfWeek } from "date-fns";

interface DayInfo { date: Date; scheduled: number; completed: number }

export default function WeekStrip({ days }: { days: DayInfo[] }) {
  const today = new Date();
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d) => {
        const isToday = isSameDay(d.date, today);
        const allDone = d.scheduled > 0 && d.completed >= d.scheduled;
        return (
          <div
            key={d.date.toISOString()}
            className={`rounded-lg border p-2 text-center ${
              isToday ? "ring-2 ring-primary" : ""
            } ${allDone ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"}`}
          >
            <div className="text-xs text-slate-500">{format(d.date, "EEE")}</div>
            <div className="text-lg font-semibold text-slate-900">{format(d.date, "d")}</div>
            <div className="text-xs text-slate-500">
              {d.completed}/{d.scheduled}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function buildWeek(): Date[] {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
