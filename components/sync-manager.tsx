"use client";

import { useEffect, useRef } from "react";
import { pullProgress, pushProgress, syncConfigured } from "@/lib/sync";
import { useProgress } from "@/store/progress";

// Cloud sync lifecycle:
// 1. On boot (once, after hydration): if sync is on, RECONCILE — pull the cloud
//    copy; whichever side has more recorded attempts wins. Heals a cleared
//    browser (Safari evicts localStorage after ~7 days unused) and stale devices.
// 2. Afterwards: debounced push mirrors every local change up.
// Also asks the browser for durable storage so localStorage survives pressure
// eviction where the platform honors it (Chrome does; Safari ignores).
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
      const res = await pullProgress(code).catch(() => null);
      if (res?.ok && res.data) {
        const cloudAttempts = res.data.attempts?.length ?? 0;
        const localAttempts = s.attempts.length;
        if (cloudAttempts > localAttempts) {
          // Cloud is ahead (this device was cleared or is stale) — restore it.
          s.importData({ ...res.data, settings: { ...res.data.settings, syncEnabled: true, syncCode: code } });
          return;
        }
      }
      // Local is ahead (or cloud empty/unreachable): mirror local up.
      pushProgress(code, s.exportData()).catch(() => {});
    };

    // Run reconcile once the store has hydrated from localStorage.
    if (useProgress.getState().hydrated) void reconcile();
    const unsubHydration = useProgress.subscribe((state) => {
      if (state.hydrated) void reconcile();
    });

    const unsub = useProgress.subscribe((state) => {
      const code = state.settings.syncCode;
      if (!state.settings.syncEnabled || !code || !state.hydrated) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        pushProgress(code, state.exportData()).catch(() => {});
      }, 2500);
    });

    return () => {
      clearTimeout(timer);
      unsub();
      unsubHydration();
    };
  }, []);

  return null;
}
