"use client";
import { useI18n } from "./I18nProvider";
import type { Rating } from "@/lib/supabase/types";

export default function RatingButtons({
  onRate, disabled,
}: { onRate: (r: Rating) => void; disabled?: boolean }) {
  const { t } = useI18n();

  const buttons: { rating: Rating; label: string; sub: string; cls: string }[] = [
    { rating: 1, label: t.rating_blackout, sub: t.rating_blackout_sub, cls: "bg-red-500 hover:bg-red-600" },
    { rating: 2, label: t.rating_hard, sub: t.rating_hard_sub, cls: "bg-orange-500 hover:bg-orange-600" },
    { rating: 3, label: t.rating_good, sub: t.rating_good_sub, cls: "bg-sky-500 hover:bg-sky-600" },
    { rating: 4, label: t.rating_easy, sub: t.rating_easy_sub, cls: "bg-emerald-500 hover:bg-emerald-600" },
  ];

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
