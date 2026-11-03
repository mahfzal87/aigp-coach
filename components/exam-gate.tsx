"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { activateStoredExam, DEFAULT_EXAM, type ExamSlug } from "@/lib/exam-state";
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
    // Order matters: the slug is already flipped, so reset() writes initial
    // state to the NEW exam's key (never clobbering the default exam's data),
    // and rehydrate() then loads whatever that exam already had.
    useProgress.getState().reset();
    useLawLab.setState({ locked: {}, drillBest: 0 });
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
