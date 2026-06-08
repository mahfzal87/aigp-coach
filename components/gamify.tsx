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
        <span className="text-sm">{streak}</span>
      </span>
      <span className="flex items-center gap-1 text-[var(--gold)]" title="Total XP">
        <Zap size={20} fill="var(--gold)" />
        <span className="text-sm">{xp}</span>
      </span>
      <span className="flex items-center gap-1 text-[var(--accent)]" title="Level">
        <Star size={20} fill="var(--accent)" />
        <span className="text-sm">Lvl {level}</span>
      </span>
    </div>
  );
}

// Circular progress ring with a value + label in the center.
export function Ring({ value, size = 132, stroke = 12, color = "var(--primary)", children }: { value: number; size?: number; stroke?: number; color?: string; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div className="relative z-10 text-center">{children}</div>
    </div>
  );
}
