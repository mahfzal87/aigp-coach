"use client";

import { useMemo } from "react";
import { Check, X } from "lucide-react";
import type { Question } from "@/lib/types";
import { correctLabels, shuffle } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { m, springSoft, Stagger, StaggerItem } from "@/components/motion";
import { haptic } from "@/lib/haptics";

const TYPE_LABEL: Record<string, string> = {
  best: "Best / Most",
  not: "NOT / Least",
  ordering: "Ordering",
  role: "Role ID",
  distinction: "Distinction",
  recall: "Recall",
};

export function QuestionView({
  question,
  selected,
  onToggle,
  revealed,
  disabled,
}: {
  question: Question;
  selected: string[];
  onToggle: (label: string) => void;
  revealed: boolean;
  disabled?: boolean;
}) {
  // Stable shuffle per question instance to prevent positional memorization.
  const opts = useMemo(() => {
    const seed = question.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return shuffle(question.options, seed);
  }, [question.id, question.options]);

  const correct = correctLabels(question);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="primary">{question.bokRef}</Badge>
        <Badge>{TYPE_LABEL[question.type] ?? question.type}</Badge>
        <Badge>{"★".repeat(question.difficulty)}</Badge>
        {question.isMultiselect && <Badge tone="warning">Select all that apply</Badge>}
      </div>

      {question.scenario && (
        <p className="mb-3 rounded-lg bg-[var(--surface-2)] p-3 text-sm text-[var(--muted)]">{question.scenario}</p>
      )}
      <p className="mb-4 text-base font-medium leading-relaxed">{question.stem}</p>

      <Stagger key={question.id} className="space-y-2" role="group" aria-label="Answer options">
        {opts.map((o) => {
          const isSel = selected.includes(o.label);
          const isCorrect = correct.includes(o.label);
          let state: "idle" | "correct" | "wrong" | "missed" = "idle";
          if (revealed) {
            if (isCorrect) state = "correct";
            else if (isSel && !isCorrect) state = "wrong";
          }
          return (
            <StaggerItem key={o.label} y={6}>
            <button
              disabled={disabled || revealed}
              onClick={() => { haptic("select"); onToggle(o.label); }}
              className={cn(
                "press flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
                state === "wrong" && "anim-shake",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                !revealed && isSel && "border-[var(--primary)] bg-[var(--primary)]/10",
                !revealed && !isSel && "border-[var(--border)] hover:bg-[var(--surface-2)]",
                state === "correct" && "border-[var(--success)] bg-[var(--success)]/12",
                state === "wrong" && "border-[var(--danger)] bg-[var(--danger)]/12",
                revealed && state === "idle" && "border-[var(--border)] opacity-70"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  isSel && !revealed && "border-[var(--primary)] text-[var(--primary)]",
                  state === "correct" && "anim-pop border-[var(--success)] bg-[var(--success)] text-white",
                  state === "wrong" && "border-[var(--danger)] bg-[var(--danger)] text-white"
                )}
              >
                {state === "correct" ? <Check size={12} /> : state === "wrong" ? <X size={12} /> : o.label}
              </span>
              <span className="flex-1">{o.text}</span>
            </button>
            </StaggerItem>
          );
        })}
      </Stagger>

      {revealed && (
        <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={springSoft} className="mt-4 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm shadow-[var(--e1)]">
          <div>
            <span className="font-semibold text-[var(--success)]">Correct: {correct.join(", ")}.</span>{" "}
            {question.correctExplanation}
          </div>
          {Object.keys(question.whyWrong).length > 0 && (
            <div>
              <div className="mb-1 font-semibold">Why the others fail</div>
              <ul className="space-y-1">
                {Object.entries(question.whyWrong).map(([k, v]) => (
                  <li key={k} className="text-[var(--muted)]">
                    <span className="font-medium text-[var(--foreground)]">{k}.</span> {v}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {question.strategyNote && (
            <div className="rounded-md border-l-2 border-[var(--primary)] bg-[var(--surface)] p-2">
              <Markdown>{`**Strategy:** ${question.strategyNote}`}</Markdown>
            </div>
          )}
        </m.div>
      )}
    </div>
  );
}
