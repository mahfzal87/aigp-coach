"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { newCardState, review as sm2Review } from "@/lib/sm2";
import { XP_PER_ATTEMPT, XP_PER_CORRECT, todayStr, updateStreak } from "@/lib/gamify";
import type {
  Attempt,
  FlashcardState,
  MockSession,
  ProgressExport,
  Settings,
} from "@/lib/types";

const EXPORT_VERSION = 2;

export interface LessonResult {
  score: number; // 0..1
  bestScore: number;
  at: number;
}

interface ProgressState {
  attempts: Attempt[];
  flashcards: Record<string, FlashcardState>;
  mocks: MockSession[];
  readNotes: string[];
  settings: Settings;
  hydrated: boolean;

  // gamification
  xp: number;
  streakCount: number;
  longestStreak: number;
  lastActiveDate: string | null;
  dailyXp: number;
  dailyDate: string | null;
  lessons: Record<string, LessonResult>; // competencyId or test id -> result

  recordAttempt: (a: Omit<Attempt, "id" | "ts">) => void;
  setRootCause: (attemptId: string, rc: Attempt["rootCause"]) => void;
  gradeFlashcard: (cardId: string, grade: number) => void;
  saveMock: (m: MockSession) => void;
  completeLesson: (id: string, score: number, bonusXp: number) => void;
  markNoteRead: (noteId: string) => void;
  setSettings: (s: Partial<Settings>) => void;
  reset: () => void;
  exportData: () => ProgressExport;
  importData: (data: ProgressExport) => void;
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      attempts: [],
      flashcards: {},
      mocks: [],
      readNotes: [],
      settings: { updatesApiEnabled: false },
      hydrated: false,
      xp: 0,
      streakCount: 0,
      longestStreak: 0,
      lastActiveDate: null,
      dailyXp: 0,
      dailyDate: null,
      lessons: {},

      recordAttempt: (a) =>
        set((s) => {
          const today = todayStr();
          const gained = XP_PER_ATTEMPT + (a.correct ? XP_PER_CORRECT : 0);
          const streak = updateStreak(s, today);
          const dailyXp = (s.dailyDate === today ? s.dailyXp : 0) + gained;
          return {
            attempts: [...s.attempts, { ...a, id: uid(), ts: Date.now() }],
            xp: s.xp + gained,
            dailyXp,
            dailyDate: today,
            ...streak,
          };
        }),

      setRootCause: (attemptId, rc) =>
        set((s) => ({
          attempts: s.attempts.map((a) => (a.id === attemptId ? { ...a, rootCause: rc } : a)),
        })),

      gradeFlashcard: (cardId, grade) =>
        set((s) => {
          const prev = s.flashcards[cardId] ?? newCardState(cardId);
          return { flashcards: { ...s.flashcards, [cardId]: sm2Review(prev, grade) } };
        }),

      saveMock: (m) =>
        set((s) => {
          const exists = s.mocks.some((x) => x.id === m.id);
          return {
            mocks: exists ? s.mocks.map((x) => (x.id === m.id ? m : x)) : [...s.mocks, m],
          };
        }),

      completeLesson: (id, score, bonusXp) =>
        set((s) => {
          const prev = s.lessons[id];
          const bestScore = Math.max(prev?.bestScore ?? 0, score);
          // only award the bonus the first time the lesson is passed
          const firstPass = !prev || prev.bestScore < 0.8;
          return {
            lessons: { ...s.lessons, [id]: { score, bestScore, at: Date.now() } },
            xp: s.xp + (firstPass && score >= 0.8 ? bonusXp : 0),
          };
        }),

      markNoteRead: (noteId) =>
        set((s) => (s.readNotes.includes(noteId) ? s : { readNotes: [...s.readNotes, noteId] })),

      setSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),

      reset: () => set({ attempts: [], flashcards: {}, mocks: [], readNotes: [], settings: { updatesApiEnabled: false }, xp: 0, streakCount: 0, longestStreak: 0, lastActiveDate: null, dailyXp: 0, dailyDate: null, lessons: {} }),

      exportData: () => {
        const s = get();
        return {
          version: EXPORT_VERSION,
          exportedAt: new Date().toISOString(),
          attempts: s.attempts,
          flashcards: s.flashcards,
          mocks: s.mocks,
          settings: s.settings,
          readNotes: s.readNotes,
          xp: s.xp,
          streakCount: s.streakCount,
          longestStreak: s.longestStreak,
          lastActiveDate: s.lastActiveDate,
          lessons: s.lessons,
        };
      },

      importData: (data) =>
        set({
          attempts: data.attempts ?? [],
          flashcards: data.flashcards ?? {},
          mocks: data.mocks ?? [],
          readNotes: data.readNotes ?? [],
          settings: data.settings ?? { updatesApiEnabled: false },
          xp: data.xp ?? 0,
          streakCount: data.streakCount ?? 0,
          longestStreak: data.longestStreak ?? 0,
          lastActiveDate: data.lastActiveDate ?? null,
          lessons: data.lessons ?? {},
        }),
    }),
    {
      name: "aigp-coach-progress",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);

// SSR-safe hook: returns false until the persisted store has hydrated on the client.
export function useHydrated() {
  return useProgress((s) => s.hydrated);
}

export { uid };
