"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { activateStoredExam, DEFAULT_EXAM, lawlabStorageKey, progressStorageKey, type ExamSlug } from "@/lib/exam-state";
import { useProgress } from "@/store/progress";
import { useLawLab } from "@/store/lawlab";
import { SyncManager } from "@/components/sync-manager";
import { AccountSyncManager } from "@/components/account-manager";

// Multi-exam boot gate. The server render and the first client (hydration)
// render always show the DEFAULT exam, so markup matches. After mount, the
// stored exam choice is activated: the module slug flips (which repoints the
// per-exam storage keys and the content accessors), the stores are reset and
// rehydrated from the new keys, and the keyed subtree remounts so every page
// and manager re-reads the new pack. For default-exam users none of that runs.
export function ExamGate({ children }: { children: ReactNode }) {
  const [slug, setSlug] = useState<ExamSlug>(DEFAULT_EXAM);

  useEffect(() => {
    const stored = activateStoredExam();
    if (stored === DEFAULT_EXAM) return;
    // The slug is already flipped, so the stores now persist to the NEW exam's
    // keys. Memory still holds the default exam's state, which must not leak
    // into this exam when it has nothing saved yet — hence the reset. But the
    // persist middleware writes on every set, so the reset would overwrite
    // this exam's saved data: snapshot it first, restore it, then rehydrate.
    const keys = [progressStorageKey(), lawlabStorageKey()];
    const saved = keys.map((k) => {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    });
    useProgress.getState().reset();
    useLawLab.setState({ locked: {}, drillBest: 0 });
    keys.forEach((k, i) => {
      const v = saved[i];
      if (v === null) return;
      try {
        localStorage.setItem(k, v);
      } catch {
        /* storage unavailable */
      }
    });
    Promise.all([useProgress.persist.rehydrate(), useLawLab.persist.rehydrate()]).finally(() => setSlug(stored));
  }, []);

  return (
    <Fragment key={slug}>
      <SyncManager />
      <AccountSyncManager />
      {children}
    </Fragment>
  );
}
