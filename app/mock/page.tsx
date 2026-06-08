"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { getDomains, getQuestion, getQuestions, competencyToDomainCode } from "@/lib/content";
import { isAnswerCorrect, shuffle, toScaledScore } from "@/lib/scoring";
import type { DomainCode, MockSession, Question } from "@/lib/types";
import { useHydrated, useProgress } from "@/store/progress";
import { Badge, Bar, Button, Card, CardBody, PageHeader } from "@/components/ui";
import { QuestionView } from "@/components/quiz/question-view";
import { uid } from "@/store/progress";
import { cn } from "@/lib/utils";

function buildSet(length: number): Question[] {
  const domains = getDomains();
  const totalW = domains.reduce((s, d) => s + (d.minQ + d.maxQ) / 2, 0);
  const all = getQuestions();
  const picked: Question[] = [];
  for (const d of domains) {
    const want = Math.round((length * ((d.minQ + d.maxQ) / 2)) / totalW);
    const pool = shuffle(all.filter((q) => competencyToDomainCode(q.competencyId) === d.code));
    picked.push(...pool.slice(0, Math.min(want, pool.length)));
  }
  // top up with any remaining if short
  if (picked.length < length) {
    const have = new Set(picked.map((q) => q.id));
    picked.push(...shuffle(all.filter((q) => !have.has(q.id))).slice(0, length - picked.length));
  }
  return shuffle(picked).slice(0, length);
}

function fmtTime(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export default function MockPage() {
  const hydrated = useHydrated();
  const saveMock = useProgress((s) => s.saveMock);
  const recordAttempt = useProgress((s) => s.recordAttempt);
  const available = getQuestions().length;

  const [phase, setPhase] = useState<"setup" | "run" | "result">("setup");
  const [length, setLength] = useState(Math.min(100, available));
  const [set, setSet] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [idx, setIdx] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [session, setSession] = useState<MockSession | null>(null);
  const startedRef = useRef(0);

  const durationMs = useMemo(() => Math.max(10, Math.round((length / 100) * 165)) * 60 * 1000, [length]);

  useEffect(() => {
    if (phase !== "run") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "run" && deadline && now >= deadline) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, phase, deadline]);

  function start() {
    const s = buildSet(length);
    setSet(s);
    setAnswers({});
    setIdx(0);
    startedRef.current = Date.now();
    setDeadline(Date.now() + durationMs);
    setNow(Date.now());
    setPhase("run");
  }

  function toggle(q: Question, label: string) {
    setAnswers((a) => {
      const cur = a[q.id] ?? [];
      if (q.isMultiselect) return { ...a, [q.id]: cur.includes(label) ? cur.filter((x) => x !== label) : [...cur, label] };
      return { ...a, [q.id]: [label] };
    });
  }

  function finish() {
    let correct = 0;
    const perDomain: Record<DomainCode, { correct: number; total: number }> = { I: { correct: 0, total: 0 }, II: { correct: 0, total: 0 }, III: { correct: 0, total: 0 }, IV: { correct: 0, total: 0 } };
    for (const q of set) {
      const chosen = answers[q.id] ?? [];
      const ok = chosen.length > 0 && isAnswerCorrect(q, chosen);
      if (ok) correct++;
      const dc = competencyToDomainCode(q.competencyId) as DomainCode;
      if (dc) { perDomain[dc].total++; if (ok) perDomain[dc].correct++; }
      recordAttempt({ questionId: q.id, competencyId: q.competencyId, chosen, correct: ok, confidence: 2, timeMs: 0, mode: "mock" });
    }
    const rate = set.length ? correct / set.length : 0;
    const ms: MockSession = {
      id: uid(),
      startedAt: startedRef.current,
      finishedAt: Date.now(),
      questionIds: set.map((q) => q.id),
      answers,
      correctCount: correct,
      scaledScore: toScaledScore(rate),
      perDomain,
      durationMs: Date.now() - startedRef.current,
    };
    saveMock(ms);
    setSession(ms);
    setPhase("result");
  }

  if (!hydrated) return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  // ── Setup ──
  if (phase === "setup") {
    const options = [Math.min(20, available), Math.min(50, available), Math.min(100, available)].filter((v, i, a) => v > 0 && a.indexOf(v) === i);
    return (
      <div>
        <PageHeader title="Mock exam" subtitle="Blueprint-proportional, timed simulation. No feedback until you submit — just like the real thing." />
        <Card><CardBody className="space-y-4">
          <div>
            <div className="mb-2 text-sm font-medium">Length</div>
            <div className="flex flex-wrap gap-2">
              {options.map((v) => (
                <button key={v} onClick={() => setLength(v)} className={cn("rounded-lg border px-4 py-2 text-sm", length === v ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)]")}>
                  {v} questions
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              The real AIGP is 100 questions in 2h45m. Time scales with length ({Math.round(durationMs / 60000)} min for {length}).
              {available < 100 && ` Bank currently has ${available} questions — ask your coach to expand it toward a full 100.`}
            </p>
          </div>
          <Button onClick={start} disabled={available === 0}>Start mock</Button>
        </CardBody></Card>
      </div>
    );
  }

  // ── Result ──
  if (phase === "result" && session) {
    const passed = (session.scaledScore ?? 0) >= 300;
    return (
      <div className="space-y-6">
        <PageHeader title="Mock results" />
        <Card><CardBody className="text-center">
          <Badge tone={passed ? "success" : "danger"}>{passed ? "Above pass line" : "Below pass line"}</Badge>
          <div className="mt-3 text-4xl font-bold">{session.scaledScore} <span className="text-lg font-medium text-[var(--muted)]">/ 500</span></div>
          <div className="mt-1 text-sm text-[var(--muted)]">{session.correctCount} / {session.questionIds.length} correct · pass = 300</div>
        </CardBody></Card>
        <Card><CardBody>
          <div className="mb-3 text-sm font-semibold">By domain</div>
          <div className="space-y-3">
            {getDomains().map((d) => {
              const pd = session.perDomain?.[d.code];
              const p = pd && pd.total ? Math.round((pd.correct / pd.total) * 100) : 0;
              return (
                <div key={d.code}>
                  <div className="mb-1 flex justify-between text-sm"><span>Domain {d.code}</span><span className="text-[var(--muted)]">{pd?.correct ?? 0}/{pd?.total ?? 0}</span></div>
                  <Bar value={p} tone={p >= 80 ? "success" : p >= 60 ? "warning" : "danger"} />
                </div>
              );
            })}
          </div>
        </CardBody></Card>
        <div>
          <h2 className="mb-3 text-lg font-semibold">Review every question</h2>
          <div className="space-y-4">
            {session.questionIds.map((qid) => {
              const q = getQuestion(qid)!;
              return (
                <Card key={qid}><CardBody><QuestionView question={q} selected={session.answers[qid] ?? []} onToggle={() => {}} revealed disabled /></CardBody></Card>
              );
            })}
          </div>
        </div>
        <Button onClick={() => setPhase("setup")}>Take another</Button>
      </div>
    );
  }

  // ── Running ──
  const q = set[idx];
  const remaining = deadline - now;
  const answeredCount = Object.values(answers).filter((a) => a.length > 0).length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium"><Clock size={16} className={remaining < 5 * 60000 ? "text-[var(--danger)]" : ""} /> {fmtTime(remaining)}</div>
        <div className="text-sm text-[var(--muted)]">{answeredCount}/{set.length} answered</div>
      </div>

      {/* question nav grid */}
      <div className="mb-4 flex flex-wrap gap-1">
        {set.map((qq, i) => {
          const done = (answers[qq.id]?.length ?? 0) > 0;
          return (
            <button key={qq.id} onClick={() => setIdx(i)} className={cn("h-7 w-7 rounded text-xs", i === idx ? "ring-2 ring-[var(--ring)]" : "", done ? "bg-[var(--primary)] text-[var(--primary-fg)]" : "bg-[var(--surface-2)]")}>{i + 1}</button>
          );
        })}
      </div>

      <Card><CardBody>
        <QuestionView question={q} selected={answers[q.id] ?? []} onToggle={(l) => toggle(q, l)} revealed={false} />
      </CardBody></Card>

      <div className="mt-4 flex items-center justify-between">
        <Button variant="outline" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>Previous</Button>
        {idx + 1 < set.length ? (
          <Button onClick={() => setIdx((i) => i + 1)}>Next</Button>
        ) : (
          <Button onClick={finish}>Submit exam</Button>
        )}
      </div>
    </div>
  );
}
