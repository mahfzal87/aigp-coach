"use client";

import { useEffect, useRef } from "react";
import { pullProgress, pushProgress, syncConfigured } from "@/lib/sync";
import { getActiveExam } from "@/lib/exam-state";
import { useProgress } from "@/store/progress";

// Cloud sync lifecycle:
// 1. On boot (after localStorage hydration — via persist.onFinishHydration, since
//    the store's `hydrated` flag is set by silent mutation and never broadcast):
//    RECONCILE — pull the cloud copy; if it has more attempts than this device,
//    restore it (heals Safari's ~7-day storage eviction and stale devices). Push
//    local up only when the cloud is definitively behind or empty — never after
//    a failed pull, so an unreachable backend can't get clobbered with an empty
//    copy later.
// 2. Afterwards: debounced push mirrors every local change up.
// Also requests durable storage so the browser is less eager to evict
// localStorage (Chrome honors it; Safari ignores it — harmless).
export function SyncManager() {
  const reconciled = useRef(false);

  useEffect(() => {
    try {
      navigator.storage?.persist?.().catch(() => {});
    } catch {
      /* unsupported */
    }
  }, []);

  useEffect(() => {
    if (!syncConfigured) return;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const reconcile = async () => {
      const s = useProgress.getState();
      const code = s.settings.syncCode;
      if (!s.settings.syncEnabled || !code || reconciled.current) return;
      reconciled.current = true;
      const exam = getActiveExam();
      const res = await pullProgress(code).catch(() => null);
      if (!res) return; // transport error — leave both sides untouched
      if (getActiveExam() !== exam) return; // exam changed mid-flight — this result belongs to another exam
      if (res.ok && res.data) {
        const cloudAttempts = res.data.attempts?.length ?? 0;
        if (cloudAttempts > s.attempts.length) {
          // Cloud is ahead (this device was cleared or is stale) — restore it.
          s.importData({ ...res.data, settings: { ...res.data.settings, syncEnabled: true, syncCode: code } });
          return;
        }
        // Cloud definitively behind or equal — mirror local up.
        pushProgress(code, s.exportData()).catch(() => {});
      } else if (res.error === "not-found") {
        // First upload for this code.
        pushProgress(code, s.exportData()).catch(() => {});
      }
      // Any other failure (paused/unreachable backend): do nothing.
    };

    if (useProgress.persist.hasHydrated()) void reconcile();
    const unsubFinish = useProgress.persist.onFinishHydration(() => void reconcile());

    const unsub = useProgress.subscribe((state) => {
      const code = state.settings.syncCode;
      if (!state.settings.syncEnabled || !code) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        pushProgress(code, state.exportData()).catch(() => {});
      }, 2500);
    });

    return () => {
      clearTimeout(timer);
      unsub();
      unsubFinish();
    };
  }, []);

  return null;
}
