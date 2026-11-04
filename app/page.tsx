"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { BookOpen, CloudOff, Target, X } from "lucide-react";
import { allCompetencyMastery, computeReadiness, READINESS, READY_SCALED } from "@/lib/readiness";
import { DAILY_GOAL_XP, LESSON_PASS, todayStr } from "@/lib/gamify";
import { getActiveMeta, getCompetency } from "@/lib/content";
import { cn, daysUntil } from "@/lib/utils";
import { useHydrated, useProgress } from "@/store/progress";
import { useSession } from "@/components/account";
import { Badge, Bar, Card, CardBody } from "@/components/ui";
import { m, springSoft } from "@/components/motion";
import { LiquidOrb } from "@/components/liquid-orb";
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
const BASELINE_ANSWERS = READINESS.firstRead;

function useMediaQuery(query: string): boolean {
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

// The lowest-mastery competency we have real signal on (cold-start noise excluded).
function weakSpot(attempts: Attempt[]) {
  if (attempts.length < BASELINE_ANSWERS) return null;
  const w = allCompetencyMastery(attempts)
    .filter((c) => !c.insufficient && c.mastery < 80)
    .sort((a, b) => a.mastery - b.mastery)[0];
  const comp = w ? getCompetency(w.competencyId) : undefined;
  return w && comp ? { comp, mastery: w.mastery } : null;
}

// One sentence: where the projection stands against the pass mark and the safe margin.
function verdictLine(r: Readiness, pass: number, safe: number): string {
  const p = r.projectedScaled;
  const gap = p < pass ? `${pass - p} points short of the pass mark.` : p < safe ? `Passing, but ${safe - p} short of the safe margin.` : "Above the safe margin.";
  if (r.verdict === "almost" && !r.hasMock) return `${gap} Sit a full mock to confirm.`;
  if (r.verdict === "almost" && p >= safe) return `${gap} ${r.reasons[0] ?? ""}`.trim();
  return gap;
}

export default function StudyPlanPage() {
  const hydrated = useHydrated();
  const { session, ready: sessionReady } = useSession();
  const attempts = useProgress((s) => s.attempts);
  const mocks = useProgress((s) => s.mocks);
  const examDate = useProgress((s) => s.settings.examDate);
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
  // Signed-in progress already backs up to the account automatically.
  const showNudge = sessionReady && !session && attempts.length >= BASELINE_ANSWERS && !syncEnabled && !nudgeDismissed;

  return (
    <div className="space-y-6">
      {firstRun ? (
        <WelcomeHero daysLeft={daysUntil(examDate)} />
      ) : (
        <VerdictHero
          readiness={readiness}
          answers={attempts.length}
          daysLeft={daysUntil(examDate)}
          todayXp={dailyDate === todayStr() ? dailyXp : 0}
          next={<NextStep row={plan.current} />}
          weak={weak}
        />
      )}

      {showNudge && (
        <Card className="border-[var(--warning)]/40">
          <CardBody className="flex items-center gap-3 py-2.5 pr-2.5">
            <CloudOff size={17} className="shrink-0 text-[var(--warning)]" aria-hidden />
            <p className="min-w-0 flex-1 text-sm font-semibold">Not backed up yet</p>
            <NavButton href="/settings#backup" size="sm" variant="accent" className="h-11 sm:h-9">
              Back it up
            </NavButton>
            <button
              type="button"
              aria-label="Dismiss backup reminder"
              onClick={() => setSettings({ syncNudgeDismissed: true })}
              className="press grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-2)] sm:h-9 sm:w-9"
            >
              <X size={15} />
            </button>
          </CardBody>
        </Card>
      )}

      <section aria-labelledby="curriculum-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <h2 id="curriculum-heading" className="text-xl font-bold">
            Curriculum{" "}
            <span className="ml-1 font-sans text-[13px] font-medium tracking-normal text-[var(--muted)]">
              {plan.passed} of {plan.total} passed
            </span>
          </h2>
          <Link href="/learn" className="press inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] sm:h-9">
            <BookOpen size={14} aria-hidden /> Study sheets
          </Link>
        </div>
        <CurriculumBoard headingLevel="h3" />
      </section>
    </div>
  );
}

// ── Returning learner: the readiness orb with the verdict beside it, then the one next step ──
function VerdictHero({
  readiness,
  answers,
  daysLeft,
  todayXp,
  next,
  weak,
}: {
  readiness: Readiness;
  answers: number;
  daysLeft: number | null;
  todayXp: number;
  next: ReactNode;
  weak: ReturnType<typeof weakSpot>;
}) {
  const meta = getActiveMeta();
  const v = VERDICT[readiness.verdict];
  const pass = meta.passScaled;
  const safe = READY_SCALED; // the verdict's own line, so the copy never contradicts it
  const baseline = readiness.verdict === "unknown";
  const wide = useMediaQuery("(min-width: 640px)");
  const goalPct = Math.min(100, (todayXp / DAILY_GOAL_XP) * 100);
  const left = BASELINE_ANSWERS - answers;

  return (
    <Card className="mesh overflow-hidden">
      <CardBody className="p-5 sm:p-6">
        <div className="flex items-center gap-4 sm:gap-6">
          {!baseline && <LiquidOrb value={readiness.overall} size={wide ? 148 : 108} sub="readiness" />}
          <div className="min-w-0 flex-1">
            {daysLeft !== null && daysLeft >= 0 && (
              <Badge tone={daysLeft <= 14 ? "warning" : "default"} className="mb-2">
                {daysLeft === 0 ? "Exam today" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} to exam`}
              </Badge>
            )}
            <h1 className="flex items-center gap-2.5 text-[26px] font-extrabold leading-[1.1] sm:text-[32px]">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: v.color }} aria-hidden />
              {v.label}
            </h1>
            <p className="mt-1.5 text-[15px] leading-snug text-[var(--muted)]">
              {baseline ? `Answer ${left} more question${left === 1 ? "" : "s"} for a first read.` : verdictLine(readiness, pass, safe)}
            </p>
          </div>
        </div>

        {baseline ? (
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-[13px] text-[var(--muted)]">
              <span>Baseline</span>
              <span className="tabular-nums">
                {answers} of {BASELINE_ANSWERS} answers
              </span>
            </div>
            <Bar value={(answers / BASELINE_ANSWERS) * 100} className="h-2" />
          </div>
        ) : (
          <ScaleGauge value={readiness.projectedScaled} pass={pass} safe={safe} color={v.color} className="mt-5" />
        )}

        <div className="mt-3 flex items-center justify-between gap-3 text-[13px] text-[var(--muted)]">
          <span className="inline-flex items-center gap-2" title={`Daily goal: ${DAILY_GOAL_XP} points`}>
            {goalPct >= 100 ? <span className="font-semibold text-[var(--success)]">Daily goal met</span> : <span>Today</span>}
            <Bar value={goalPct} tone="gold" className="h-1.5 w-14" />
            <span className="tabular-nums">
              {todayXp} of {DAILY_GOAL_XP} pts
            </span>
          </span>
          <Link href="/profile" className="inline-flex h-11 shrink-0 items-center font-semibold text-[var(--muted)] underline-offset-4 hover:text-[var(--foreground)] hover:underline sm:h-8">
            Full breakdown
          </Link>
        </div>
      </CardBody>

      <div className="border-t border-[var(--border)] px-5 py-4 sm:px-6">
        {next}
        {weak && (
          <div className="mt-3 flex items-center gap-2 border-t border-[var(--border)] pt-3 text-[13px] text-[var(--muted)]">
            <Target size={14} className="shrink-0 text-[var(--accent)]" aria-hidden />
            <span className="min-w-0 truncate">
              Weakest: <span className="font-semibold text-[var(--foreground)]">{weak.comp.code} {weak.comp.name}</span>, {weak.mastery}% mastery
            </span>
            <Link href={`/practice?competency=${weak.comp.id}`} className="ml-auto inline-flex h-11 shrink-0 items-center font-semibold text-[color-mix(in_srgb,var(--accent)_85%,var(--foreground))] underline-offset-4 hover:underline sm:h-8">
              Drill it
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}

// Where the projection sits on the exam's 100–500 scale: under the pass mark,
// between pass and the safe margin, or clear of it.
function ScaleGauge({ value, pass, safe, color, className }: { value: number; pass: number; safe: number; color: string; className?: string }) {
  const reduce = useReducedMotion();
  const pos = (s: number) => Math.max(0, Math.min(100, ((s - 100) / 400) * 100));
  const p = pos(value);
  // keep the marker's label inside the strip at either end
  const labelShift = p < 12 ? "0%" : p > 88 ? "-100%" : "-50%";
  return (
    <div className={cn("relative pb-5 pt-6", className)} role="img" aria-label={`Projected ${value} of 500. Pass mark ${pass}, safe margin ${safe}.`}>
      <m.span
        className="absolute top-0 whitespace-nowrap text-[13px] font-semibold tabular-nums"
        style={{ x: labelShift }}
        initial={reduce ? false : { left: "0%" }}
        animate={{ left: `${p}%` }}
        transition={springSoft}
      >
        Projected {value}
      </m.span>
      <div className="relative h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div className="absolute inset-y-0 left-0 bg-[var(--danger)]/22" style={{ width: `${pos(pass)}%` }} />
        <div className="absolute inset-y-0 bg-[var(--warning)]/24" style={{ left: `${pos(pass)}%`, width: `${pos(safe) - pos(pass)}%` }} />
        <div className="absolute inset-y-0 right-0 bg-[var(--success)]/28" style={{ left: `${pos(safe)}%` }} />
      </div>
      <m.span
        aria-hidden
        className="absolute top-5 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[var(--glass-tint-strong)] shadow-[var(--e1)]"
        style={{ background: color }}
        initial={reduce ? false : { left: "0%" }}
        animate={{ left: `${p}%` }}
        transition={springSoft}
      />
      <span className="absolute bottom-0 -translate-x-1/2 whitespace-nowrap text-xs text-[var(--muted)]" style={{ left: `${pos(pass)}%` }}>
        Pass {pass}
      </span>
      <span className="absolute bottom-0 -translate-x-1/2 whitespace-nowrap text-xs text-[var(--muted)]" style={{ left: `${pos(safe)}%` }}>
        Safe {safe}
      </span>
    </div>
  );
}

// ── Brand-new learner: what this is, how a lesson works, the first lesson ──
function WelcomeHero({ daysLeft }: { daysLeft: number | null }) {
  const meta = getActiveMeta();
  const plan = useCurriculum();
  const lessons = plan.units.reduce((n, u) => n + u.rows.filter((r) => r.kind === "lesson").length, 0);
  const steps = [
    { title: "Read a topic", sub: "A concept and an example" },
    { title: "Answer on it", sub: "One exam-style question" },
    { title: `Pass at ${Math.round(LESSON_PASS * 100)}%`, sub: "Then take the domain test" },
  ];
  return (
    <Card className="mesh overflow-hidden">
      <CardBody className="p-5 sm:p-6">
        {daysLeft !== null && daysLeft >= 0 && (
          <Badge tone={daysLeft <= 14 ? "warning" : "default"} className="mb-2">
            {daysLeft === 0 ? "Exam today" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} to exam`}
          </Badge>
        )}
        <h1 className="text-[28px] font-extrabold leading-[1.1] sm:text-[32px]">Your {meta.name} study plan</h1>
        <p className="mt-1.5 text-[15px] text-[var(--muted)]">
          {lessons} lessons across {plan.units.length} domains, in blueprint order.
        </p>
        <ol className="mt-5 grid grid-cols-3 gap-3" aria-label="How a lesson works">
          {steps.map((s, i) => (
            <li key={s.title} className="min-w-0">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--primary)]/14 font-display text-[13px] font-extrabold text-[color-mix(in_srgb,var(--primary)_85%,var(--foreground))]">{i + 1}</span>
              <div className="mt-2 text-[15px] font-semibold leading-tight">{s.title}</div>
              <div className="mt-0.5 text-[13px] leading-snug text-[var(--muted)]">{s.sub}</div>
            </li>
          ))}
        </ol>
      </CardBody>
      <div className="border-t border-[var(--border)] px-5 py-4 sm:px-6">
        <NextStep row={plan.current} firstRun />
        <p className="mt-3 text-[13px] text-[var(--muted)]">Your readiness orb fills after {BASELINE_ANSWERS} answers.</p>
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
