"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { activateStoredExam, DEFAULT_EXAM, lawlabStorageKey, progressStorageKey, type ExamSlug } from "@/lib/exam-state";
import { useProgress } from "@/store/progress";
import { useLawLab } from "@/store/lawlab";
import { SyncManager } from "@/components/sync-manager";
import { AccountSyncManager } from "@/components/account-manager";
import { Splash } from "@/components/entry-ui";

// Multi-exam boot gate. The server render and the first client (hydration)
// render show the splash, so markup matches. After mount, the stored exam
// choice is activated: the module slug flips (which repoints the per-exam
// storage keys and the content accessors), the stores are reset and rehydrated
// from the new keys, and only then does the app render — against the right pack.
//
// The sync managers mount only once the active exam is RESOLVED. Mounted
// earlier, their reconcile would pull for the default exam and then apply the
// result to whichever exam became live a moment later.
export function ExamGate({ children }: { children: ReactNode }) {
  const [slug, setSlug] = useState<ExamSlug | null>(null);

  useEffect(() => {
    const stored = activateStoredExam();
    if (stored === DEFAULT_EXAM) {
      void Promise.resolve().then(() => setSlug(DEFAULT_EXAM));
      return;
    }
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

  // Another tab saved this exam's progress: reload it, so a stale tab never
  // writes its older snapshot over newer work (persist writes whole state).
  useEffect(() => {
    if (!slug) return;
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== localStorage || e.newValue === null) return;
      if (e.key === progressStorageKey()) void useProgress.persist.rehydrate();
      else if (e.key === lawlabStorageKey()) void useLawLab.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [slug]);

  // Pages wait for the resolved exam: rendered earlier, a page would run once
  // against the default exam's content and storage (and could write to it).
  // The splash covers the instant it takes — EntryFlow shows the same one.
  if (!slug) return <Splash />;

  return (
    <Fragment key={slug}>
      <SyncManager />
      <AccountSyncManager />
      {children}
    </Fragment>
  );
}
