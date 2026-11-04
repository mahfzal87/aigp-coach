"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Check, Crosshair, Swords, Target, X } from "lucide-react";
import { getPackExtras, getQuestions } from "@/lib/content";
import { ATTACK_STEPS, DECISION_RULES, TRAP_WORDS, TYPE_PLAYBOOK } from "@/content/strategy-structured";
import type { Question, QuestionType } from "@/lib/types";
import { Badge, Bar, Button, Card, CardBody, PageHeader } from "@/components/ui";
import { Drill } from "@/components/quiz/drill";
import { useIsClient } from "@/components/library-ui";
import { useProgress } from "@/store/progress";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const DRILL_SIZE = 10; // a technique drill is a short, finishable set
const MIN_ANSWERS = 5; // below this a hit rate is noise, not a verdict

type Tone = "success" | "warning" | "danger";
const rateTone = (r: number): Tone => (r >= 0.85 ? "success" : r >= 0.7 ? "warning" : "danger");
const TONE_TEXT: Record<Tone, string> = { success: "text-[var(--success)]", warning: "text-[var(--warning)]", danger: "text-[var(--danger)]" };
const pct = (r: number) => `${Math.round(r * 100)}%`;

interface TypeRow {
  type: QuestionType;
  label: string;
  move: string;
  trap: string;
  bank: number;
  answered: number;
  correct: number;
  rate: number | null; // null until MIN_ANSWERS
}

function shuffle<T>(xs: T[]): T[] {
  return xs
    .map((x) => [Math.random(), x] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([, x]) => x);
}

export default function StrategyPage() {
  const client = useIsClient(); // progress lives in localStorage — render it only after hydration
  const attempts = useProgress((s) => s.attempts);
  const [drill, setDrill] = useState<{ type: QuestionType; questions: Question[]; run: number } | null>(null);

  const rows = useMemo<TypeRow[]>(() => {
    const qs = getQuestions();
    const typeOf = new Map(qs.map((q) => [q.id, q.type]));
    const tally = new Map<QuestionType, { n: number; c: number }>();
    for (const a of attempts) {
      const t = typeOf.get(a.questionId);
      if (!t) continue;
      const v = tally.get(t) ?? { n: 0, c: 0 };
      v.n++;
      if (a.correct) v.c++;
      tally.set(t, v);
    }
    return TYPE_PLAYBOOK.map((p) => {
      const v = tally.get(p.type) ?? { n: 0, c: 0 };
      return { ...p, bank: qs.filter((q) => q.type === p.type).length, answered: v.n, correct: v.c, rate: v.n >= MIN_ANSWERS ? v.c / v.n : null };
    });
  }, [attempts]);

  const rated = rows.filter((r) => r.rate !== null && r.bank > 0).sort((a, b) => (a.rate as number) - (b.rate as number) || b.answered - a.answered);
  const weakest = client ? rated[0] : undefined;
  const starter = [...rows].filter((r) => r.bank > 0).sort((a, b) => b.bank - a.bank)[0];
  const target = weakest ?? starter;

  // Missed-last-time first, then unseen, then the rest — capped to a finishable set.
  function startDrill(type: QuestionType) {
    haptic("tap");
    const pool = getQuestions().filter((q) => q.type === type);
    const last = new Map<string, boolean>();
    for (const a of useProgress.getState().attempts) last.set(a.questionId, a.correct);
    const missed = shuffle(pool.filter((q) => last.get(q.id) === false));
    const unseen = shuffle(pool.filter((q) => !last.has(q.id)));
    const rest = shuffle(pool.filter((q) => last.get(q.id) === true));
    setDrill((d) => ({ type, questions: [...missed, ...unseen, ...rest].slice(0, DRILL_SIZE), run: (d?.run ?? 0) + 1 }));
    window.scrollTo({ top: 0 });
  }
  function exitDrill() {
    setDrill(null);
    window.scrollTo({ top: 0 });
  }

  if (drill) {
    const play = rows.find((t) => t.type === drill.type);
    return (
      <div>
        <PageHeader title={`Technique drill · ${play?.label ?? "Mixed"}`} subtitle={play ? `Winning move: ${play.move}` : undefined} />
        {/* The drill's own End / summary actions are the way out — no second exit button here. */}
        <Drill
          key={drill.run}
          questions={drill.questions}
          mode="strategy"
          onExit={exitDrill}
          exitLabel="Back to strategy"
          onNewSession={() => startDrill(drill.type)}
          newSessionLabel={play && play.bank > DRILL_SIZE ? `Next ${DRILL_SIZE}` : "Run again"}
        />
      </div>
    );
  }

  const tiles = getPackExtras().strategyTiles;
  const solid = (weakest?.rate ?? 0) >= 0.85; // even the lowest type is strong
  const showRates = client && rows.some((r) => r.answered > 0); // a brand-new user sees no wall of "not tried"
  const verdictTone = weakest && weakest.rate !== null ? rateTone(weakest.rate) : null;

  return (
    <div className="space-y-5">
      <PageHeader title="Question strategy" subtitle="Technique decides the close calls." />

      {/* Verdict — the one thing to do next (the screen's lit hero) */}
      {target && (
        <Card className="mesh">
          <CardBody className={cn("flex flex-col gap-5 p-6 sm:flex-row sm:items-center", !client && "invisible")}>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--muted)]">
                <Target size={14} aria-hidden /> {weakest ? (solid ? "Your lowest question type" : "Your weakest question type") : "Start with the most common type"}
              </p>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-[31px] font-extrabold leading-none">{target.label}</h2>
                {weakest && weakest.rate !== null && verdictTone && (
                  <span className={cn("font-display text-[31px] font-extrabold leading-none tabular-nums", TONE_TEXT[verdictTone])}>{pct(weakest.rate)}</span>
                )}
              </div>
              {weakest && weakest.rate !== null && verdictTone ? (
                <div className="mt-3 max-w-xs">
                  <Bar value={weakest.rate * 100} tone={verdictTone} className="h-2" />
                  <p className="mt-1.5 text-sm text-[var(--muted)]">
                    {weakest.correct} of {weakest.answered} right{solid ? " — every type looks solid" : ""}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-[var(--muted)]">{target.bank} in the bank</p>
              )}
            </div>
            <Button size="lg" className="w-full shrink-0 sm:w-auto" onClick={() => startDrill(target.type)}>
              Drill {Math.min(DRILL_SIZE, target.bank)} questions <ArrowRight size={16} aria-hidden />
            </Button>
          </CardBody>
        </Card>
      )}

      {/* The method in one glance */}
      <Card className="overflow-hidden">
        <CardBody>
          <h2 className="mb-4 flex items-center gap-2 text-lg">
            <Crosshair size={18} aria-hidden className="text-[var(--primary)]" /> The method — six moves, every question
          </h2>
          <ol className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {ATTACK_STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <Badge tone="primary" className="h-7 w-7 shrink-0 justify-center px-0 font-display text-sm tabular-nums">{i + 1}</Badge>
                <div className="min-w-0">
                  <div className="text-sm font-bold leading-7">{s.title}</div>
                  <p className="text-[13px] leading-relaxed text-[var(--muted)]">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardBody>
        {tiles.length > 0 && (
          <div className="grid grid-cols-2 border-t border-[var(--border)] sm:grid-cols-4">
            {tiles.map((t, i) => (
              <div key={t.label} className={cn("min-w-0 px-5 py-4", i % 2 === 1 && "border-l border-[var(--border)]", i >= 2 && "border-t border-[var(--border)] sm:border-t-0", i === 2 && "sm:border-l")}>
                <div className="font-display text-[25px] font-bold leading-none tabular-nums text-[color-mix(in_srgb,var(--primary)_82%,var(--foreground))]">{t.stat}</div>
                <div className="mt-1.5 text-[13px] font-semibold">{t.label}</div>
                <div className="mt-0.5 text-xs leading-snug text-[var(--muted)]">{t.sub}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Playbooks — one row per type, with your hit rate and a drill */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-5">
          <h2 className="flex items-center gap-2 text-lg">
            <Swords size={18} aria-hidden className="text-[var(--accent)]" /> Playbook by question type
          </h2>
          {showRates && <span className="text-[13px] text-[var(--muted)]">Your hit rate</span>}
        </div>
        <ul className="divide-y divide-[var(--border)]">
          {rows.map((r) => {
            const isWeakest = !solid && weakest?.type === r.type;
            const n = Math.min(DRILL_SIZE, r.bank);
            return (
              <li key={r.type} className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-[15px] font-bold">{r.label}</span>
                    {isWeakest && <Badge tone="warning">Weakest</Badge>}
                    <span className="text-xs text-[var(--muted)]">{r.bank} in bank</span>
                  </div>
                  {showRates && <HitRate row={r} className="hidden sm:flex" />}
                  <Button size="sm" variant={isWeakest ? "soft" : "outline"} disabled={n === 0} onClick={() => startDrill(r.type)} className="h-11 shrink-0 sm:h-9">
                    Drill {n}
                  </Button>
                </div>
                {showRates && <HitRate row={r} className="mt-2 sm:hidden" />}
                <div className="mt-2 space-y-1 text-sm leading-snug">
                  <p className="flex gap-1.5">
                    <Check size={15} aria-hidden className="mt-0.5 shrink-0 text-[var(--success)]" />
                    <span className="min-w-0"><span className="sr-only">Winning move: </span>{r.move}</span>
                  </p>
                  <p className="flex gap-1.5 text-[var(--muted)]">
                    <AlertTriangle size={15} aria-hidden className="mt-0.5 shrink-0 text-[var(--warning)]" />
                    <span className="min-w-0"><span className="sr-only">Trap: </span>{r.trap}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Trap radar */}
      <Card>
        <CardBody>
          <h2 className="mb-3 text-lg">Trap radar — words that decide answers</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-[color-mix(in_srgb,var(--danger)_80%,var(--foreground))]">
                <X size={14} aria-hidden /> Distrust in an option
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TRAP_WORDS.wrong.map((w) => <Badge key={w} tone="danger">{w}</Badge>)}
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-[color-mix(in_srgb,var(--success)_80%,var(--foreground))]">
                <Check size={14} aria-hidden /> Lean toward
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TRAP_WORDS.right.map((w) => <Badge key={w} tone="success">{w}</Badge>)}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* House rules */}
      <Card>
        <CardBody>
          <h2 className="mb-1 text-lg">What IAPP rewards — six house rules</h2>
          <ul className="grid sm:grid-cols-2 sm:gap-x-8">
            {DECISION_RULES.map((r, i) => (
              <li key={r.rule} className={cn("border-t border-[var(--border)] py-3", i === 0 && "border-t-0", i === 1 && "sm:border-t-0")}>
                <div className="text-sm font-bold">{r.rule}</div>
                <div className="mt-0.5 text-[13px] leading-relaxed text-[var(--muted)]">{r.detail}</div>
              </li>
            ))}
          </ul>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[var(--border)] pt-3 text-[13px] text-[var(--muted)]">
            <Badge>Tip</Badge> Tag every miss: knowledge, technique or read error.
            <Link href="/analytics" className="relative font-semibold text-[var(--accent-ink)] underline-offset-2 before:absolute before:-inset-x-1 before:-inset-y-3 before:content-[''] hover:underline">See your pattern</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

function HitRate({ row, className }: { row: TypeRow; className?: string }) {
  if (row.rate === null)
    return (
      <span className={cn("flex shrink-0 text-xs text-[var(--muted)]", className)}>
        {row.answered ? `${row.answered} answered — too few to rate` : "Not tried yet"}
      </span>
    );
  const tone = rateTone(row.rate);
  return (
    <div className={cn("flex w-full shrink-0 items-center gap-2 sm:w-36", className)} title={`${row.correct} of ${row.answered} right`}>
      <Bar value={row.rate * 100} tone={tone} className="h-1.5 min-w-0 flex-1" />
      <span className={cn("w-11 text-right font-display text-[15px] font-bold tabular-nums", TONE_TEXT[tone])}>{pct(row.rate)}</span>
    </div>
  );
}
