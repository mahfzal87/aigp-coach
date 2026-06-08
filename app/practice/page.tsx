"use client";

import { useMemo, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { getCompetencies, getQuestions } from "@/lib/content";
import { isAnswerCorrect } from "@/lib/scoring";
import type { Confidence, Question, RootCause } from "@/lib/types";
import { useHydrated, useProgress } from "@/store/progress";
import { Badge, Button, Card, CardBody, PageHeader } from "@/components/ui";
import { QuestionView } from "@/components/quiz/question-view";

const TYPES = [
  { v: "all", l: "All types" },
  { v: "best", l: "Best/Most" },
  { v: "not", l: "NOT/Least" },
  { v: "ordering", l: "Ordering" },
  { v: "role", l: "Role ID" },
  { v: "distinction", l: "Distinction" },
  { v: "recall", l: "Recall" },
];

export default function PracticePage() {
  const hydrated = useHydrated();
  const attempts = useProgress((s) => s.attempts);
  const recordAttempt = useProgress((s) => s.recordAttempt);
  const setRootCause = useProgress((s) => s.setRootCause);

  const comps = getCompetencies();
  const [competency, setCompetency] = useState("all");
  const [type, setType] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [unseenOnly, setUnseenOnly] = useState(false);
  const [wrongOnly, setWrongOnly] = useState(false);
  const [started, setStarted] = useState(false);

  const seenIds = useMemo(() => new Set(attempts.map((a) => a.questionId)), [attempts]);
  const wrongIds = useMemo(
    () => new Set(attempts.filter((a) => !a.correct).map((a) => a.questionId)),
    [attempts]
  );

  const queue = useMemo(() => {
    let qs = getQuestions();
    if (competency !== "all") qs = qs.filter((q) => q.competencyId === competency);
    if (type !== "all") qs = qs.filter((q) => q.type === type);
    if (difficulty !== "all") qs = qs.filter((q) => q.difficulty === Number(difficulty));
    if (unseenOnly) qs = qs.filter((q) => !seenIds.has(q.id));
    if (wrongOnly) qs = qs.filter((q) => wrongIds.has(q.id));
    // light shuffle
    return [...qs].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competency, type, difficulty, unseenOnly, wrongOnly, started]);

  // session state
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [confidence, setConfidence] = useState<Confidence>(2);
  const [startTs, setStartTs] = useState(Date.now());
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [lastAttemptId, setLastAttemptId] = useState<string | null>(null);
  const [lastCorrect, setLastCorrect] = useState(false);

  const q: Question | undefined = queue[idx];

  function begin() {
    setStarted(true);
    setIdx(0);
    setSelected([]);
    setRevealed(false);
    setConfidence(2);
    setStartTs(Date.now());
    setSessionStats({ correct: 0, total: 0 });
  }

  function toggle(label: string) {
    if (!q) return;
    if (q.isMultiselect) {
      setSelected((s) => (s.includes(label) ? s.filter((x) => x !== label) : [...s, label]));
    } else {
      setSelected([label]);
    }
  }

  function submit() {
    if (!q || selected.length === 0) return;
    const correct = isAnswerCorrect(q, selected);
    recordAttempt({
      questionId: q.id,
      competencyId: q.competencyId,
      chosen: selected,
      correct,
      confidence,
      timeMs: Date.now() - startTs,
      mode: "practice",
    });
    // capture the id of the attempt we just made (last in list) for K/T/R tagging
    const all = useProgress.getState().attempts;
    setLastAttemptId(all[all.length - 1]?.id ?? null);
    setLastCorrect(correct);
    setRevealed(true);
    setSessionStats((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  }

  function next() {
    setIdx((i) => i + 1);
    setSelected([]);
    setRevealed(false);
    setConfidence(2);
    setStartTs(Date.now());
    setLastAttemptId(null);
  }

  function tagRootCause(rc: RootCause) {
    if (lastAttemptId) setRootCause(lastAttemptId, rc);
  }

  if (!hydrated) return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  // ── Setup screen ──
  if (!started) {
    return (
      <div>
        <PageHeader title="Practice" subtitle="Untimed drills with instant feedback, rationales, confidence tracking and miss-cause tagging." />
        <Card>
          <CardBody className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-sm">
                <span className="mb-1 block text-[var(--muted)]">Competency</span>
                <select className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2" value={competency} onChange={(e) => setCompetency(e.target.value)}>
                  <option value="all">All competencies</option>
                  {comps.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-[var(--muted)]">Question type</span>
                <select className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2" value={type} onChange={(e) => setType(e.target.value)}>
                  {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-[var(--muted)]">Difficulty</span>
                <select className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="all">Any</option>
                  <option value="1">★ Easy</option>
                  <option value="2">★★ Medium</option>
                  <option value="3">★★★ Hard</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={unseenOnly} onChange={(e) => setUnseenOnly(e.target.checked)} /> Unseen only</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={wrongOnly} onChange={(e) => setWrongOnly(e.target.checked)} /> My wrong answers only</label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">{queue.length} question{queue.length === 1 ? "" : "s"} match</span>
              <Button onClick={begin} disabled={queue.length === 0}>Start drill <ArrowRight size={16} /></Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // ── Done screen ──
  if (!q) {
    const acc = sessionStats.total ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
    return (
      <div>
        <PageHeader title="Drill complete" />
        <Card><CardBody className="space-y-4 text-center">
          <div className="text-4xl font-bold">{acc}%</div>
          <p className="text-sm text-[var(--muted)]">{sessionStats.correct} / {sessionStats.total} correct this session.</p>
          <div className="flex justify-center gap-3">
            <Button onClick={begin}><RotateCcw size={16} /> New drill</Button>
            <Button variant="outline" onClick={() => setStarted(false)}>Change filters</Button>
          </div>
        </CardBody></Card>
      </div>
    );
  }

  // ── Active question ──
  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-sm text-[var(--muted)]">
        <span>Question {idx + 1} / {queue.length}</span>
        <span>Session: {sessionStats.correct}/{sessionStats.total}</span>
      </div>
      <Card>
        <CardBody>
          <QuestionView question={q} selected={selected} onToggle={toggle} revealed={revealed} />

          {!revealed && (
            <div className="mt-5 flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[var(--muted)]">Confidence:</span>
                {([[1, "Sure"], [2, "Unsure"], [3, "Guess"]] as [Confidence, string][]).map(([v, l]) => (
                  <button key={v} onClick={() => setConfidence(v)} className={`rounded-full px-3 py-1 text-xs ${confidence === v ? "bg-[var(--primary)] text-[var(--primary-fg)]" : "bg-[var(--surface-2)]"}`}>{l}</button>
                ))}
              </div>
              <Button onClick={submit} disabled={selected.length === 0}>Submit</Button>
            </div>
          )}

          {revealed && (
            <div className="mt-5 flex flex-col gap-3 border-t border-[var(--border)] pt-4">
              {!lastCorrect && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-[var(--muted)]">Why did you miss it?</span>
                  {([["K", "Knowledge gap"], ["T", "Technique (fell for bait)"], ["R", "Read error"]] as [RootCause, string][]).map(([v, l]) => (
                    <button key={v} onClick={() => tagRootCause(v)} className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs hover:opacity-80">{l}</button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <Badge tone={lastCorrect ? "success" : "danger"}>{lastCorrect ? "Correct" : "Incorrect"}</Badge>
                <Button onClick={next}>{idx + 1 < queue.length ? "Next" : "Finish"} <ArrowRight size={16} /></Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
