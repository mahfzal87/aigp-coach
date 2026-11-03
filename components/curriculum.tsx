"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { ArrowRight, CheckCircle2, ChevronDown, Circle, GraduationCap, PlayCircle, RotateCcw, Sparkles, Trophy, type LucideIcon } from "lucide-react";
import { getCompetenciesByDomain, getDomains, getFlashcards, getQuestions, getQuestionsByCompetency, getTopicsByCompetency } from "@/lib/content";
import { LESSON_PASS } from "@/lib/gamify";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { Domain, LessonSession } from "@/lib/types";
import { useProgress, type LessonResult } from "@/store/progress";
import { Badge, Button, Card, CardBody } from "@/components/ui";
import { MotionBar, Stagger, StaggerItem } from "@/components/motion";
import { DomainArt, type DomainCode } from "@/components/domain-art";

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
  return row.kind === "test" ? `Domain ${row.domainCode} test` : `${row.code} · ${row.name}`;
}

// ── Navigation button ──
// The shared Button primitive, navigating on click: one focus stop and one
// role (a <Link> wrapping a <button> gives keyboard users two).
export function NavButton({ href, onClick, children, ...props }: Omit<ComponentProps<typeof Button>, "onClick"> & { href: string; onClick?: () => void }) {
  const router = useRouter();
  return (
    <Button
      type="button"
      {...props}
      onMouseEnter={() => router.prefetch(href)}
      onFocus={() => router.prefetch(href)}
      onClick={() => {
        haptic("tap");
        onClick?.();
        router.push(href);
      }}
    >
      {children}
    </Button>
  );
}

// ── Domain header (art band) — shared by the Study Plan boards and Study sheets ──
export function DomainHeader({ domain, right, as: H = "h2" }: { domain: Domain; right?: ReactNode; as?: "h2" | "h3" }) {
  return (
    <div className="relative overflow-hidden border-b border-[var(--border)]">
      <DomainArt code={domain.code as DomainCode} className="absolute inset-0 h-full w-full" />
      <div className="relative flex min-h-[104px] items-end gap-4 px-4 pb-3.5 pt-7 sm:px-5">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Domain {domain.code} · {domain.minQ}–{domain.maxQ} <span className="hidden sm:inline">exam </span>questions
          </div>
          <H className="mt-0.5 text-base font-bold leading-snug sm:text-lg sm:leading-tight">{domain.name}</H>
        </div>
        {right && <div className="shrink-0 pb-0.5">{right}</div>}
      </div>
    </div>
  );
}

function DomainProgress({ unit }: { unit: Unit }) {
  return (
    <div className="flex w-24 flex-col items-end gap-1.5 sm:w-28">
      {unit.complete ? (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--success)]">
          <CheckCircle2 size={13} aria-hidden /> Complete
        </span>
      ) : (
        <span className="text-xs font-semibold tabular-nums text-[var(--muted)]">
          {unit.passed}/{unit.total} passed
        </span>
      )}
      <MotionBar value={unit.pct} tone={unit.complete ? "success" : "primary"} className="h-1.5" />
    </div>
  );
}

// ── Study Plan boards ──
export function CurriculumBoard({ headingLevel = "h2" }: { headingLevel?: "h2" | "h3" }) {
  const { units } = useCurriculum();
  return (
    <Stagger className="space-y-5" delay={0.05}>
      {units.map((u) => (
        <StaggerItem key={u.domain.id} y={14}>
          <DomainBoard unit={u} headingLevel={headingLevel} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}

function DomainBoard({ unit, headingLevel }: { unit: Unit; headingLevel: "h2" | "h3" }) {
  // Finished domains fold away so the remaining work leads; the user can open them.
  const [toggled, setToggled] = useState<boolean | null>(null);
  const open = toggled ?? !unit.complete;
  const listId = useId();
  const avgBest = Math.round((unit.rows.reduce((s, r) => s + (r.best ?? 0), 0) / unit.rows.length) * 100);
  return (
    <Card className="overflow-hidden">
      <DomainHeader domain={unit.domain} as={headingLevel} right={<DomainProgress unit={unit} />} />
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
            All {unit.total} passed <span className="font-normal text-[var(--muted)]">· average best {avgBest}%</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--muted)]">
            {open ? "Hide" : "Show"}
            <ChevronDown size={14} className={cn("transition-transform duration-200", open && "rotate-180")} aria-hidden />
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
  if (row.kind === "test") return { Icon: GraduationCap, cls: row.isCurrent ? "text-[var(--primary)]" : "text-[var(--muted)] opacity-60" };
  return { Icon: row.isCurrent ? PlayCircle : Circle, cls: row.isCurrent ? "text-[var(--primary)]" : "text-[var(--muted)] opacity-50" };
}

function actionLabel(row: Row): string {
  if (row.status === "paused") return "Resume";
  if (row.status === "retake") return "Retake";
  if (row.status === "done") return row.kind === "test" ? "Retake" : "Review";
  return row.kind === "test" ? "Take test" : "Start";
}

function RowMeta({ row }: { row: Row }) {
  const parts: ReactNode[] = [row.kind === "test" ? `${row.qCount} questions` : row.topicCount ? `${row.topicCount} topics` : `${row.steps} steps`];
  if (row.session) parts.push(<span className="font-semibold text-[var(--accent)]">paused at {row.session.step + 1}/{row.session.total}</span>);
  if (row.best !== null) {
    parts.push(
      row.passed ? (
        `best ${Math.round(row.best * 100)}%`
      ) : (
        <span className="font-semibold text-[var(--warning)]">
          best {Math.round(row.best * 100)}% · needs {PASS_PCT}%
        </span>
      )
    );
  } else if (!row.session) {
    parts.push(`~${row.minutes} min`);
  }
  return (
    <div className="mt-0.5 text-xs text-[var(--muted)]">
      {row.kind === "lesson" && <span className="font-semibold sm:hidden">{row.code} · </span>}
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && " · "}
          {p}
        </span>
      ))}
    </div>
  );
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
        row.isCurrent && "bg-[var(--primary)]/5"
      )}
    >
      <Icon size={20} className={cn("shrink-0 transition-transform duration-200 group-hover:scale-110", cls)} aria-hidden />
      <span className="hidden w-10 shrink-0 text-xs font-semibold tabular-nums text-[var(--muted)] sm:block">{isTest ? "" : row.code}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="line-clamp-2 min-w-0 text-sm font-semibold leading-snug sm:line-clamp-1">{isTest ? "Domain test" : row.name}</span>
          {row.session ? (
            <Badge tone="accent" className="shrink-0 whitespace-nowrap">In progress</Badge>
          ) : (
            row.isCurrent && <Badge tone="primary" className="shrink-0 whitespace-nowrap">Up next</Badge>
          )}
        </div>
        <RowMeta row={row} />
      </div>
      <span className={cn("flex shrink-0 items-center gap-1 text-xs font-semibold", row.isCurrent || row.session ? "text-[var(--primary)]" : "text-[var(--accent)]")}>
        <span className="hidden sm:inline">{actionLabel(row)}</span>
        <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}

// ── Next step — the one primary action of the plan ──
const TONE_TEXT = {
  primary: "text-[var(--primary)]",
  accent: "text-[var(--accent)]",
  warning: "text-[var(--warning)]",
  success: "text-[var(--success)]",
} as const;

export function NextStep({ row, firstRun, className }: { row: Row | null; firstRun?: boolean; className?: string }) {
  if (!row) {
    return (
      <StepShell
        className={className}
        tone="success"
        icon={Trophy}
        eyebrow="Plan complete"
        title="Every module and domain test passed"
        meta="Keep sharp with full-length mocks."
        action={<NavButton href="/mock" className="group w-full sm:w-auto">Take a full mock <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" /></NavButton>}
      />
    );
  }
  const isTest = row.kind === "test";
  let tone: keyof typeof TONE_TEXT = "primary";
  let icon: LucideIcon = PlayCircle;
  let eyebrow = "Up next";
  let label = "Start lesson";
  let meta = isTest ? `${row.domainName} · ${row.qCount} questions · ~${row.minutes} min` : `${row.topicCount ? `${row.topicCount} topics · ` : ""}${row.steps} steps · ~${row.minutes} min`;
  let progress: number | null = null;

  if (row.session) {
    const left = row.session.total - row.session.step;
    tone = "accent";
    eyebrow = `Resume · step ${row.session.step + 1} of ${row.session.total}`;
    label = "Resume";
    meta = `${left} step${left === 1 ? "" : "s"} left · ~${Math.max(1, Math.round((row.minutes * left) / row.session.total))} min`;
    progress = (row.session.step / row.session.total) * 100;
  } else if (firstRun) {
    icon = Sparkles;
    eyebrow = "Start here";
    label = "Start first lesson";
  } else if (row.status === "retake") {
    tone = "warning";
    icon = RotateCcw;
    eyebrow = isTest ? "Up next · retake the test" : "Up next · retake to pass";
    label = isTest ? "Retake test" : "Retake lesson";
    meta = `Best ${Math.round((row.best ?? 0) * 100)}% · ${PASS_PCT}% passes · ~${row.minutes} min`;
  } else if (isTest) {
    icon = GraduationCap;
    eyebrow = "Up next · domain test";
    label = "Take the test";
  }

  return (
    <StepShell
      className={className}
      tone={tone}
      icon={icon}
      eyebrow={eyebrow}
      title={rowTitle(row)}
      meta={meta}
      progress={progress}
      action={
        <NavButton href={`/lesson/${row.id}`} className="group w-full sm:w-auto">
          {label} <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </NavButton>
      }
    />
  );
}

function StepShell({ tone, icon: Icon, eyebrow, title, meta, progress, action, className }: { tone: keyof typeof TONE_TEXT; icon: LucideIcon; eyebrow: string; title: string; meta: string; progress?: number | null; action: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6", className)}>
      <div className="min-w-0 flex-1">
        <div className={cn("flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]", TONE_TEXT[tone])}>
          <Icon size={13} aria-hidden /> {eyebrow}
        </div>
        <div className="mt-1 text-[15px] font-bold leading-snug">{title}</div>
        <div className="mt-0.5 text-xs text-[var(--muted)]">{meta}</div>
        {progress != null && <MotionBar value={progress} tone="accent" className="mt-2 h-1.5 max-w-60" />}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

/** Standalone next-step card (kept for callers of the previous API). */
export function ContinueCard() {
  const { current } = useCurriculum();
  return (
    <Card className="mesh">
      <CardBody>
        <NextStep row={current} />
      </CardBody>
    </Card>
  );
}
