import type { Rating } from "./supabase/types";

export const MIN_EASE = 1.3;
export const MAX_EASE = 4.0;
export const DEFAULT_EASE = 2.5;

export interface Sm2Result {
  nextInterval: number;
  newEaseFactor: number;
  newRepetitionCount: number;
}

const clampEase = (ef: number) => Math.min(MAX_EASE, Math.max(MIN_EASE, ef));

/**
 * SM-2 spaced repetition.
 * Rating: 1=Blackout, 2=Hard, 3=Good, 4=Easy.
 */
export function calculateNextReview(
  repetitionCount: number,
  easeFactor: number,
  rating: Rating,
): Sm2Result {
  // Blackout: reset and review tomorrow.
  if (rating === 1) {
    return { nextInterval: 1, newEaseFactor: clampEase(easeFactor), newRepetitionCount: 0 };
  }

  // Adjust ease factor per spec.
  let newEase = easeFactor;
  if (rating === 2) newEase -= 0.2;
  else if (rating === 4) newEase += 0.1;
  newEase = clampEase(newEase);

  const newReps = repetitionCount + 1;

  // Interval rules per spec:
  // - First review: always 1 day
  // - Second review: 3 days
  // - Subsequent: previous interval * ease factor
  // Additionally, ratings 2/3/4 have explicit early-stage intervals (2/7/14 days).
  let interval: number;
  if (newReps === 1) {
    interval = 1;
  } else if (newReps === 2) {
    interval = 3;
  } else {
    const baseByRating: Record<Exclude<Rating, 1>, number> = { 2: 2, 3: 7, 4: 14 };
    // For 3rd+ rep, scale prior interval by ease, but never less than the
    // rating's minimum recall interval.
    const scaled = Math.round((baseByRating[rating]) * newEase);
    interval = Math.max(baseByRating[rating], scaled);
  }

  return {
    nextInterval: Math.max(1, Math.round(interval)),
    newEaseFactor: newEase,
    newRepetitionCount: newReps,
  };
}
