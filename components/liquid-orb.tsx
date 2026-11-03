"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";
import { springSoft } from "@/components/motion";

// The readiness orb: a glass sphere filled with the exam's liquid to `value`
// (0–100), with a slow surface wave. Colors come from the exam tokens
// (--primary / --glow), so the orb takes each exam's light.

const R = 92;
const C = 100;
// One full period of the wave is 200 units wide; the path spans three periods
// so translating it by exactly one period (in either direction) loops seamlessly.
const WAVE = "M-40 10 Q 10 0 60 10 T 160 10 T 260 10 T 360 10 T 460 10 T 560 10 V 220 H -40 Z";

export function LiquidOrb({
  value,
  size = 176,
  label,
  sub,
}: {
  value: number;
  size?: number;
  label?: string;
  sub?: string;
}) {
  const id = useId().replace(/[:]/g, "");
  const reduce = useReducedMotion();
  const v = Math.max(0, Math.min(100, Math.round(value)));
  // surface height inside the sphere: 0 → bottom of the circle, 100 → top
  const surfaceY = C + R - (2 * R * v) / 100 - 10;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label ?? "Readiness"} ${v} out of 100`}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <clipPath id={`orb-${id}`}>
            <circle cx={C} cy={C} r={R} />
          </clipPath>
          <linearGradient id={`liq-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--glow)" }} />
            <stop offset="100%" style={{ stopColor: "var(--exam-primary)" }} />
          </linearGradient>
          {/* sphere volume: bright core, clear body, a faint exam-tinted rim */}
          <radialGradient id={`body-${id}`} cx="38%" cy="30%" r="78%">
            <stop offset="0%" style={{ stopColor: "var(--orb-shine)" }} />
            <stop offset="62%" style={{ stopColor: "var(--orb-body)" }} />
            <stop offset="100%" style={{ stopColor: "color-mix(in srgb, var(--exam-primary) 26%, transparent)" }} />
          </radialGradient>
        </defs>

        {/* glass body */}
        <circle cx={C} cy={C} r={R} fill={`url(#body-${id})`} />

        {/* liquid: back wave (slower, fainter) then front wave */}
        <g clipPath={`url(#orb-${id})`}>
          <motion.g initial={reduce ? false : { y: 200 }} animate={{ y: surfaceY }} transition={{ ...springSoft, delay: 0.15 }}>
            <g className={reduce ? undefined : "orb-wave-slow"} style={{ opacity: 0.45 }}>
              <path d={WAVE} fill={`url(#liq-${id})`} transform="translate(-30 -4)" />
            </g>
            <g className={reduce ? undefined : "orb-wave"}>
              <path d={WAVE} fill={`url(#liq-${id})`} />
            </g>
          </motion.g>
        </g>

        {/* specular highlight + 1px rim — minimal glass */}
        <ellipse cx={72} cy={52} rx={34} ry={16} transform="rotate(-24 72 52)" style={{ fill: "var(--orb-spec)" }} />
        <circle cx={C} cy={C} r={R} fill="none" strokeWidth={1.25} style={{ stroke: "var(--glass-edge)" }} />
      </svg>

      {/* The figure sits over liquid once the orb is past half full — switch ink for contrast. */}
      <div className="absolute inset-0 grid place-items-center text-center">
        <div className={v >= 56 ? "text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.18)]" : "text-[var(--foreground)]"}>
          <div className="font-display font-extrabold leading-none tabular-nums" style={{ fontSize: size * 0.3 }}>
            {v}
          </div>
          {sub && <div className="mt-1 text-[11px] font-semibold opacity-85">{sub}</div>}
        </div>
      </div>
    </div>
  );
}
