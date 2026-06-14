"use client";
import type { Rating } from "@/lib/supabase/types";

const buttons: { rating: Rating; label: string; sub: string; cls: string }[] = [
  { rating: 1, label: "Blackout", sub: "Had no idea", cls: "bg-red-500 hover:bg-red-600" },
  { rating: 2, label: "Hard", sub: "Remembered with difficulty", cls: "bg-orange-500 hover:bg-orange-600" },
  { rating: 3, label: "Good", sub: "Remembered with some effort", cls: "bg-sky-500 hover:bg-sky-600" },
  { rating: 4, label: "Easy", sub: "Knew it perfectly", cls: "bg-emerald-500 hover:bg-emerald-600" },
];

export default function RatingButtons({
  onRate, disabled,
}: { onRate: (r: Rating) => void; disabled?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {buttons.map((b) => (
        <button
          key={b.rating}
          disabled={disabled}
          onClick={() => onRate(b.rating)}
          className={`rounded-xl px-4 py-5 text-left text-white transition disabled:opacity-50 ${b.cls}`}
        >
          <div className="text-lg font-semibold">{b.label}</div>
          <div className="text-sm opacity-90">{b.sub}</div>
        </button>
      ))}
    </div>
  );
}
