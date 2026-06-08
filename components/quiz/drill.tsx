"use client";

import { useMemo, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import type { Confidence, Question, RootCause } from "@/lib/types";
import { isAnswerCorrect } from "@/lib/scoring";
import { useProgress } from "@/store/progress";
import { Badge, Button, Card, CardBody } from "@/components/ui";
import { QuestionView } from "@/components/quiz/question-view";

// Self-contained practice runner over a fixed question list (used by Strategy + retry flows).
export function Drill({ questions, mode = "practice", onExit }: { questions: Question[]; mode?: "practice" | "strategy"; onExit?: () => void }) {
  const recordAttempt = useProgress((s) => s.recordAttempt);
  const setRootCause = useProgress((s) => s.setRootCause);
  const queue = useMemo(() => [...questions].sort(() => Math.random() - 0.5), [questions]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [confidence, setConfidence] = useState<Confidence>(2);
  const [startTs, setStartTs] = useState(Date.now());
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [lastId, setLastId] = useState<string | null>(null);
  const [lastCorrect, setLastCorrect] = useState(false);

  const q = queue[idx];

  function toggle(label: string) {
    if (!q) return;
    if (q.isMultiselect) setSelected((s) => (s.includes(label) ? s.filter((x) => x !== label) : [...s, label]));
    else setSelected([label]);
  }
  function submit() {
    if (!q || selected.length === 0) return;
    const correct = isAnswerCorrect(q, selected);
    recordAttempt({ questionId: q.id, competencyId: q.competencyId, chosen: selected, correct, confidence, timeMs: Date.now() - startTs, mode });
    const all = useProgress.getState().attempts;
    setLastId(all[all.length - 1]?.id ?? null);
    setLastCorrect(correct);
    setRevealed(true);
    setStats((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  }
  function next() {
    setIdx((i) => i + 1); setSelected([]); setRevealed(false); setConfidence(2); setStartTs(Date.now()); setLastId(null);
  }

  if (!q) {
    const acc = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
    return (
      <Card><CardBody className="space-y-3 text-center">
        <div className="text-3xl font-bold">{acc}%</div>
        <p className="text-sm text-[var(--muted)]">{stats.correct} / {stats.total} correct.</p>
        {onExit && <Button variant="outline" onClick={onExit}><RotateCcw size={16} /> Back</Button>}
      </CardBody></Card>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-[var(--muted)]">
        <span>Question {idx + 1} / {queue.length}</span>
        <span>{stats.correct}/{stats.total}</span>
      </div>
      <Card><CardBody>
        <QuestionView question={q} selected={selected} onToggle={toggle} revealed={revealed} />
        {!revealed ? (
          <div className="mt-5 flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[var(--muted)]">Confidence:</span>
              {([[1, "Sure"], [2, "Unsure"], [3, "Guess"]] as [Confidence, string][]).map(([v, l]) => (
                <button key={v} onClick={() => setConfidence(v)} className={`rounded-full px-3 py-1 text-xs ${confidence === v ? "bg-[var(--primary)] text-[var(--primary-fg)]" : "bg-[var(--surface-2)]"}`}>{l}</button>
              ))}
            </div>
            <Button onClick={submit} disabled={selected.length === 0}>Submit</Button>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3 border-t border-[var(--border)] pt-4">
            {!lastCorrect && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-[var(--muted)]">Why did you miss it?</span>
                {([["K", "Knowledge"], ["T", "Technique"], ["R", "Read error"]] as [RootCause, string][]).map(([v, l]) => (
                  <button key={v} onClick={() => lastId && setRootCause(lastId, v)} className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs hover:opacity-80">{l}</button>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between">
              <Badge tone={lastCorrect ? "success" : "danger"}>{lastCorrect ? "Correct" : "Incorrect"}</Badge>
              <Button onClick={next}>{idx + 1 < queue.length ? "Next" : "Finish"} <ArrowRight size={16} /></Button>
            </div>
          </div>
        )}
      </CardBody></Card>
    </div>
  );
}
