"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { MotionBar } from "@/components/motion";

// Practice-area building blocks (imported only by the practice / quiz files).
// Everything here is token-based. These are the hand-rolled surfaces a central
// reskin should review: Kbd, LetterChip, ToggleChip (active state), SegmentTrack,
// ActionTray (mobile sticky bar — uses the shared `.glass` chrome), Callout.
//
// Colored borders carry the important modifier (`border-[var(--x)]!`): globals.css
// declares `* { border-color }` outside a cascade layer, which otherwise beats
// Tailwind's layered border-color utilities and renders every status border gray.

/** Keyboard key cap — rendered only for fine pointers (mouse / trackpad). */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "hidden h-[18px] min-w-[18px] items-center justify-center rounded-[5px] border border-[var(--border)] bg-[var(--surface)] px-1 font-sans text-[10px] font-semibold leading-none text-[var(--muted)] pointer-fine:inline-flex",
        className
      )}
    >
      {children}
    </kbd>
  );
}

export type ChipTone = "idle" | "selected" | "success" | "danger" | "warning" | "muted";

const CHIP_TONE: Record<ChipTone, string> = {
  idle: "border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]",
  selected: "bg-[var(--primary)] text-[var(--primary-fg)]",
  success: "bg-[var(--success)] text-[var(--primary-fg)]",
  danger: "bg-[var(--danger)] text-white",
  warning: "bg-[var(--warning)]/15 text-[var(--warning)]",
  muted: "border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]",
};

/** Option letter token. The same chip marks the option and its rationale, so a
 *  reference like "C" is matched at a glance even though options are shuffled. */
export function LetterChip({ label, tone = "idle", square, className }: { label: string; tone?: ChipTone; square?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center text-[11px] font-bold tabular-nums",
        square ? "rounded-md" : "rounded-full",
        CHIP_TONE[tone],
        className
      )}
    >
      {label}
    </span>
  );
}

/** Filter / choice chip on the shared outline Button. Active = soft primary tint
 *  (keeps the solid primary for the one real action on screen). The ::before
 *  pseudo-element stretches the tap target to 44px on phones without growing the chip. */
export function ToggleChip({
  active,
  count,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean; count?: number }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-pressed={active}
      className={cn(
        "relative gap-1.5 before:absolute before:inset-x-0 before:-inset-y-1 before:content-[''] md:before:hidden",
        active && "border-[var(--primary)]! bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/15",
        className
      )}
      {...props}
    >
      {children}
      {count !== undefined && <span className={cn("font-medium tabular-nums", active ? "opacity-75" : "text-[var(--muted)]")}>{count}</span>}
    </Button>
  );
}

/** Session progress: one segment per question (green right / red wrong / tinted
 *  current), falling back to a plain bar for long sessions. */
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
 *  tray that floats above the fixed bottom nav, inside thumb reach. Its surface is
 *  near-opaque on purpose: it carries the verdict text, which must stay legible
 *  over scrolling content even where backdrop blur is unavailable. */
export function ActionTray({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-10 mt-4 p-2 md:static md:z-auto md:mt-5 md:border-t md:border-[var(--border)] md:px-0 md:pb-0 md:pt-4",
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 shadow-[var(--e2)] backdrop-blur-md md:hidden"
      />
      {children}
    </div>
  );
}

const CALLOUT_TONE = {
  neutral: "bg-[var(--surface-2)]",
  plain: "bg-[var(--surface)]",
  warning: "bg-[var(--warning)]/10",
  danger: "bg-[var(--danger)]/8",
} as const;

/** Tinted note box (rationale panel, near-miss teaching moment, empty-filter explainer). */
export function Callout({ tone = "neutral", className, children }: { tone?: keyof typeof CALLOUT_TONE; className?: string; children: ReactNode }) {
  return <div className={cn("rounded-xl p-3.5", CALLOUT_TONE[tone], className)}>{children}</div>;
}
