export default function StreakCounter({ days }: { days: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <p className="text-sm uppercase tracking-wide text-slate-500">Study streak</p>
      <p className="mt-1 text-5xl font-bold text-primary">{days}</p>
      <p className="text-sm text-slate-500">day{days === 1 ? "" : "s"} in a row</p>
    </div>
  );
}
