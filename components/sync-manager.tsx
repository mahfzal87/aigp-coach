"use client";

import { useEffect } from "react";
import { pushProgress, syncConfigured } from "@/lib/sync";
import { useProgress } from "@/store/progress";

// Watches the progress store and debounced-pushes to Supabase when cloud sync
// is enabled. localStorage stays the primary store (offline-first); this just
// mirrors it up so a sync code can restore it elsewhere.
export function SyncManager() {
  useEffect(() => {
    if (!syncConfigured) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
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
    };
  }, []);
  return null;
}
