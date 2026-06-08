import confetti from "canvas-confetti";

const DUO = ["#58cc02", "#1cb0f6", "#ffc800", "#ff9600", "#a560e8"];

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

// A short, pleasant ascending arpeggio via Web Audio — no asset needed.
export function playSuccessChime() {
  try {
    const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    const ctx = new Ctx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
    setTimeout(() => ctx.close().catch(() => {}), 800);
  } catch {
    /* audio not available — ignore */
  }
}

function fail() {
  try {
    const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.36);
    setTimeout(() => ctx.close().catch(() => {}), 500);
  } catch {
    /* ignore */
  }
}

export function celebrate({ sound = true, big = false }: { sound?: boolean; big?: boolean } = {}) {
  if (sound) playSuccessChime();
  if (prefersReducedMotion()) return;

  const burst = (x: number) => confetti({ particleCount: big ? 70 : 45, spread: 70, origin: { x, y: 0.7 }, colors: DUO, scalar: 1.1, zIndex: 9999 });
  burst(0.25);
  burst(0.75);
  if (big) {
    // a little cannon finale for unit tests / perfect runs
    setTimeout(() => confetti({ particleCount: 120, spread: 110, startVelocity: 45, origin: { y: 0.6 }, colors: DUO, zIndex: 9999 }), 250);
  }
}

export function buzzFail({ sound = true }: { sound?: boolean } = {}) {
  if (sound) fail();
}
