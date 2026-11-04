"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock,
  Crosshair,
  Flag,
  Flame,
  LayoutGrid,
  Layers,
  ListChecks,
  Minus,
  Pause,
  RotateCcw,
  Shuffle,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { competencyToDomainCode, getActiveMeta, getCompetency, getDomain, getDomains, getQuestion } from "@/lib/content";
import { buildSprint, getExamDef, getExamDefs, getExamQuestions, getExamStats, getSprintDef, type ExamDef } from "@/lib/exams";
import { TRAP_LABEL, computeMockInsights, type MockInsights, type MissRecord, type PaperPoint } from "@/lib/mock-insights";
import { isAnswerCorrect, correctLabels, shuffle, toScaledScore } from "@/lib/scoring";
import { haptic } from "@/lib/haptics";
import { celebrate } from "@/lib/celebrate";
import type { DomainCode, MockRun, MockSession, Question } from "@/lib/types";
import { uid, useHydrated, useProgress } from "@/store/progress";
import { useModalFocus } from "@/components/a11y";
import { Badge, Bar, Button, Card, CardBody, Chip, PageHeader } from "@/components/ui";
import { AnimatedNumber } from "@/components/motion";
import { QuestionView } from "@/components/quiz/question-view";
import { Drill } from "@/components/quiz/drill";
import { cn } from "@/lib/utils";

// ─── Formatting ───

function fmtTime(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function fmtDay(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function fmtDuration(ms?: number): string | null {
  if (!ms) return null;
  const m = Math.round(ms / 60000);
  return m < 1 ? "<1 min" : `${m} min`;
}

function relTime(ts: number): string {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
}

const pctOf = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

type Tone = "success" | "warning" | "danger";
const toneFor = (p: number): Tone => (p >= 80 ? "success" : p >= 60 ? "warning" : "danger");
const TONE_TEXT: Record<Tone, string> = {
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
};

// Full-width ruled-list row that opens or expands something.
const ROW_BUTTON =
  "flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)] sm:px-5";

// Position on the IAPP 100–500 scaled range, as a 0..100 share.
const scalePct = (s: number) => ((Math.max(100, Math.min(500, s)) - 100) / 400) * 100;

// ─── Papers ───

const PAPER_ICON: Record<ExamDef["kind"], typeof Trophy> = {
  full: Trophy,
  gauntlet: Flame,
  trap: AlertTriangle,
  domain: Layers,
  sprint: Shuffle,
};

// What each paper is FOR — one breath, derived from its kind so every exam pack gets it.
function paperPurpose(d: ExamDef, fullIndex: number): string {
  switch (d.kind) {
    case "full":
      return fullIndex <= 0 ? "Exam-day dress rehearsal" : "Fresh set, zero overlap";
    case "gauntlet":
      return "Only the hardest questions";
    case "trap":
      return "Every question hides a trap";
    case "domain":
      return (d.domain && getDomain(d.domain)?.name) || "One domain, every competency";
    case "sprint":
      return "Least-seen questions, new mix";
  }
}

function paperLength(d: ExamDef): number {
  return d.kind === "sprint" ? d.length : getExamStats(d.id).total;
}

function finishedTries(mocks: MockSession[], id: string): MockSession[] {
  return mocks
    .filter((m) => m.examId === id && m.finishedAt && typeof m.scaledScore === "number")
    .sort((a, b) => (a.finishedAt ?? 0) - (b.finishedAt ?? 0));
}

interface NextPick {
  def: ExamDef;
  kicker: string;
  reason: string;
}

// "Which paper next" — one recommendation, with the reason in one breath.
function pickNext(mocks: MockSession[], ins: MockInsights): NextPick | null {
  const defs = getExamDefs().filter((d) => paperLength(d) > 0);
  const fulls = defs.filter((d) => d.kind === "full");
  const untried = (d: ExamDef) => finishedTries(mocks, d.id).length === 0;
  const weakest = ins.domains
    .filter((d) => d.acc !== null && d.total >= 8)
    .sort((a, b) => (a.acc ?? 0) - (b.acc ?? 0))[0];
  const weakDeep = weakest && weakest.acc !== null && weakest.acc < 0.8
    ? defs.find((d) => d.kind === "domain" && d.domain === weakest.code)
    : undefined;
  const weakPct = weakest?.acc != null ? Math.round(weakest.acc * 100) : 0;

  if (ins.fullCount === 0 && fulls.length) {
    return { def: fulls.find(untried) ?? fulls[0], kicker: "Start here", reason: "Your baseline at real length and timing" };
  }
  const pass = getActiveMeta().passScaled;
  if (ins.latestFull && ins.latestFull.score < pass && weakDeep && weakest) {
    return { def: weakDeep, kicker: "Next up", reason: `Lift Domain ${weakest.code} (${weakPct}%) before the next full paper` };
  }
  const fresh = fulls.find(untried);
  if (fresh) return { def: fresh, kicker: "Next up", reason: "Fresh full paper — zero repeats" };
  if (weakDeep && weakest) return { def: weakDeep, kicker: "Next up", reason: `Domain ${weakest.code} is your weakest, at ${weakPct}%` };
  const trap = ins.trapStats[0];
  const trapLab = defs.find((d) => d.kind === "trap");
  if (trap && trap.rate >= 0.3 && trapLab) {
    return { def: trapLab, kicker: "Next up", reason: `You miss ${Math.round(trap.rate * 100)}% of “${trap.label}” traps` };
  }
  const gauntlet = defs.find((d) => d.kind === "gauntlet");
  if (gauntlet && untried(gauntlet)) return { def: gauntlet, kicker: "Next up", reason: "Pressure-test on ★★★ questions only" };
  const lastAt = (d: ExamDef) => {
    const t = finishedTries(mocks, d.id);
    return t[t.length - 1]?.finishedAt ?? 0;
  };
  const stalest = [...fulls].sort((a, b) => lastAt(a) - lastAt(b))[0];
  return stalest ? { def: stalest, kicker: "Next up", reason: "Re-sit the form you took longest ago" } : null;
}

// ─── Hooks ───

// First tap arms a warning when a paused exam would be replaced; second tap starts.
function useGuardedStart(guard: boolean, onStart: () => void) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  return {
    armed,
    fire: () => {
      if (guard && !armed) {
        haptic("tap");
        setArmed(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setArmed(false), 6000);
        return;
      }
      if (timer.current) clearTimeout(timer.current);
      setArmed(false);
      onStart();
    },
  };
}

// A viewport query read as an external store — no effect-driven state, no flicker.
function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

// The liquid lens: one spring pill that glides to the active option (as in the app nav).
function useLens() {
  const reduce = useReducedMotion();
  return reduce ? { duration: 0 } : ({ type: "spring", stiffness: 380, damping: 30, mass: 0.9 } as const);
}

type NavFilter = "all" | "blank" | "flagged";

// ─── Page ───

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
  const [now, setNow] = useState(0); // set when a paper starts or resumes
  const [session, setSession] = useState<MockSession | null>(null);
  const [reviewOnly, setReviewOnly] = useState(false);
  const [confirmArm, setConfirmArm] = useState(false);
  // Flag-for-review is component state only — MockRun's persisted shape is untouched,
  // so flags last for this sitting and clear on pause, resume or submit.
  const [flags, setFlags] = useState<string[]>([]);
  const [navOpen, setNavOpen] = useState(false);
  const [navFilter, setNavFilter] = useState<NavFilter>("all");
  const [timeUp, setTimeUp] = useState(false);
  const [drill, setDrill] = useState<{ qs: Question[]; label: string; back: "landing" | "result" } | null>(null);
  const startedRef = useRef(0);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desktop = useMedia("(min-width: 768px)");
  const sound = useProgress((s) => s.settings.sound ?? false);

  const seenCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of attempts) m.set(a.questionId, (m.get(a.questionId) ?? 0) + 1);
    return m;
  }, [attempts]);

  const ins = useMemo(() => computeMockInsights(mocks, attempts), [mocks, attempts]);

  useEffect(() => {
    if (phase !== "run") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

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

  // Also capture the clock when the page is hidden, reloaded or closed —
  // otherwise a reload refunds the time since the last answer. (Not on a timer:
  // every save also triggers a cloud backup.)
  const persistClock = useRef<() => void>(() => {});
  useEffect(() => {
    persistClock.current = () => {
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
    };
  });
  useEffect(() => {
    if (phase !== "run") return;
    const save = () => persistClock.current();
    const onVisibility = () => document.visibilityState === "hidden" && save();
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [phase]);

  useEffect(() => () => {
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
  }, []);

  // Desktop exam keys: ←/→ move between questions, Esc closes the question list.
  useEffect(() => {
    if (phase !== "run") return;
    const last = set.length - 1;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setIdx((i) => Math.min(last, i + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Escape") {
        setNavOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, set.length]);

  // Phone question-list sheet: keep keyboard focus inside it; Esc returns focus to the list button.
  const navSheetRef = useRef<HTMLDivElement>(null);
  const navTriggerRef = useRef<HTMLButtonElement>(null);
  useModalFocus(navSheetRef, navOpen && !desktop, () => setNavOpen(false), navTriggerRef);

  // Exam focus mode: while the clock runs the shell hides the phone dock.
  useEffect(() => {
    if (phase !== "run") return;
    document.body.dataset.focus = "exam";
    return () => {
      delete document.body.dataset.focus;
    };
  }, [phase]);

  // A new question or a new screen always starts at the top.
  useEffect(() => {
    if (window.scrollY > 0) window.scrollTo({ top: 0 });
  }, [phase, idx, session?.id]);

  function disarmSubmit() {
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    setConfirmArm(false);
  }

  function resetSitting() {
    setFlags([]);
    setNavOpen(false);
    setNavFilter("all");
    setTimeUp(false);
    disarmSubmit();
  }

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
    resetSitting();
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
    resetSitting();
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
    resetSitting();
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

  function finish(byTime = false) {
    let correct = 0;
    const perDomain: Record<DomainCode, { correct: number; total: number }> = { I: { correct: 0, total: 0 }, II: { correct: 0, total: 0 }, III: { correct: 0, total: 0 }, IV: { correct: 0, total: 0 }, V: { correct: 0, total: 0 }, VI: { correct: 0, total: 0 } };
    for (const q of set) {
      const chosen = answers[q.id] ?? [];
      const ok = chosen.length > 0 && isAnswerCorrect(q, chosen);
      if (ok) correct++;
      const dc = competencyToDomainCode(q.competencyId);
      if (dc) { perDomain[dc].total++; if (ok) perDomain[dc].correct++; }
      recordAttempt({ questionId: q.id, competencyId: q.competencyId, chosen, correct: ok, confidence: 2, timeMs: 0, mode: "mock" });
    }
    const rate = set.length ? correct / set.length : 0;
    const scaled = toScaledScore(rate);
    const ms: MockSession = {
      id: uid(),
      examId: def?.id,
      examName: def?.name,
      startedAt: startedRef.current,
      finishedAt: Date.now(),
      questionIds: set.map((q) => q.id),
      answers,
      correctCount: correct,
      scaledScore: scaled,
      perDomain,
      durationMs: Date.now() - startedRef.current,
    };
    saveMock(ms);
    clearMockRun();
    setSession(ms);
    setReviewOnly(false);
    resetSitting();
    setTimeUp(byTime);
    setPhase("result");
    // A pass is earned: one small chime-and-burst, never a storm.
    if (scaled >= getActiveMeta().passScaled) {
      haptic("success");
      celebrate({ sound, big: false });
    }
  }

  // Two-step submit, always: the first tap arms "Sure?" for 6s, the second submits.
  function submitNow() {
    if (!confirmArm) {
      haptic("tap");
      setConfirmArm(true);
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      confirmTimer.current = setTimeout(() => setConfirmArm(false), 6000);
      return;
    }
    disarmSubmit();
    haptic("tap");
    finish();
  }

  function openReview(m: MockSession) {
    haptic("tap");
    setSession(m);
    setDef(m.examId === "sprint" ? getSprintDef() : m.examId ? getExamDef(m.examId) ?? null : null);
    setReviewOnly(true);
    setTimeUp(false);
    setPhase("result");
  }

  function toLanding() {
    setPhase("landing");
    setSession(null);
  }

  function startDrill(qs: Question[], label: string, back: "landing" | "result") {
    if (qs.length === 0) return;
    haptic("tap");
    setDrill({ qs, label, back });
    setPhase("drill");
  }

  function exitDrill() {
    const back = drill?.back === "result" && session ? "result" : "landing";
    setDrill(null);
    setPhase(back);
  }

  function go(i: number) {
    setIdx(Math.max(0, Math.min(set.length - 1, i)));
  }

  function jump(i: number) {
    go(i);
    setNavOpen(false);
  }

  function toggleFlag(qid: string) {
    haptic("select");
    setFlags((f) => (f.includes(qid) ? f.filter((x) => x !== qid) : [...f, qid]));
  }

  function openNavigator(filter: NavFilter = "all") {
    setNavFilter(filter);
    setNavOpen(true);
  }

  function retake() {
    if (def) start(def);
  }

  // Time's up: the paper submits itself, exactly as on exam day.
  useEffect(() => {
    if (phase === "run" && deadline && now >= deadline) finish(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, phase, deadline]);

  if (!hydrated) return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  // ── Landing: verdict → next paper → every paper → misses → history ──
  if (phase === "landing") {
    const pick = pickNext(mocks, ins);
    const guard = !!mockRun;
    const history = [...mocks].sort((a, b) => (b.finishedAt ?? b.startedAt) - (a.finishedAt ?? a.startedAt));
    const openPaper = (id: string) => {
      const m = mocks.find((x) => x.id === id);
      if (m) openReview(m);
    };
    return (
      <div className="space-y-6">
        <PageHeader title="Mock exams" subtitle="Timed, scored like exam day." />

        {mockRun && <ResumeBanner run={mockRun} onResume={resumeRun} onDiscard={() => { haptic("tap"); clearMockRun(); }} />}

        {ins.papers.length > 0 ? (
          <ExamRecord ins={ins} pick={pick} guard={guard} onStart={start} onOpenPaper={openPaper} />
        ) : (
          pick && <StartHere pick={pick} guard={guard} onStart={start} />
        )}

        <PaperBoard mocks={mocks} pickId={pick?.def.id} guard={guard} onStart={start} />

        {ins.misses.length > 0 && (
          <MissVault misses={ins.misses} onDrill={(qs, label) => startDrill(qs, label, "landing")} />
        )}

        {history.length > 0 && <PastPapers history={history} onOpen={openReview} />}
      </div>
    );
  }

  // ── Miss drill: untimed retraining with instant feedback (Drill's own End leads back) ──
  if (phase === "drill" && drill) {
    return (
      <div>
        <PageHeader title="Miss drill" subtitle={drill.label} />
        <Drill
          questions={drill.qs}
          onExit={exitDrill}
          exitLabel={drill.back === "result" && session ? "Back to results" : "Back to mock exams"}
        />
      </div>
    );
  }

  // ── Result / review: verdict → domains → question review ──
  if (phase === "result" && session) {
    const pass = getActiveMeta().passScaled;
    const rows = session.questionIds
      .map((qid) => ({ qid, q: getQuestion(qid) }))
      .filter((r): r is { qid: string; q: Question } => !!r.q)
      .map(({ qid, q }) => {
        const chosen = session.answers[qid] ?? [];
        const ok = chosen.length > 0 && isAnswerCorrect(q, chosen);
        return { q, chosen, ok };
      });
    const retired = session.questionIds.length - rows.length;
    const misses = rows.filter((r) => !r.ok);
    // Earlier finished attempts of this same paper, newest first.
    const earlierSame = session.examId
      ? mocks
          .filter((m) => m.id !== session.id && m.examId === session.examId && m.finishedAt && typeof m.scaledScore === "number" && (m.finishedAt ?? 0) < (session.finishedAt ?? Number.MAX_SAFE_INTEGER))
          .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
      : [];
    const prevSame = earlierSame[0];
    const prevBest = earlierSame.reduce<number | undefined>((b, m) => Math.max(b ?? 0, m.scaledScore ?? 0), undefined);
    const newBest = prevBest !== undefined && (session.scaledScore ?? 0) > prevBest;
    const domainRows = getDomains()
      .map((d) => ({ code: d.code, pd: session.perDomain?.[d.code] }))
      .filter((r): r is { code: DomainCode; pd: { correct: number; total: number } } => !!r.pd && r.pd.total > 0);
    const weakestRow = domainRows.length > 1
      ? [...domainRows].sort((a, b) => a.pd.correct / a.pd.total - b.pd.correct / b.pd.total)[0]
      : undefined;
    const weakDeep = weakestRow && pctOf(weakestRow.pd.correct, weakestRow.pd.total) < 80
      ? getExamDefs().find((d) => d.kind === "domain" && d.domain === weakestRow.code && d.id !== session.examId)
      : undefined;
    const paperName = session.examName ?? "Mock exam";
    const drillMisses = () => startDrill(misses.map((r) => r.q), `${misses.length} misses from ${paperName}, untimed`, "result");
    const actionProps = { missCount: misses.length, onDrill: drillMisses, retakeDef: def, guard: !!mockRun, onRetake: retake, onBack: toLanding };
    return (
      <div className="space-y-6">
        <PageHeader
          title={reviewOnly ? "Paper review" : "Results"}
          subtitle={`${paperName}, ${fmtDay(session.finishedAt ?? session.startedAt)}`}
          action={<Button variant="ghost" size="sm" onClick={toLanding} className="h-11 shrink-0 sm:h-9"><ArrowLeft size={15} /> All papers</Button>}
        />

        <VerdictCard session={session} pass={pass} prev={prevSame?.scaledScore} newBest={newBest} fresh={!reviewOnly} timeUp={timeUp} rows={rows}>
          <ResultActions {...actionProps} showBack={false} />
        </VerdictCard>

        {domainRows.length > 0 && (
          <Card>
            <CardBody>
              <SectionLabel right="This paper">By domain</SectionLabel>
              <div className="mt-1 divide-y divide-[var(--border)]">
                {domainRows.map((r) => (
                  <DomainLine
                    key={r.code}
                    code={r.code}
                    correct={r.pd.correct}
                    total={r.pd.total}
                    action={weakDeep && weakestRow?.code === r.code ? <GuardedButton label="Deep-dive" def={weakDeep} guard={!!mockRun} onStart={start} /> : undefined}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        <ReviewList key={session.id} rows={rows} retired={retired} />

        {rows.length > 8 && <div className="pt-2"><ResultActions {...actionProps} showBack /></div>}
      </div>
    );
  }

  // ── Running: exam bar (timer, list, pause, submit) · question · thumb controls ──
  const q = set[idx];
  if (!q) return null;
  const n = set.length;
  const remaining = deadline - now;
  const answeredCount = set.filter((qq) => (answers[qq.id]?.length ?? 0) > 0).length;
  const blankCount = n - answeredCount;
  const flagged = flags.includes(q.id);
  const onLast = idx + 1 >= n;
  const toggleNav = () => (navOpen ? setNavOpen(false) : openNavigator());
  const navigator = (scroll: boolean) => (
    <NavigatorBody
      set={set}
      answers={answers}
      flags={flags}
      idx={idx}
      filter={navFilter}
      onFilter={setNavFilter}
      onJump={jump}
      confirmArm={confirmArm}
      onSubmit={submitNow}
      scroll={scroll}
    />
  );

  return (
    <div>
      {/* Exam bar — calm floating glass, pinned just under the header */}
      <div className="glass-float sticky top-[calc(var(--header-h)+8px)] z-20 mb-4 rounded-[22px] px-4 pb-3 pt-3 sm:px-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] text-[var(--muted)]">{def?.name ?? "Mock exam"}</div>
            <div className="whitespace-nowrap font-display text-[17px] font-bold leading-tight tabular-nums">
              <span className="sm:hidden">Q{idx + 1}</span>
              <span className="hidden sm:inline">Question {idx + 1}</span> <span className="font-medium text-[var(--muted)]">of {n}</span>
            </div>
          </div>
          <ExamTimer ms={remaining} />
          <Button variant="outline" size="sm" onClick={pauseExam} aria-label="Pause exam" title="Pause — the clock freezes" className="h-11 w-11 shrink-0 px-0 sm:h-10 sm:w-auto sm:px-3.5">
            <Pause size={15} /> <span className="hidden sm:inline">Pause</span>
          </Button>
          <Button variant={confirmArm ? "primary" : "outline"} size="sm" onClick={submitNow} className="h-11 shrink-0 sm:h-10">
            {confirmArm ? <><span className="sm:hidden">Sure?</span><span className="hidden sm:inline">Sure? Submit</span></> : "Submit"}
          </Button>
        </div>
        <ProgressStrip set={set} answers={answers} flags={flags} idx={idx} open={navOpen} onToggle={toggleNav} />
        {confirmArm && (
          <SubmitNotice
            blank={blankCount}
            flagged={flags.length}
            onReviewBlanks={() => { disarmSubmit(); openNavigator("blank"); }}
            onCancel={disarmSubmit}
          />
        )}
      </div>

      {/* Desktop: the question list opens inline under the bar */}
      {navOpen && desktop && (
        <Card className="mb-4">
          <CardBody>{navigator(false)}</CardBody>
        </Card>
      )}

      <Card>
        <CardBody className="sm:p-6">
          <QuestionView question={q} selected={answers[q.id] ?? []} onToggle={(l) => toggle(q, l)} revealed={false} examMode />
        </CardBody>
      </Card>

      {/* Desktop controls */}
      <div className="mt-4 hidden items-center gap-2 md:flex">
        <Button variant="outline" onClick={() => go(idx - 1)} disabled={idx === 0}><ChevronLeft size={16} /> Previous</Button>
        <FlagToggle flagged={flagged} onToggle={() => toggleFlag(q.id)} />
        <span className="ml-auto text-xs text-[var(--muted)]">← → to move</span>
        {onLast ? (
          <Button onClick={() => openNavigator()}><ListChecks size={16} /> Review and submit</Button>
        ) : (
          <Button onClick={() => go(idx + 1)}>Next <ChevronRight size={16} /></Button>
        )}
      </div>

      {/* Phone: a floating thumb dock — the app's own dock steps aside in exam focus mode */}
      <div className="fixed inset-x-3 bottom-[max(10px,env(safe-area-inset-bottom))] z-30 md:hidden">
        <div className="glass-float flex h-[62px] items-center gap-1 rounded-[24px] px-1.5">
          <Button variant="ghost" aria-label="Previous question" onClick={() => go(idx - 1)} disabled={idx === 0} className="h-12 w-12 shrink-0 px-0 text-[var(--foreground)]">
            <ChevronLeft size={20} />
          </Button>
          <FlagToggle flagged={flagged} onToggle={() => toggleFlag(q.id)} compact />
          <Button
            ref={navTriggerRef}
            variant="ghost"
            onClick={toggleNav}
            aria-expanded={navOpen}
            aria-label={`Question list — ${answeredCount} of ${n} answered`}
            className="h-12 min-w-0 flex-1 px-2 text-[var(--foreground)]"
          >
            <LayoutGrid size={17} /> <span className="tabular-nums">{answeredCount}/{n}</span>
          </Button>
          {onLast ? (
            <Button onClick={() => openNavigator()} className="h-12 shrink-0 px-5">Review</Button>
          ) : (
            <Button onClick={() => go(idx + 1)} className="h-12 shrink-0 px-5">Next <ChevronRight size={18} /></Button>
          )}
        </div>
      </div>

      {/* Phone: the question list as a glass bottom sheet */}
      {navOpen && !desktop && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Question list">
          <div aria-hidden className="absolute inset-0 bg-black/45" onClick={() => setNavOpen(false)} />
          <div ref={navSheetRef} className="sheet-up glass-float absolute inset-x-0 bottom-0 flex max-h-[78dvh] flex-col rounded-t-[28px] px-4 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-2">
            <div aria-hidden className="mx-auto mb-2 h-1 w-10 shrink-0 rounded-full bg-[var(--border)]" />
            <div className="flex shrink-0 items-center justify-between pb-2">
              <span className="font-display text-lg font-extrabold">Questions</span>
              <button
                type="button"
                autoFocus
                aria-label="Close"
                onClick={() => setNavOpen(false)}
                className="press grid h-11 w-11 cursor-pointer place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <X size={18} />
              </button>
            </div>
            {navigator(true)}
          </div>
        </div>
      )}
    </div>
  );
}

// Flag for review: amber when set; the flag pops each time it goes up.
function FlagToggle({ flagged, onToggle, compact }: { flagged: boolean; onToggle: () => void; compact?: boolean }) {
  return (
    <Button
      variant="ghost"
      onClick={onToggle}
      aria-pressed={flagged}
      aria-label={compact ? "Flag for review" : undefined}
      className={cn(
        compact ? "h-12 w-12 shrink-0 px-0 text-[var(--foreground)]" : "",
        flagged && "bg-[var(--warning)]/14 text-[var(--warning)] hover:bg-[var(--warning)]/20 hover:text-[var(--warning)]"
      )}
    >
      <Flag key={flagged ? "up" : "down"} size={compact ? 18 : 15} className={cn(flagged && "anim-pop fill-current")} />
      {!compact && "Flag for review"}
    </Button>
  );
}

// ─── Shared bits ───

// A quiet sentence-case label for a section inside a panel (never a tracked caps eyebrow).
function SectionLabel({ children, icon, right }: { children: ReactNode; icon?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)]">
        {icon}
        <span className="truncate">{children}</span>
      </span>
      {right && <span className="shrink-0 text-xs text-[var(--muted)]">{right}</span>}
    </div>
  );
}

// A section title that sits on the light, outside any panel.
function SectionTitle({ children, right, id }: { children: ReactNode; right?: ReactNode; id?: string }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <h2 id={id} className="text-lg font-bold">{children}</h2>
      {right}
    </div>
  );
}

function Delta({ value, suffix }: { value: number; suffix?: string }) {
  const tone = value === 0 ? "text-[var(--muted)]" : value > 0 ? "text-[var(--success)]" : "text-[var(--danger)]";
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-semibold tabular-nums", tone)}>
      {value === 0 ? <Minus size={14} /> : value > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {value > 0 ? "+" : value < 0 ? "−" : ""}
      {Math.abs(value)}
      {suffix && <span className="font-normal text-[var(--muted)]">{suffix}</span>}
    </span>
  );
}

function TrendChip({ value }: { value: number | null }) {
  if (value === null) return null;
  const pp = Math.round(value * 100);
  if (Math.abs(pp) < 2) return <span title="Latest paper vs earlier papers" className="text-xs font-semibold text-[var(--muted)]">steady</span>;
  const up = pp > 0;
  return (
    <span title="Latest paper vs earlier papers" className={cn("inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums", up ? "text-[var(--success)]" : "text-[var(--danger)]")}>
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {up ? "+" : "−"}{Math.abs(pp)}pp
    </span>
  );
}

// Single-choice filter chips on the shared Chip, with the liquid lens gliding to the
// active one. "All" is always the visible reset; empty filters are disabled.
function FilterChips<T extends string>({
  lensId,
  label,
  value,
  onChange,
  options,
}: {
  lensId: string;
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string; n: number; always?: boolean }[];
}) {
  const lens = useLens();
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      {options.map((o) => {
        const on = value === o.id;
        return (
          <Chip
            key={o.id}
            selected={on}
            disabled={!o.always && o.n === 0}
            onClick={() => { haptic("tap"); onChange(o.id); }}
            className={cn(
              // a 44px touch target around a calm 32px chip
              "relative before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-['']",
              on && "bg-transparent hover:bg-transparent"
            )}
          >
            {on && <motion.span layoutId={lensId} transition={lens} aria-hidden className="absolute inset-0 rounded-full bg-[var(--primary)]/12 ring-1 ring-[var(--primary)]/25" />}
            <span className="relative">{o.label}</span>{" "}
            <span className="relative tabular-nums">{o.n}</span>
          </Chip>
        );
      })}
    </div>
  );
}

function GuardedButton({ label, def, guard, onStart }: { label: string; def: ExamDef; guard: boolean; onStart: (d: ExamDef) => void }) {
  const { armed, fire } = useGuardedStart(guard, () => onStart(def));
  return (
    <Button variant={armed ? "danger" : "outline"} size="sm" onClick={fire} className="h-11 shrink-0 sm:h-9">
      {armed ? "Replace paused?" : label}
    </Button>
  );
}

function DomainLine({ code, correct, total, trend, action }: { code: DomainCode; correct: number; total: number; trend?: number | null; action?: ReactNode }) {
  const p = pctOf(correct, total);
  const name = getDomain(code)?.name ?? `Domain ${code}`;
  return (
    <div className="py-2.5">
      <div className="flex min-h-6 items-center gap-3">
        <span className="w-8 shrink-0 text-sm font-bold tabular-nums">{code}</span>
        <span className="min-w-0 flex-1 truncate text-sm" title={name}>{name}</span>
        {trend !== undefined && <TrendChip value={trend} />}
        <span className={cn("w-10 shrink-0 text-right text-sm font-bold tabular-nums", TONE_TEXT[toneFor(p)])}>{p}%</span>
        <span className="hidden w-14 shrink-0 text-right text-xs tabular-nums text-[var(--muted)] sm:block">{correct}/{total}</span>
        {action}
      </div>
      <div className="mt-1.5 pl-11">
        <Bar value={p} tone={toneFor(p)} className="h-1.5" />
      </div>
    </div>
  );
}

// ─── Landing: paused exam ───

function ResumeBanner({ run, onResume, onDiscard }: { run: MockRun; onResume: () => void; onDiscard: () => void }) {
  const [arm, setArm] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const total = run.questionIds.length;
  const answered = Object.values(run.answers).filter((a) => a.length > 0).length;
  return (
    <Card className="border-[var(--primary)]/40">
      <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Pause size={20} className="mt-0.5 shrink-0 text-[var(--primary)]" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-[17px] font-bold">{run.examName ?? "Mock exam"}</div>
            <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs tabular-nums text-[var(--muted)]">
              <span>{answered}/{total} answered</span>
              <span>{fmtTime(run.remainingMs)} left</span>
              <span>Paused {relTime(run.updatedAt)}</span>
            </div>
            <Bar value={pctOf(answered, total)} className="mt-2 h-1.5" />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!arm) {
                haptic("tap");
                setArm(true);
                if (timer.current) clearTimeout(timer.current);
                timer.current = setTimeout(() => setArm(false), 6000);
                return;
              }
              onDiscard();
            }}
            className={cn("h-11 sm:h-10", arm && "text-[var(--danger)] hover:text-[var(--danger)]")}
          >
            {arm ? "Tap again to discard" : "Discard"}
          </Button>
          <Button onClick={onResume} className="h-11 flex-1 sm:h-10 sm:flex-none">Resume <ArrowRight size={15} /></Button>
        </div>
      </CardBody>
    </Card>
  );
}

// ─── Landing: the exam record — one instrument ───

function ExamRecord({ ins, pick, guard, onStart, onOpenPaper }: { ins: MockInsights; pick: NextPick | null; guard: boolean; onStart: (d: ExamDef) => void; onOpenPaper: (id: string) => void }) {
  const pass = getActiveMeta().passScaled;
  const lead = ins.latestFull ?? ins.papers[ins.papers.length - 1];
  const leadFull = !!ins.latestFull;
  const prev = leadFull ? ins.prevFull : ins.papers[ins.papers.length - 2] ?? null;
  const delta = prev ? lead.score - prev.score : null;
  const ok = lead.score >= pass;
  const best = ins.bestFull ?? ins.bestScore ?? lead.score;
  const leaks = [
    ...ins.trapStats.map((t) => ({ ...t, label: `“${t.label}” trap` })),
    ...ins.typeStats.map((t) => ({ ...t, label: `${t.label} questions` })),
  ]
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 4);
  const domains = ins.domains.filter((d) => d.total > 0);
  const toMisses = () => document.getElementById("mock-misses")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <Card className="mesh">
      {/* Verdict + the one next step */}
      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]">
        <div className="min-w-0 p-5">
          <SectionLabel>{leadFull ? "Latest full paper" : "Latest paper"}</SectionLabel>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="flex items-baseline gap-1">
              <AnimatedNumber value={lead.score} className="font-display text-[44px] font-extrabold leading-none tracking-tight" />
              <span className="text-sm font-medium text-[var(--muted)]">/ 500</span>
            </span>
            <Badge tone={ok ? "success" : "danger"}>
              {ok ? <CircleCheck size={13} /> : <CircleX size={13} />} {ok ? "Pass" : "Fail"}
            </Badge>
            {delta !== null && <Delta value={delta} />}
          </div>
          <p className="mt-2 text-sm">
            {Math.abs(lead.score - pass)} {ok ? "above" : "below"} the pass line
          </p>
          <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-[var(--muted)]">
            <span className="font-medium text-[var(--foreground)]">{lead.name}</span>
            <span>{fmtDay(lead.at)}</span>
          </p>
          {!leadFull && <p className="mt-1 text-xs font-medium text-[var(--warning)]">Short paper — confirm with a full form</p>}
          <dl className="mt-4 grid grid-cols-3 divide-x divide-[var(--border)]">
            <MiniStat label={ins.bestFull !== null ? "Best full" : "Best"} value={best} />
            <MiniStat label={ins.fullCount ? "Full passes" : "Papers"} value={ins.fullCount ? `${ins.fullPassCount} of ${ins.fullCount}` : ins.papers.length} />
            <MiniStat label="Open misses" value={ins.openMisses.length} onClick={ins.misses.length ? toMisses : undefined} />
          </dl>
        </div>
        {pick && (
          <div className="min-w-0 border-t border-[var(--border)] p-5 md:border-l md:border-t-0">
            <NextUp pick={pick} guard={guard} onStart={onStart} />
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border)] px-5 py-4">
        <ScoreTrack papers={ins.papers} pass={pass} onOpen={onOpenPaper} />
      </div>

      {domains.length > 0 && (
        <div className="border-t border-[var(--border)] px-5 pb-2 pt-4">
          <SectionLabel right="Across all papers">Domains</SectionLabel>
          <div className="mt-1 divide-y divide-[var(--border)]">
            {domains.map((d) => <DomainLine key={d.code} code={d.code} correct={d.correct} total={d.total} trend={d.trend} />)}
          </div>
        </div>
      )}

      <div className="grid border-t border-[var(--border)] md:grid-cols-2">
        <div className="min-w-0 px-5 pb-3 pt-4">
          <SectionLabel icon={<Zap size={13} className="text-[var(--warning)]" />} right="Miss rate">Technique leaks</SectionLabel>
          {leaks.length === 0 ? (
            <p className="py-3 text-sm text-[var(--muted)]">Needs 4+ sightings to show.</p>
          ) : (
            <ul className="mt-1 divide-y divide-[var(--border)]">
              {leaks.map((t) => (
                <li key={t.label} className="flex items-center gap-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{t.label}</span>
                    <span className="text-xs tabular-nums text-[var(--muted)]">{t.missed} of {t.seen} missed</span>
                  </span>
                  <span className={cn("shrink-0 text-sm font-bold tabular-nums", t.rate >= 0.5 ? TONE_TEXT.danger : TONE_TEXT.warning)}>{Math.round(t.rate * 100)}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="min-w-0 border-t border-[var(--border)] px-5 pb-3 pt-4 md:border-l md:border-t-0">
          <SectionLabel icon={<Crosshair size={13} className="text-[var(--danger)]" />} right="Accuracy">Weakest competencies</SectionLabel>
          {ins.weakSpots.length === 0 ? (
            <p className="py-3 text-sm text-[var(--muted)]">None under 85% yet.</p>
          ) : (
            <ul className="mt-1 divide-y divide-[var(--border)]">
              {ins.weakSpots.slice(0, 4).map((w) => {
                const p = Math.round(w.acc * 100);
                return (
                  <li key={w.id}>
                    <Link href={`/practice?competency=${w.id}`} className="group flex min-h-11 items-center gap-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{w.code} · {w.name}</span>
                        <span className="text-xs tabular-nums text-[var(--muted)]">{w.wrong} of {w.total} wrong</span>
                      </span>
                      <span className={cn("shrink-0 text-sm font-bold tabular-nums", p < 50 ? TONE_TEXT.danger : TONE_TEXT.warning)}>{p}%</span>
                      <span className="shrink-0 text-xs font-semibold text-[var(--accent)] group-hover:underline">Drill</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}

function MiniStat({ label, value, onClick }: { label: string; value: ReactNode; onClick?: () => void }) {
  return (
    <div className="min-w-0 px-3 first:pl-0">
      <dt className="truncate text-xs text-[var(--muted)]">{label}</dt>
      <dd className="mt-0.5 font-display text-xl font-bold tabular-nums">
        {onClick ? (
          <button type="button" onClick={onClick} aria-label={`${value} open misses — jump to the list`} className="-my-2 cursor-pointer rounded py-2 underline decoration-[var(--border)] decoration-2 underline-offset-4 hover:decoration-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
            {value}
          </button>
        ) : value}
      </dd>
    </div>
  );
}

function NextUp({ pick, guard, onStart }: { pick: NextPick; guard: boolean; onStart: (d: ExamDef) => void }) {
  const { armed, fire } = useGuardedStart(guard, () => onStart(pick.def));
  return (
    <div className="flex h-full min-w-0 flex-col gap-3">
      <div className="min-w-0">
        <SectionLabel icon={<Target size={13} className="text-[var(--primary)]" />}>{pick.kicker}</SectionLabel>
        <div className="mt-1.5 font-display text-lg font-bold leading-snug">{pick.def.name}</div>
        <p className="mt-1 text-sm text-[var(--muted)]">{pick.reason}</p>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3">
        <span className="text-xs tabular-nums text-[var(--muted)]">{paperLength(pick.def)} questions, {pick.def.minutes} min</span>
        <Button variant={armed ? "danger" : guard ? "outline" : "primary"} size="sm" onClick={fire} className="h-11 shrink-0 sm:h-10">
          {armed ? "Replace paused?" : guard ? "Start" : <>Start <ArrowRight size={14} /></>}
        </Button>
      </div>
    </div>
  );
}

// The hero instrument: every finished paper on the 100–500 scale, above or below the pass line.
function ScoreTrack({ papers, pass, onOpen }: { papers: PaperPoint[]; pass: number; onOpen: (id: string) => void }) {
  const gid = `track-${useId().replace(/[:]/g, "")}`;
  const shown = papers.slice(-24);
  const n = shown.length;
  const x = (i: number) => (n === 1 ? 50 : 3 + (i / (n - 1)) * 94);
  const y = (s: number) => 6 + (1 - scalePct(s) / 100) * 88; // 6% headroom top and bottom
  const passY = y(pass);
  const last = shown[n - 1];
  const line = shown.map((p, i) => `${x(i)},${y(p.score)}`).join(" ");
  return (
    <div>
      <SectionLabel
        right={
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span aria-hidden className="h-2 w-2 rounded-full bg-[var(--muted)]" /> Full</span>
            <span className="flex items-center gap-1"><span aria-hidden className="h-2 w-2 rounded-full border border-[var(--muted)]" /> Short</span>
          </span>
        }
      >
        Score track
      </SectionLabel>
      <div className="mt-3 flex gap-2">
        <div aria-hidden className="relative w-7 shrink-0 text-right text-[10px] tabular-nums text-[var(--muted)]">
          <span className="absolute right-0 -translate-y-1/2" style={{ top: `${y(500)}%` }}>500</span>
          <span className="absolute right-0 -translate-y-1/2 font-semibold text-[var(--foreground)]" style={{ top: `${passY}%` }}>{pass}</span>
          <span className="absolute right-0 -translate-y-1/2" style={{ top: `${y(100)}%` }}>100</span>
        </div>
        <div className="relative h-36 min-w-0 flex-1">
          {/* pass / fail zones */}
          <div aria-hidden className="absolute inset-x-0 top-0 rounded-t-lg bg-[var(--success)]/[0.07]" style={{ height: `${passY}%` }} />
          <div aria-hidden className="absolute inset-x-0 bottom-0 rounded-b-lg bg-[var(--danger)]/[0.06]" style={{ top: `${passY}%` }} />
          <div aria-hidden className="absolute inset-x-0 border-t border-dashed border-[var(--muted)]" style={{ top: `${passY}%` }} />
          <span aria-hidden className="absolute left-2 -translate-y-[calc(100%+3px)] text-[11px] font-medium text-[var(--muted)]" style={{ top: `${passY}%` }}>Pass line</span>
          {n > 1 && (
            // the line carries the exam's own liquid; the dots carry pass/fail
            <svg aria-hidden className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="0">
                  <stop offset="0%" style={{ stopColor: "var(--glow)" }} />
                  <stop offset="100%" style={{ stopColor: "var(--primary)" }} />
                </linearGradient>
              </defs>
              <polyline points={line} fill="none" stroke={`url(#${gid})`} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
          )}
          {shown.map((p, i) => {
            const good = p.score >= pass;
            const xi = x(i);
            const tipSide = xi > 66 ? "right-0" : xi < 34 ? "left-0" : "left-1/2 -translate-x-1/2";
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onOpen(p.id)}
                aria-label={`${p.name}: ${p.score}, ${good ? "pass" : "fail"}, ${fmtDay(p.at)}. Open review`}
                className="group absolute z-[1] grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                style={{ left: `${xi}%`, top: `${y(p.score)}%` }}
              >
                <span
                  className={cn(
                    "block rounded-full border-2 transition-transform group-hover:scale-125",
                    p.full ? "h-3 w-3" : "h-2.5 w-2.5",
                    good ? "border-[var(--success)]" : "border-[var(--danger)]",
                    p.full ? (good ? "bg-[var(--success)]" : "bg-[var(--danger)]") : "bg-[var(--surface)]"
                  )}
                />
                <span className={cn("pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-left text-[11px] shadow-[var(--e2)] group-hover:block group-focus-visible:block", tipSide)}>
                  <span className="block font-semibold">{p.name}</span>
                  <span className="block tabular-nums text-[var(--muted)]">{p.score} on {fmtDay(p.at)}</span>
                </span>
              </button>
            );
          })}
          {last && (
            // latest score, under its dot when near the top, else above — clear of the line
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute -translate-x-1/2 text-xs font-bold tabular-nums",
                y(last.score) < 30 ? "translate-y-2.5" : "-translate-y-[calc(100%+10px)]"
              )}
              style={{ left: `${x(n - 1)}%`, top: `${y(last.score)}%` }}
            >
              {last.score}
            </span>
          )}
        </div>
      </div>
      <div aria-hidden className="mt-1.5 flex justify-between pl-9 text-[11px] text-[var(--muted)]">
        <span>{fmtDay(shown[0].at)}</span>
        {n > 1 && <span>{fmtDay(last.at)}</span>}
      </div>
    </div>
  );
}

// ─── Landing: first-run orientation (no papers yet) ───

function StartHere({ pick, guard, onStart }: { pick: NextPick; guard: boolean; onStart: (d: ExamDef) => void }) {
  const { armed, fire } = useGuardedStart(guard, () => onStart(pick.def));
  const meta = getActiveMeta();
  const facts = [
    { icon: Timer, text: "Timed like exam day" },
    { icon: Pause, text: "Pause freezes the clock" },
    { icon: ListChecks, text: "Every miss explained after" },
  ];
  return (
    <Card className="mesh">
      <CardBody className="p-5 sm:p-6">
        <h2 className="text-2xl font-extrabold">{pick.def.name}</h2>
        <p className="mt-1 text-[15px] text-[var(--muted)]">{pick.kicker} — {pick.reason.charAt(0).toLowerCase() + pick.reason.slice(1)}.</p>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <dl className="grid grid-cols-3 divide-x divide-[var(--border)]">
            <MiniStat label="Questions" value={paperLength(pick.def)} />
            <MiniStat label="Minutes" value={pick.def.minutes} />
            <MiniStat label="Pass mark" value={<>{meta.passScaled}<span className="text-xs font-medium text-[var(--muted)]"> / 500</span></>} />
          </dl>
          <Button variant={armed ? "danger" : guard ? "outline" : "primary"} onClick={fire} className="h-12 w-full sm:h-11 sm:w-auto">
            {armed ? "Replaces paused exam — sure?" : guard ? "Start the paper" : <>Start the paper <ArrowRight size={16} /></>}
          </Button>
        </div>
      </CardBody>
      <ul className="grid border-t border-[var(--border)] sm:grid-cols-3">
        {facts.map(({ icon: Icon, text }, i) => (
          <li key={text} className={cn("flex items-center gap-2.5 px-5 py-3 text-xs text-[var(--muted)]", i > 0 && "border-t border-[var(--border)] sm:border-l sm:border-t-0")}>
            <Icon size={15} className="shrink-0 text-[var(--primary)]" /> {text}
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ─── Landing: every paper, one ruled board ───

function PaperBoard({ mocks, pickId, guard, onStart }: { mocks: MockSession[]; pickId?: string; guard: boolean; onStart: (d: ExamDef) => void }) {
  const defs = getExamDefs();
  const full = defs.filter((d) => d.kind === "full");
  const targeted = [...defs.filter((d) => d.kind !== "full"), getSprintDef()];
  const groups = [
    { key: "full", icon: Trophy, title: "Full-length", hint: "Real length, timing and blueprint", defs: full },
    { key: "targeted", icon: Target, title: "Targeted", hint: "Short papers, one weakness each", defs: targeted },
  ].filter((g) => g.defs.length > 0);
  return (
    <section aria-labelledby="mock-papers">
      <SectionTitle id="mock-papers">All papers</SectionTitle>
      <Card>
        {groups.map((g, gi) => (
          <div key={g.key} className={cn(gi > 0 && "border-t border-[var(--border)]")}>
            <div className="flex min-w-0 items-baseline gap-2.5 px-4 pb-1 pt-3.5 sm:px-5">
              <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-semibold">
                <g.icon size={14} className="text-[var(--muted)]" /> {g.title}
              </span>
              <span className="truncate text-xs text-[var(--muted)]">{g.hint}</span>
            </div>
            <ul className="divide-y divide-[var(--border)]">
              {g.defs.map((d, i) => (
                <li key={d.id}>
                  <PaperRow def={d} purpose={paperPurpose(d, g.key === "full" ? i : -1)} mocks={mocks} recommended={d.id === pickId} guard={guard} onStart={onStart} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Card>
    </section>
  );
}

function PaperRow({ def, purpose, mocks, recommended, guard, onStart }: { def: ExamDef; purpose: string; mocks: MockSession[]; recommended: boolean; guard: boolean; onStart: (d: ExamDef) => void }) {
  const total = paperLength(def);
  const tries = finishedTries(mocks, def.id);
  const last = tries[tries.length - 1]?.scaledScore;
  const { armed, fire } = useGuardedStart(guard, () => onStart(def));
  const Icon = PAPER_ICON[def.kind];
  const status = <PaperStatus tries={tries.length} last={last} />;
  const nextBadge = recommended ? <Badge tone="primary" className="shrink-0">Next up</Badge> : null;
  return (
    <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <Icon size={18} className={cn("shrink-0", recommended ? "text-[var(--primary)]" : "text-[var(--muted)]")} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold">{def.name}</span>
          <span className="hidden sm:contents">{nextBadge}</span>
        </div>
        <div className="truncate text-xs text-[var(--muted)]" title={purpose}>{purpose}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)] sm:hidden">
          <span className="tabular-nums">{total} Q in {def.minutes} min</span>
          {nextBadge && !tries.length ? nextBadge : <>{status}{nextBadge}</>}
        </div>
      </div>
      <span className="hidden w-24 shrink-0 text-right text-xs leading-tight tabular-nums text-[var(--muted)] sm:block">
        <span className="block font-medium text-[var(--foreground)]">{total} questions</span>
        <span className="block">{def.minutes} min</span>
      </span>
      <span className="hidden w-28 shrink-0 justify-end sm:flex">{status}</span>
      <Button
        variant={armed ? "danger" : "outline"}
        size="sm"
        onClick={fire}
        disabled={total === 0}
        title={total === 0 ? "No questions in the bank yet" : undefined}
        className="h-11 min-w-[5rem] shrink-0 sm:h-9"
      >
        {armed ? "Replace paused?" : tries.length ? "Retake" : "Start"}
      </Button>
    </div>
  );
}

function PaperStatus({ tries, last }: { tries: number; last?: number }) {
  if (!tries || last === undefined) return <span className="text-xs text-[var(--muted)]">Not taken</span>;
  const ok = last >= getActiveMeta().passScaled;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs" title={tries > 1 ? `${tries} attempts` : undefined}>
      <Badge tone={ok ? "success" : "danger"} className="tabular-nums">{last}</Badge>
      <span className="text-[var(--muted)]">{ok ? "Pass" : "Fail"}</span>
    </span>
  );
}

// ─── Landing: miss vault ───

type MissFilter = "open" | "repeat" | "all";

function MissVault({ misses, onDrill }: { misses: MissRecord[]; onDrill: (qs: Question[], label: string) => void }) {
  const open = misses.filter((m) => !m.cleared);
  const repeat = open.filter((m) => m.times > 1);
  const [filter, setFilter] = useState<MissFilter>(open.length ? "open" : "all");
  const [showAll, setShowAll] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const list = filter === "open" ? open : filter === "repeat" ? repeat : misses;
  const shown = showAll ? list : list.slice(0, 6);
  const drillLabel = filter === "open" ? `${list.length} open misses, untimed` : filter === "repeat" ? `${list.length} repeat misses, untimed` : `All ${list.length} mock misses, untimed`;
  return (
    <section id="mock-misses" className="scroll-mt-24">
      <SectionTitle
        right={
          <FilterChips
            lensId="mock-miss-lens"
            label="Filter misses"
            value={filter}
            onChange={(v) => { setFilter(v); setShowAll(false); setOpenId(null); }}
            options={[
              { id: "open", label: "Open", n: open.length },
              { id: "repeat", label: "Repeats", n: repeat.length },
              { id: "all", label: "All", n: misses.length, always: true },
            ]}
          />
        }
      >
        Mock misses
      </SectionTitle>
      <Card>
        {list.length === 0 ? (
          <CardBody className="flex items-center gap-3 text-sm">
            <CircleCheck size={18} className="shrink-0 text-[var(--success)]" />
            <span className="min-w-0 flex-1">Every mock miss is cleared.</span>
          </CardBody>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3 sm:px-5">
              <span className="text-xs text-[var(--muted)]">
                {filter === "all" ? `${open.length} open, ${misses.length - open.length} cleared since` : "Cleared once you answer them right"}
              </span>
              <Button variant="outline" size="sm" onClick={() => onDrill(list.map((m) => m.q), drillLabel)} className="h-11 shrink-0 sm:h-9">
                <RotateCcw size={13} /> Drill {list.length}
              </Button>
            </div>
            <ul className="divide-y divide-[var(--border)]">
              {shown.map((m) => {
                const isOpen = openId === m.q.id;
                const code = getCompetency(m.q.competencyId)?.code ?? m.q.bokRef;
                return (
                  <li key={m.q.id}>
                    <button
                      type="button"
                      onClick={() => { haptic("tap"); setOpenId(isOpen ? null : m.q.id); }}
                      aria-expanded={isOpen}
                      aria-label={isOpen ? `Collapse: ${m.q.stem.slice(0, 80)}` : undefined}
                      className={ROW_BUTTON}
                    >
                      <span className="min-w-0 flex-1">
                        {!isOpen && <span className="mb-1 line-clamp-2 text-sm font-medium">{m.q.stem}</span>}
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                          <span className="font-semibold tabular-nums">{code}</span>
                          {m.q.trapType !== "none" && <span className="text-[var(--warning)]">{TRAP_LABEL[m.q.trapType] ?? m.q.trapType}</span>}
                          {m.times > 1 && <span className="font-semibold text-[var(--danger)]">missed ×{m.times}</span>}
                          <span>{m.lastSkipped ? "left blank" : `you ${[...m.lastChosen].sort().join(", ")}`} → {correctLabels(m.q).join(", ")}</span>
                          {m.cleared && <span className="inline-flex items-center gap-0.5 font-semibold text-[var(--success)]"><Check size={12} /> cleared</span>}
                        </span>
                      </span>
                      <ChevronDown size={16} className={cn("mt-1 shrink-0 text-[var(--muted)] transition-transform", isOpen && "rotate-180")} />
                    </button>
                    {isOpen && (
                      <div className="border-t border-[var(--border)] px-4 py-4 sm:px-5">
                        <QuestionView question={m.q} selected={m.lastChosen} onToggle={() => {}} revealed disabled />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            {list.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="min-h-11 w-full cursor-pointer border-t border-[var(--border)] px-5 py-3 text-center text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--surface-2)]"
              >
                {showAll ? "Show fewer" : `Show all ${list.length}`}
              </button>
            )}
          </>
        )}
      </Card>
    </section>
  );
}

// ─── Landing: history ───

function PastPapers({ history, onOpen }: { history: MockSession[]; onOpen: (m: MockSession) => void }) {
  const [all, setAll] = useState(false);
  const pass = getActiveMeta().passScaled;
  const shown = all ? history : history.slice(0, 6);
  return (
    <section>
      <SectionTitle>Past papers</SectionTitle>
      <Card>
        <ul className="divide-y divide-[var(--border)]">
          {shown.map((m) => {
            const ok = (m.scaledScore ?? 0) >= pass;
            const total = m.questionIds.length;
            const answered = Object.values(m.answers).filter((a) => a.length > 0).length;
            const partial = total > 0 && answered / total < 0.5;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => onOpen(m)}
                  aria-label={`Review ${m.examName ?? "mock exam"}: ${m.scaledScore ?? "no score"}, ${ok ? "pass" : "fail"}, ${fmtDay(m.finishedAt ?? m.startedAt)}`}
                  className={cn(ROW_BUTTON, "items-center")}
                >
                  <Badge tone={ok ? "success" : "danger"} className="w-12 shrink-0 justify-center py-1 text-sm tabular-nums">{m.scaledScore ?? "—"}</Badge>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{m.examName ?? "Mock exam"}</span>
                    <span className="flex min-w-0 gap-x-3 overflow-hidden whitespace-nowrap text-xs text-[var(--muted)]">
                      <span className={cn("font-semibold", ok ? TONE_TEXT.success : TONE_TEXT.danger)}>{ok ? "Pass" : "Fail"}</span>
                      <span className="tabular-nums">{m.correctCount ?? 0}/{total} correct</span>
                      {partial && <span className="text-[var(--warning)]">{answered} answered</span>}
                      <span className="truncate">{fmtDay(m.finishedAt ?? m.startedAt)}</span>
                    </span>
                  </span>
                  <ChevronRight size={16} aria-hidden className="shrink-0 text-[var(--muted)]" />
                </button>
              </li>
            );
          })}
        </ul>
        {history.length > 6 && (
          <button
            type="button"
            onClick={() => setAll((v) => !v)}
            className="min-h-11 w-full cursor-pointer border-t border-[var(--border)] px-5 py-3 text-center text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--surface-2)]"
          >
            {all ? "Show fewer" : `Show all ${history.length} papers`}
          </button>
        )}
      </Card>
    </section>
  );
}

// ─── Run ───

function ExamTimer({ ms }: { ms: number }) {
  const low = ms < 5 * 60_000;
  const warn = ms < 10 * 60_000;
  return (
    <div
      role="timer"
      aria-label={`${fmtTime(ms)} left`}
      className={cn(
        "flex shrink-0 items-center gap-1.5 font-display text-[19px] font-bold tabular-nums sm:text-[22px]",
        low ? "text-[var(--danger)]" : warn ? "text-[var(--warning)]" : "text-[var(--foreground)]"
      )}
    >
      <Clock size={17} aria-hidden className={cn(!low && !warn && "text-[var(--muted)]")} />
      {fmtTime(ms)}
    </div>
  );
}

// At-a-glance paper state: one segment per question; tap to open the list.
function ProgressStrip({ set, answers, flags, idx, open, onToggle }: { set: Question[]; answers: Record<string, string[]>; flags: string[]; idx: number; open: boolean; onToggle: () => void }) {
  const n = set.length;
  const answered = set.filter((qq) => (answers[qq.id]?.length ?? 0) > 0).length;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={`${open ? "Hide" : "Show"} question list — ${answered} of ${n} answered${flags.length ? `, ${flags.length} flagged` : ""}`}
      className="group mt-2.5 flex w-full cursor-pointer items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      <span aria-hidden className="flex h-2 min-w-0 flex-1 gap-px overflow-hidden rounded-full">
        {set.map((qq, i) => {
          const done = (answers[qq.id]?.length ?? 0) > 0;
          const fl = flags.includes(qq.id);
          return (
            <span
              key={qq.id}
              className={cn(
                "h-full min-w-0 flex-1",
                i === idx ? "bg-[var(--foreground)]" : fl ? "bg-[var(--warning)]" : done ? "bg-[var(--primary)]" : "bg-[var(--muted)]/25"
              )}
            />
          );
        })}
      </span>
      <span className="shrink-0 text-xs font-semibold tabular-nums text-[var(--muted)] group-hover:text-[var(--foreground)]">
        {answered}/{n}<span className="hidden sm:inline"> answered</span>
      </span>
      <ChevronDown size={14} aria-hidden className={cn("shrink-0 text-[var(--muted)] transition-transform", open && "rotate-180")} />
    </button>
  );
}

function SubmitNotice({ blank, flagged, onReviewBlanks, onCancel }: { blank: number; flagged: number; onReviewBlanks: () => void; onCancel: () => void }) {
  return (
    <div role="alert" className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--border)] pt-3">
      <span className="min-w-0 basis-full text-sm sm:flex-1 sm:basis-auto">
        <span className="font-semibold">{blank > 0 ? `${blank} blank — they score zero.` : "Every question answered."}</span>
        {flagged > 0 && <span className="text-[var(--warning)]"> {flagged} flagged.</span>}
        <span className="text-[var(--muted)]"> Tap again to submit.</span>
      </span>
      <span className="-ml-3 flex items-center gap-1 sm:ml-0">
        {blank > 0 && <Button variant="ghost" size="sm" onClick={onReviewBlanks} className="h-11 sm:h-9">Review blanks</Button>}
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-11 sm:h-9">Keep going</Button>
      </span>
    </div>
  );
}

function NavigatorBody({
  set,
  answers,
  flags,
  idx,
  filter,
  onFilter,
  onJump,
  confirmArm,
  onSubmit,
  scroll,
}: {
  set: Question[];
  answers: Record<string, string[]>;
  flags: string[];
  idx: number;
  filter: NavFilter;
  onFilter: (f: NavFilter) => void;
  onJump: (i: number) => void;
  confirmArm: boolean;
  onSubmit: () => void;
  scroll: boolean;
}) {
  const items = set.map((qq, i) => ({ qq, i, done: (answers[qq.id]?.length ?? 0) > 0, fl: flags.includes(qq.id) }));
  const blank = items.filter((x) => !x.done).length;
  const flagged = items.filter((x) => x.fl).length;
  // A filter that has emptied out (last blank answered) falls back to All.
  const eff: NavFilter = (filter === "blank" && blank === 0) || (filter === "flagged" && flagged === 0) ? "all" : filter;
  const shown = eff === "blank" ? items.filter((x) => !x.done) : eff === "flagged" ? items.filter((x) => x.fl) : items;
  return (
    <div className={cn("flex flex-col", scroll && "min-h-0 flex-1")}>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <FilterChips
          lensId="mock-nav-lens"
          label="Filter questions"
          value={eff}
          onChange={onFilter}
          options={[
            { id: "all", label: "All", n: set.length, always: true },
            { id: "blank", label: "Blank", n: blank },
            { id: "flagged", label: "Flagged", n: flagged },
          ]}
        />
        <span className="text-xs text-[var(--muted)]">Flags clear on pause</span>
      </div>
      <div className={cn("mt-3 grid grid-cols-7 gap-1.5 p-1 sm:grid-cols-10 md:grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))]", scroll && "min-h-0 flex-1 overflow-y-auto")}>
        {shown.map(({ qq, i, done, fl }) => (
          <Button
            key={qq.id}
            variant={done ? "primary" : "outline"}
            onClick={() => onJump(i)}
            aria-label={`Question ${i + 1}, ${done ? "answered" : "blank"}${fl ? ", flagged" : ""}`}
            aria-current={i === idx ? "step" : undefined}
            className={cn(
              "relative h-11 w-full rounded-[12px] px-0 text-sm tabular-nums shadow-none md:h-10",
              i === idx && "ring-2 ring-[var(--foreground)] ring-offset-2 ring-offset-[var(--surface)]"
            )}
          >
            {i + 1}
            {fl && (
              <span aria-hidden className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-[var(--warning)] text-white ring-2 ring-[var(--surface)]">
                <Flag size={9} className="fill-current" />
              </span>
            )}
          </Button>
        ))}
      </div>
      <div className="mt-3 flex shrink-0 items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
        <span className="flex min-w-0 flex-wrap gap-x-3 text-xs text-[var(--muted)]">
          <span>{blank > 0 ? <><span className="font-semibold text-[var(--foreground)]">{blank} blank</span> — they score zero</> : "All answered"}</span>
          {flagged > 0 && <span className="font-semibold text-[var(--warning)]">{flagged} flagged</span>}
        </span>
        <Button size="sm" variant={confirmArm ? "primary" : "outline"} onClick={onSubmit} className="h-11 shrink-0 sm:h-9">
          {confirmArm ? "Sure? Submit" : "Submit exam"}
        </Button>
      </div>
    </div>
  );
}

// ─── Results ───

// The 100–500 scale as a glass tube: the exam's liquid pours up to your score, the
// pass mark is etched across it, and a hollow ring marks your last attempt.
function PassScale({ score, pass, prev }: { score: number; pass: number; prev?: number }) {
  const reduce = useReducedMotion();
  const p = scalePct(score);
  const passP = scalePct(pass);
  const ok = score >= pass;
  return (
    <div aria-hidden>
      <div className="relative h-7">
        <div className="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 overflow-hidden rounded-full border border-[var(--glass-edge)] bg-[var(--surface-2)]">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${p}%`, background: "linear-gradient(90deg, var(--glow), var(--primary))" }}
            initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1], delay: 0.15 }}
          />
          <div className="absolute inset-x-2 top-[2px] h-px rounded-full bg-[var(--glass-highlight)]" />
        </div>
        <div className="absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full bg-[var(--foreground)]/80" style={{ left: `${passP}%` }} />
        {prev !== undefined && prev !== score && (
          <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--muted)] bg-[var(--surface)]" style={{ left: `${scalePct(prev)}%` }} />
        )}
        <span
          className={cn("absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] bg-[var(--surface)] shadow-[var(--e2)]", ok ? "border-[var(--success)]" : "border-[var(--danger)]")}
          style={{ left: `${p}%` }}
        />
      </div>
      <div className="relative mt-1 h-4 text-[11px] font-medium tabular-nums text-[var(--muted)]">
        <span className="absolute left-0">100</span>
        <span className="absolute -translate-x-1/2 font-semibold text-[var(--foreground)]" style={{ left: `${passP}%` }}>Pass {pass}</span>
        <span className="absolute right-0">500</span>
      </div>
    </div>
  );
}

function VerdictCard({
  session,
  pass,
  prev,
  newBest,
  fresh,
  timeUp,
  rows,
  children,
}: {
  session: MockSession;
  pass: number;
  prev?: number;
  newBest: boolean;
  fresh: boolean; // just finished (not a review of an old paper)
  timeUp: boolean;
  rows: { q: Question; chosen: string[]; ok: boolean }[];
  children: ReactNode;
}) {
  const score = session.scaledScore ?? 0;
  const ok = score >= pass;
  const blank = rows.filter((r) => r.chosen.length === 0).length;
  const wrong = rows.filter((r) => !r.ok && r.chosen.length > 0).length;
  const total = session.questionIds.length;
  const stats: { label: string; value: ReactNode; tone?: Tone }[] = [
    { label: "Correct", value: `${session.correctCount ?? 0}/${total}` },
    { label: "Missed", value: wrong, tone: wrong ? "danger" : undefined },
    { label: "Blank", value: blank, tone: blank ? "warning" : undefined },
    { label: "Time", value: fmtDuration(session.durationMs) ?? "—" },
  ];
  return (
    <Card className="mesh">
      <CardBody className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className={cn("inline-flex items-center gap-2 font-display text-[26px] font-extrabold leading-none", ok ? TONE_TEXT.success : TONE_TEXT.danger, fresh && ok && "anim-pop")}>
            {ok ? <CircleCheck size={24} strokeWidth={2.4} /> : <CircleX size={24} strokeWidth={2.4} />}
            {ok ? "Pass" : "Fail"}
          </span>
          {newBest && <Badge tone="primary"><Trophy size={12} /> New best</Badge>}
          {timeUp && <Badge tone="warning"><Clock size={12} /> Time ran out — auto-submitted</Badge>}
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-1">
          <span className="flex items-baseline gap-1.5">
            <AnimatedNumber value={score} className="font-display text-[56px] font-extrabold leading-none tracking-tight" />
            <span className="text-lg font-medium text-[var(--muted)]">/ 500</span>
          </span>
          {prev !== undefined && <span className="pb-1.5"><Delta value={score - prev} suffix=" vs last attempt" /></span>}
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">{Math.abs(score - pass)} {ok ? "above" : "below"} the {pass} pass line</p>
        <div className="mt-5">
          <PassScale score={score} pass={pass} prev={prev} />
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="min-w-0">
              <dt className="text-xs text-[var(--muted)]">{s.label}</dt>
              <dd className={cn("mt-0.5 font-display text-xl font-bold tabular-nums", s.tone && TONE_TEXT[s.tone])}>{s.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 border-t border-[var(--border)] pt-5">{children}</div>
      </CardBody>
    </Card>
  );
}

function ResultActions({ missCount, onDrill, retakeDef, guard, onRetake, onBack, showBack }: { missCount: number; onDrill: () => void; retakeDef: ExamDef | null; guard: boolean; onRetake: () => void; onBack: () => void; showBack: boolean }) {
  const { armed, fire } = useGuardedStart(guard, onRetake);
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {missCount > 0 ? (
        <Button onClick={onDrill} className="h-12 sm:h-11"><RotateCcw size={16} /> Drill {missCount} miss{missCount === 1 ? "" : "es"}</Button>
      ) : (
        <Button onClick={onBack} className="h-12 sm:h-11">Choose the next paper <ArrowRight size={16} /></Button>
      )}
      {retakeDef && (
        <Button variant={armed ? "danger" : "outline"} onClick={fire} className="h-12 sm:h-11">
          {armed ? "Replaces paused exam — sure?" : <><RotateCcw size={15} /> Retake {retakeDef.name}</>}
        </Button>
      )}
      {missCount > 0 && showBack && <Button variant="ghost" onClick={onBack} className="h-12 sm:h-11">All papers</Button>}
    </div>
  );
}

type ReviewFilter = "misses" | "correct" | "all";

function ReviewList({ rows, retired }: { rows: { q: Question; chosen: string[]; ok: boolean }[]; retired: number }) {
  const numbered = rows.map((r, i) => ({ ...r, n: i + 1 }));
  const missCount = rows.filter((r) => !r.ok).length;
  const [filter, setFilter] = useState<ReviewFilter>(missCount > 0 ? "misses" : "all");
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [limit, setLimit] = useState(20);
  const list = filter === "misses" ? numbered.filter((r) => !r.ok) : filter === "correct" ? numbered.filter((r) => r.ok) : numbered;
  const shown = list.slice(0, limit);
  return (
    <section>
      <SectionTitle
        right={
          <FilterChips
            lensId="mock-review-lens"
            label="Filter questions"
            value={filter}
            onChange={(v) => { setFilter(v); setLimit(20); }}
            options={[
              { id: "misses", label: "Misses", n: missCount },
              { id: "correct", label: "Correct", n: rows.length - missCount },
              { id: "all", label: "All", n: rows.length, always: true },
            ]}
          />
        }
      >
        Question review
      </SectionTitle>
      {retired > 0 && <p className="mb-3 text-xs text-[var(--muted)]">{retired} retired question{retired === 1 ? "" : "s"} not shown.</p>}
      <Card>
        {list.length === 0 ? (
          <CardBody className="flex items-center gap-3 text-sm">
            <CircleCheck size={18} className="shrink-0 text-[var(--success)]" /> Clean sweep — nothing missed.
          </CardBody>
        ) : (
          <>
            <ul className="divide-y divide-[var(--border)]">
              {shown.map((r) => (
                <ReviewRow
                  key={r.q.id}
                  n={r.n}
                  q={r.q}
                  chosen={r.chosen}
                  ok={r.ok}
                  open={openIds.includes(r.q.id)}
                  onToggle={() => {
                    haptic("tap");
                    setOpenIds((ids) => (ids.includes(r.q.id) ? ids.filter((x) => x !== r.q.id) : [...ids, r.q.id]));
                  }}
                />
              ))}
            </ul>
            {list.length > limit && (
              <button
                type="button"
                onClick={() => setLimit((l) => l + 20)}
                className="min-h-11 w-full cursor-pointer border-t border-[var(--border)] px-5 py-3 text-center text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--surface-2)]"
              >
                Show {Math.min(20, list.length - limit)} more, {list.length - limit} left
              </button>
            )}
          </>
        )}
      </Card>
    </section>
  );
}

function ReviewRow({ n, q, chosen, ok, open, onToggle }: { n: number; q: Question; chosen: string[]; ok: boolean; open: boolean; onToggle: () => void }) {
  const blank = chosen.length === 0;
  const tone: Tone = ok ? "success" : blank ? "warning" : "danger";
  const code = getCompetency(q.competencyId)?.code;
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={open ? `Collapse question ${n}` : undefined}
        className={ROW_BUTTON}
      >
        <span className={cn("mt-0.5 shrink-0", TONE_TEXT[tone])}>
          {ok ? <Check size={16} /> : blank ? <Minus size={16} /> : <X size={16} />}
        </span>
        <span className="min-w-0 flex-1">
          {!open && <span className="mb-1 line-clamp-2 text-sm font-medium">{q.stem}</span>}
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
            <span className="tabular-nums">#{n}</span>
            <span className={cn("font-semibold", TONE_TEXT[tone])}>{ok ? "Correct" : blank ? "Blank" : "Missed"}</span>
            {!ok && <span>{blank ? "no answer" : `you ${[...chosen].sort().join(", ")}`} → {correctLabels(q).join(", ")}</span>}
            {code && <span className="tabular-nums">{code}</span>}
            {q.trapType !== "none" && <span className="text-[var(--warning)]">{TRAP_LABEL[q.trapType] ?? q.trapType}</span>}
          </span>
        </span>
        <ChevronDown size={16} className={cn("mt-1 shrink-0 text-[var(--muted)] transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-[var(--border)] px-4 py-4 sm:px-5">
          <QuestionView question={q} selected={chosen} onToggle={() => {}} revealed disabled />
        </div>
      )}
    </li>
  );
}
