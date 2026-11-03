"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookCheck,
  CheckCircle2,
  ChevronRight,
  Circle,
  Flame,
  Footprints,
  GraduationCap,
  Rocket,
  Star,
  Swords,
  TrendingUp,
  Trophy,
  XCircle,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { getActiveMeta, getCompetenciesByDomain, getCompetency, getDomain, getDomains } from "@/lib/content";
import { allCompetencyMastery, computeReadiness } from "@/lib/readiness";
import { computeTopicStats, type TopicStat } from "@/lib/topic-stats";
import { ACHIEVEMENTS, DAILY_GOAL_XP, LESSON_PASS, levelFromXp, streakAlive, todayStr, type AchievementInput } from "@/lib/gamify";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { Competency, MockSession, Readiness, Verdict } from "@/lib/types";
import { useHydrated, useProgress } from "@/store/progress";
import { Badge, Bar, Card, CardBody, PageHeader } from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion";
import { ScoreDial } from "@/components/readiness-gauge";
import { Ring } from "@/components/gamify";
import {
  DragRow,
  Eyebrow,
  GoButton,
  MIN_SEEN,
  MasteryBar,
  ROW_LINK,
  SectionHead,
  StatStrip,
  TARGET,
  TargetLegend,
  masteryTone,
  rankDrag,
  toneVar,
  type DragItem,
  type Tone,
} from "@/components/progress-kit";

const VERDICT: Record<Verdict, { label: string; tone: "success" | "warning" | "danger" | "default" }> = {
  ready: { label: "Exam ready", tone: "success" },
  almost: { label: "Almost there", tone: "warning" },
  "not-yet": { label: "Not yet ready", tone: "danger" },
  unknown: { label: "Building your baseline", tone: "default" },
};

// Mirrors lib/readiness.ts: under 10 answers there is no verdict; a projection
// of ≥ 92% clears the Ready gate and ≥ 83% means "almost". The thresholds are
// located on the scaled range with the verdict's own rounding, so the dial,
// the gates and the badge can never disagree.
const FIRST_READ = 10;
const READY_PCT = 92;
const ALMOST_PCT = 83;
function scaledFor(pct: number): number {
  for (let s = 100; s <= 500; s++) if (Math.round(((s - 100) / 400) * 100) >= pct) return s;
  return 500;
}
const READY_AT = scaledFor(READY_PCT); // 466
const ALMOST_AT = scaledFor(ALMOST_PCT); // 430

// Explicit icon map — importing lucide's whole namespace pulled ~5,900 icons into this page.
const ACH_ICON: Record<string, LucideIcon> = { Footprints, Flame, Swords, Zap, Rocket, BookCheck, Trophy, Star, TrendingUp, GraduationCap };
// [current, goal, baseline] — level starts at 1, so level progress is measured from there.
const ACH_PROGRESS: Record<string, (s: AchievementInput) => [number, number, number?]> = {
  "first-step": (s) => [s.attempts, 1],
  "ten-q": (s) => [s.attempts, 10],
  "hundred-q": (s) => [s.attempts, 100],
  "streak-3": (s) => [s.streakCount, 3],
  "streak-7": (s) => [s.streakCount, 7],
  "first-lesson": (s) => [s.lessonsCompleted, 1],
  "domain-done": (s) => [s.lessonsCompleted, 3],
  perfect: (s) => [s.perfectLessons, 1],
  "level-5": (s) => [s.level, 5, 1],
  "mock-pass": (s) => [s.mocksPassed, 1],
};

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

// The paper the projection is built on (lib/readiness.ts: latest finished, 50+ questions).
function latestSubstantialMock(mocks: MockSession[]): MockSession | null {
  return (
    mocks
      .filter((m) => m.finishedAt && typeof m.scaledScore === "number" && m.questionIds.length >= 50)
      .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))[0] ?? null
  );
}

export default function ProfilePage() {
  const hydrated = useHydrated();
  const attempts = useProgress((s) => s.attempts);
  const mocks = useProgress((s) => s.mocks);
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streakCount);
  const longest = useProgress((s) => s.longestStreak);
  const lastActive = useProgress((s) => s.lastActiveDate);
  const dailyXp = useProgress((s) => s.dailyXp);
  const dailyDate = useProgress((s) => s.dailyDate);
  const lessons = useProgress((s) => s.lessons);

  const readiness = useMemo(() => computeReadiness(attempts, mocks), [attempts, mocks]);
  const mastery = useMemo(() => allCompetencyMastery(attempts), [attempts]);
  const topicStats = useMemo(() => computeTopicStats(attempts), [attempts]);
  const lvl = useMemo(() => levelFromXp(xp), [xp]);

  if (!hydrated) return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  const meta = getActiveMeta();
  const domains = getDomains();
  const comps = domains.flatMap((d) => getCompetenciesByDomain(d.id));
  const n = attempts.length;
  const correct = attempts.filter((a) => a.correct).length;
  const unique = new Set(attempts.map((a) => a.questionId)).size;
  const accuracy = n ? Math.round((correct / n) * 100) : null;
  const last50 = n > 50 ? [...attempts].sort((a, b) => b.ts - a.ts).slice(0, 50) : null;
  const acc50 = last50 ? Math.round((last50.filter((a) => a.correct).length / 50) * 100) : null;

  // Modules exactly as the Study Plan board counts them: one lesson per competency + one test per domain.
  const moduleIds = [...comps.map((c) => c.id), ...domains.map((d) => `test-${d.code}`)];
  const modulesPassed = moduleIds.filter((id) => (lessons[id]?.bestScore ?? 0) >= LESSON_PASS).length;

  const fullMocks = mocks.filter((m) => m.finishedAt && typeof m.scaledScore === "number" && m.questionIds.length >= 90);
  const fullPassed = fullMocks.filter((m) => (m.scaledScore ?? 0) >= meta.passScaled).length;
  const latestMock = latestSubstantialMock(mocks);

  // Achievement inputs — same semantics as before the redesign.
  const achInput: AchievementInput = {
    xp,
    level: lvl.level,
    streakCount: streak,
    attempts: n,
    correct,
    lessonsCompleted: Object.values(lessons).filter((l) => l.bestScore >= LESSON_PASS).length,
    mocksPassed: mocks.filter((m) => (m.scaledScore ?? 0) >= 300 && m.questionIds.length >= 90).length,
    perfectLessons: Object.values(lessons).filter((l) => l.bestScore >= 1).length,
  };

  const drag = rankDrag(comps, mastery);
  const alive = streakAlive(lastActive);
  const fresh = n === 0;

  return (
    <div>
      <PageHeader
        title="Progress"
        subtitle="Readiness, mastery, rhythm."
        action={
          <GoButton href="/analytics" variant="outline" size="sm">
            <BarChart3 size={14} /> Analytics
          </GoButton>
        }
      />

      <Stagger className="space-y-6">
        <StaggerItem>
          <ReadinessHero
            readiness={readiness}
            answered={n}
            passScaled={meta.passScaled}
            latestMock={latestMock}
            fullMocks={fullMocks.length}
            modulesPassed={modulesPassed}
            drag={drag}
            firstComp={comps[0]}
          />
        </StaggerItem>

        {!fresh && (
          <StaggerItem>
            <StatStrip
              items={[
                { label: "Answered", value: n.toLocaleString(), hint: `${unique.toLocaleString()} unique questions` },
                {
                  label: "Accuracy",
                  value: accuracy == null ? "—" : `${accuracy}%`,
                  hint: acc50 != null ? `${acc50}% in your last 50` : `${correct} of ${n} right`,
                },
                {
                  label: "Modules passed",
                  value: (
                    <>
                      {modulesPassed}
                      <span className="text-base font-semibold text-[var(--muted)]">/{moduleIds.length}</span>
                    </>
                  ),
                  hint: "lessons + domain tests",
                },
                {
                  label: "Full mocks passed",
                  value: fullMocks.length ? (
                    <>
                      {fullPassed}
                      <span className="text-base font-semibold text-[var(--muted)]">/{fullMocks.length}</span>
                    </>
                  ) : (
                    "—"
                  ),
                  hint: fullMocks.length ? `pass mark ${meta.passScaled}` : "none taken yet",
                },
              ]}
            />
          </StaggerItem>
        )}

        {!fresh && (
          <StaggerItem>
            <DomainMastery rows={readiness.domainMastery.map((d) => ({ ...d, name: getDomain(d.code)?.name ?? `Domain ${d.code}` }))} />
          </StaggerItem>
        )}

        {!fresh && topicStats.length > 0 && (
          <StaggerItem>
            <TopicsCard stats={topicStats} firstComp={comps[0]} />
          </StaggerItem>
        )}

        <StaggerItem>
          <RhythmCard
            level={lvl.level}
            levelPct={lvl.pct}
            toNext={lvl.need - lvl.into}
            streak={alive ? streak : 0}
            staleStreak={!alive && streak > 0 ? streak : 0}
            longest={longest}
            todayPts={dailyDate === todayStr() ? dailyXp : 0}
            xp={xp}
          />
        </StaggerItem>

        <StaggerItem>
          <MilestonesCard input={achInput} />
        </StaggerItem>
      </Stagger>
    </div>
  );
}

// ─── Hero: verdict, the dial, the three gates, and what's dragging the score ───

interface Gate {
  label: string;
  ok: boolean;
  value: string;
  tone: Tone;
}

function ReadinessHero({
  readiness,
  answered,
  passScaled,
  latestMock,
  fullMocks,
  modulesPassed,
  drag,
  firstComp,
}: {
  readiness: Readiness;
  answered: number;
  passScaled: number;
  latestMock: MockSession | null;
  fullMocks: number;
  modulesPassed: number;
  drag: DragItem[];
  firstComp?: Competency;
}) {
  const v = VERDICT[readiness.verdict];
  const known = readiness.verdict !== "unknown";
  const projected = readiness.projectedScaled;

  const low = readiness.domainMastery
    .filter((d) => d.insufficient || d.mastery < TARGET)
    .sort((a, b) => Number(a.insufficient) - Number(b.insufficient) || a.mastery - b.mastery);
  const worst = low[0];
  const gates: Gate[] = [
    {
      label: `Projected ${READY_AT}+`,
      ok: readiness.projectedPercent >= READY_PCT,
      value: String(projected),
      tone: projected >= READY_AT ? "success" : projected >= ALMOST_AT ? "warning" : "danger",
    },
    {
      label: `Every domain ${TARGET}+`,
      ok: low.length === 0,
      value: low.length
        ? low
            .slice(0, 2)
            .map((d) => (d.insufficient ? `${d.code} needs data` : `${d.code} at ${d.mastery}`))
            .join(" · ") + (low.length > 2 ? ` +${low.length - 2}` : "")
        : "All clear",
      tone: !worst ? "success" : worst.insufficient ? "warning" : masteryTone(worst.mastery),
    },
    {
      label: "Full mock taken",
      ok: readiness.hasMock,
      value: fullMocks ? `${fullMocks} taken` : "None yet",
      tone: readiness.hasMock ? "success" : "danger",
    },
  ];

  let headline: string;
  if (!known) headline = answered === 0 ? `Answer ${FIRST_READ} questions to start` : `${plural(FIRST_READ - answered, "more answer")} to a first read`;
  else if (readiness.verdict === "ready") headline = "All three gates passed";
  else if (!gates[0].ok) headline = `${READY_AT - projected} below the Ready line`;
  else if (!gates[1].ok) headline = worst?.insufficient ? `Build data on Domain ${worst.code}` : `Lift Domain ${worst?.code} to ${TARGET}`;
  else headline = "Take a full mock to confirm";

  const weakest = drag.find((d) => !d.m.insufficient) ?? drag[0];
  const drillWeakest = weakest ? { href: weakest.href, label: `Drill ${weakest.comp.code}` } : null;
  let primary: { href: string; label: string };
  let secondary: { href: string; label: string } | null;
  if (!known) {
    primary = { href: "/practice", label: "Start a drill" };
    secondary = null;
  } else if (!readiness.hasMock) {
    primary = { href: "/mock", label: "Take a full mock" };
    secondary = drillWeakest;
  } else if (drillWeakest && readiness.verdict !== "ready") {
    primary = drillWeakest;
    secondary = { href: "/mock", label: "Take a mock" };
  } else {
    primary = { href: "/mock", label: "Take a mock" };
    secondary = drillWeakest;
  }

  const steps = [
    { done: answered >= FIRST_READ, label: `Answer ${FIRST_READ} questions`, sub: "unlocks your verdict", meta: `${Math.min(answered, FIRST_READ)}/${FIRST_READ}`, href: null as string | null },
    { done: modulesPassed > 0, label: "Pass a lesson", sub: "maps your topics", meta: firstComp ? `Lesson ${firstComp.code}` : "Lessons", href: firstComp ? `/lesson/${firstComp.id}` : "/" },
    { done: fullMocks > 0, label: "Finish a full mock", sub: "anchors the projection", meta: "Mock exam", href: "/mock" },
  ];

  return (
    <Card>
      <CardBody className="grid gap-5 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-center sm:gap-7">
        <div className="flex flex-col items-center">
          <ScoreDial
            projected={known ? projected : null}
            verdict={readiness.verdict}
            pass={passScaled}
            almostAt={ALMOST_AT}
            readyAt={READY_AT}
            mock={known ? (latestMock?.scaledScore ?? null) : null}
            size={260}
          />
          {known && latestMock && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted)]">
              <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--foreground)] opacity-75" />
              Latest mock <span className="font-semibold tabular-nums text-[var(--foreground)]">{latestMock.scaledScore}</span>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <Badge tone={v.tone}>{v.label}</Badge>
          <div className="mt-2 text-xl font-bold tracking-tight tabular-nums">{headline}</div>
          {known && (
            <div className="mt-0.5 text-xs text-[var(--muted)]">
              Readiness <span className="font-semibold tabular-nums text-[var(--foreground)]">{readiness.overall}</span>/100
            </div>
          )}

          {known ? (
            <ul className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]" aria-label="Gates to Exam ready">
              {gates.map((g) => (
                <li key={g.label} className="flex items-center gap-2.5 py-2 text-sm">
                  {g.ok ? (
                    <CheckCircle2 size={16} className="shrink-0 text-[var(--success)]" aria-hidden />
                  ) : (
                    <XCircle size={16} className="shrink-0" style={{ color: toneVar(g.tone) }} aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 truncate">
                    <span className="sr-only">{g.ok ? "Passed: " : "Not yet: "}</span>
                    {g.label}
                  </span>
                  <span className="shrink-0 text-xs font-semibold tabular-nums" style={{ color: toneVar(g.ok ? "success" : g.tone) }}>
                    {g.value}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <Bar value={(Math.min(answered, FIRST_READ) / FIRST_READ) * 100} tone="primary" className="mt-3 h-1.5" />
              <ul className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]" aria-label="First steps">
                {steps.map((s) => {
                  const body = (
                    <>
                      {s.done ? <CheckCircle2 size={16} className="shrink-0 text-[var(--success)]" /> : <Circle size={16} className="shrink-0 text-[var(--muted)]" />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{s.label}</span>
                        <span className="block truncate text-xs text-[var(--muted)]">{s.sub}</span>
                      </span>
                      <span className={cn("flex shrink-0 items-center text-xs font-semibold tabular-nums", s.href ? "text-[var(--accent)]" : "text-[var(--muted)]")}>
                        {s.meta}
                        {s.href && <ChevronRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />}
                      </span>
                    </>
                  );
                  return (
                    <li key={s.label}>
                      {s.href ? (
                        <Link href={s.href} onClick={() => haptic("tap")} className={cn(ROW_LINK, "-mx-2 min-h-[48px] rounded-lg px-2")}>
                          {body}
                        </Link>
                      ) : (
                        <div className="flex min-h-[48px] items-center gap-3 py-2.5">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <GoButton href={primary.href} className="group w-full sm:w-auto">
              {primary.label} <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </GoButton>
            {secondary && (
              <GoButton href={secondary.href} variant="ghost" className="w-full sm:w-auto">
                {secondary.label}
              </GoButton>
            )}
          </div>
        </div>
      </CardBody>

      {known && (
        <div className="border-t border-[var(--border)]">
          <div className="flex items-baseline justify-between gap-3 px-5 pb-1 pt-4">
            <Eyebrow>Dragging you down</Eyebrow>
            <Link href="/analytics" className="-my-3 flex items-center py-3 text-xs font-semibold text-[var(--accent)] hover:underline">
              All competencies <ChevronRight size={14} />
            </Link>
          </div>
          {drag.length ? (
            <ul className="divide-y divide-[var(--border)] pb-1">
              {drag.map((d) => (
                <DragRow key={d.comp.id} item={d} />
              ))}
            </ul>
          ) : (
            <p className="px-5 pb-4 pt-1 text-sm text-[var(--muted)]">Nothing below {TARGET} — keep mocks sharp.</p>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Domain mastery: ruled list, each bar carries the 80 target tick ───

function DomainMastery({ rows }: { rows: (Readiness["domainMastery"][number] & { name: string })[] }) {
  // Until any domain has signal, a stack of empty bars says nothing — say what unlocks them.
  if (rows.every((d) => d.insufficient)) {
    return (
      <Card>
        <CardBody>
          <SectionHead title="Mastery by domain" />
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="text-sm text-[var(--muted)]">Scores appear at {MIN_SEEN} answers per competency.</p>
            <Link href="/practice" className="-my-3 flex items-center py-3 text-xs font-semibold text-[var(--accent)] hover:underline">
              Start a drill <ChevronRight size={14} />
            </Link>
          </div>
        </CardBody>
      </Card>
    );
  }
  return (
    <Card>
      <CardBody>
        <SectionHead title="Mastery by domain" meta={<TargetLegend />} />
        <ul className="space-y-4">
          {rows.map((d) => {
            const tone = masteryTone(d.mastery, d.insufficient);
            return (
              <li key={d.code} className="flex gap-3">
                <span className="w-8 shrink-0 pt-px text-xs font-semibold tabular-nums text-[var(--muted)]">{d.code}</span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-start justify-between gap-3">
                    <span className="min-w-0 text-sm font-medium leading-snug">{d.name}</span>
                    {d.insufficient ? (
                      <span className="shrink-0 text-xs text-[var(--muted)]">needs {MIN_SEEN}+ answers</span>
                    ) : (
                      <span className="shrink-0 text-sm font-bold tabular-nums" style={{ color: toneVar(tone) }}>
                        {d.mastery}
                      </span>
                    )}
                  </div>
                  <MasteryBar value={d.insufficient ? 0 : d.mastery} tone={tone} />
                </div>
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
}

// ─── Topics: a coverage map plus the topics to retrain ───

const TOPIC_SEGMENTS = [
  { key: "strong", label: "strong", color: "var(--success)" },
  { key: "shaky", label: "shaky", color: "var(--warning)" },
  { key: "weak", label: "weak", color: "var(--danger)" },
] as const;

function TopicsCard({ stats, firstComp }: { stats: TopicStat[]; firstComp?: Competency }) {
  const [showAll, setShowAll] = useState(false);
  const total = stats.length;
  const count = { strong: 0, shaky: 0, weak: 0, untouched: 0 };
  for (const s of stats) count[s.status]++;
  const started = total - count.untouched;
  const flagged = [
    ...stats.filter((s) => s.status === "weak").sort((a, b) => a.accuracy - b.accuracy),
    ...stats.filter((s) => s.status === "shaky").sort((a, b) => a.accuracy - b.accuracy),
  ];
  const LIMIT = 5;
  const shown = showAll ? flagged : flagged.slice(0, LIMIT);

  return (
    <Card>
      <CardBody className="pb-0">
        <SectionHead title="Topics" meta={`${started} of ${total} started`} />
        <div
          className="flex h-2.5 w-full gap-px overflow-hidden rounded-full bg-[var(--surface-2)]"
          role="img"
          aria-label={`${count.strong} strong, ${count.shaky} shaky, ${count.weak} weak, ${count.untouched} not started`}
        >
          {TOPIC_SEGMENTS.map((seg) =>
            count[seg.key] > 0 ? <div key={seg.key} className="h-full" style={{ width: `${(count[seg.key] / total) * 100}%`, background: seg.color }} /> : null
          )}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
          {TOPIC_SEGMENTS.map((seg) => (
            <span key={seg.key} className="inline-flex items-center gap-1.5">
              <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: seg.color }} />
              <span className="font-semibold tabular-nums text-[var(--foreground)]">{count[seg.key]}</span> {seg.label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-2 w-2 rounded-full border border-[var(--muted)] opacity-60" />
            <span className="font-semibold tabular-nums text-[var(--foreground)]">{count.untouched}</span> not started
          </span>
        </div>
      </CardBody>

      {flagged.length > 0 ? (
        <>
          <ul className="mt-4 divide-y divide-[var(--border)] border-t border-[var(--border)]">
            {shown.map((s) => {
              const comp = getCompetency(s.topic.competencyId);
              return (
                <li key={s.topic.id}>
                  <Link href={`/lesson/${s.topic.competencyId}`} onClick={() => haptic("tap")} className={cn(ROW_LINK, "min-h-[56px]")}>
                    <Badge tone={s.status === "weak" ? "danger" : "warning"} className="w-14 shrink-0 justify-center">
                      {s.status}
                    </Badge>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-sm font-medium sm:line-clamp-1">{s.topic.title}</span>
                      <span className="block truncate text-xs tabular-nums text-[var(--muted)]">
                        {comp ? `${comp.code} · ` : ""}
                        {Math.round(s.accuracy * 100)}% recent · {plural(s.attempts, "answer")}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center text-xs font-semibold text-[var(--accent)]">
                      Retrain
                      <ChevronRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {flagged.length > LIMIT && (
            <button
              type="button"
              onClick={() => setShowAll((x) => !x)}
              aria-expanded={showAll}
              className="press min-h-[44px] w-full cursor-pointer border-t border-[var(--border)] py-3 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]/50"
            >
              {showAll ? "Show fewer" : `Show all ${flagged.length}`}
            </button>
          )}
        </>
      ) : started > 0 ? (
        <p className="px-5 py-4 text-sm text-[var(--muted)]">No weak topics right now — keep it up.</p>
      ) : (
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <p className="text-sm text-[var(--muted)]">Lessons map your topics.</p>
          {firstComp && (
            <Link href={`/lesson/${firstComp.id}`} className="-my-3 flex shrink-0 items-center py-3 text-xs font-semibold text-[var(--accent)] hover:underline">
              Start lesson {firstComp.code} <ChevronRight size={14} />
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Study rhythm: level, streak, today — quiet, one card ───

function RhythmCard({
  level,
  levelPct,
  toNext,
  streak,
  staleStreak,
  longest,
  todayPts,
  xp,
}: {
  level: number;
  levelPct: number;
  toNext: number;
  streak: number;
  staleStreak: number;
  longest: number;
  todayPts: number;
  xp: number;
}) {
  const cells = [
    {
      key: "level",
      visual: (
        <Ring value={levelPct} size={40} stroke={4} color="var(--accent)" label={`Level ${level}, ${Math.round(levelPct)}% to level ${level + 1}`}>
          <span className="text-sm font-bold tabular-nums">{level}</span>
        </Ring>
      ),
      title: `Level ${level}`,
      sub: `${toNext.toLocaleString()} pts to level ${level + 1}`,
    },
    {
      key: "streak",
      visual: <Flame size={20} className={streak ? "text-[var(--streak)]" : "text-[var(--muted)] opacity-50"} fill={streak ? "var(--streak)" : "none"} />,
      title: streak ? `${plural(streak, "day")} streak` : "No streak running",
      sub: streak ? `best ${plural(longest, "day")}` : staleStreak ? `was ${plural(staleStreak, "day")} · study today` : "study today to start one",
    },
    {
      key: "today",
      visual: <Zap size={20} className="text-[var(--gold)]" />,
      title: `${todayPts}/${DAILY_GOAL_XP} pts today`,
      sub: `${xp.toLocaleString()} pts all time`,
    },
  ];
  return (
    <Card>
      <div className="grid sm:grid-cols-3">
        {cells.map((c, i) => (
          <div
            key={c.key}
            className={cn("flex min-w-0 items-center gap-3 border-[var(--border)] px-4 py-3.5", i < cells.length - 1 && "border-b sm:border-b-0 sm:border-r")}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center">{c.visual}</span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tabular-nums">{c.title}</div>
              <div className="truncate text-xs tabular-nums text-[var(--muted)]">{c.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Milestones: earned as quiet chips, the next ones with progress ───

function MilestonesCard({ input }: { input: AchievementInput }) {
  const [showAll, setShowAll] = useState(false);
  const earned = ACHIEVEMENTS.filter((a) => a.test(input));
  // Closest to earning first; ties keep the catalogue's natural order.
  const pending = ACHIEVEMENTS.filter((a) => !a.test(input))
    .map((a) => {
      const p = ACH_PROGRESS[a.id]?.(input);
      if (!p) return { a, cur: null, goal: null, ratio: 0 };
      const [raw, goal, base = 0] = p;
      const cur = Math.min(raw, goal);
      return { a, cur, goal, ratio: goal > base ? Math.max(0, cur - base) / (goal - base) : 0 };
    })
    .sort((x, y) => y.ratio - x.ratio);
  const LIMIT = 3;
  const shown = showAll ? pending : pending.slice(0, LIMIT);

  return (
    <Card>
      <CardBody className={pending.length ? "pb-0" : undefined}>
        <SectionHead title="Milestones" meta={`${earned.length} of ${ACHIEVEMENTS.length}`} />
        {earned.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="Earned milestones">
            {earned.map((a) => {
              const Icon = ACH_ICON[a.icon] ?? Award;
              return (
                <li key={a.id} title={a.desc}>
                  <Badge className="text-[var(--foreground)]">
                    <Icon size={12} className="text-[var(--gold)]" aria-hidden /> {a.name}
                  </Badge>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-[var(--muted)]">Your first answer earns the first one.</p>
        )}
      </CardBody>

      {pending.length > 0 && (
        <>
          <Eyebrow className="px-5 pt-4">Next up</Eyebrow>
          <ul className="mt-1 divide-y divide-[var(--border)]">
            {shown.map(({ a, cur, goal, ratio }) => {
              const Icon = ACH_ICON[a.icon] ?? Award;
              return (
                <li key={a.id} className="flex min-h-[56px] items-center gap-3 px-5 py-2.5">
                  <Icon size={18} className="shrink-0 text-[var(--muted)]" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{a.name}</div>
                    <div className="truncate text-xs text-[var(--muted)]">{a.desc}</div>
                  </div>
                  {goal != null && cur != null && (
                    <div className="w-20 shrink-0">
                      <div className="mb-1 text-right text-xs font-semibold tabular-nums text-[var(--muted)]">
                        {cur}/{goal}
                      </div>
                      <Bar value={ratio * 100} tone="gold" className="h-1.5" />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {pending.length > LIMIT && (
            <button
              type="button"
              onClick={() => setShowAll((x) => !x)}
              aria-expanded={showAll}
              className="press min-h-[44px] w-full cursor-pointer border-t border-[var(--border)] py-3 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]/50"
            >
              {showAll ? "Show fewer" : `Show all ${pending.length}`}
            </button>
          )}
        </>
      )}
    </Card>
  );
}
