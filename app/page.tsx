"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, CalendarDays, CloudOff, Flame, Target, X } from "lucide-react";
import { allCompetencyMastery, computeReadiness } from "@/lib/readiness";
import { DAILY_GOAL_XP, LESSON_PASS, streakAlive, todayStr } from "@/lib/gamify";
import { getActiveMeta, getCompetency, getTopics } from "@/lib/content";
import { cn, daysUntil } from "@/lib/utils";
import { useHydrated, useProgress } from "@/store/progress";
import { firstNameOf } from "@/lib/account";
import { useSession } from "@/components/account";
import { Card, CardBody } from "@/components/ui";
import { m, MotionBar, Reveal, springSoft } from "@/components/motion";
import { CurriculumBoard, NavButton, NextStep, useCurriculum } from "@/components/curriculum";
import type { Attempt, Readiness, Verdict } from "@/lib/types";

const VERDICT: Record<Verdict, { label: string; color: string }> = {
  ready: { label: "Exam ready", color: "var(--success)" },
  almost: { label: "Almost there", color: "var(--warning)" },
  "not-yet": { label: "Not yet ready", color: "var(--danger)" },
  unknown: { label: "Building your baseline", color: "var(--muted)" },
};

// Mirrors lib/readiness.ts: a verdict needs 10 answers; "ready" needs a
// projected score of 92%+ (the safe margin), on the IAPP 100–500 scale.
const BASELINE_ANSWERS = 10;
const SAFE_PCT = 0.92;
const toScaled = (pct: number) => Math.round(100 + pct * 400);

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Late-night session";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// The lowest-mastery competency we have real signal on (cold-start noise excluded).
function weakSpot(attempts: Attempt[]) {
  if (attempts.length < BASELINE_ANSWERS) return null;
  const w = allCompetencyMastery(attempts)
    .filter((c) => !c.insufficient && c.mastery < 80)
    .sort((a, b) => a.mastery - b.mastery)[0];
  const comp = w ? getCompetency(w.competencyId) : undefined;
  return w && comp ? { comp, mastery: w.mastery } : null;
}

function verdictLine(r: Readiness, pass: number, safe: number): string {
  const p = r.projectedScaled;
  const gap = p < pass ? `${pass - p} points short of the ${pass} pass mark.` : p < safe ? `Clears the ${pass} pass mark — ${safe - p} short of the ${safe} safe margin.` : `Above the ${safe} safe margin.`;
  if (r.verdict === "almost" && !r.hasMock) return `${gap} Sit a full mock to confirm.`;
  if (r.verdict === "almost" && p >= safe) return `${gap} ${r.reasons[0] ?? ""}`.trim();
  return gap;
}

export default function StudyPlanPage() {
  const hydrated = useHydrated();
  const { session, ready: sessionReady } = useSession();
  const firstName = firstNameOf(session);
  const attempts = useProgress((s) => s.attempts);
  const mocks = useProgress((s) => s.mocks);
  const examDate = useProgress((s) => s.settings.examDate);
  const streak = useProgress((s) => s.streakCount);
  const lastActive = useProgress((s) => s.lastActiveDate);
  const dailyXp = useProgress((s) => s.dailyXp);
  const dailyDate = useProgress((s) => s.dailyDate);
  const syncEnabled = useProgress((s) => s.settings.syncEnabled ?? false);
  const nudgeDismissed = useProgress((s) => s.settings.syncNudgeDismissed ?? false);
  const setSettings = useProgress((s) => s.setSettings);
  const plan = useCurriculum();

  const readiness = useMemo(() => computeReadiness(attempts, mocks), [attempts, mocks]);
  const weak = useMemo(() => weakSpot(attempts), [attempts]);

  if (!hydrated) return <PlanSkeleton />;

  const firstRun = attempts.length === 0 && plan.units.every((u) => u.rows.every((r) => r.best === null && !r.session));
  const hello = `${greeting()}${firstName ? `, ${firstName}` : ""}`;
  // Signed-in progress already backs up to the account automatically.
  const showNudge = sessionReady && !session && attempts.length >= BASELINE_ANSWERS && !syncEnabled && !nudgeDismissed;

  return (
    <div className="space-y-6">
      <Reveal>
        {firstRun ? (
          <WelcomeHero hello={hello} />
        ) : (
          <VerdictHero
            hello={hello}
            readiness={readiness}
            answers={attempts.length}
            daysLeft={daysUntil(examDate)}
            streak={streakAlive(lastActive) ? streak : 0}
            todayXp={dailyDate === todayStr() ? dailyXp : 0}
            next={<NextStep row={plan.current} />}
            weak={weak}
          />
        )}
      </Reveal>

      {showNudge && (
        <Reveal delay={0.04}>
          <Card className="border-[var(--warning)]/40">
            <CardBody className="flex items-center gap-3 py-2.5 pr-2.5">
              <CloudOff size={17} className="shrink-0 text-[var(--warning)]" aria-hidden />
              <p className="min-w-0 flex-1 text-sm font-semibold">Saved in this browser only</p>
              <NavButton href="/settings" size="sm" variant="accent" className="h-11 sm:h-9">Back it up</NavButton>
              <button
                type="button"
                aria-label="Dismiss backup reminder"
                onClick={() => setSettings({ syncNudgeDismissed: true })}
                className="press grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-2)] sm:h-9 sm:w-9"
              >
                <X size={15} />
              </button>
            </CardBody>
          </Card>
        </Reveal>
      )}

      <section aria-labelledby="curriculum-heading" className="space-y-3">
        <div className="flex items-end justify-between gap-3 px-1">
          <div>
            <h2 id="curriculum-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Curriculum
            </h2>
            <div className="mt-0.5 text-sm font-semibold">
              <span className="tabular-nums">{plan.passed}</span> of {plan.total} passed
            </div>
          </div>
          <Link href="/learn" className="inline-flex h-11 items-center gap-1.5 rounded-lg px-2 sm:h-9 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--surface-2)]">
            <BookOpen size={14} aria-hidden /> Study sheets
          </Link>
        </div>
        <CurriculumBoard headingLevel="h3" />
      </section>
    </div>
  );
}

// ── Returning learner: verdict → instrument → the one next step ──
function VerdictHero({
  hello,
  readiness,
  answers,
  daysLeft,
  streak,
  todayXp,
  next,
  weak,
}: {
  hello: string;
  readiness: Readiness;
  answers: number;
  daysLeft: number | null;
  streak: number;
  todayXp: number;
  next: ReactNode;
  weak: ReturnType<typeof weakSpot>;
}) {
  const meta = getActiveMeta();
  const v = VERDICT[readiness.verdict];
  const pass = meta.passScaled;
  const safe = toScaled(SAFE_PCT);
  const baseline = readiness.verdict === "unknown";
  const goalPct = Math.min(100, (todayXp / DAILY_GOAL_XP) * 100);

  return (
    <Card className="mesh overflow-hidden">
      <CardBody className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{hello}</div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
            {daysLeft !== null && daysLeft >= 0 && (
              <span className={cn("inline-flex items-center gap-1 font-semibold", daysLeft <= 14 && "text-[var(--warning)]")}>
                <CalendarDays size={13} aria-hidden /> {daysLeft === 0 ? "Exam today" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} to exam`}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Flame size={13} className={streak > 0 ? "text-[var(--streak)]" : "opacity-50"} fill={streak > 0 ? "var(--streak)" : "none"} aria-hidden />
              {streak > 0 ? (
                <span>
                  <span className="font-semibold tabular-nums text-[var(--foreground)]">{streak}</span>-day streak
                </span>
              ) : (
                <span>Start a streak today</span>
              )}
            </span>
            <span className="inline-flex items-center gap-2" title={`Daily goal: ${DAILY_GOAL_XP} points`}>
              {goalPct >= 100 ? <span className="font-semibold text-[var(--success)]">Goal met</span> : "Today"}
              <MotionBar value={goalPct} tone={goalPct >= 100 ? "success" : "gold"} className="h-1.5 w-14" />
              <span className="tabular-nums">
                {todayXp}/{DAILY_GOAL_XP}
              </span>
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: v.color }} aria-hidden />
              {v.label}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {baseline
                ? `Answer ${BASELINE_ANSWERS - answers} more question${BASELINE_ANSWERS - answers === 1 ? "" : "s"} for a first read.`
                : verdictLine(readiness, pass, safe)}
            </p>
          </div>
          {!baseline && (
            <div className="shrink-0 text-right">
              <div className="text-3xl font-bold leading-none tabular-nums">{readiness.projectedScaled}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">projected</div>
            </div>
          )}
        </div>

        {baseline ? (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs text-[var(--muted)]">
              <span>Baseline</span>
              <span className="tabular-nums">
                {answers}/{BASELINE_ANSWERS} answers
              </span>
            </div>
            <MotionBar value={(answers / BASELINE_ANSWERS) * 100} tone="accent" className="h-2" />
          </div>
        ) : (
          <>
            <ScaleGauge value={readiness.projectedScaled} pass={pass} safe={safe} color={v.color} className="mt-4" />
            <div className="mt-2.5 flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
              <span>
                Readiness <span className="font-semibold tabular-nums text-[var(--foreground)]">{readiness.overall}</span>/100
              </span>
              <Link href="/profile" className="inline-flex h-11 items-center gap-1 sm:h-8 font-semibold text-[var(--accent)] hover:underline">
                Full breakdown <ArrowRight size={12} aria-hidden />
              </Link>
            </div>
          </>
        )}
      </CardBody>

      <div className="border-t border-[var(--border)] px-5 py-4 sm:px-6">
        {next}
        {weak && (
          <div className="mt-3 flex items-center gap-2 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
            <Target size={13} className="shrink-0 text-[var(--accent)]" aria-hidden />
            <span className="min-w-0 truncate">
              Weak spot: <span className="font-semibold text-[var(--foreground)]">{weak.comp.code} {weak.comp.name}</span> · {weak.mastery}% mastery
            </span>
            <Link href={`/practice?competency=${weak.comp.id}`} className="ml-auto inline-flex h-11 shrink-0 items-center gap-1 sm:h-8 font-semibold text-[var(--accent)] hover:underline">
              Drill it <ArrowRight size={12} aria-hidden />
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}

// Where the projection sits on the exam's 100–500 scale: below the pass mark,
// between pass and the safe margin, or clear of it.
function ScaleGauge({ value, pass, safe, color, className }: { value: number; pass: number; safe: number; color: string; className?: string }) {
  const reduce = useReducedMotion();
  const pos = (s: number) => Math.max(0, Math.min(100, ((s - 100) / 400) * 100));
  return (
    <div className={cn("relative pt-5", className)} role="img" aria-label={`Projected ${value} of 500. Pass mark ${pass}, safe margin ${safe}.`}>
      <span className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]" style={{ left: `${pos(pass)}%` }}>
        Pass {pass}
      </span>
      <span className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]" style={{ left: `${pos(safe)}%` }}>
        Safe {safe}
      </span>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div className="absolute inset-y-0 left-0 bg-[var(--danger)]/20" style={{ width: `${pos(pass)}%` }} />
        <div className="absolute inset-y-0 bg-[var(--warning)]/20" style={{ left: `${pos(pass)}%`, width: `${pos(safe) - pos(pass)}%` }} />
        <div className="absolute inset-y-0 right-0 bg-[var(--success)]/25" style={{ left: `${pos(safe)}%` }} />
        <div className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-[var(--surface)]" style={{ left: `${pos(pass)}%` }} />
        <div className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-[var(--surface)]" style={{ left: `${pos(safe)}%` }} />
      </div>
      <m.span
        className="absolute -bottom-[3px] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[var(--surface)]"
        style={{ background: color }}
        initial={reduce ? false : { left: "0%" }}
        animate={{ left: `${pos(value)}%` }}
        transition={springSoft}
      />
    </div>
  );
}

// ── Brand-new learner: what this is, how a lesson works, the first lesson ──
function WelcomeHero({ hello }: { hello: string }) {
  const meta = getActiveMeta();
  const plan = useCurriculum();
  const lessons = plan.units.reduce((n, u) => n + u.rows.filter((r) => r.kind === "lesson").length, 0);
  const steps = [
    { title: "Read a topic", sub: "Concept + example" },
    { title: "Answer on it", sub: "Exam-style question" },
    { title: `Pass at ${Math.round(LESSON_PASS * 100)}%`, sub: "Then the domain test" },
  ];
  return (
    <Card className="mesh overflow-hidden">
      <CardBody className="p-5 sm:p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{hello}</div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Your {meta.name} study plan</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {plan.units.length} domains · {lessons} lessons · {getTopics().length} topics, in blueprint order.
        </p>
        <ol className="mt-5 grid grid-cols-3 gap-2 sm:gap-3" aria-label="How a lesson works">
          {steps.map((s, i) => (
            <li key={s.title} className="min-w-0">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--primary)]/15 text-[11px] font-bold text-[var(--primary)]">{i + 1}</span>
              <div className="mt-2 text-sm font-semibold leading-tight">{s.title}</div>
              <div className="mt-0.5 text-xs leading-snug text-[var(--muted)]">{s.sub}</div>
            </li>
          ))}
        </ol>
      </CardBody>
      <div className="border-t border-[var(--border)] px-5 py-4 sm:px-6">
        <NextStep row={plan.current} firstRun />
        <p className="mt-3 text-xs text-[var(--muted)]">Readiness unlocks after {BASELINE_ANSWERS} answers.</p>
      </div>
    </Card>
  );
}

function PlanSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <span className="sr-only">Loading your study plan…</span>
      <Card className="h-72 motion-safe:animate-pulse" />
      <Card className="h-80 motion-safe:animate-pulse" />
    </div>
  );
}
