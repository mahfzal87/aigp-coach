"use client";

// Shared building blocks for the Progress (/profile) and Analytics (/analytics)
// pages only. Surfaces come from the shared primitives (Card, Bar, Badge,
// buttonVariants) so the Glass Box system styles them; colours are CSS tokens.
// Recharts colours live in app/analytics/page.tsx because SVG attributes need literals.

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import { getQuestionsByCompetency } from "@/lib/content";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { Competency, CompetencyMastery } from "@/lib/types";
import { Bar, Card, buttonVariants } from "@/components/ui";

/** Mastery every domain must reach for the "Exam ready" verdict (lib/readiness.ts). */
export const TARGET = 80;
/** Answers per competency before mastery stops being cold-start noise (lib/readiness.ts MIN_SEEN). */
export const MIN_SEEN = 5;

export type Tone = "success" | "warning" | "danger" | "muted";

export function toneVar(t: Tone): string {
  return `var(--${t})`;
}

export function masteryTone(mastery: number, insufficient = false): Tone {
  if (insufficient) return "muted";
  return mastery >= TARGET ? "success" : mastery >= 60 ? "warning" : "danger";
}

/** A real link that looks like the shared Button. */
export function ButtonLink({
  href,
  variant,
  size,
  className,
  onClick,
  ...rest
}: { href: string } & Omit<ComponentProps<typeof Link>, "href"> & VariantProps<typeof buttonVariants>) {
  return (
    <Link
      href={href}
      onClick={(e) => {
        haptic("tap");
        onClick?.(e);
      }}
      className={cn(buttonVariants({ variant, size }), className)}
      {...rest}
    />
  );
}

// ── Typography helpers ──
/** Sentence-case section label (no tracked caps). */
export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("text-[13px] font-medium text-[var(--muted)]", className)}>{children}</div>;
}

export function SectionHead({ title, meta, className }: { title: ReactNode; meta?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-4 flex items-baseline justify-between gap-3", className)}>
      <h2 className="text-[17px] tracking-tight">{title}</h2>
      {meta != null && <div className="shrink-0 text-xs tabular-nums text-[var(--muted)]">{meta}</div>}
    </div>
  );
}

/** "▏80 target" legend matching the tick drawn by MasteryBar. */
export function TargetLegend({ value = TARGET }: { value?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className="h-3 w-0.5 rounded-full bg-[var(--foreground)] opacity-40" />
      {value} target
    </span>
  );
}

// ── Stat strip: one glass panel, hairline-divided cells (no card soup) ──
export interface StatItem {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
}

// 2×2 on phones, 1×4 from sm. Cells stay transparent so the Card is the only surface.
const CELL_RULES = ["border-r border-b sm:border-b-0", "border-b sm:border-b-0 sm:border-r", "border-r", ""];

export function StatStrip({ items }: { items: StatItem[] }) {
  return (
    <Card>
      <dl className="grid grid-cols-2 sm:grid-cols-4">
        {items.slice(0, 4).map((it, i) => (
          <div key={it.label} className={cn("min-w-0 border-[var(--border)] px-4 py-3.5", CELL_RULES[i])}>
            <dt className="truncate text-[13px] font-medium text-[var(--muted)]">{it.label}</dt>
            <dd className="mt-0.5 font-display text-[26px] font-bold leading-tight tabular-nums" style={it.tone ? { color: toneVar(it.tone) } : undefined}>
              {it.value}
            </dd>
            {it.hint != null && <dd className="mt-0.5 truncate text-xs tabular-nums text-[var(--muted)]">{it.hint}</dd>}
          </div>
        ))}
      </dl>
    </Card>
  );
}

// ── Mastery bar: the shared Bar plus the 80 target tick ──
export function MasteryBar({ value, tone, target = TARGET, className }: { value: number; tone: Tone; target?: number | null; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Bar value={value} tone={tone === "muted" ? "primary" : tone} className="h-2" />
      {target != null && (
        <span
          aria-hidden
          className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--foreground)] opacity-40"
          style={{ left: `calc(${target}% - 1px)` }}
        />
      )}
    </div>
  );
}

// ── "What's dragging you down": weakest competencies, each linked to a drill ──
export interface DragItem {
  comp: Competency;
  m: CompetencyMastery;
  reason: string;
  /** Practice deep link aimed at the reason (missed questions for accuracy, unseen for coverage). */
  href: string;
}

// The biggest fixable loss in the mastery formula (lib/readiness.ts:
// 55% recency-weighted accuracy + 25% bank coverage + 20% calibration).
// Both target pools are non-empty by construction: accuracy < 100% means at
// least one miss; coverage < 100% means unseen questions remain.
function dragTarget(comp: Competency, m: CompetencyMastery, bank: number): { reason: string; href: string } {
  const base = `/practice?competency=${comp.id}`;
  if (m.attempts === 0) return { reason: "Not started", href: base };
  if (m.insufficient) return { reason: `${m.attempts} of ${MIN_SEEN} answers so far`, href: base };
  const accLoss = 0.55 * (1 - m.recentAccuracy);
  const covLoss = 0.25 * (1 - m.coverage);
  return accLoss >= covLoss
    ? { reason: `${Math.round(m.recentAccuracy * 100)}% recent accuracy`, href: `${base}&pool=missed` }
    : { reason: `${m.seen} of ${bank} questions seen`, href: `${base}&pool=unseen` };
}

/** Weak competencies (enough data, below target) first, then the thinnest-data ones by exam weight. */
export function rankDrag(comps: Competency[], mastery: CompetencyMastery[], limit = 3): DragItem[] {
  const byId = new Map(mastery.map((m) => [m.competencyId, m]));
  const items = comps.flatMap((comp) => {
    const m = byId.get(comp.id);
    return m ? [{ comp, m }] : [];
  });
  const weak = items.filter((x) => !x.m.insufficient && x.m.mastery < TARGET).sort((a, b) => a.m.mastery - b.m.mastery);
  const thin = items.filter((x) => x.m.insufficient).sort((a, b) => b.comp.maxQ - a.comp.maxQ || a.m.attempts - b.m.attempts);
  return [...weak, ...thin].slice(0, limit).map((x) => ({ ...x, ...dragTarget(x.comp, x.m, getQuestionsByCompetency(x.comp.id).length) }));
}

/** Ruled-list row inside a glass panel: quiet hover fill, springy press, inset focus ring. */
export const ROW_LINK =
  "press group flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]";

export function DragRow({ item }: { item: DragItem }) {
  const { comp, m, reason, href } = item;
  const tone = masteryTone(m.mastery, m.insufficient);
  return (
    <li>
      <Link href={href} onClick={() => haptic("tap")} className={cn(ROW_LINK, "min-h-[56px]")}>
        <span className="w-10 shrink-0 text-xs font-semibold tabular-nums text-[var(--muted)]">{comp.code}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{comp.name}</span>
          <span className="block truncate text-xs text-[var(--muted)]">{reason}</span>
        </span>
        <span className="w-8 shrink-0 text-right font-display text-base font-bold tabular-nums" style={{ color: toneVar(tone) }}>
          {m.insufficient ? "—" : m.mastery}
        </span>
        <span className="shrink-0 text-xs font-semibold text-[var(--accent)]">Drill</span>
      </Link>
    </li>
  );
}
