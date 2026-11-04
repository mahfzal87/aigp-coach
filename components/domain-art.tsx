"use client";

// A domain's mark that carries information instead of decoration: one ring
// segment per module in plan order, coloured by that module's state, with the
// domain numeral inside. The exam light behind the glass carries identity.

export type DomainCode = "I" | "II" | "III" | "IV" | "V" | "VI";
export type RingState = "done" | "paused" | "retake" | "current" | "new";

const STROKE: Record<RingState, string> = {
  done: "var(--success)",
  paused: "var(--accent)",
  retake: "var(--warning)",
  current: "var(--glow)",
  new: "color-mix(in srgb, var(--muted) 28%, transparent)",
};

const R = 18;
const C = 2 * Math.PI * R;

export function DomainRing({ code, states, size = 44 }: { code: string; states: RingState[]; size?: number }) {
  const n = Math.max(1, states.length);
  const slot = C / n;
  // round caps add half the stroke width at each end — widen the gap to match
  const gap = n > 1 ? 7.5 : 0;
  const seg = Math.max(0.5, slot - gap);
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} className="shrink-0" aria-hidden>
      <g transform="rotate(-90 22 22)">
        {states.map((s, i) => (
          <circle
            key={i}
            cx="22"
            cy="22"
            r={R}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${seg} ${C}`}
            strokeDashoffset={-(i * slot + gap / 2)}
            style={{ stroke: STROKE[s] }}
          />
        ))}
      </g>
      <text x="22" y="22" dy="0.36em" textAnchor="middle" className="font-display" style={{ fill: "var(--foreground)", fontSize: code.length > 2 ? 11.5 : 13, fontWeight: 800 }}>
        {code}
      </text>
    </svg>
  );
}
