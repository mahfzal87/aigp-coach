"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Clock, Eye, Flame, History, Layers, RotateCcw, Shuffle, Target, Trophy } from "lucide-react";
import { competencyToDomainCode, getDomains, getQuestion } from "@/lib/content";
import { EXAM_DEFS, SPRINT_DEF, buildSprint, getExamDef, getExamQuestions, getExamStats, type ExamDef } from "@/lib/exams";
import { isAnswerCorrect, correctLabels, shuffle, toScaledScore } from "@/lib/scoring";
import { haptic } from "@/lib/haptics";
import type { DomainCode, MockSession, Question } from "@/lib/types";
import { useHydrated, useProgress } from "@/store/progress";
import { Badge, Bar, Button, Card, CardBody, PageHeader } from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion";
import { QuestionView } from "@/components/quiz/question-view";
import { uid } from "@/store/progress";
import { cn } from "@/lib/utils";

const TRAP_LABEL: Record<string, string> = {
  "too-narrow": "Too narrow",
  absolute: "Absolute wording",
  premature: "Premature step",
  "true-but-irrelevant": "True but irrelevant",
  "synonym-bait": "Synonym bait",
  "wrong-economics": "Wrong economics",
};

function fmtTime(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" }) +
    " · " + new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function MockPage() {
  const hydrated = useHydrated();
  const saveMock = useProgress((s) => s.saveMock);
  const recordAttempt = useProgress((s) => s.recordAttempt);
  const mocks = useProgress((s) => s.mocks);
  const attempts = useProgress((s) => s.attempts);

  const [phase, setPhase] = useState<"landing" | "run" | "result">("landing");
  const [def, setDef] = useState<ExamDef | null>(null);
  const [set, setSet] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [idx, setIdx] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [session, setSession] = useState<MockSession | null>(null);
  const [reviewOnly, setReviewOnly] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [confirmArm, setConfirmArm] = useState(false);
  const startedRef = useRef(0);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const seenCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of attempts) m.set(a.questionId, (m.get(a.questionId) ?? 0) + 1);
    return m;
  }, [attempts]);

  useEffect(() => {
    if (phase !== "run") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "run" && deadline && now >= deadline) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, phase, deadline]);

  function start(d: ExamDef) {
    const base = d.kind === "sprint" ? buildSprint(seenCount, d.length) : getExamQuestions(d.id);
    if (base.length === 0) return;
    haptic("tap");
    const s = shuffle(base); // same paper, fresh order each attempt
    setDef(d);
    setSet(s);
    setAnswers({});
    setIdx(0);
    setSession(null);
    setReviewOnly(false);
    setShowAll(false);
    startedRef.current = Date.now();
    setDeadline(Date.now() + d.minutes * 60 * 1000);
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
      const dc = competencyToDomainCode(q.competencyId);
      if (dc) { perDomain[dc].total++; if (ok) perDomain[dc].correct++; }
      recordAttempt({ questionId: q.id, competencyId: q.competencyId, chosen, correct: ok, confidence: 2, timeMs: 0, mode: "mock" });
    }
    const rate = set.length ? correct / set.length : 0;
    const ms: MockSession = {
      id: uid(),
      examId: def?.id,
      examName: def?.name,
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
    setReviewOnly(false);
    setShowAll(false);
    setPhase("result");
  }

  function submitNow() {
    const unanswered = set.length - Object.values(answers).filter((a) => a.length > 0).length;
    if (unanswered > 0 && !confirmArm) {
      // two-step confirm: first click arms, second click (within 5s) submits
      haptic("tap");
      setConfirmArm(true);
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      confirmTimer.current = setTimeout(() => setConfirmArm(false), 8000);
      return;
    }
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    setConfirmArm(false);
    haptic("tap");
    finish();
  }

  function openReview(m: MockSession) {
    haptic("tap");
    setSession(m);
    setDef(m.examId ? getExamDef(m.examId) ?? null : null);
    setReviewOnly(true);
    setShowAll(false);
    setPhase("result");
  }

  if (!hydrated) return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  // ── Landing: exam clusters ──
  if (phase === "landing") {
    const fullDefs = EXAM_DEFS.filter((d) => d.kind === "full");
    const targetedDefs = EXAM_DEFS.filter((d) => d.kind !== "full");
    const history = [...mocks].sort((a, b) => (b.finishedAt ?? b.startedAt) - (a.finishedAt ?? a.startedAt));
    return (
      <div className="space-y-8">
        <PageHeader title="Mock exams" subtitle="Fixed exam papers built from the hard pool — each cluster is a different set, so no paper repeats another. Timed, no feedback until you submit, full reasoning for every miss afterward." />

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"><Trophy size={15} /> Full-length forms</h2>
          <Stagger className="grid gap-4 md:grid-cols-3" delay={0.04}>
            {fullDefs.map((d) => <StaggerItem key={d.id} y={10}><ExamCard def={d} mocks={mocks} onStart={() => start(d)} /></StaggerItem>)}
          </Stagger>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"><Target size={15} /> Targeted clusters</h2>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" delay={0.04}>
            {targetedDefs.map((d) => <StaggerItem key={d.id} y={10}><ExamCard def={d} mocks={mocks} onStart={() => start(d)} /></StaggerItem>)}
            <StaggerItem y={10}><SprintCard onStart={() => start(SPRINT_DEF)} mocks={mocks} /></StaggerItem>
          </Stagger>
        </section>

        {history.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"><History size={15} /> Past sessions</h2>
            <Card>
              <CardBody className="divide-y divide-[var(--border)] p-0">
                {history.slice(0, 12).map((m) => {
                  const passed = (m.scaledScore ?? 0) >= 300;
                  return (
                    <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{m.examName ?? "Mock exam"}</div>
                        <div className="text-xs text-[var(--muted)]">{fmtDate(m.finishedAt ?? m.startedAt)} · {m.correctCount}/{m.questionIds.length} correct</div>
                      </div>
                      <Badge tone={passed ? "success" : "danger"}>{m.scaledScore ?? "—"}</Badge>
                      <button onClick={() => openReview(m)} className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:opacity-80">
                        <Eye size={13} /> Review
                      </button>
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          </section>
        )}
      </div>
    );
  }

  // ── Result / review ──
  if (phase === "result" && session) {
    const passed = (session.scaledScore ?? 0) >= 300;
    const rows = session.questionIds
      .map((qid) => ({ qid, q: getQuestion(qid) }))
      .filter((r): r is { qid: string; q: Question } => !!r.q)
      .map(({ qid, q }) => {
        const chosen = session.answers[qid] ?? [];
        const ok = chosen.length > 0 && isAnswerCorrect(q, chosen);
        return { q, chosen, ok };
      });
    const retired = session.questionIds.length - rows.length;
    const missed = rows.filter((r) => !r.ok);
    const shown = showAll ? rows : missed;
    return (
      <div className="space-y-6">
        <PageHeader title={reviewOnly ? "Session review" : "Mock results"} subtitle={session.examName} />
        <Card><CardBody className="text-center">
          <Badge tone={passed ? "success" : "danger"}>{passed ? "Above pass line" : "Below pass line"}</Badge>
          <div className="mt-3 text-4xl font-bold">{session.scaledScore} <span className="text-lg font-medium text-[var(--muted)]">/ 500</span></div>
          <div className="mt-1 text-sm text-[var(--muted)]">
            {session.correctCount} / {session.questionIds.length} correct · pass = 300
            {session.durationMs ? ` · ${Math.round(session.durationMs / 60000)} min` : ""}
          </div>
        </CardBody></Card>
        <Card><CardBody>
          <div className="mb-3 text-sm font-semibold">By domain</div>
          <div className="space-y-3">
            {getDomains().map((d) => {
              const pd = session.perDomain?.[d.code];
              if (!pd || pd.total === 0) return null;
              const p = Math.round((pd.correct / pd.total) * 100);
              return (
                <div key={d.code}>
                  <div className="mb-1 flex justify-between text-sm"><span>Domain {d.code}</span><span className="text-[var(--muted)]">{pd.correct}/{pd.total}</span></div>
                  <Bar value={p} tone={p >= 80 ? "success" : p >= 60 ? "warning" : "danger"} />
                </div>
              );
            })}
          </div>
        </CardBody></Card>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle size={18} className="text-[var(--danger)]" />
              {missed.length === 0 ? "Nothing missed — clean sweep" : `Why you missed ${missed.length} question${missed.length === 1 ? "" : "s"}`}
            </h2>
            <button onClick={() => setShowAll((v) => !v)} className="text-xs font-semibold text-[var(--accent)] hover:opacity-80">
              {showAll ? "Show misses only" : "Show all questions"}
            </button>
          </div>
          {retired > 0 && <p className="mb-3 text-xs text-[var(--muted)]">{retired} question{retired === 1 ? " was" : "s were"} retired from the bank since this session and can’t be shown.</p>}
          <div className="space-y-4">
            {shown.map(({ q, chosen, ok }, i) => (
              <Card key={q.id} className={cn(!ok && "border-[var(--danger)]/30")}>
                <CardBody>
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                    <Badge tone={ok ? "success" : "danger"}>{ok ? "Correct" : chosen.length === 0 ? "Skipped" : "Missed"}</Badge>
                    {!ok && (
                      <span className="font-medium text-[var(--muted)]">
                        {chosen.length === 0 ? "No answer given" : `You chose ${[...chosen].sort().join(", ")}`} · correct: {correctLabels(q).join(", ")}
                      </span>
                    )}
                    {q.trapType !== "none" && <Badge tone="warning">Trap: {TRAP_LABEL[q.trapType] ?? q.trapType}</Badge>}
                    <span className="ml-auto text-[var(--muted)]">#{showAll ? i + 1 : rows.findIndex((r) => r.q.id === q.id) + 1}</span>
                  </div>
                  <QuestionView question={q} selected={chosen} onToggle={() => {}} revealed disabled />
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {def && <Button onClick={() => start(def)}><RotateCcw size={15} /> Retake {def.name}</Button>}
          <Button variant="outline" onClick={() => { setPhase("landing"); setSession(null); }}>All exams</Button>
        </div>
      </div>
    );
  }

  // ── Running ──
  const q = set[idx];
  if (!q) return null;
  const remaining = deadline - now;
  const answeredCount = Object.values(answers).filter((a) => a.length > 0).length;

  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{def?.name}</div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium"><Clock size={16} className={remaining < 5 * 60000 ? "text-[var(--danger)]" : ""} /> {fmtTime(remaining)}</div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--muted)]">{answeredCount}/{set.length} answered</span>
          <Button variant={confirmArm ? "primary" : "outline"} onClick={submitNow} className="h-8 px-3 text-xs">
            {confirmArm ? `Sure? ${set.length - answeredCount} blank — tap again` : "Submit"}
          </Button>
        </div>
      </div>

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
          <Button onClick={submitNow}>{confirmArm ? `Sure? ${set.length - answeredCount} blank — tap again` : "Submit exam"}</Button>
        )}
      </div>
    </div>
  );
}

// ─── Cluster cards ───

function ExamCard({ def, mocks, onStart }: { def: ExamDef; mocks: MockSession[]; onStart: () => void }) {
  const stats = getExamStats(def.id);
  const tries = mocks.filter((m) => m.examId === def.id);
  const best = tries.reduce((b, m) => Math.max(b, m.scaledScore ?? 0), 0);
  const Icon = def.kind === "full" ? Trophy : def.kind === "gauntlet" ? Flame : def.kind === "trap" ? AlertTriangle : Layers;
  const disabled = stats.total === 0;
  return (
    <Card className="liftable flex h-full flex-col">
      <CardBody className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-[15px] font-bold"><Icon size={16} className="text-[var(--primary)]" /> {def.name}</div>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{def.tagline}</p>
          </div>
          {best > 0 && <Badge tone={best >= 300 ? "success" : "danger"}>Best {best}</Badge>}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
          <span className="font-semibold text-[var(--foreground)]">{stats.total} questions</span>
          <span>{def.minutes} min</span>
          <span>{stats.d3} hard ★★★</span>
          {stats.multi > 0 && <span>{stats.multi} multi-select</span>}
          {stats.ordering > 0 && <span>{stats.ordering} ordering</span>}
        </div>
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-xs text-[var(--muted)]">{tries.length === 0 ? "Not attempted" : `${tries.length} attempt${tries.length === 1 ? "" : "s"}`}</span>
          <Button onClick={onStart} disabled={disabled} className="h-8 px-3 text-xs">
            {tries.length > 0 ? "Retake" : "Start"} <ArrowRight size={13} />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function SprintCard({ onStart, mocks }: { onStart: () => void; mocks: MockSession[] }) {
  const tries = mocks.filter((m) => m.examId === "sprint");
  return (
    <Card className="liftable flex h-full flex-col border-dashed">
      <CardBody className="flex flex-1 flex-col gap-3">
        <div>
          <div className="flex items-center gap-2 text-[15px] font-bold"><Shuffle size={16} className="text-[var(--accent)]" /> {SPRINT_DEF.name}</div>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{SPRINT_DEF.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
          <span className="font-semibold text-[var(--foreground)]">{SPRINT_DEF.length} questions</span>
          <span>{SPRINT_DEF.minutes} min</span>
          <span>least-seen first</span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-xs text-[var(--muted)]">{tries.length === 0 ? "Daily variety drill" : `${tries.length} run${tries.length === 1 ? "" : "s"}`}</span>
          <Button onClick={onStart} className="h-8 px-3 text-xs">Start <ArrowRight size={13} /></Button>
        </div>
      </CardBody>
    </Card>
  );
}
