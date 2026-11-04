"use client";

import { useEffect, useRef } from "react";
import { authConfigured, pullAccountProgress, pushAccountProgress } from "@/lib/account";
import { useSession } from "@/components/account";
import { useProgress } from "@/store/progress";
import { getActiveExam, ownerKeyFor, type ExamSlug } from "@/lib/exam-state";

// Account-backed sync, same lifecycle as the sync-code SyncManager:
// 1. When a session appears (login, or boot with a persisted session) and the
//    store has hydrated: RECONCILE — pull the account copy; if it has more
//    attempts than this device, restore it; if the account is behind or empty,
//    mirror local up. Never push after a failed pull, so an unreachable
//    backend can't get clobbered later.
// 2. Afterwards: debounced push mirrors every local change to the account.
function readOwner(exam: ExamSlug): string | null {
  try {
    return localStorage.getItem(ownerKeyFor(exam));
  } catch {
    return null;
  }
}

function claimOwner(exam: ExamSlug, userId: string) {
  try {
    localStorage.setItem(ownerKeyFor(exam), userId);
  } catch {
    /* storage unavailable */
  }
}

export function AccountSyncManager() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const reconciledFor = useRef<string | null>(null);

  useEffect(() => {
    if (!authConfigured || !userId) return;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const reconcile = async () => {
      if (reconciledFor.current === userId) return;
      reconciledFor.current = userId;
      const exam = getActiveExam();
      const res = await pullAccountProgress(userId).catch(() => null);
      if (!res) return; // transport error — leave both sides untouched
      if (getActiveExam() !== exam) return; // exam changed mid-flight — this result belongs to another exam
      const s = useProgress.getState();
      // Local progress already tied to a DIFFERENT account (a shared device):
      // never push it into this one — take this account's copy, or start clean.
      const owner = readOwner(exam);
      const foreign = owner !== null && owner !== userId;
      claimOwner(exam, userId);
      if (res.ok && res.data) {
        const cloudAttempts = res.data.attempts?.length ?? 0;
        if (foreign || cloudAttempts > s.attempts.length) {
          // Account is ahead (fresh device, or this one was cleared) — restore,
          // keeping this device's sync-code settings if it has its own.
          s.importData({
            ...res.data,
            // Keep this device's own sync code — unless the device's data was another account's.
            settings: foreign
              ? res.data.settings
              : {
                  ...res.data.settings,
                  syncEnabled: s.settings.syncEnabled ?? res.data.settings?.syncEnabled,
                  syncCode: s.settings.syncCode ?? res.data.settings?.syncCode,
                },
          });
          return;
        }
        pushAccountProgress(userId, s.exportData()).catch(() => {});
      } else if (res.error === "not-found") {
        if (foreign) s.reset(); // another account's local data — this account starts empty
        // First backup for this account (pre-account progress on this device attaches to it).
        else pushAccountProgress(userId, s.exportData()).catch(() => {});
      }
    };

    if (useProgress.persist.hasHydrated()) void reconcile();
    const unsubFinish = useProgress.persist.onFinishHydration(() => void reconcile());

    const unsub = useProgress.subscribe((state) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        pushAccountProgress(userId, state.exportData()).catch(() => {});
      }, 2500);
    });

    return () => {
      clearTimeout(timer);
      unsub();
      unsubFinish();
    };
  }, [userId]);

  return null;
}
