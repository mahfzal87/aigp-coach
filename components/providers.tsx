"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { SyncManager } from "@/components/sync-manager";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SyncManager />
      {children}
    </ThemeProvider>
  );
}
