import type { FlashcardState } from "@/lib/types";

const DAY = 24 * 60 * 60 * 1000;

export function newCardState(cardId: string, now = Date.now()): FlashcardState {
  return { cardId, ease: 2.5, intervalDays: 0, due: now, reps: 0, lapses: 0, lastGrade: 0, lastReviewed: 0 };
}

// SuperMemo-2. grade 0-5 (we use 0=Again,3=Hard,4=Good,5=Easy in the UI).
export function review(state: FlashcardState, grade: number, now = Date.now()): FlashcardState {
  let { ease, intervalDays, reps, lapses } = state;
  if (grade < 3) {
    reps = 0;
    intervalDays = 0; // relearn today
    lapses += 1;
  } else {
    if (reps === 0) intervalDays = 1;
    else if (reps === 1) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * ease);
    reps += 1;
    ease = Math.max(1.3, ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
  }
  const due = now + Math.max(0, intervalDays) * DAY;
  return { ...state, ease, intervalDays, reps, lapses, lastGrade: grade, lastReviewed: now, due };
}

export function isDue(state: FlashcardState | undefined, now = Date.now()): boolean {
  if (!state) return true; // never seen → due
  return state.due <= now;
}
