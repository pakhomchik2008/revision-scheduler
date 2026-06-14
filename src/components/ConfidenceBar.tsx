import { MIN_EASE, MAX_EASE } from "@/lib/sm2";

export default function ConfidenceBar({ label, ease }: { label: string; ease: number }) {
  const pct = Math.max(0, Math.min(1, (ease - MIN_EASE) / (MAX_EASE - MIN_EASE))) * 100;
  const color = ease < 2.0 ? "bg-danger" : ease < 2.5 ? "bg-warn" : "bg-primary";
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-500">{ease.toFixed(2)}</span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
