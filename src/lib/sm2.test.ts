import { describe, it, expect } from "vitest";
import { calculateNextReview, MIN_EASE, MAX_EASE, DEFAULT_EASE } from "./sm2";

describe("calculateNextReview", () => {
  it("blackout resets reps and schedules tomorrow", () => {
    const r = calculateNextReview(5, 2.3, 1);
    expect(r).toEqual({ nextInterval: 1, newEaseFactor: 2.3, newRepetitionCount: 0 });
  });

  it("first successful review is 1 day", () => {
    const r = calculateNextReview(0, DEFAULT_EASE, 3);
    expect(r.nextInterval).toBe(1);
    expect(r.newRepetitionCount).toBe(1);
  });

  it("second successful review is 3 days", () => {
    const r = calculateNextReview(1, DEFAULT_EASE, 3);
    expect(r.nextInterval).toBe(3);
    expect(r.newRepetitionCount).toBe(2);
  });

  it("hard rating decreases ease factor by 0.2", () => {
    const r = calculateNextReview(2, 2.5, 2);
    expect(r.newEaseFactor).toBeCloseTo(2.3, 5);
  });

  it("good rating leaves ease unchanged", () => {
    const r = calculateNextReview(2, 2.5, 3);
    expect(r.newEaseFactor).toBe(2.5);
  });

  it("easy rating increases ease factor by 0.1", () => {
    const r = calculateNextReview(2, 2.5, 4);
    expect(r.newEaseFactor).toBeCloseTo(2.6, 5);
  });

  it("clamps ease between 1.3 and 4.0", () => {
    const low = calculateNextReview(2, 1.35, 2);
    expect(low.newEaseFactor).toBe(MIN_EASE);
    const high = calculateNextReview(2, 3.95, 4);
    expect(high.newEaseFactor).toBe(MAX_EASE);
  });

  it("third+ review for Good scales with ease", () => {
    const r = calculateNextReview(2, 2.5, 3);
    expect(r.nextInterval).toBeGreaterThanOrEqual(7);
    expect(r.newRepetitionCount).toBe(3);
  });

  it("Easy review yields longer interval than Good", () => {
    const good = calculateNextReview(2, 2.5, 3);
    const easy = calculateNextReview(2, 2.5, 4);
    expect(easy.nextInterval).toBeGreaterThan(good.nextInterval);
  });

  it("interval rounds to whole days >= 1", () => {
    const r = calculateNextReview(10, 1.3, 2);
    expect(Number.isInteger(r.nextInterval)).toBe(true);
    expect(r.nextInterval).toBeGreaterThanOrEqual(1);
  });
});
