import type { Question } from "@/lib/types";

// Grade a single question. For multiselect: exact set match. For ordering: handled as single-option
// (the option text encodes the full sequence), so it reduces to single-select correctness.
export function isAnswerCorrect(question: Question, chosen: string[]): boolean {
  const correct = question.options.filter((o) => o.isCorrect).map((o) => o.label).sort();
  const picked = [...chosen].sort();
  if (correct.length !== picked.length) return false;
  return correct.every((c, i) => c === picked[i]);
}

export function correctLabels(question: Question): string[] {
  return question.options.filter((o) => o.isCorrect).map((o) => o.label);
}

// Map a raw correct-rate (0..1) to the IAPP 100..500 scaled range. 300 = pass.
// We anchor: ~62% correct ≈ 300 (pass line), 100% ≈ 500, 0% ≈ 100, piecewise-linear through the pass point.
export function toScaledScore(correctRate: number): number {
  const r = Math.max(0, Math.min(1, correctRate));
  const passRate = 0.62;
  let scaled: number;
  if (r <= passRate) scaled = 100 + (r / passRate) * 200; // 100..300
  else scaled = 300 + ((r - passRate) / (1 - passRate)) * 200; // 300..500
  return Math.round(scaled);
}

// Inverse-ish helper to show a target: what correct-rate maps to a scaled score.
export function scaledToPercent(scaled: number): number {
  const passRate = 0.62;
  if (scaled <= 300) return ((scaled - 100) / 200) * passRate * 100;
  return (passRate + ((scaled - 300) / 200) * (1 - passRate)) * 100;
}

// Fisher–Yates shuffle (used to randomize option order to prevent memorization).
export function shuffle<T>(arr: T[], seed?: number): T[] {
  const a = [...arr];
  let s = seed ?? Math.floor(Math.random() * 1e9);
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
