"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { BookOpen, Check, CheckCircle2, ChevronDown, History, Lightbulb, RotateCcw, SearchX, Target, X } from "lucide-react";
import {
  getActiveMeta,
  getCompetenciesByDomain,
  getCompetency,
  getDomain,
  getDomains,
  getFlashcards,
  getQuestion,
  getQuestionsByCompetency,
  getTopicForQuestion,
  getTopicsByCompetency,
} from "@/lib/content";
import { isAnswerCorrect, shuffle } from "@/lib/scoring";
import { LESSON_PASS, XP_LESSON_BONUS, XP_TEST_BONUS } from "@/lib/gamify";
import { celebrate } from "@/lib/celebrate";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { Question, Topic } from "@/lib/types";
import { useHydrated, useProgress } from "@/store/progress";
import { Badge, Bar, Button, Card, CardBody } from "@/components/ui";
import { QuestionView } from "@/components/quiz/question-view";
import { m, Reveal, springSoft } from "@/components/motion";
import { Markdown } from "@/components/markdown";
import { NavButton, NextStep, nextAfter, TEST_LENGTH, useCurriculum } from "@/components/curriculum";

type Step =
  | { kind: "topic"; topic: Topic; index: number; count: number; questions: number }
  | { kind: "card"; card: { front: string; back: string } }
  | { kind: "q"; q: Question; topicTitle?: string; topicId?: string };

interface LessonMeta {
  title: string;
  competencyId: string | null;
  domainCode: string;
  steps: Step[];
}

interface Miss {
  q: Question;
  topicTitle?: string;
  topicId?: string;
}

interface Outcome {
  score: number;
  correct: number;
  total: number;
  prevBest: number | null;
  firstPass: boolean;
  bonus: number;
}

const PASS_PCT = Math.round(LESSON_PASS * 100);

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function scrollToTop() {
  if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const [attempt, setAttempt] = useState(0);
  // The lesson is built only after hydration: a domain test draws a random set,
  // which must not differ between the server render and the client.
  if (!hydrated) return <LessonSkeleton />;
  // A new key = a clean run (and a fresh draw of questions for a domain test).
  return <LessonLoader key={`${id}:${attempt}`} id={id} onRestart={() => setAttempt((a) => a + 1)} />;
}

function LessonLoader({ id, onRestart }: { id: string; onRestart: () => void }) {
  const [meta] = useState(() => buildLesson(id));
  return meta ? <LessonFlow id={id} meta={meta} onRestart={onRestart} /> : <ModuleNotFound />;
}

// Two-step confirm: the first press arms for 6 s, the second acts.
function useArm<K extends string>(ms = 6000) {
  const [armed, setArmed] = useState<K | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const arm = (k: K) => {
    haptic("tap");
    setArmed(k);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setArmed(null), ms);
  };
  const disarm = () => {
    clearTimeout(timer.current);
    setArmed(null);
  };
  return [armed, arm, disarm] as const;
}

// The saved in-module position, if it still matches this lesson's shape.
function readSaved(id: string, total: number): { step: number; correctCount: number; missed: Miss[] } | null {
  const sess = useProgress.getState().lessonSessions[id];
  if (!sess || sess.total !== total || sess.step <= 0 || sess.step >= total) return null;
  const missed: Miss[] = [];
  for (const qid of sess.missedIds) {
    const q = getQuestion(qid);
    if (!q) continue;
    const t = getTopicForQuestion(qid);
    missed.push({ q, topicTitle: t?.title, topicId: t?.id });
  }
  return { step: sess.step, correctCount: sess.correctCount, missed };
}

function LessonFlow({ id, meta, onRestart }: { id: string; meta: LessonMeta; onRestart: () => void }) {
  const router = useRouter();
  const isTest = id.startsWith("test-");
  const steps = meta.steps;
  const totalQ = steps.filter((s) => s.kind === "q").length;
  const recordAttempt = useProgress((s) => s.recordAttempt);
  const completeLesson = useProgress((s) => s.completeLesson);
  const saveLessonSession = useProgress((s) => s.saveLessonSession);
  const clearLessonSession = useProgress((s) => s.clearLessonSession);
  const sound = useProgress((s) => s.settings.sound ?? false);

  // Resume where the learner stopped (domain tests are short and re-drawn: always fresh).
  const [saved] = useState(() => (isTest ? null : readSaved(id, steps.length)));
  const [step, setStep] = useState(saved?.step ?? 0);
  const [correctCount, setCorrectCount] = useState(saved?.correctCount ?? 0);
  const [missed, setMissed] = useState<Miss[]>(saved?.missed ?? []);
  // Right/wrong per question step, for the step track (rebuilt from the saved misses on resume).
  const [results, setResults] = useState<Record<number, boolean>>(() => {
    const r: Record<number, boolean> = {};
    if (!saved) return r;
    const missedIds = new Set(saved.missed.map((mm) => mm.q.id));
    steps.forEach((s, i) => {
      if (i < saved.step && s.kind === "q") r[i] = !missedIds.has(s.q.id);
    });
    return r;
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [armed, arm, disarm] = useArm<"restart" | "exit">();
  const reduceMotion = useReducedMotion();
  const startedAt = useRef(0);

  // Per-question answer timing starts when each step appears.
  useEffect(() => {
    startedAt.current = Date.now();
  }, [step]);

  if (outcome) return <LessonResults id={id} meta={meta} outcome={outcome} missed={missed} onRetake={onRestart} />;

  const cur = steps[step];
  const last = step + 1 >= steps.length;

  function finish(finalCorrect: number) {
    const score = totalQ ? finalCorrect / totalQ : 1;
    const prevBest = useProgress.getState().lessons[id]?.bestScore ?? null;
    const bonus = isTest ? XP_TEST_BONUS : XP_LESSON_BONUS;
    completeLesson(id, score, bonus); // the store awards the bonus on the first pass only
    clearLessonSession(id);
    if (score >= LESSON_PASS) haptic(isTest ? "milestone" : "success");
    if (isTest && score >= LESSON_PASS) celebrate({ sound, big: false });
    setOutcome({ score, correct: finalCorrect, total: totalQ, prevBest, firstPass: score >= LESSON_PASS && (prevBest ?? 0) < LESSON_PASS, bonus });
    scrollToTop();
  }

  function next() {
    haptic("tap");
    disarm();
    if (last) return finish(correctCount);
    if (!isTest) {
      saveLessonSession(id, { step: step + 1, correctCount, missedIds: missed.map((mm) => mm.q.id), total: steps.length, updatedAt: Date.now() });
    }
    setStep((s) => s + 1);
    setSelected([]);
    setRevealed(false);
    scrollToTop(); // each card starts at its top, even after a long read
  }

  function toggle(label: string, q: Question) {
    if (q.isMultiselect) setSelected((s) => (s.includes(label) ? s.filter((x) => x !== label) : [...s, label]));
    else setSelected([label]);
  }

  function check(q: Question, topicTitle?: string, topicId?: string) {
    if (selected.length === 0) return;
    const correct = isAnswerCorrect(q, selected);
    recordAttempt({ questionId: q.id, competencyId: q.competencyId, chosen: selected, correct, confidence: 2, timeMs: Date.now() - startedAt.current, mode: isTest ? "mock" : "practice" });
    haptic(correct ? "success" : "error");
    if (correct) setCorrectCount((c) => c + 1);
    else setMissed((prev) => [...prev, { q, topicTitle, topicId }]);
    setResults((r) => ({ ...r, [step]: correct }));
    setRevealed(true);
  }

  function startOver() {
    clearLessonSession(id);
    onRestart();
  }

  // Leaving a test mid-way loses the run, so it asks twice; a lesson keeps its place.
  const exitNeedsConfirm = isTest && (step > 0 || revealed);
  const exitCls = "press flex h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] md:h-9 md:min-w-9";
  const answered = Object.values(results);

  let action: ReactNode;
  if (cur.kind !== "q") {
    action = <Button className="w-full" onClick={next}>{last ? "See results" : cur.kind === "topic" && cur.questions > 0 ? "Got it, test me" : "Continue"}</Button>;
  } else if (!revealed) {
    action = (
      <Button className="w-full" onClick={() => check(cur.q, cur.topicTitle, cur.topicId)} disabled={selected.length === 0}>
        Check answer
      </Button>
    );
  } else {
    action = <Button className="w-full" onClick={next}>{last ? "See results" : "Continue"}</Button>;
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center gap-3">
        {exitNeedsConfirm ? (
          <button
            type="button"
            onClick={() => (armed === "exit" ? router.push("/") : arm("exit"))}
            aria-label={armed === "exit" ? "Leave the test — tap again to confirm" : "Exit test"}
            className={cn(exitCls, armed === "exit" && "text-[var(--danger)] hover:text-[var(--danger)]")}
          >
            <X size={20} aria-hidden />
            {armed === "exit" && <span className="text-[13px] font-semibold">Leave? Tap again</span>}
          </button>
        ) : (
          <Link href="/" aria-label={isTest ? "Exit test" : "Exit lesson — your place is saved"} title={isTest ? undefined : "Your place is saved"} className={exitCls}>
            <X size={20} aria-hidden />
          </Link>
        )}
        <div
          className="min-w-0 flex-1"
          role="progressbar"
          aria-label={isTest ? "Test progress" : "Lesson progress"}
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={step}
          aria-valuetext={`Step ${step + 1} of ${steps.length}. ${answered.filter(Boolean).length} right, ${answered.filter((x) => !x).length} missed.`}
        >
          <StepTrack steps={steps} step={step} results={results} />
        </div>
        <span className="shrink-0 text-[13px] font-semibold tabular-nums text-[var(--muted)]">
          {step + 1}/{steps.length}
        </span>
      </div>

      <div className="mb-2 truncate px-1 text-[13px] font-medium text-[var(--muted)]">{meta.title}</div>
      {saved && step === saved.step && !revealed && (
        <div role="status" className="mb-2 flex items-center justify-between gap-3">
          <Badge tone="accent">
            <History size={12} aria-hidden /> Resumed at step {saved.step + 1} of {steps.length}
          </Badge>
          <Button size="sm" variant="ghost" className={cn("h-11 shrink-0 sm:h-9", armed === "restart" && "text-[var(--danger)] hover:text-[var(--danger)]")} onClick={() => (armed === "restart" ? startOver() : arm("restart"))}>
            {armed === "restart" ? "Sure? Tap again" : "Start over"}
          </Button>
        </div>
      )}

      <m.div key={step} initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={springSoft}>
        {cur.kind === "topic" ? (
          <Card>
            <CardBody className="space-y-4 sm:p-6">
              <div>
                <div className="text-[13px] font-semibold text-[color-mix(in_srgb,var(--primary)_85%,var(--foreground))]">
                  Topic {cur.index + 1} of {cur.count}
                </div>
                <h2 className="mt-1 text-xl font-bold leading-snug">{cur.topic.title}</h2>
              </div>
              <div className="prose-note text-[15px] leading-relaxed">
                <Markdown>{cur.topic.conceptMd}</Markdown>
              </div>
              <ExampleBox md={cur.topic.exampleMd} />
              {cur.questions > 0 && (
                <p className="text-[13px] text-[var(--muted)]">
                  Next: {cur.questions === 1 ? "a question" : `${cur.questions} questions`} on this topic
                </p>
              )}
            </CardBody>
          </Card>
        ) : cur.kind === "card" ? (
          <Card>
            <CardBody className="min-h-40 space-y-2 sm:p-6">
              <div className="text-[13px] font-semibold text-[var(--muted)]">Key concept</div>
              <div className="text-[15px] font-semibold leading-relaxed">{cur.card.front}</div>
              <div className="prose-note text-sm text-[var(--muted)]">
                <Markdown>{cur.card.back}</Markdown>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody className="sm:p-6">
              {cur.topicTitle && (
                <div className="mb-2">
                  <Badge tone="accent">{cur.topicTitle}</Badge>
                </div>
              )}
              <QuestionView question={cur.q} selected={selected} onToggle={(l) => toggle(l, cur.q)} revealed={revealed} />
            </CardBody>
          </Card>
        )}
      </m.div>

      {/* Phone: a glass tray floating just above the dock, inside thumb reach. Desktop: inline. */}
      <div className="sticky bottom-[calc(var(--bottom-nav-h)_+_max(0px,_env(safe-area-inset-bottom)_-_10px)_+_6px)] z-10 mt-4 p-2 md:static md:mt-5 md:p-0">
        <span aria-hidden className="glass-float pointer-events-none absolute inset-0 -z-10 rounded-[24px] md:hidden" />
        {action}
      </div>
    </div>
  );
}

// One segment per step: read cards glow, answers show right or wrong, the current
// step is a neutral marker. Long lessons fall back to the liquid bar.
function StepTrack({ steps, step, results }: { steps: Step[]; step: number; results: Record<number, boolean> }) {
  if (steps.length > 40) return <Bar value={(step / steps.length) * 100} className="h-2" />;
  return (
    <div className="flex h-2 gap-[3px]" aria-hidden>
      {steps.map((s, i) => {
        const r = results[i];
        const cls =
          r === true
            ? "bg-[var(--success)]"
            : r === false
              ? "bg-[var(--danger)]"
              : i === step
                ? "bg-[var(--foreground)]/35"
                : i < step
                  ? "bg-[var(--glow)]/70"
                  : "bg-[var(--surface-2)]";
        return <span key={i} className={cn("h-full min-w-0 flex-1 rounded-full motion-safe:transition-colors motion-safe:duration-300", cls)} />;
      })}
    </div>
  );
}

function ExampleBox({ md }: { md: string }) {
  return (
    <div className="rounded-[14px] bg-[var(--accent)]/7 p-4">
      <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[color-mix(in_srgb,var(--accent)_85%,var(--foreground))]">
        <Lightbulb size={14} aria-hidden /> Example
      </div>
      <div className="prose-note text-sm leading-relaxed">
        <Markdown>{md}</Markdown>
      </div>
    </div>
  );
}

// ── Results: verdict, then the obvious next step, then what to revisit ──

interface MissGroup {
  key: string;
  title: string;
  href: string;
  cta: string;
  short: string; // compact label for the footer row
  items: Question[];
}

function groupMisses(missed: Miss[], isTest: boolean): MissGroup[] {
  const groups = new Map<string, MissGroup>();
  for (const mm of missed) {
    let g: MissGroup;
    if (isTest) {
      // Domain tests: group by competency, so the drill target is obvious.
      const c = getCompetency(mm.q.competencyId);
      g = groups.get(mm.q.competencyId) ?? { key: mm.q.competencyId, title: c ? `${c.code} ${c.name}` : mm.q.bokRef, href: `/practice?competency=${mm.q.competencyId}`, cta: `Drill ${c?.code ?? "these"} questions`, short: `Drill ${c?.code ?? "weakest"}`, items: [] };
    } else {
      const key = mm.topicId ?? mm.topicTitle ?? "general";
      g = groups.get(key) ?? { key, title: mm.topicTitle ?? "General", href: `/learn/${mm.q.competencyId}${mm.topicId ? `#${mm.topicId}` : ""}`, cta: "Study this topic", short: "Study topic", items: [] };
    }
    g.items.push(mm.q);
    groups.set(g.key, g);
  }
  const list = [...groups.values()];
  return isTest ? list.sort((a, b) => b.items.length - a.items.length) : list;
}

function LessonResults({ id, meta, outcome, missed, onRetake }: { id: string; meta: LessonMeta; outcome: Outcome; missed: Miss[]; onRetake: () => void }) {
  const plan = useCurriculum();
  const isTest = id.startsWith("test-");
  const passed = outcome.score >= LESSON_PASS;
  const next = passed ? nextAfter(plan.units, id) : null;
  const pct = Math.round(outcome.score * 100);
  const improved = outcome.prevBest !== null && outcome.score > outcome.prevBest;
  const groups = groupMisses(missed, isTest);
  const title = passed ? (isTest ? `Domain ${meta.domainCode} test passed` : "Module passed") : isTest ? "Test not passed yet" : "Not passed yet";
  const weakest = isTest ? groups[0] : undefined;
  const ghost = "h-11 sm:h-9";

  return (
    <Reveal className="mx-auto max-w-xl space-y-4" data-lesson-results="">
      <div className="truncate px-1 text-[13px] font-medium text-[var(--muted)]">{meta.title}</div>

      <Card className="mesh overflow-hidden">
        <CardBody className="p-5 sm:p-6">
          <h1 className="flex items-center gap-2.5 text-[26px] font-extrabold leading-[1.1] sm:text-[30px]">
            {passed ? <CheckCircle2 size={26} className="anim-pop shrink-0 text-[var(--success)]" aria-hidden /> : <RotateCcw size={24} className="shrink-0 text-[var(--warning)]" aria-hidden />}
            {title}
          </h1>
          <p className="mt-1.5 text-[15px] text-[var(--muted)]">
            {outcome.correct} of {outcome.total} correct
            {outcome.firstPass ? (
              <>
                {" "}· <span className="font-semibold text-[color-mix(in_srgb,var(--gold)_70%,var(--foreground))]">+{outcome.bonus} pts</span>
              </>
            ) : improved ? (
              <>
                {" "}· <span className="font-semibold text-[var(--success)]">new best</span>
              </>
            ) : !passed && outcome.prevBest !== null ? (
              <> · best {Math.round(outcome.prevBest * 100)}%</>
            ) : null}
          </p>
          <ScoreMeter pct={pct} passed={passed} className="mt-4" />
        </CardBody>

        <div className="border-t border-[var(--border)] px-5 py-4 sm:px-6">
          {passed ? (
            <NextStep row={next} />
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[color-mix(in_srgb,var(--warning)_80%,var(--foreground))]">
                  <RotateCcw size={14} aria-hidden /> Retake to pass
                </div>
                <div className="mt-1 font-display text-[17px] font-bold leading-snug">{isTest ? `A fresh ${TEST_LENGTH} from Domain ${meta.domainCode}` : "Run the lesson again"}</div>
                <div className="mt-0.5 text-[13px] text-[var(--muted)]">
                  {groups.length ? `${groups.length} ${isTest ? (groups.length === 1 ? "competency" : "competencies") : groups.length === 1 ? "topic" : "topics"} to revisit` : `${PASS_PCT}% passes`}
                </div>
              </div>
              <Button className="w-full shrink-0 sm:w-auto" onClick={() => { haptic("tap"); onRetake(); }}>
                {isTest ? "Retake test" : "Retake lesson"} <RotateCcw size={15} aria-hidden />
              </Button>
            </div>
          )}
        </div>
      </Card>

      {groups.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-baseline justify-between gap-3 px-5 pb-3 pt-4">
            <h2 className="text-[17px] font-bold">To revisit</h2>
            <span className="text-[13px] text-[var(--muted)]">{missed.length} missed</span>
          </div>
          <ul className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
            {groups.map((g) => (
              <MissRow key={g.key} group={g} />
            ))}
          </ul>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-center gap-1">
        <NavButton href="/" variant="ghost" size="sm" className={ghost}>
          Study plan
        </NavButton>
        {passed && (
          <Button variant="ghost" size="sm" className={ghost} onClick={() => { haptic("tap"); onRetake(); }}>
            <RotateCcw size={14} aria-hidden /> {isTest ? "New test" : "Run again"}
          </Button>
        )}
        {!isTest && meta.competencyId && (
          <NavButton href={`/learn/${meta.competencyId}`} variant="ghost" size="sm" className={ghost}>
            <BookOpen size={14} aria-hidden /> Study sheet
          </NavButton>
        )}
        {weakest && !passed && (
          <NavButton href={weakest.href} variant="ghost" size="sm" className={ghost}>
            <Target size={14} aria-hidden /> {weakest.short}
          </NavButton>
        )}
      </div>
    </Reveal>
  );
}

// The score pours in against the pass line — the result's one instrument. A pass
// fills with the exam's liquid; a miss keeps its status colour.
function ScoreMeter({ pct, passed, className }: { pct: number; passed: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const fill = passed ? "linear-gradient(90deg, var(--glow), var(--primary))" : pct >= 60 ? "var(--warning)" : "var(--danger)";
  const labelShift = pct < 10 ? "0%" : pct > 90 ? "-100%" : "-50%";
  return (
    <div className={cn("relative pb-5 pt-6", className)} role="img" aria-label={`Score ${pct}%. ${PASS_PCT}% passes.`}>
      <span className="absolute top-0 whitespace-nowrap font-display text-[15px] font-extrabold tabular-nums" style={{ left: `${pct}%`, transform: `translateX(${labelShift})` }}>
        {pct}%
      </span>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <m.div className="h-full origin-left rounded-full" style={{ background: fill }} initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: pct / 100 }} transition={{ ...springSoft, delay: 0.1 }} />
      </div>
      <span aria-hidden className="absolute top-6 h-2.5 w-0.5 -translate-x-1/2 rounded-full bg-[var(--foreground)]/45" style={{ left: `${PASS_PCT}%` }} />
      <span className="absolute bottom-0 -translate-x-1/2 whitespace-nowrap text-xs text-[var(--muted)]" style={{ left: `${PASS_PCT}%` }}>
        Pass {PASS_PCT}%
      </span>
    </div>
  );
}

function MissRow({ group }: { group: MissGroup }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="flex min-h-12 w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]/50"
      >
        <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug">{group.title}</span>
        <Badge tone="danger" className="shrink-0 whitespace-nowrap">{group.items.length} missed</Badge>
        <ChevronDown size={16} className={cn("shrink-0 text-[var(--muted)] motion-safe:transition-transform motion-safe:duration-200", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div id={panelId} className="space-y-4 px-5 pb-4">
          {group.items.map((q) => (
            <div key={q.id} className="rounded-[14px] bg-[var(--surface-2)] p-3.5 text-sm">
              <p className="font-medium leading-relaxed">{q.stem}</p>
              <p className="mt-1.5 flex gap-1.5 text-[var(--success)]">
                <Check size={14} className="mt-0.5 shrink-0" aria-hidden />
                <span className="font-semibold">{q.options.filter((o) => o.isCorrect).map((o) => o.text).join("; ")}</span>
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">{q.correctExplanation}</p>
            </div>
          ))}
          <NavButton href={group.href} variant="soft" size="sm" className="h-11 sm:h-9">
            {group.cta}
          </NavButton>
        </div>
      )}
    </li>
  );
}

function ModuleNotFound() {
  const meta = getActiveMeta();
  return (
    <Card className="mx-auto max-w-md">
      <CardBody className="py-10 text-center">
        <SearchX size={28} className="mx-auto text-[var(--muted)]" aria-hidden />
        <h1 className="mt-3 text-xl font-bold">Module not found</h1>
        <p className="mt-1 text-[15px] text-[var(--muted)]">This link doesn&apos;t match any {meta.name} module.</p>
        <div className="mt-5 flex justify-center gap-2">
          <NavButton href="/">Back to study plan</NavButton>
          <NavButton href="/learn" variant="outline">
            Study sheets
          </NavButton>
        </div>
      </CardBody>
    </Card>
  );
}

function LessonSkeleton() {
  return (
    <div className="mx-auto max-w-xl" aria-busy="true">
      <span className="sr-only">Loading lesson…</span>
      <div className="mb-5 flex h-11 items-center gap-3 md:h-9">
        <div className="h-2 flex-1 rounded-full bg-[var(--surface-2)]" />
      </div>
      <Card className="h-80 motion-safe:animate-pulse" />
    </div>
  );
}

function buildLesson(id: string): LessonMeta | null {
  if (id.startsWith("test-")) {
    const code = id.slice(5);
    const domain = getDomains().find((d) => d.code === code);
    if (!domain) return null;
    const comps = getCompetenciesByDomain(domain.id);
    const qs = shuffle(comps.flatMap((c) => getQuestionsByCompetency(c.id))).slice(0, TEST_LENGTH);
    if (qs.length === 0) return null;
    return { title: `Domain ${domain.code} test: ${domain.name}`, competencyId: null, domainCode: domain.code, steps: qs.map((q) => ({ kind: "q", q })) };
  }
  const comp = getCompetency(id);
  if (!comp) return null;
  const domainCode = getDomain(comp.domainId)?.code ?? "";

  // Topic-driven lesson: concept+example, then its exam-style question(s) — every topic, in order.
  const topics = getTopicsByCompetency(id);
  if (topics.length > 0) {
    const steps: Step[] = [];
    topics.forEach((t, i) => {
      const qs = t.questionIds.map((qid) => getQuestion(qid)).filter((q): q is Question => !!q);
      steps.push({ kind: "topic", topic: t, index: i, count: topics.length, questions: qs.length });
      for (const q of qs) steps.push({ kind: "q", q, topicTitle: t.title, topicId: t.id });
    });
    return { title: `${comp.code} ${comp.name}`, competencyId: id, domainCode, steps };
  }

  // Fallback (no topics authored yet): legacy flashcards + random questions.
  const cards = getFlashcards().filter((f) => f.competencyId === id).slice(0, 2);
  const qs = shuffle(getQuestionsByCompetency(id)).slice(0, 6);
  if (qs.length === 0) return null;
  const steps: Step[] = [...cards.map((c) => ({ kind: "card" as const, card: { front: c.front, back: c.back } })), ...qs.map((q) => ({ kind: "q" as const, q }))];
  return { title: `${comp.code} ${comp.name}`, competencyId: id, domainCode, steps };
}
