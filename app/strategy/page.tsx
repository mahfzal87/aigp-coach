"use client";

import { useState } from "react";
import { getQuestions, getStrategyNotes } from "@/lib/content";
import type { QuestionType } from "@/lib/types";
import { Badge, Button, Card, CardBody, PageHeader } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { Drill } from "@/components/quiz/drill";

const TECHNIQUE_TYPES: { v: QuestionType; l: string }[] = [
  { v: "best", l: "Best / Most" },
  { v: "not", l: "NOT / Least" },
  { v: "ordering", l: "Ordering" },
  { v: "role", l: "Role ID" },
  { v: "distinction", l: "Distinction" },
];

export default function StrategyPage() {
  const notes = getStrategyNotes();
  const [drillType, setDrillType] = useState<QuestionType | null>(null);

  if (drillType) {
    const qs = getQuestions().filter((q) => q.type === drillType);
    return (
      <div>
        <PageHeader title={`Technique drill — ${TECHNIQUE_TYPES.find((t) => t.v === drillType)?.l}`} action={<Button variant="outline" onClick={() => setDrillType(null)}>Exit</Button>} />
        <Drill questions={qs} mode="strategy" onExit={() => setDrillType(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Question strategy" subtitle="The margin between 85% and 95% is technique. Learn IAPP's traps, then drill by question type." />
      {notes.map((n) => (
        <Card key={n.id}><CardBody><Markdown>{n.bodyMd}</Markdown></CardBody></Card>
      ))}
      <Card>
        <CardBody>
          <div className="mb-3 text-sm font-semibold">Drill by question type</div>
          <div className="flex flex-wrap gap-2">
            {TECHNIQUE_TYPES.map((t) => {
              const n = getQuestions().filter((q) => q.type === t.v).length;
              return (
                <button key={t.v} onClick={() => n > 0 && setDrillType(t.v)} disabled={n === 0} className="rounded-lg border border-[var(--border)] px-4 py-3 text-left text-sm hover:border-[var(--primary)] disabled:opacity-40">
                  <div className="font-medium">{t.l}</div>
                  <div className="text-xs text-[var(--muted)]">{n} question{n === 1 ? "" : "s"}</div>
                </button>
              );
            })}
          </div>
          <div className="mt-3"><Badge>Tip</Badge> <span className="text-sm text-[var(--muted)]">After each miss, tag it Knowledge / Technique / Read-error — Analytics shows your pattern.</span></div>
        </CardBody>
      </Card>
    </div>
  );
}
