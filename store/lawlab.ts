"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { lawlabStorageKey } from "@/lib/exam-state";

// Law Lab progress — which mindmap leaves are "locked in" + best drill score.
// Local-only (device) by design: it's a cram surface, not part of the sync blob.

interface LawLabState {
  locked: Record<string, true>; // leafKey -> locked
  drillBest: number;
  hydrated: boolean;
  toggle: (key: string) => void;
  lockMany: (keys: string[]) => void;
  setDrillBest: (n: number) => void;
}

export const useLawLab = create<LawLabState>()(
  persist(
    (set) => ({
      locked: {},
      drillBest: 0,
      hydrated: false,
      toggle: (key) =>
        set((s) => {
          const next = { ...s.locked };
          if (next[key]) delete next[key];
          else next[key] = true;
          return { locked: next };
        }),
      lockMany: (keys) =>
        set((s) => {
          const next = { ...s.locked };
          for (const k of keys) next[k] = true;
          return { locked: next };
        }),
      setDrillBest: (n) => set((s) => (n > s.drillBest ? { drillBest: n } : s)),
    }),
    {
      // Physical key is per exam (lib/exam-state.ts); ExamGate rehydrates after
      // activating a non-default exam.
      name: "aigp-lawlab",
      storage: createJSONStorage(() => ({
        getItem: (_n) => (typeof window === "undefined" ? null : window.localStorage.getItem(lawlabStorageKey())),
        setItem: (_n, value) => {
          if (typeof window !== "undefined") window.localStorage.setItem(lawlabStorageKey(), value);
        },
        removeItem: (_n) => {
          if (typeof window !== "undefined") window.localStorage.removeItem(lawlabStorageKey());
        },
      })),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);

export function useLawLabHydrated() {
  return useLawLab((s) => s.hydrated);
}
