"use client";

import Link from "next/link";
import { useId, useMemo, useState, type ComponentProps, type ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import { ArrowRight, CheckCircle2, ChevronDown, ChevronRight, Circle, GraduationCap, PlayCircle, RotateCcw, Sparkles, Trophy, type LucideIcon } from "lucide-react";
import { getCompetenciesByDomain, getDomains, getFlashcards, getQuestions, getQuestionsByCompetency, getTopicsByCompetency } from "@/lib/content";
import { LESSON_PASS } from "@/lib/gamify";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { Domain, LessonSession } from "@/lib/types";
import { useProgress, type LessonResult } from "@/store/progress";
import { Badge, Bar, buttonVariants, Card, CardBody } from "@/components/ui";
import { DomainRing, type RingState } from "@/components/domain-art";

// The study plan: every competency lesson in blueprint order, closed by a
// domain test. One pointer ("up next") walks the plan; an in-flight lesson
// beats it. Shared by the Study Plan, the Study sheets and lesson results.

export const TEST_LENGTH = 12; // questions in a domain test (app/lesson/[id])
const PASS_PCT = Math.round(LESSON_PASS * 100);

type RowState = "done" | "current" | "todo";
/** done = passed (≥80%) · paused = mid-lesson · retake = tried, below 80% · new = never tried */
export type RowStatus = "done" | "paused" | "retake" | "new";

export interface Row {
  id: string; // competency id, or `test-<domain code>`
  code: string; // "II.C" (or "TEST")
  name: string;
  kind: "lesson" | "test";
  domainCode: string;
  domainName: string;
  qCount: number; // lessons: questions in the bank · tests: questions per test
  topicCount: number;
  lessonQ: number; // questions asked inside the lesson / test
  steps: number; // lesson length (topic cards + questions)
  minutes: number; // rough time to finish from scratch
  best: number | null; // 0..1
  passed: boolean;
  status: RowStatus;
  isCurrent: boolean; // the plan pointer
  state: RowState; // legacy pointer state (kept for older callers)
  session?: { step: number; total: number; updatedAt: number };
}

export interface Unit {
  domain: Domain;
  rows: Row[];
  passed: number;
  total: number;
  pct: number;
  complete: boolean;
}

/** ~45 s per reading card, ~75 s per question (read, answer, read the why). */
export function estimateMinutes(readSteps: number, questions: number): number {
  const m = readSteps * 0.75 + questions * 1.25;
  return m < 10 ? Math.max(1, Math.round(m)) : Math.round(m / 5) * 5;
}

function buildCurriculum(lessons: Record<string, LessonResult>, sessions: Record<string, LessonSession>) {
  const known = new Set(getQuestions().map((q) => q.id));
  const cards = getFlashcards();
  const units: Unit[] = [];
  let pointerTaken = false;

  for (const d of getDomains()) {
    const rows: Row[] = [];
    let domainBank = 0;
    for (const c of getCompetenciesByDomain(d.id)) {
      const best = lessons[c.id]?.bestScore ?? null;
      const passed = (best ?? 0) >= LESSON_PASS;
      const topics = getTopicsByCompetency(c.id);
      const bank = getQuestionsByCompetency(c.id).length;
      domainBank += bank;
      // Mirrors buildLesson(): topic card + its questions, or the legacy
      // fallback (≤2 flashcards + ≤6 questions) when no topics exist yet.
      const readSteps = topics.length || Math.min(2, cards.filter((f) => f.competencyId === c.id).length);
      const lessonQ = topics.length ? topics.reduce((n, t) => n + t.questionIds.filter((qid) => known.has(qid)).length, 0) : Math.min(6, bank);
      const steps = readSteps + lessonQ;
      const sess = sessions[c.id];
      const session = sess && sess.step > 0 && sess.step < steps && sess.total === steps ? { step: sess.step, total: sess.total, updatedAt: sess.updatedAt } : undefined;
      const isCurrent = !passed && !pointerTaken;
      if (isCurrent) pointerTaken = true;
      rows.push({
        id: c.id,
        code: c.code,
        name: c.name,
        kind: "lesson",
        domainCode: d.code,
        domainName: d.name,
        qCount: bank,
        topicCount: topics.length,
        lessonQ,
        steps,
        minutes: estimateMinutes(readSteps, lessonQ),
        best,
        passed,
        status: session ? "paused" : passed ? "done" : best !== null ? "retake" : "new",
        isCurrent,
        state: passed ? "done" : isCurrent ? "current" : "todo",
        session,
      });
    }

    const testId = `test-${d.code}`;
    const testBest = lessons[testId]?.bestScore ?? null;
    const testPassed = (testBest ?? 0) >= LESSON_PASS;
    const testCurrent = !testPassed && rows.every((r) => r.passed) && !pointerTaken;
    if (testCurrent) pointerTaken = true;
    const testQ = Math.min(TEST_LENGTH, domainBank);
    rows.push({
      id: testId,
      code: "TEST",
      name: `Domain ${d.code} test`,
      kind: "test",
      domainCode: d.code,
      domainName: d.name,
      qCount: testQ,
      topicCount: 0,
      lessonQ: testQ,
      steps: testQ,
      minutes: estimateMinutes(0, testQ),
      best: testBest,
      passed: testPassed,
      status: testPassed ? "done" : testBest !== null ? "retake" : "new",
      isCurrent: testCurrent,
      state: testPassed ? "done" : testCurrent ? "current" : "todo",
    });

    const passedCount = rows.filter((r) => r.passed).length;
    units.push({ domain: d, rows, passed: passedCount, total: rows.length, pct: Math.round((passedCount / rows.length) * 100), complete: passedCount === rows.length });
  }

  const all = units.flatMap((u) => u.rows);
  // An in-flight lesson beats the plan pointer: resume the most recent one.
  const resume = all.filter((r) => r.session).sort((a, b) => b.session!.updatedAt - a.session!.updatedAt)[0] ?? null;
  const current = resume ?? all.find((r) => r.isCurrent) ?? null;
  return { units, current, resume, passed: all.filter((r) => r.passed).length, total: all.length };
}

export function useCurriculum() {
  const lessons = useProgress((s) => s.lessons);
  const lessonSessions = useProgress((s) => s.lessonSessions);
  return useMemo(() => buildCurriculum(lessons, lessonSessions), [lessons, lessonSessions]);
}

/** The next unpassed module after `id` in plan order (wrapping), skipping
 *  domain tests whose lessons are not all passed yet. null = plan complete. */
export function nextAfter(units: Unit[], id: string): Row | null {
  const all = units.flatMap((u) => u.rows);
  const i = all.findIndex((r) => r.id === id);
  const ordered = i >= 0 ? [...all.slice(i + 1), ...all.slice(0, i)] : all;
  const lessonsPassed = (code: string) => units.find((u) => u.domain.code === code)?.rows.every((r) => r.kind === "test" || r.passed) ?? false;
  return ordered.find((r) => !r.passed && (r.kind === "lesson" || lessonsPassed(r.domainCode))) ?? null;
}

export function rowTitle(row: Row): string {
  return row.kind === "test" ? `Domain ${row.domainCode} test` : `${row.code} ${row.name}`;
}

/** Ring segment per row: status first, then the plan pointer. */
export function ringStates(rows: Row[]): RingState[] {
  return rows.map((r) => (r.status === "done" ? "done" : r.status === "paused" ? "paused" : r.status === "retake" ? "retake" : r.isCurrent ? "current" : "new"));
}

// ── A link that looks like the shared Button (one focus stop, real navigation) ──
export function NavButton({ variant, size, className, onClick, ...props }: ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>) {
  return (
    <Link
      {...props}
      className={cn(buttonVariants({ variant, size }), className)}
      onClick={(e) => {
        haptic("tap");
        onClick?.(e);
      }}
    />
  );
}

// ── Domain header — shared by the Study Plan boards and Study sheets ──
export function DomainHeader({ domain, states, right, as: H = "h2" }: { domain: Domain; states: RingState[]; right?: ReactNode; as?: "h2" | "h3" }) {
  return (
    <div className="flex items-center gap-3.5 border-b border-[var(--border)] px-4 py-3.5 sm:px-5">
      <DomainRing code={domain.code} states={states} />
      <div className="min-w-0 flex-1">
        <H className="text-[17px] font-bold leading-snug sm:text-lg sm:leading-tight">{domain.name}</H>
        <div className="mt-0.5 text-[13px] text-[var(--muted)]">
          Domain {domain.code} · {domain.minQ}–{domain.maxQ} exam questions
        </div>
        {/* phones: the count sits under the label so long domain names keep the width */}
        {right && <div className="mt-0.5 sm:hidden">{right}</div>}
      </div>
      {right && <div className="hidden shrink-0 text-right sm:block">{right}</div>}
    </div>
  );
}

// ── Study Plan boards ──
export function CurriculumBoard({ headingLevel = "h2" }: { headingLevel?: "h2" | "h3" }) {
  const { units } = useCurriculum();
  return (
    <div className="space-y-4">
      {units.map((u) => (
        <DomainBoard key={u.domain.id} unit={u} headingLevel={headingLevel} />
      ))}
    </div>
  );
}

function DomainBoard({ unit, headingLevel }: { unit: Unit; headingLevel: "h2" | "h3" }) {
  // Finished domains fold away so the remaining work leads; the learner can open them.
  const [toggled, setToggled] = useState<boolean | null>(null);
  const open = toggled ?? !unit.complete;
  const listId = useId();
  const avgBest = Math.round((unit.rows.reduce((s, r) => s + (r.best ?? 0), 0) / unit.rows.length) * 100);
  return (
    <Card className="overflow-hidden">
      <DomainHeader
        domain={unit.domain}
        states={ringStates(unit.rows)}
        as={headingLevel}
        right={
          !unit.complete && (
            <span className="whitespace-nowrap text-[13px] text-[var(--muted)]">
              <span className="font-semibold tabular-nums text-[var(--foreground)]">
                {unit.passed}/{unit.total}
              </span>{" "}
              passed
            </span>
          )
        }
      />
      {unit.complete && (
        <button
          type="button"
          onClick={() => setToggled(!open)}
          aria-expanded={open}
          aria-controls={listId}
          className={cn(
            "flex min-h-12 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]/50 sm:px-5",
            open && "border-b border-[var(--border)]"
          )}
        >
          <Trophy size={18} className="shrink-0 text-[var(--success)]" aria-hidden />
          <span className="min-w-0 flex-1 text-sm font-semibold">
            All {unit.total} passed <span className="font-normal text-[var(--muted)]">with an average best of {avgBest}%</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-[var(--muted)]">
            {open ? "Hide" : "Show"}
            <ChevronDown size={15} className={cn("motion-safe:transition-transform motion-safe:duration-200", open && "rotate-180")} aria-hidden />
          </span>
        </button>
      )}
      {open && (
        <ul id={listId} className="divide-y divide-[var(--border)]">
          {unit.rows.map((r) => (
            <li key={r.id}>
              <ModuleRow row={r} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function statusIcon(row: Row): { Icon: LucideIcon; cls: string } {
  if (row.status === "done") return { Icon: CheckCircle2, cls: "text-[var(--success)]" };
  if (row.status === "paused") return { Icon: PlayCircle, cls: "text-[var(--accent)]" };
  if (row.status === "retake") return { Icon: RotateCcw, cls: "text-[var(--warning)]" };
  if (row.kind === "test") return { Icon: GraduationCap, cls: row.isCurrent ? "text-[var(--primary)]" : "text-[var(--muted)] opacity-70" };
  return { Icon: row.isCurrent ? PlayCircle : Circle, cls: row.isCurrent ? "text-[var(--primary)]" : "text-[var(--muted)] opacity-60" };
}

function actionLabel(row: Row): string {
  if (row.status === "paused") return "Resume";
  if (row.status === "retake") return "Retake";
  if (row.status === "done") return row.kind === "test" ? "Retake" : "Review";
  return row.kind === "test" ? "Take test" : "Start";
}

/** One short line per row — a single separator at most. */
function rowMeta(row: Row): ReactNode {
  const count = row.kind === "test" ? `${row.qCount} questions` : row.topicCount ? `${row.topicCount} topics` : `${row.steps} steps`;
  if (row.session) return <span className="font-semibold text-[var(--accent)]">Paused at step {row.session.step + 1} of {row.session.total}</span>;
  if (row.status === "retake")
    return (
      <span className="font-semibold text-[color-mix(in_srgb,var(--warning)_80%,var(--foreground))]">
        Best {Math.round((row.best ?? 0) * 100)}% · needs {PASS_PCT}%
      </span>
    );
  if (row.status === "done") return `${count} · best ${Math.round((row.best ?? 0) * 100)}%`;
  return `${count} · ~${row.minutes} min`;
}

function ModuleRow({ row }: { row: Row }) {
  const { Icon, cls } = statusIcon(row);
  const isTest = row.kind === "test";
  return (
    <Link
      href={`/lesson/${row.id}`}
      onClick={() => haptic("tap")}
      aria-current={row.isCurrent ? "step" : undefined}
      className={cn(
        "group flex min-h-14 cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]/50 sm:px-5",
        row.isCurrent && "bg-[var(--primary)]/6"
      )}
    >
      <Icon size={20} className={cn("shrink-0 motion-safe:transition-transform motion-safe:duration-200 group-hover:scale-110", cls)} aria-hidden />
      <span className="hidden w-10 shrink-0 text-[13px] font-semibold tabular-nums text-[var(--muted)] sm:block">{isTest ? "" : row.code}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="line-clamp-2 min-w-0 text-[15px] font-semibold leading-snug sm:line-clamp-1">
            {!isTest && <span className="font-medium text-[var(--muted)] sm:hidden">{row.code} </span>}
            {isTest ? "Domain test" : row.name}
          </span>
          {row.session ? (
            <Badge tone="accent" className="shrink-0 whitespace-nowrap">In progress</Badge>
          ) : (
            row.isCurrent && <Badge tone="primary" className="shrink-0 whitespace-nowrap">Up next</Badge>
          )}
        </div>
        <div className="mt-0.5 text-[13px] text-[var(--muted)]">{rowMeta(row)}</div>
      </div>
      <span className={cn("hidden shrink-0 text-[13px] font-semibold sm:block", row.isCurrent || row.session ? "text-[var(--primary)]" : "text-[var(--muted)] group-hover:text-[var(--foreground)]")}>
        {actionLabel(row)}
      </span>
      <ChevronRight size={16} className="shrink-0 text-[var(--muted)] sm:hidden" aria-hidden />
    </Link>
  );
}

// ── Next step — the one primary action of the plan ──
const TONE_TEXT = {
  primary: "text-[color-mix(in_srgb,var(--primary)_85%,var(--foreground))]",
  accent: "text-[color-mix(in_srgb,var(--accent)_85%,var(--foreground))]",
  warning: "text-[color-mix(in_srgb,var(--warning)_80%,var(--foreground))]",
  success: "text-[color-mix(in_srgb,var(--success)_85%,var(--foreground))]",
} as const;

export function NextStep({ row, firstRun, className }: { row: Row | null; firstRun?: boolean; className?: string }) {
  if (!row) {
    return (
      <StepShell
        className={className}
        tone="success"
        icon={Trophy}
        label="Plan complete"
        title="Every module and domain test passed"
        meta="Keep sharp with full-length mocks."
        action={
          <NavButton href="/mock" className="group w-full sm:w-auto">
            Take a full mock <ArrowRight size={15} className="motion-safe:transition-transform motion-safe:duration-200 group-hover:translate-x-0.5" aria-hidden />
          </NavButton>
        }
      />
    );
  }
  const isTest = row.kind === "test";
  let tone: keyof typeof TONE_TEXT = "primary";
  let icon: LucideIcon = PlayCircle;
  let label = "Up next";
  let cta = "Start lesson";
  let meta = isTest ? `${row.qCount} questions · ~${row.minutes} min` : `${row.topicCount ? `${row.topicCount} topics` : `${row.steps} steps`} · ~${row.minutes} min`;
  let progress: number | null = null;

  if (row.session) {
    const left = row.session.total - row.session.step;
    tone = "accent";
    label = `Resume at step ${row.session.step + 1} of ${row.session.total}`;
    cta = "Resume";
    meta = `${left} step${left === 1 ? "" : "s"} left · ~${Math.max(1, Math.round((row.minutes * left) / row.session.total))} min`;
    progress = (row.session.step / row.session.total) * 100;
  } else if (firstRun) {
    icon = Sparkles;
    label = "Your first lesson";
    cta = "Start first lesson";
  } else if (row.status === "retake") {
    tone = "warning";
    icon = RotateCcw;
    label = isTest ? "Retake the domain test" : "Retake to pass";
    cta = isTest ? "Retake test" : "Retake lesson";
    meta = `Best ${Math.round((row.best ?? 0) * 100)}% · ${PASS_PCT}% passes`;
  } else if (isTest) {
    icon = GraduationCap;
    label = "Domain test unlocked";
    cta = "Take the test";
  }

  const title = isTest ? (
    <>
      Domain {row.domainCode} test <span className="font-medium text-[var(--muted)]">{row.domainName}</span>
    </>
  ) : (
    <>
      <span className="font-medium text-[var(--muted)]">{row.code}</span> {row.name}
    </>
  );

  return (
    <StepShell
      className={className}
      tone={tone}
      icon={icon}
      label={label}
      title={title}
      meta={meta}
      progress={progress}
      action={
        <NavButton href={`/lesson/${row.id}`} className="group w-full sm:w-auto">
          {cta} <ArrowRight size={15} className="motion-safe:transition-transform motion-safe:duration-200 group-hover:translate-x-0.5" aria-hidden />
        </NavButton>
      }
    />
  );
}

function StepShell({ tone, icon: Icon, label, title, meta, progress, action, className }: { tone: keyof typeof TONE_TEXT; icon: LucideIcon; label: string; title: ReactNode; meta: string; progress?: number | null; action: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6", className)}>
      <div className="min-w-0 flex-1">
        <div className={cn("flex items-center gap-1.5 text-[13px] font-semibold", TONE_TEXT[tone])}>
          <Icon size={14} aria-hidden /> {label}
        </div>
        <div className="mt-1 font-display text-[17px] font-bold leading-snug">{title}</div>
        <div className="mt-0.5 text-[13px] text-[var(--muted)]">{meta}</div>
        {progress != null && <Bar value={progress} className="mt-2 h-1.5 max-w-60" />}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

/** Standalone next-step card (kept for callers of the previous API). */
export function ContinueCard() {
  const { current } = useCurriculum();
  return (
    <Card>
      <CardBody>
        <NextStep row={current} />
      </CardBody>
    </Card>
  );
}
