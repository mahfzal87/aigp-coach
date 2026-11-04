"use client";

import { useEffect, useId, type ReactNode } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { Verdict } from "@/lib/types";

// Colours go through style (CSS properties), not SVG presentation attributes,
// so var() tokens resolve in every browser and follow the theme and the exam.
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
      <circle cx={cx} cy={cx} r={r} fill="none" strokeWidth={stroke} style={{ stroke: "var(--border)" }} />
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
      <text x={cx} y={cx} dy="0.35em" textAnchor="middle" className="font-display text-3xl font-bold" style={{ fill: "var(--foreground)", fontVariantNumeric: "tabular-nums" }}>
        {Math.round(pct)}
      </text>
    </svg>
  );
}

// ── ScoreDial: the projected score on the exam's own 100–500 scale ──
// A 240° dial. The arc fills to the projection; a thin zone ring marks where
// the verdict turns "almost" and "ready"; ticks mark the pass mark and the
// Ready line. Two layouts:
//  • standalone — thick track, labels and a centre readout in the SVG;
//  • bezel (pass `children`) — a thin ring hugging centre content such as the
//    LiquidOrb; labels move to the caller's legend so the ring stays quiet.

const START = 150; // degrees, clockwise from +x in SVG space (lower-left)
const SWEEP = 240; // ends lower-right

interface Geometry {
  W: number;
  H: number;
  CX: number;
  CY: number;
  R: number; // track centreline
  SW: number; // track width
  ZONE_R: number; // zone ring radius
  INNER_R: number; // radius available to centre content (bezel)
}
const STANDALONE: Geometry = { W: 300, H: 178, CX: 150, CY: 120, R: 86, SW: 14, ZONE_R: 86 + 7 + 5, INNER_R: 0 };
// The orb's sphere is 92% of its box, so INNER_R 120 leaves a ~13px gap to the ring at 264px.
const BEZEL: Geometry = { W: 300, H: 260, CX: 150, CY: 140, R: 128, SW: 6, ZONE_R: 128 + 3 + 4, INNER_R: 120 };

function polar(g: Geometry, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [g.CX + r * Math.cos(a), g.CY + r * Math.sin(a)];
}

function arcPath(g: Geometry, r: number, a0: number, a1: number): string {
  const [x0, y0] = polar(g, r, a0);
  const [x1, y1] = polar(g, r, a1);
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
  /** Latest substantial mock, scaled — a dot inside the track (standalone layout only). */
  mock?: number | null;
  min?: number;
  max?: number;
  /** Rendered width in px (shrinks to fit its container). */
  size?: number;
  className?: string;
  /** Centre content for the bezel layout; receives its diameter in px at `size`. */
  children?: (innerSize: number) => ReactNode;
}

export function ScoreDial({ projected, verdict, pass, almostAt, readyAt, mock = null, min = 100, max = 500, size = 260, className, children }: ScoreDialProps) {
  const reduce = useReducedMotion();
  const bezel = typeof children === "function";
  const g = bezel ? BEZEL : STANDALONE;

  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const frac = (v: number) => (clamp(v) - min) / (max - min);
  const ang = (v: number) => START + SWEEP * frac(v);

  const has = projected != null && verdict !== "unknown";
  const target = has ? frac(projected) : 0;
  const knobColor = VERDICT_COLOR[verdict];
  // In the bezel the arc shares the orb's liquid so the two read as one object;
  // the verdict colour stays on the knob, the zone ring, the badge and the gates.
  const arcColor = bezel ? "var(--primary)" : knobColor;

  // One spring drives the arc, the knob and the count-up so they stay in step.
  const progress = useSpring(reduce ? target : 0, { stiffness: 120, damping: 24 });
  useEffect(() => {
    if (reduce) progress.jump(target);
    else progress.set(target);
  }, [target, reduce, progress]);
  const knobX = useTransform(progress, (f) => polar(g, g.R, START + SWEEP * f)[0]);
  const knobY = useTransform(progress, (f) => polar(g, g.R, START + SWEEP * f)[1]);
  const number = useTransform(progress, (f) => String(Math.round(min + f * (max - min))));

  const track = arcPath(g, g.R, START, START + SWEEP);
  const tick = (v: number, r0: number, r1: number) => {
    const [x1, y1] = polar(g, r0, ang(v));
    const [x2, y2] = polar(g, r1, ang(v));
    return { x1, y1, x2, y2 };
  };
  const tickIn = g.R - g.SW / 2 - (bezel ? 3 : 1);
  const tickOut = g.ZONE_R + 3;

  // Standalone labels sit just outside the zone ring; anchor follows the side of the dial.
  const label = (v: number) => {
    const a = (ang(v) * Math.PI) / 180;
    const [x, y] = polar(g, g.ZONE_R + 9, ang(v));
    const cos = Math.cos(a);
    const anchor: "start" | "end" | "middle" = cos > 0.35 ? "start" : cos < -0.35 ? "end" : "middle";
    return { x, y, anchor, top: Math.sin(a) < -0.6 };
  };
  const passL = label(pass);
  const readyL = label(readyAt);
  const mockPos = !bezel && has && mock != null ? polar(g, g.R - g.SW / 2 - 7, ang(mock)) : null;

  const aria = has
    ? `Projected ${projected} of ${max}. Pass mark ${pass}. Ready from ${readyAt}.${mock != null ? ` Latest mock ${mock}.` : ""}`
    : `No projection yet. Pass mark ${pass}. Ready from ${readyAt}.`;

  const ring = (
    <svg
      viewBox={`0 0 ${g.W} ${g.H}`}
      role="img"
      aria-label={aria}
      className={bezel ? "absolute inset-0 h-full w-full" : className}
      style={bezel ? undefined : { width: size, maxWidth: "100%", height: "auto" }}
    >
      {/* track */}
      <path d={track} fill="none" strokeWidth={g.SW} strokeLinecap="round" style={{ stroke: "var(--border)" }} />

      {/* zone ring: almost → ready → top of scale */}
      <path d={arcPath(g, g.ZONE_R, ang(almostAt), ang(readyAt))} fill="none" strokeWidth={3} strokeLinecap="round" style={{ stroke: "var(--warning)", opacity: 0.6 }} />
      <path d={arcPath(g, g.ZONE_R, ang(readyAt), START + SWEEP)} fill="none" strokeWidth={3} strokeLinecap="round" style={{ stroke: "var(--success)", opacity: 0.85 }} />

      {/* projection arc */}
      <motion.path
        d={track}
        fill="none"
        strokeWidth={g.SW}
        strokeLinecap="round"
        style={{ stroke: arcColor, pathLength: progress, opacity: has && target > 0 ? 1 : 0 }}
      />

      {/* pass + ready ticks cross the track so they read over the arc */}
      <line {...tick(pass, tickIn, tickOut)} strokeWidth={2} strokeLinecap="round" style={{ stroke: "var(--foreground)", opacity: 0.45 }} />
      <line {...tick(readyAt, tickIn, tickOut)} strokeWidth={2} strokeLinecap="round" style={{ stroke: "var(--success)" }} />

      {!bezel && (
        <>
          <text
            x={passL.x}
            y={passL.top ? passL.y - 1 : passL.y + 4}
            textAnchor={passL.anchor}
            style={{ fill: "var(--muted)", fontSize: 10.5, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
          >
            Pass {pass}
          </text>
          <text x={readyL.x} y={readyL.y - 2} textAnchor={readyL.anchor} style={{ fill: "var(--success)", fontSize: 10.5, fontWeight: 700 }}>
            Ready
            <tspan x={readyL.x} dy={12} style={{ fill: "var(--muted)", fontSize: 10, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
              {readyAt}+
            </tspan>
          </text>
        </>
      )}

      {/* latest mock (standalone only) */}
      {mockPos && <circle cx={mockPos[0]} cy={mockPos[1]} r={3.5} style={{ fill: "var(--foreground)", opacity: 0.75 }} />}

      {/* knob at the projection, in the verdict colour */}
      <motion.circle
        cx={knobX}
        cy={knobY}
        r={bezel ? 6.5 : 7.5}
        strokeWidth={bezel ? 3 : 3.5}
        style={{ fill: "var(--surface)", stroke: knobColor, opacity: has ? 1 : 0 }}
      />

      {!bezel && (
        <>
          <motion.text
            x={g.CX}
            y={g.CY + 12}
            textAnchor="middle"
            className="font-display"
            style={{ fill: has ? "var(--foreground)" : "var(--muted)", fontSize: 46, fontWeight: 700, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}
          >
            {has ? number : "—"}
          </motion.text>
          <text x={g.CX} y={g.CY + 33} textAnchor="middle" style={{ fill: "var(--muted)", fontSize: 11, fontWeight: 500 }}>
            {has ? `projected of ${max}` : "no read yet"}
          </text>
        </>
      )}
    </svg>
  );

  if (!bezel) return ring;

  const inner = Math.round((size * 2 * g.INNER_R) / g.W);
  return (
    <div className={className ? `relative ${className}` : "relative"} style={{ width: size, maxWidth: "100%", aspectRatio: `${g.W} / ${g.H}` }}>
      {ring}
      <div
        className="absolute grid place-items-center"
        style={{
          left: `${((g.CX - g.INNER_R) / g.W) * 100}%`,
          top: `${((g.CY - g.INNER_R) / g.H) * 100}%`,
          width: `${((2 * g.INNER_R) / g.W) * 100}%`,
          height: `${((2 * g.INNER_R) / g.H) * 100}%`,
        }}
      >
        {children(inner)}
      </div>
    </div>
  );
}

// ── EmptyOrb: the orb's glass with no liquid, for when there is no reading yet ──
// Mirrors components/liquid-orb.tsx (same tokens) so the hero keeps its shape
// without inventing a readiness figure.
export function EmptyOrb({ size = 176, sub, label = "Readiness" }: { size?: number; sub?: string; label?: string }) {
  const id = useId().replace(/[:]/g, "");
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label}: no reading yet`}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <radialGradient id={`empty-${id}`} cx="38%" cy="30%" r="78%">
            <stop offset="0%" style={{ stopColor: "var(--orb-shine)" }} />
            <stop offset="62%" style={{ stopColor: "var(--orb-body)" }} />
            <stop offset="100%" style={{ stopColor: "color-mix(in srgb, var(--exam-primary) 18%, transparent)" }} />
          </radialGradient>
        </defs>
        <circle cx={100} cy={100} r={92} fill={`url(#empty-${id})`} />
        <ellipse cx={72} cy={52} rx={34} ry={16} transform="rotate(-24 72 52)" style={{ fill: "var(--orb-spec)" }} />
        <circle cx={100} cy={100} r={92} fill="none" strokeWidth={1.25} style={{ stroke: "var(--glass-edge)" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center text-[var(--muted)]">
        <div>
          <div className="font-display font-extrabold leading-none" style={{ fontSize: size * 0.3 }}>
            —
          </div>
          {sub && <div className="mt-1 text-[11px] font-semibold">{sub}</div>}
        </div>
      </div>
    </div>
  );
}
