"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { AuthGate } from "@/components/account";
import { ExamGate } from "@/components/exam-gate";
import { MotionProvider } from "@/components/motion";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MotionProvider>
        {/* ExamGate mounts the sync managers so they remount per exam. */}
        <AuthGate>
          <ExamGate>{children}</ExamGate>
        </AuthGate>
      </MotionProvider>
    </ThemeProvider>
  );
}
