// Haptic feedback via the Vibration API. Works on Android Chrome/Edge and some
// desktop hardware; iOS Safari ignores navigator.vibrate — calls are safe no-ops
// there. Patterns follow HIG advice: short, purposeful, never spammy.

import { useProgress } from "@/store/progress";

type Pattern = number | number[];

const PATTERNS = {
  tap: 8, // light touch — selection, nav
  select: 12, // choosing an answer option
  success: [12, 60, 24], // correct answer / module complete
  error: [45, 40, 45], // wrong answer
  milestone: [12, 50, 18, 50, 30], // domain test passed / achievement
} satisfies Record<string, Pattern>;

export type HapticKind = keyof typeof PATTERNS;

function enabled(): boolean {
  try {
    const s = useProgress.getState().settings;
    return s.haptics ?? true;
  } catch {
    return true;
  }
}

export function haptic(kind: HapticKind = "tap") {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  if (!enabled()) return;
  try {
    navigator.vibrate(PATTERNS[kind]);
  } catch {
    /* unsupported — ignore */
  }
}
