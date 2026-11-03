"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, BarChart3, ChevronDown, Clock, Crosshair, Eye, Flame, History, Layers, Pause, PlayCircle, RotateCcw, Shuffle, Target, TrendingDown, TrendingUp, Trophy, XCircle, Zap } from "lucide-react";
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { competencyToDomainCode, getDomains, getQuestion } from "@/lib/content";
import { buildSprint, getExamDef, getExamDefs, getExamQuestions, getExamStats, getSprintDef, type ExamDef } from "@/lib/exams";
import { TRAP_LABEL, computeMockInsights, type MockInsights, type MissRecord } from "@/lib/mock-insights";
import { isAnswerCorrect, correctLabels, shuffle, toScaledScore } from "@/lib/scoring";
import { haptic } from "@/lib/haptics";
import type { DomainCode, MockRun, MockSession, Question } from "@/lib/types";
import { useHydrated, useProgress } from "@/store/progress";
import { Badge, Bar, Button, Card, CardBody, PageHeader, Stat } from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion";
import { QuestionView } from "@/components/quiz/question-view";
import { Drill } from "@/components/quiz/drill";
import { uid } from "@/store/progress";
import { cn } from "@/lib/utils";

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
  const mockRun = useProgress((s) => s.mockRun);
  const saveMockRun = useProgress((s) => s.saveMockRun);
  const clearMockRun = useProgress((s) => s.clearMockRun);

  const [phase, setPhase] = useState<"landing" | "run" | "result" | "drill">("landing");
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

  const ins = useMemo(() => computeMockInsights(mocks), [mocks]);
  const missQs = useMemo(() => ins.misses.map((m) => m.q), [ins]);

  useEffect(() => {
    if (phase !== "run") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "run" && deadline && now >= deadline) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, phase, deadline]);

  // Crash-proof runs: persist the in-flight paper on every answer and navigation,
  // so a pause, closed tab or crash never loses a mock exam.
  useEffect(() => {
    if (phase !== "run" || set.length === 0 || !deadline) return;
    saveMockRun({
      examId: def?.id,
      examName: def?.name,
      questionIds: set.map((q) => q.id),
      answers,
      idx,
      remainingMs: Math.max(0, deadline - Date.now()),
      startedAt: startedRef.current,
      updatedAt: Date.now(),
      totalMinutes: def?.minutes ?? Math.round(set.length * 1.65),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, idx, phase, set, deadline]);

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

  function pauseExam() {
    if (phase !== "run" || !deadline) return;
    haptic("tap");
    saveMockRun({
      examId: def?.id,
      examName: def?.name,
      questionIds: set.map((q) => q.id),
      answers,
      idx,
      remainingMs: Math.max(0, deadline - Date.now()),
      startedAt: startedRef.current,
      updatedAt: Date.now(),
      totalMinutes: def?.minutes ?? Math.round(set.length * 1.65),
    });
    setSet([]);
    setAnswers({});
    setIdx(0);
    setDeadline(0);
    setDef(null);
    setConfirmArm(false);
    setPhase("landing");
  }

  function resumeRun() {
    const run = useProgress.getState().mockRun;
    if (!run) return;
    const qs: Question[] = [];
    for (const qid of run.questionIds) {
      const q = getQuestion(qid);
      if (q) qs.push(q);
    }
    if (qs.length === 0) {
      clearMockRun();
      return;
    }
    haptic("tap");
    setDef(run.examId === "sprint" ? getSprintDef() : run.examId ? getExamDef(run.examId) ?? null : null);
    setSet(qs);
    setAnswers(run.answers);
    setIdx(Math.min(run.idx, qs.length - 1));
    setSession(null);
    setReviewOnly(false);
    setShowAll(false);
    setConfirmArm(false);
    startedRef.current = run.startedAt;
    setDeadline(Date.now() + Math.max(60_000, run.remainingMs)); // resuming always grants at least a minute
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
    const perDomain: Record<DomainCode, { correct: number; total: number }> = { I: { correct: 0, total: 0 }, II: { correct: 0, total: 0 }, III: { correct: 0, total: 0 }, IV: { correct: 0, total: 0 }, V: { correct: 0, total: 0 } };
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
    clearMockRun();
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
    const fullDefs = getExamDefs().filter((d) => d.kind === "full");
    const targetedDefs = getExamDefs().filter((d) => d.kind !== "full");
    const history = [...mocks].sort((a, b) => (b.finishedAt ?? b.startedAt) - (a.finishedAt ?? a.startedAt));
    return (
      <div className="space-y-8">
        <PageHeader title="Mock exams" subtitle="Fixed exam papers built from the hard pool — each cluster is a different set, so no paper repeats another. Timed, no feedback until you submit, full reasoning for every miss afterward." />

        {mockRun && <ResumeBanner run={mockRun} onResume={resumeRun} onDiscard={() => { haptic("tap"); clearMockRun(); }} />}

        {ins.sessions.length > 0 && <InsightsBand ins={ins} />}

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"><Trophy size={15} /> Full-length forms</h2>
          <Stagger className="grid gap-4 md:grid-cols-3" delay={0.04}>
            {fullDefs.map((d) => <StaggerItem key={d.id} y={10}><ExamCard def={d} mocks={mocks} guard={!!mockRun} onStart={() => start(d)} /></StaggerItem>)}
          </Stagger>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"><Target size={15} /> Targeted clusters</h2>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" delay={0.04}>
            {targetedDefs.map((d) => <StaggerItem key={d.id} y={10}><ExamCard def={d} mocks={mocks} guard={!!mockRun} onStart={() => start(d)} /></StaggerItem>)}
            <StaggerItem y={10}><SprintCard onStart={() => start(getSprintDef())} mocks={mocks} guard={!!mockRun} /></StaggerItem>
          </Stagger>
        </section>

        {ins.misses.length > 0 && (
          <MissVault misses={ins.misses} onDrill={() => { haptic("tap"); setPhase("drill"); }} />
        )}

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

  // ── Miss drill: untimed retraining over every question ever missed in a mock ──
  if (phase === "drill") {
    return (
      <div>
        <PageHeader title="Miss drill" subtitle={`Retraining the ${missQs.length} questions you have missed in mock exams — untimed, instant feedback, full reasoning.`} />
        <Drill questions={missQs} onExit={() => setPhase("landing")} />
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--muted)]">{answeredCount}/{set.length} answered</span>
          <Button variant="outline" onClick={pauseExam} className="h-8 px-3 text-xs"><Pause size={13} /> Pause</Button>
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

// First tap arms a warning when a paused exam would be replaced; second tap starts.
function useGuardedStart(guard: boolean, onStart: () => void) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return {
    armed,
    fire: () => {
      if (guard && !armed) {
        haptic("tap");
        setArmed(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setArmed(false), 5000);
        return;
      }
      if (timer.current) clearTimeout(timer.current);
      setArmed(false);
      onStart();
    },
  };
}

function ExamCard({ def, mocks, guard, onStart }: { def: ExamDef; mocks: MockSession[]; guard: boolean; onStart: () => void }) {
  const stats = getExamStats(def.id);
  const tries = mocks.filter((m) => m.examId === def.id && m.finishedAt && typeof m.scaledScore === "number");
  const best = tries.reduce((b, m) => Math.max(b, m.scaledScore ?? 0), 0);
  const sorted = [...tries].sort((a, b) => (a.finishedAt ?? 0) - (b.finishedAt ?? 0));
  const latest = sorted[sorted.length - 1]?.scaledScore;
  const prev = sorted[sorted.length - 2]?.scaledScore;
  const { armed, fire } = useGuardedStart(guard, onStart);
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
          <span className="text-xs text-[var(--muted)]">
            {tries.length === 0 ? "Not attempted" : (
              <>
                {tries.length} attempt{tries.length === 1 ? "" : "s"}
                {latest !== undefined && <> · last {latest}</>}
                {latest !== undefined && prev !== undefined && (
                  <span className={cn("ml-1 font-semibold", latest - prev >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]")}>
                    {latest - prev >= 0 ? "▲" : "▼"}{Math.abs(latest - prev)}
                  </span>
                )}
              </>
            )}
          </span>
          <Button variant={armed ? "danger" : "primary"} onClick={fire} disabled={disabled} className="h-8 px-3 text-xs">
            {armed ? "Replaces paused exam — sure?" : <>{tries.length > 0 ? "Retake" : "Start"} <ArrowRight size={13} /></>}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

// ─── Paused-exam banner ───

function relTime(ts: number): string {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
}

function ResumeBanner({ run, onResume, onDiscard }: { run: MockRun; onResume: () => void; onDiscard: () => void }) {
  const [arm, setArm] = useState(false);
  const answered = Object.values(run.answers).filter((a) => a.length > 0).length;
  return (
    <Card className="liftable border-[var(--primary)]/35">
      <CardBody className="flex flex-wrap items-center gap-3">
        <PlayCircle size={24} className="shrink-0 text-[var(--primary)]" />
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold">{run.examName ?? "Mock exam"} — paused</div>
          <div className="mt-0.5 text-xs text-[var(--muted)]">
            {answered}/{run.questionIds.length} answered · {fmtTime(run.remainingMs)} on the clock · paused {relTime(run.updatedAt)} — the timer is frozen
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              if (!arm) {
                haptic("tap");
                setArm(true);
                setTimeout(() => setArm(false), 5000);
                return;
              }
              onDiscard();
            }}
            className={cn("h-9 px-3 text-xs", arm && "text-[var(--danger)]")}
          >
            {arm ? "Tap again to discard" : "Discard"}
          </Button>
          <Button onClick={onResume} className="h-9 px-4 text-sm">Resume exam <ArrowRight size={14} /></Button>
        </div>
      </CardBody>
    </Card>
  );
}

// ─── Insights band ───

function TrendChip({ value }: { value: number | null }) {
  if (value === null) return null;
  const pp = Math.round(value * 100);
  if (Math.abs(pp) < 2) return <span className="text-xs font-semibold text-[var(--muted)]">steady</span>;
  const up = pp > 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-semibold", up ? "text-[var(--success)]" : "text-[var(--danger)]")}>
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {up ? "+" : ""}{pp}pp
    </span>
  );
}

function InsightsBand({ ins }: { ins: MockInsights }) {
  const delta = ins.latestScore !== null && ins.prevScore !== null ? ins.latestScore - ins.prevScore : null;
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"><BarChart3 size={15} /> Your exam record</h2>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Latest score"
          value={
            <span className="flex items-baseline gap-2">
              {ins.latestScore}
              {delta !== null && (
                <span className={cn("text-sm font-bold", delta >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]")}>
                  {delta >= 0 ? "▲" : "▼"}{Math.abs(delta)}
                </span>
              )}
            </span>
          }
          hint={delta !== null ? "vs previous paper" : "first paper banked"}
        />
        <Stat label="Best score" value={ins.bestScore ?? "—"} hint="pass = 300 / 500" />
        <Stat label="Papers finished" value={ins.sessions.length} hint={`${Math.round(ins.passRate * 100)}% above the pass line`} />
        <Stat label="Questions faced" value={ins.questionsFaced} hint={`${ins.misses.length} unique misses to clear`} />
      </div>

      {/* Trajectory + domain readiness */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardBody>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Score trajectory</span>
              <span className="text-xs text-[var(--muted)]">scaled 100–500 · dashed = pass</span>
            </div>
            {ins.series.length >= 2 ? (
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={ins.series} margin={{ top: 6, right: 10, left: -16, bottom: 0 }}>
                  <XAxis dataKey="idx" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[100, 500]} ticks={[100, 200, 300, 400, 500]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, color: "var(--foreground)" }}
                    labelFormatter={(_, payload) => (payload?.[0]?.payload as { name?: string })?.name ?? ""}
                    formatter={(v) => [`${v} / 500`, "scaled"]}
                  />
                  <ReferenceLine y={300} stroke="#94a3b8" strokeDasharray="5 4" />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} activeDot={{ r: 5 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[190px] items-center justify-center text-sm text-[var(--muted)]">
                Finish a second paper to draw your trend line.
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardBody>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">Domain readiness</span>
              <span className="text-xs text-[var(--muted)]">across all mocks</span>
            </div>
            <div className="space-y-3">
              {ins.domains.map((d) => {
                const p = d.acc !== null ? Math.round(d.acc * 100) : null;
                return (
                  <div key={d.code}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">Domain {d.code}</span>
                      <span className="flex items-center gap-2 text-xs text-[var(--muted)]">
                        <TrendChip value={d.trend} />
                        {p !== null ? `${p}% · ${d.correct}/${d.total}` : "no data"}
                      </span>
                    </div>
                    <Bar value={p ?? 0} tone={p === null ? "primary" : p >= 80 ? "success" : p >= 60 ? "warning" : "danger"} />
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Weak spots + technique leaks */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardBody>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Crosshair size={15} className="text-[var(--danger)]" /> Weakest competencies</div>
            {ins.weakSpots.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Nothing flagged yet — a competency needs 3+ sightings in mocks (and under 85% accuracy) to show here.</p>
            ) : (
              <div className="space-y-2">
                {ins.weakSpots.map((w) => (
                  <a key={w.id} href={`/practice?competency=${w.id}`} className="group flex items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-2 transition-colors hover:bg-[var(--surface-2)]">
                    <span className={cn("w-11 shrink-0 text-sm font-bold tabular-nums", w.acc < 0.5 ? "text-[var(--danger)]" : "text-[var(--warning)]")}>{Math.round(w.acc * 100)}%</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{w.code} · {w.name}</span>
                      <span className="text-xs text-[var(--muted)]">{w.wrong} wrong of {w.total} seen</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--accent)]">Drill <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" /></span>
                  </a>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Zap size={15} className="text-[var(--warning)]" /> Technique leaks</div>
            {ins.trapStats.length === 0 && ins.typeStats.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No pattern yet — once a trap or question type has 4+ sightings, your miss rate on it shows here.</p>
            ) : (
              <div className="space-y-2 text-sm">
                {ins.trapStats.map((t) => (
                  <div key={t.key} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-3 py-2">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">Falls for “{t.label}”</span>
                      <span className="text-xs text-[var(--muted)]">missed {t.missed} of {t.seen} trapped questions</span>
                    </span>
                    <span className={cn("shrink-0 text-sm font-bold tabular-nums", t.rate >= 0.5 ? "text-[var(--danger)]" : "text-[var(--warning)]")}>{Math.round(t.rate * 100)}%</span>
                  </div>
                ))}
                {ins.typeStats.map((t) => (
                  <div key={t.key} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-3 py-2">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{t.label} questions</span>
                      <span className="text-xs text-[var(--muted)]">missed {t.missed} of {t.seen}</span>
                    </span>
                    <span className={cn("shrink-0 text-sm font-bold tabular-nums", t.rate >= 0.5 ? "text-[var(--danger)]" : "text-[var(--warning)]")}>{Math.round(t.rate * 100)}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </section>
  );
}

// ─── Miss vault: every question ever missed in a mock ───

function MissVault({ misses, onDrill }: { misses: MissRecord[]; onDrill: () => void }) {
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const shown = showAll ? misses : misses.slice(0, 6);
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
          <XCircle size={15} className="text-[var(--danger)]" /> Missed in mocks · {misses.length}
        </h2>
        <Button onClick={onDrill} className="h-8 px-3 text-xs"><RotateCcw size={13} /> Drill all misses</Button>
      </div>
      <Card>
        <CardBody className="divide-y divide-[var(--border)] p-0">
          {shown.map((m) => {
            const isOpen = open === m.q.id;
            const correct = correctLabels(m.q).join(", ");
            return (
              <div key={m.q.id}>
                <button
                  onClick={() => { haptic("tap"); setOpen(isOpen ? null : m.q.id); }}
                  className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-[var(--surface-2)]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-sm font-medium">{m.q.stem}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                      <span>{m.q.bokRef}</span>
                      <span>{"★".repeat(m.q.difficulty)}</span>
                      {m.q.trapType !== "none" && <span className="text-[var(--warning)]">{TRAP_LABEL[m.q.trapType] ?? m.q.trapType}</span>}
                      {m.times > 1 && <span className="font-semibold text-[var(--danger)]">missed ×{m.times}</span>}
                      <span>{m.lastSkipped ? "last: skipped" : `last: ${[...m.lastChosen].sort().join(", ")}`} · correct: {correct}</span>
                    </div>
                  </div>
                  <ChevronDown size={16} className={cn("mt-1 shrink-0 text-[var(--muted)] transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="border-t border-[var(--border)] bg-[var(--surface-2)]/40 px-5 py-4">
                    <QuestionView question={m.q} selected={m.lastChosen} onToggle={() => {}} revealed disabled />
                  </div>
                )}
              </div>
            );
          })}
          {misses.length > 6 && (
            <button onClick={() => setShowAll((v) => !v)} className="w-full px-5 py-3 text-center text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--surface-2)]">
              {showAll ? "Show fewer" : `Show all ${misses.length} misses`}
            </button>
          )}
        </CardBody>
      </Card>
    </section>
  );
}

function SprintCard({ onStart, mocks, guard }: { onStart: () => void; mocks: MockSession[]; guard: boolean }) {
  const tries = mocks.filter((m) => m.examId === "sprint");
  const { armed, fire } = useGuardedStart(guard, onStart);
  const SPRINT_DEF = getSprintDef();
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
          <Button variant={armed ? "danger" : "primary"} onClick={fire} className="h-8 px-3 text-xs">
            {armed ? "Replaces paused exam — sure?" : <>Start <ArrowRight size={13} /></>}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
