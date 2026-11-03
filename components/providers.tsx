"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { EntryFlow } from "@/components/entry-flow";
import { ExamGate } from "@/components/exam-gate";
import { MotionProvider } from "@/components/motion";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MotionProvider>
        {/* EntryFlow = SaaS front door (login → name → exam tiles) when
            NEXT_PUBLIC_REQUIRE_AUTH is on; ExamGate mounts the sync managers
            so they remount per exam. */}
        <EntryFlow>
          <ExamGate>{children}</ExamGate>
        </EntryFlow>
      </MotionProvider>
    </ThemeProvider>
  );
}
