"use client";

import { useEffect } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { Verdict } from "@/lib/types";

// Colours go through style (CSS properties), not SVG presentation attributes,
// so var() tokens resolve in every browser and follow the theme.
const VERDICT_COLOR: Record<Verdict, string> = {
  ready: "var(--success)",
  almost: "var(--warning)",
  "not-yet": "var(--danger)",
  unknown: "var(--muted)",
};

/** Legacy 0–100 ring. API unchanged; ScoreDial below is the Progress hero. */
export function ReadinessGauge({ value, verdict, size = 180 }: { value: number; verdict: Verdict; size?: number }) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;

  return (
    <svg width={size} height={size} role="img" aria-label={`Readiness ${Math.round(pct)} of 100`}>
      <circle cx={cx} cy={cx} r={r} fill="none" strokeWidth={stroke} style={{ stroke: "var(--surface-2)" }} />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cx})`}
        className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-500"
        style={{ stroke: VERDICT_COLOR[verdict] }}
      />
      <text x={cx} y={cx} dy="0.35em" textAnchor="middle" className="text-3xl font-bold" style={{ fill: "var(--foreground)", fontVariantNumeric: "tabular-nums" }}>
        {Math.round(pct)}
      </text>
    </svg>
  );
}

// ── ScoreDial: the projected score on the exam's own 100–500 scale ──
// A 240° dial. The arc fills to the projection in the verdict colour; a thin
// zone ring marks where the verdict turns "almost" and "ready"; ticks mark the
// pass mark and the Ready line; a dot inside the track marks the latest mock.

const W = 300;
const H = 178;
const CX = 150;
const CY = 120;
const R = 86; // track centreline
const SW = 14; // track width
const ZONE_R = R + SW / 2 + 5; // thin zone ring just outside the track
const START = 150; // degrees, clockwise from +x in SVG space (lower-left)
const SWEEP = 240; // ends lower-right

function polar(r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function arcPath(r: number, a0: number, a1: number): string {
  const [x0, y0] = polar(r, a0);
  const [x1, y1] = polar(r, a1);
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

export interface ScoreDialProps {
  /** Projected scaled score; null (or verdict "unknown") renders the empty dial. */
  projected: number | null;
  verdict: Verdict;
  /** Pass mark on the scaled range (300 on IAPP papers). */
  pass: number;
  /** First scaled score where the verdict turns "almost". */
  almostAt: number;
  /** First scaled score where the projection gate for "ready" passes. */
  readyAt: number;
  /** Latest substantial mock, scaled — drawn as a dot inside the track. */
  mock?: number | null;
  min?: number;
  max?: number;
  /** Rendered width in px (shrinks to fit its container). */
  size?: number;
  className?: string;
}

export function ScoreDial({ projected, verdict, pass, almostAt, readyAt, mock = null, min = 100, max = 500, size = 260, className }: ScoreDialProps) {
  const reduce = useReducedMotion();
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const frac = (v: number) => (clamp(v) - min) / (max - min);
  const ang = (v: number) => START + SWEEP * frac(v);

  const has = projected != null && verdict !== "unknown";
  const target = has ? frac(projected) : 0;
  const color = VERDICT_COLOR[verdict];

  // One spring drives the arc, the knob and the count-up so they stay in step.
  const progress = useSpring(reduce ? target : 0, { stiffness: 120, damping: 24 });
  useEffect(() => {
    if (reduce) progress.jump(target);
    else progress.set(target);
  }, [target, reduce, progress]);
  const knobX = useTransform(progress, (f) => polar(R, START + SWEEP * f)[0]);
  const knobY = useTransform(progress, (f) => polar(R, START + SWEEP * f)[1]);
  const number = useTransform(progress, (f) => String(Math.round(min + f * (max - min))));

  const track = arcPath(R, START, START + SWEEP);
  const tick = (v: number, r0: number, r1: number) => {
    const [x1, y1] = polar(r0, ang(v));
    const [x2, y2] = polar(r1, ang(v));
    return { x1, y1, x2, y2 };
  };

  // Labels sit just outside the zone ring; anchor follows the side of the dial.
  const label = (v: number) => {
    const a = (ang(v) * Math.PI) / 180;
    const [x, y] = polar(ZONE_R + 9, ang(v));
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const anchor: "start" | "end" | "middle" = cos > 0.35 ? "start" : cos < -0.35 ? "end" : "middle";
    return { x, y, anchor, top: sin < -0.6 };
  };
  const passL = label(pass);
  const readyL = label(readyAt);

  const mockPos = has && mock != null ? polar(R - SW / 2 - 7, ang(mock)) : null;

  const aria = has
    ? `Projected ${projected} of ${max}. Pass mark ${pass}. Ready from ${readyAt}.${mock != null ? ` Latest mock ${mock}.` : ""}`
    : `No projection yet. Pass mark ${pass}. Ready from ${readyAt}.`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className={className} style={{ width: size, maxWidth: "100%", height: "auto" }}>
      {/* track */}
      <path d={track} fill="none" strokeWidth={SW} strokeLinecap="round" style={{ stroke: "var(--surface-2)" }} />

      {/* zone ring: almost → ready → top of scale */}
      <path d={arcPath(ZONE_R, ang(almostAt), ang(readyAt))} fill="none" strokeWidth={3} style={{ stroke: "var(--warning)", opacity: 0.55 }} />
      <path d={arcPath(ZONE_R, ang(readyAt), START + SWEEP)} fill="none" strokeWidth={3} style={{ stroke: "var(--success)", opacity: 0.8 }} />

      {/* projection arc */}
      <motion.path
        d={track}
        fill="none"
        strokeWidth={SW}
        strokeLinecap="round"
        style={{ stroke: color, pathLength: progress, opacity: has && target > 0 ? 1 : 0 }}
      />

      {/* pass + ready ticks cross the track so they read over the arc */}
      <line {...tick(pass, R - SW / 2 - 1, ZONE_R + 3)} strokeWidth={2} strokeLinecap="round" style={{ stroke: "var(--foreground)", opacity: 0.45 }} />
      <line {...tick(readyAt, R - SW / 2 - 1, ZONE_R + 3)} strokeWidth={2} strokeLinecap="round" style={{ stroke: "var(--success)" }} />

      <text
        x={passL.x}
        y={passL.top ? passL.y - 1 : passL.y + 4}
        textAnchor={passL.anchor}
        style={{ fill: "var(--muted)", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", fontVariantNumeric: "tabular-nums" }}
      >
        PASS {pass}
      </text>
      <text x={readyL.x} y={readyL.y - 2} textAnchor={readyL.anchor} style={{ fill: "var(--success)", fontSize: 10.5, fontWeight: 700 }}>
        Ready
        <tspan x={readyL.x} dy={12} style={{ fill: "var(--muted)", fontSize: 10, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          {readyAt}+
        </tspan>
      </text>

      {/* latest mock */}
      {mockPos && <circle cx={mockPos[0]} cy={mockPos[1]} r={3.5} style={{ fill: "var(--foreground)", opacity: 0.75 }} />}

      {/* knob at the projection */}
      <motion.circle cx={knobX} cy={knobY} r={7.5} strokeWidth={3.5} style={{ fill: "var(--surface)", stroke: color, opacity: has ? 1 : 0 }} />

      {/* centre readout */}
      <motion.text
        x={CX}
        y={CY + 12}
        textAnchor="middle"
        style={{ fill: has ? "var(--foreground)" : "var(--muted)", fontSize: 46, fontWeight: 700, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}
      >
        {has ? number : "—"}
      </motion.text>
      <text x={CX} y={CY + 33} textAnchor="middle" style={{ fill: "var(--muted)", fontSize: 11, fontWeight: 500 }}>
        {has ? `projected · of ${max}` : "no read yet"}
      </text>
    </svg>
  );
}
