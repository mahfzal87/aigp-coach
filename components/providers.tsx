"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { SyncManager } from "@/components/sync-manager";
import { AccountSyncManager } from "@/components/account-manager";
import { AuthGate } from "@/components/account";
import { MotionProvider } from "@/components/motion";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SyncManager />
      <AccountSyncManager />
      <MotionProvider>
        <AuthGate>{children}</AuthGate>
      </MotionProvider>
    </ThemeProvider>
  );
}
