"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MotionBar } from "@/components/motion";

// Practice-area building blocks (imported only by the practice / quiz files), on the
// Glass Box tokens. Hand-rolled surfaces a central reskin may want to review:
// Kbd, LetterChip, Segmented (the lens), SegmentTrack, ActionTray, Callout.

/** Keyboard key cap — rendered only for fine pointers (mouse / trackpad). */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "hidden h-[18px] min-w-[18px] items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-1 font-sans text-[10px] font-semibold leading-none text-[var(--muted)] pointer-fine:inline-flex",
        className
      )}
    >
      {children}
    </kbd>
  );
}

export type ChipTone = "idle" | "selected" | "success" | "danger" | "warning" | "muted";

// Text on filled status chips uses --primary-fg (white in light, ink in dark) so it
// passes contrast on both themes' status colors.
const CHIP_TONE: Record<ChipTone, string> = {
  idle: "bg-[var(--glass-tint-strong)] text-[var(--muted)] ring-1 ring-inset ring-[var(--border)]",
  selected: "bg-[var(--primary)] text-[var(--primary-fg)]",
  success: "bg-[var(--success)] text-[var(--primary-fg)]",
  danger: "bg-[var(--danger)] text-[var(--primary-fg)]",
  warning: "bg-[var(--warning)]/16 text-[color-mix(in_srgb,var(--warning)_65%,var(--foreground))]",
  muted: "text-[var(--muted)] ring-1 ring-inset ring-[var(--border)]",
};

/** Option letter token. The same chip marks the option and its rationale, so a
 *  reference like "C" is matched at a glance even though options are shuffled. */
export function LetterChip({ label, tone = "idle", square, className }: { label: string; tone?: ChipTone; square?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center text-[11px] font-bold tabular-nums transition-colors duration-200",
        square ? "rounded-md" : "rounded-full",
        CHIP_TONE[tone],
        className
      )}
    >
      {label}
    </span>
  );
}

export interface SegmentOption<T> {
  value: T;
  label: ReactNode;
  count?: number;
  disabled?: boolean;
  title?: string;
}

/** Segmented control with the liquid lens: one spring pill (framer-motion layoutId)
 *  glides to the active choice — the shell's nav pattern, scoped by `id`. A disabled
 *  choice shows its 0 count as the reason. `allowDeselect` lets a second tap clear it. */
export function Segmented<T extends string | number>({
  id,
  value,
  options,
  onChange,
  ariaLabel,
  allowDeselect,
  className,
  itemClassName,
}: {
  id: string;
  value: T | undefined;
  options: SegmentOption<T>[];
  onChange: (v: T | undefined) => void;
  ariaLabel: string;
  allowDeselect?: boolean;
  className?: string;
  itemClassName?: string;
}) {
  const reduce = useReducedMotion();
  const lens = reduce ? { duration: 0 } : ({ type: "spring", stiffness: 380, damping: 30, mass: 0.9 } as const);
  return (
    <div role="group" aria-label={ariaLabel} className={cn("inline-flex max-w-full flex-wrap gap-0.5 rounded-[20px] bg-[var(--surface-2)] p-1", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={active}
            data-kbd-toggle=""
            disabled={o.disabled && !active}
            title={o.title}
            onClick={() => onChange(active && allowDeselect ? undefined : o.value)}
            className={cn(
              "press relative inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold",
              // stretch the tap target to 44px on phones without growing the pill
              "before:absolute before:inset-x-0 before:-inset-y-1 before:content-[''] md:before:hidden",
              active ? "text-[color-mix(in_srgb,var(--primary)_82%,var(--foreground))]" : "text-[var(--muted)] hover:text-[var(--foreground)]",
              "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[var(--muted)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              itemClassName
            )}
          >
            {active && (
              <motion.span
                layoutId={`lens-${id}`}
                transition={lens}
                aria-hidden
                className="absolute inset-0 rounded-full bg-[var(--glass-tint-strong)] shadow-[var(--e1)] ring-1 ring-[var(--primary)]/30"
              />
            )}
            <span className="relative inline-flex items-center gap-1.5">{o.label}</span>
            {o.count !== undefined && <span className="relative font-medium tabular-nums">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Session progress: one segment per question (green right / red wrong / neutral
 *  current), falling back to the liquid bar for long sessions. */
export function SegmentTrack({ results, total, current, className }: { results: boolean[]; total: number; current?: number; className?: string }) {
  const answered = results.length;
  if (total > 40) return <MotionBar value={total ? (answered / total) * 100 : 0} className={cn("h-2", className)} />;
  return (
    <div className={cn("flex h-2 gap-1", className)} role="img" aria-label={`${answered} of ${total} answered, ${results.filter(Boolean).length} right`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-full min-w-0 flex-1 rounded-full transition-colors duration-300",
            // current = neutral marker, so it never reads as "answered right"
            i < answered ? (results[i] ? "bg-[var(--success)]" : "bg-[var(--danger)]") : i === current ? "bg-[var(--foreground)]/35" : "bg-[var(--surface-2)]"
          )}
        />
      ))}
    </div>
  );
}

/** The action row of a question card. Desktop: a ruled card footer. Phone: a sticky
 *  glass tray floating just above the dock, inside thumb reach. */
export function ActionTray({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "sticky bottom-[calc(var(--bottom-nav-h)_+_max(0px,_env(safe-area-inset-bottom)_-_10px)_+_6px)] z-10 mt-4 p-2 md:static md:z-auto md:mt-5 md:border-t md:border-[var(--border)] md:px-0 md:pb-0 md:pt-4",
        className
      )}
    >
      <span aria-hidden className="glass-float pointer-events-none absolute inset-0 -z-10 rounded-[22px] md:hidden" />
      {children}
    </div>
  );
}

const CALLOUT_TONE = {
  neutral: "bg-[var(--surface-2)]",
  outline: "border border-[var(--border)]",
  warning: "border border-[var(--warning)]/35 bg-[var(--warning)]/8",
  danger: "bg-[var(--danger)]/8",
} as const;

/** Quiet inner section on a glass panel (scenario, strategy, the near-miss lesson). */
export function Callout({ tone = "neutral", className, children }: { tone?: keyof typeof CALLOUT_TONE; className?: string; children: ReactNode }) {
  return <div className={cn("rounded-[14px] p-3.5", CALLOUT_TONE[tone], className)}>{children}</div>;
}
