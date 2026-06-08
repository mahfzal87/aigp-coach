"use client";

import type { Verdict } from "@/lib/types";

const VERDICT_COLOR: Record<Verdict, string> = {
  ready: "var(--success)",
  almost: "var(--warning)",
  "not-yet": "var(--danger)",
  unknown: "var(--muted)",
};

export function ReadinessGauge({ value, verdict, size = 180 }: { value: number; verdict: Verdict; size?: number }) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;
  const color = VERDICT_COLOR[verdict];

  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x={cx} y={cx} dy="0.35em" textAnchor="middle" className="fill-[var(--foreground)] text-3xl font-bold">
        {Math.round(pct)}
      </text>
    </svg>
  );
}
