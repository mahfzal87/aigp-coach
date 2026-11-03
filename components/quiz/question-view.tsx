"use client";

import { useMemo, type ReactNode } from "react";
import { Check, Scale, X } from "lucide-react";
import type { Question, QuestionOption } from "@/lib/types";
import { correctLabels, shuffle } from "@/lib/scoring";
import { TRAP_LABEL } from "@/lib/mock-insights";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { Callout, LetterChip, type ChipTone } from "@/components/practice-kit";
import { haptic } from "@/lib/haptics";

export const TYPE_LABEL: Record<string, string> = {
  best: "Best / Most",
  not: "NOT / Least",
  ordering: "Ordering",
  role: "Role ID",
  distinction: "Distinction",
  recall: "Recall",
};

/** On-screen order of a question's options: a stable per-question shuffle (prevents
 *  positional memorisation). Exported so keyboard shortcuts map 1–n to what is shown. */
export function orderedOptions(question: Question): QuestionOption[] {
  const seed = question.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return shuffle(question.options, seed);
}

const WORD_COUNT: Record<string, number> = { TWO: 2, THREE: 3, FOUR: 4 };

/** How many options the question asks for: 1 for single-select, the stem's number for
 *  "Select THREE." multi-selects, null when a multi-select names no number. */
export function requiredPicks(question: Question): number | null {
  if (!question.isMultiselect) return 1;
  const m = question.stem.match(/\bselect\s+(two|three|four|[2-4])\b/i);
  if (!m) return null;
  const w = m[1].toUpperCase();
  return WORD_COUNT[w] ?? Number(w);
}

type OptionState = "idle" | "selected" | "correct" | "correct-picked" | "wrong" | "near" | "dim";

// Colored borders need `!` — see the note in components/practice-kit.tsx.
const OPTION_CLASS: Record<OptionState, string> = {
  idle: "cursor-pointer border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]",
  selected: "cursor-pointer border-[var(--primary)]! bg-[var(--primary)]/8",
  correct: "border-[var(--success)]! bg-[var(--success)]/10",
  "correct-picked": "border-[var(--success)]! bg-[var(--success)]/10",
  wrong: "anim-shake border-[var(--danger)]! bg-[var(--danger)]/10",
  near: "border-dashed border-[var(--warning)]! bg-[var(--warning)]/6",
  dim: "border-[var(--border)] bg-[var(--surface)] opacity-60",
};

const OPTION_CHIP: Record<OptionState, ChipTone> = {
  idle: "idle",
  selected: "selected",
  correct: "success",
  "correct-picked": "success",
  wrong: "danger",
  near: "warning",
  dim: "muted",
};

function Stars({ n }: { n: number }) {
  return (
    <>
      <span className="sr-only">Difficulty {n} of 3</span>
      <span aria-hidden className="tracking-[0.08em]">
        {"★".repeat(n)}
        <span className="opacity-30">{"★".repeat(Math.max(0, 3 - n))}</span>
      </span>
    </>
  );
}

export function QuestionView({
  question,
  selected,
  onToggle,
  revealed,
  disabled,
  showTrap = false,
}: {
  question: Question;
  selected: string[];
  onToggle: (label: string) => void;
  revealed: boolean;
  disabled?: boolean;
  /** Name the trap in the rationale (off by default — the mock review shows its own). */
  showTrap?: boolean;
}) {
  const opts = useMemo(() => orderedOptions(question), [question]);
  const correct = correctLabels(question);
  const square = question.isMultiselect;
  const picks = requiredPicks(question);
  // The designated near-miss: defensible in general, wrong here on one discriminator.
  const nearMiss = question.nearMiss && !correct.includes(question.nearMiss) ? question.nearMiss : undefined;
  const nearWhy = nearMiss ? question.whyWrong[nearMiss] : undefined;
  const pickedNear = !!nearMiss && selected.includes(nearMiss);

  // Remaining wrong options: your pick first, then on-screen order.
  const others = opts
    .filter((o) => !correct.includes(o.label) && !(nearWhy && o.label === nearMiss) && question.whyWrong[o.label])
    .map((o) => ({ label: o.label, text: question.whyWrong[o.label], picked: selected.includes(o.label) }))
    .sort((a, b) => Number(b.picked) - Number(a.picked));

  const trap = showTrap && question.trapType !== "none" ? (TRAP_LABEL[question.trapType] ?? question.trapType) : null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <Badge tone="primary">{question.bokRef}</Badge>
        <Badge>{TYPE_LABEL[question.type] ?? question.type}</Badge>
        <Badge>
          <Stars n={question.difficulty} />
        </Badge>
        {question.isMultiselect && <Badge tone="warning">{picks ? `Select ${picks}` : "Select all that apply"}</Badge>}
      </div>

      {question.scenario && (
        <Callout className="mb-3 text-sm leading-relaxed">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Scenario</span>
          {question.scenario}
        </Callout>
      )}
      <p className="mb-4 text-base font-medium leading-relaxed">{question.stem}</p>

      <Stagger key={question.id} className="space-y-2" role="group" aria-label="Answer options">
        {opts.map((o) => {
          const isSel = selected.includes(o.label);
          const isCorrect = correct.includes(o.label);
          const isNear = o.label === nearMiss;
          const state: OptionState = !revealed
            ? isSel
              ? "selected"
              : "idle"
            : isCorrect
              ? isSel
                ? "correct-picked"
                : "correct"
              : isSel
                ? "wrong"
                : isNear
                  ? "near"
                  : "dim";
          const tags: ReactNode[] = [];
          if (state === "correct-picked") tags.push(<Badge key="c" tone="success"><Check size={12} strokeWidth={3} /> Your answer</Badge>);
          if (state === "correct") tags.push(<Badge key="c" tone="success"><Check size={12} strokeWidth={3} /> Correct answer</Badge>);
          if (state === "wrong") tags.push(<Badge key="w" tone="danger"><X size={12} strokeWidth={3} /> Your answer</Badge>);
          if (revealed && isNear) tags.push(<Badge key="n" tone="warning"><Scale size={12} /> Near-miss</Badge>);
          return (
            <StaggerItem key={o.label} y={6}>
              <button
                type="button"
                disabled={disabled || revealed}
                aria-pressed={isSel}
                data-option={o.label}
                data-kbd-toggle=""
                onClick={() => {
                  haptic("select");
                  onToggle(o.label);
                }}
                className={cn(
                  "press flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors disabled:cursor-default",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]",
                  OPTION_CLASS[state]
                )}
              >
                <LetterChip label={o.label} tone={OPTION_CHIP[state]} square={square} className={cn("mt-px", state === "correct-picked" && "anim-pop")} />
                <span className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <span className="min-w-0 leading-relaxed">{o.text}</span>
                  {tags.length > 0 && <span className="flex shrink-0 flex-wrap gap-1 sm:flex-col sm:items-end sm:pt-0.5">{tags}</span>}
                </span>
              </button>
            </StaggerItem>
          );
        })}
      </Stagger>

      {revealed && (
        <Reveal y={8} className="mt-4">
          <Callout className="space-y-4 p-4 text-sm">
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--success)]">
                  <Check size={15} strokeWidth={2.75} />
                  Why {correct.join(", ")} {correct.length > 1 ? "are" : "is"} right
                </span>
                {trap && <Badge>Trap · {trap}</Badge>}
              </div>
              <p className="leading-relaxed">{question.correctExplanation}</p>
            </div>

            {nearMiss && nearWhy && (
              <Callout tone="warning" className="p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--warning)]">
                    <Scale size={14} /> Near-miss
                  </span>
                  <LetterChip label={nearMiss} tone="warning" square={square} className="h-5 w-5 text-[10px]" />
                  {pickedNear && <span className="text-xs font-semibold text-[var(--danger)]">Your pick</span>}
                </div>
                <div className="mt-1.5 text-[13px] font-semibold">Both looked right. The one discriminator:</div>
                <p className="mt-0.5 leading-relaxed">{nearWhy}</p>
              </Callout>
            )}

            {others.length > 0 && (
              <div>
                <div className="mb-2 font-semibold">Why the others fail</div>
                <ul className="space-y-2">
                  {others.map((w) => (
                    <li key={w.label} className="flex items-start gap-2.5">
                      <LetterChip label={w.label} tone={w.picked ? "danger" : "muted"} square={square} className="mt-px h-5 w-5 text-[10px]" />
                      <span className="min-w-0 leading-relaxed text-[var(--muted)]">
                        {w.picked && <span className="font-semibold text-[var(--danger)]">Your pick. </span>}
                        {w.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {question.strategyNote && (
              <Callout tone="plain" className="px-3 py-2.5">
                <Markdown>{`**Strategy:** ${question.strategyNote}`}</Markdown>
              </Callout>
            )}
          </Callout>
        </Reveal>
      )}
    </div>
  );
}
