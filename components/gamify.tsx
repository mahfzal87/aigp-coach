"use client";

import { Flame, Star, Zap } from "lucide-react";
import { levelFromXp, streakAlive } from "@/lib/gamify";
import { cn } from "@/lib/utils";

// Compact header chips: streak, XP, level.
export function StatChips({ xp, streak, lastActiveDate, className }: { xp: number; streak: number; lastActiveDate: string | null; className?: string }) {
  const { level } = levelFromXp(xp);
  const alive = streakAlive(lastActiveDate);
  return (
    <div className={cn("flex items-center gap-3 font-extrabold", className)}>
      <span className="flex items-center gap-1 text-[var(--streak)]" title="Day streak">
        <Flame size={20} className={alive ? "" : "opacity-40"} fill={alive ? "var(--streak)" : "none"} />
        <span className="text-sm tabular-nums">{streak}</span>
      </span>
      <span className="flex items-center gap-1 text-[var(--gold)]" title="Total points">
        <Zap size={20} fill="var(--gold)" />
        <span className="text-sm tabular-nums">{xp.toLocaleString()}</span>
      </span>
      <span className="flex items-center gap-1 text-[var(--accent)]" title="Level">
        <Star size={20} fill="var(--accent)" />
        <span className="text-sm tabular-nums">Lvl {level}</span>
      </span>
    </div>
  );
}

// Circular progress ring with a value + label in the center.
// Colours are applied as CSS (style), so var() tokens resolve in every browser.
export function Ring({
  value,
  size = 132,
  stroke = 12,
  color = "var(--primary)",
  trackColor = "var(--border)",
  label,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  /** Accessible description, e.g. "Level 9, 89% to level 10". */
  label?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  const off = c - (pct / 100) * c;
  return (
    <div
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <svg width={size} height={size} className="absolute inset-0" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} style={{ stroke: trackColor }} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-500"
          style={{ stroke: color, opacity: pct > 0 ? 1 : 0 }}
        />
      </svg>
      <div className="relative z-10 text-center" aria-hidden={label ? true : undefined}>
        {children}
      </div>
    </div>
  );
}

// A week of streak pips arranged in a ring around the centre content: filled
// for each day of the running streak (up to the goal), hollow for the days to
// go. A small instrument, not a badge.
export function StreakRing({ days, goal = 7, size = 40, children }: { days: number; goal?: number; size?: number; children?: React.ReactNode }) {
  const filled = Math.max(0, Math.min(goal, Math.floor(days)));
  const c = size / 2;
  const r = c - 3.5;
  return (
    <div className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }} role="img" aria-label={`${filled} of ${goal} streak days`}>
      <svg width={size} height={size} className="absolute inset-0" aria-hidden>
        {Array.from({ length: goal }, (_, i) => {
          const a = ((-90 + (i * 360) / goal) * Math.PI) / 180;
          return (
            <circle
              key={i}
              cx={c + r * Math.cos(a)}
              cy={c + r * Math.sin(a)}
              r={2.6}
              strokeWidth={1}
              style={i < filled ? { fill: "var(--streak)", stroke: "var(--streak)" } : { fill: "var(--surface-2)", stroke: "var(--border)" }}
            />
          );
        })}
      </svg>
      <div className="relative z-10 grid place-items-center" aria-hidden>
        {children}
      </div>
    </div>
  );
}
