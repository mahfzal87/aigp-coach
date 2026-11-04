"use client";

import { useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowRight, ChevronDown, RotateCcw, SearchX } from "lucide-react";
import { getCompetencies, getDomains, getQuestions } from "@/lib/content";
import { shuffle } from "@/lib/scoring";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { Question, QuestionType } from "@/lib/types";
import { useHydrated, useProgress } from "@/store/progress";
import { Button, Card, CardBody, PageHeader } from "@/components/ui";
import { AnimatedNumber } from "@/components/motion";
import { ActionTray, Segmented } from "@/components/practice-kit";
import { Drill } from "@/components/quiz/drill";
import { TYPE_LABEL } from "@/components/quiz/question-view";

type Pool = "all" | "unseen" | "missed";
type Size = 10 | 20 | "all";
interface Filters {
  competency: string;
  type: string;
  difficulty: string;
  pool: Pool;
}
type FilterKey = keyof Filters;

const DEFAULTS: Filters = { competency: "all", type: "all", difficulty: "all", pool: "all" };
const TYPES: QuestionType[] = ["best", "not", "ordering", "role", "distinction", "recall"];
const DIFFS = [
  { v: "1", l: "Easy" },
  { v: "2", l: "Medium" },
  { v: "3", l: "Hard" },
];
const POOLS: { v: Pool; l: string; title: string }[] = [
  { v: "all", l: "All", title: "Every question, least-seen first" },
  { v: "unseen", l: "Unseen", title: "Questions you have never answered" },
  { v: "missed", l: "Missed before", title: "Questions you have answered wrong at least once" },
];
const SUBTITLE = "Untimed drills. Instant rationale.";

// Deep links: /practice?competency=ii-c&pool=missed|unseen&type=not&difficulty=3
function filtersFrom(search: string): Filters {
  const p = new URLSearchParams(search);
  const c = p.get("competency");
  const t = p.get("type");
  const d = p.get("difficulty");
  const pool = p.get("pool");
  return {
    competency: c && getCompetencies().some((x) => x.id === c) ? c : "all",
    type: t && (TYPES as string[]).includes(t) ? t : "all",
    difficulty: d && ["1", "2", "3"].includes(d) ? d : "all",
    pool: pool === "unseen" || pool === "missed" ? pool : "all",
  };
}

// The query string as an external store (no useSearchParams — it forces dynamic
// rendering). React re-reads the snapshot after every commit, and Next writes the new
// URL in an insertion effect before that check, so in-app <Link>/router.push
// navigations are picked up as reliably as full loads; popstate covers back/forward.
function subscribeToHistory(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}
function useLocationSearch(): string {
  return useSyncExternalStore(
    subscribeToHistory,
    () => window.location.search,
    () => ""
  );
}

function matches(q: Question, f: Filters, seen: Set<string>, wrong: Set<string>, skip?: FilterKey) {
  if (skip !== "competency" && f.competency !== "all" && q.competencyId !== f.competency) return false;
  if (skip !== "type" && f.type !== "all" && q.type !== f.type) return false;
  if (skip !== "difficulty" && f.difficulty !== "all" && String(q.difficulty) !== f.difficulty) return false;
  if (skip !== "pool") {
    if (f.pool === "unseen" && seen.has(q.id)) return false;
    if (f.pool === "missed" && !wrong.has(q.id)) return false;
  }
  return true;
}

export default function PracticePage() {
  const hydrated = useHydrated();
  const attempts = useProgress((s) => s.attempts);
  const comps = getCompetencies();
  const domains = getDomains();

  const [f, setF] = useState<Filters>(DEFAULTS);
  const [size, setSize] = useState<Size>(20);
  const [session, setSession] = useState<{ key: number; questions: Question[]; label: string } | null>(null);
  const sessionCount = useRef(0);

  // Apply URL params whenever the query string changes (first load, in-app deep link,
  // back/forward). A new link while a drill runs returns to the setup with its filters.
  const search = useLocationSearch();
  const [appliedSearch, setAppliedSearch] = useState<string | null>(null);
  if (search !== appliedSearch) {
    setAppliedSearch(search);
    setF(filtersFrom(search));
    if (appliedSearch !== null) setSession(null);
  }

  const seenIds = useMemo(() => new Set(attempts.map((a) => a.questionId)), [attempts]);
  const wrongIds = useMemo(() => new Set(attempts.filter((a) => !a.correct).map((a) => a.questionId)), [attempts]);

  // Live counts. Each facet is counted against the OTHER filters, so every chip shows
  // what it would yield — and a chip that would yield nothing is disabled at 0.
  const facets = useMemo(() => {
    const all = getQuestions();
    const by = (skip: FilterKey, key: (q: Question) => string) => {
      const m = new Map<string, number>();
      let total = 0;
      for (const q of all) {
        if (!matches(q, f, seenIds, wrongIds, skip)) continue;
        total++;
        const k = key(q);
        m.set(k, (m.get(k) ?? 0) + 1);
      }
      return { m, total };
    };
    let scope = 0;
    let right = 0;
    let missed = 0;
    let unseen = 0;
    for (const q of all) {
      if (!matches(q, f, seenIds, wrongIds, "pool")) continue;
      scope++;
      if (!seenIds.has(q.id)) unseen++;
      else if (wrongIds.has(q.id)) missed++;
      else right++;
    }
    return {
      competency: by("competency", (q) => q.competencyId),
      type: by("type", (q) => q.type),
      difficulty: by("difficulty", (q) => String(q.difficulty)),
      pool: { scope, right, missed, unseen },
    };
  }, [f, seenIds, wrongIds]);

  const matching = useMemo(() => getQuestions().filter((q) => matches(q, f, seenIds, wrongIds)), [f, seenIds, wrongIds]);
  const n = matching.length;
  const effSize = size === "all" ? n : Math.min(size, n);
  const sizes = ([10, 20] as const).filter((s) => s < n);
  const dirty = (Object.keys(DEFAULTS) as FilterKey[]).some((k) => f[k] !== DEFAULTS[k]);
  const comp = comps.find((c) => c.id === f.competency);

  const nameOf = (k: FilterKey): string =>
    k === "competency"
      ? (comp?.code ?? "competency")
      : k === "type"
        ? (TYPE_LABEL[f.type] ?? f.type)
        : k === "difficulty"
          ? (DIFFS.find((d) => d.v === f.difficulty)?.l ?? "difficulty")
          : (POOLS.find((p) => p.v === f.pool)?.l ?? "pool");

  // Zero matches → the single filter whose removal brings back the most questions.
  const relax = useMemo(() => {
    if (n > 0) return null;
    let best: { key: FilterKey; count: number } | null = null;
    for (const key of ["pool", "difficulty", "type", "competency"] as FilterKey[]) {
      if (f[key] === DEFAULTS[key]) continue;
      const count = getQuestions().filter((q) => matches(q, f, seenIds, wrongIds, key)).length;
      if (count > 0 && (!best || count > best.count)) best = { key, count };
    }
    return best;
  }, [n, f, seenIds, wrongIds]);

  function set(patch: Partial<Filters>) {
    haptic("tap");
    setF((x) => ({ ...x, ...patch }));
  }

  function begin() {
    if (n === 0) return;
    // Variety engine: shuffle, then stable-sort so least-seen questions come first.
    const counts = new Map<string, number>();
    for (const a of useProgress.getState().attempts) counts.set(a.questionId, (counts.get(a.questionId) ?? 0) + 1);
    const qs = shuffle(matching)
      .sort((a, b) => (counts.get(a.id) ?? 0) - (counts.get(b.id) ?? 0))
      .slice(0, effSize);
    // context line for the drill, as a plain phrase: "II.C, missed before, hard"
    const parts = [
      comp?.code,
      f.pool !== "all" ? POOLS.find((p) => p.v === f.pool)?.l.toLowerCase() : undefined,
      f.type !== "all" ? TYPE_LABEL[f.type] : undefined,
      f.difficulty !== "all" ? DIFFS.find((d) => d.v === f.difficulty)?.l.toLowerCase() : undefined,
    ].filter(Boolean);
    haptic("tap");
    sessionCount.current += 1;
    setSession({ key: sessionCount.current, questions: qs, label: parts.length ? parts.join(", ") : "All questions, least-seen first" });
    window.scrollTo({ top: 0 });
  }

  if (!hydrated) {
    return (
      <div>
        <PageHeader title="Practice" subtitle={SUBTITLE} />
        <Card>
          <CardBody className="h-96 animate-pulse motion-reduce:animate-none" />
        </Card>
      </div>
    );
  }

  // ── Session ──
  if (session) {
    return (
      <Drill
        key={session.key}
        questions={session.questions}
        ordered
        mode="practice"
        label={session.label}
        onExit={() => {
          setSession(null);
          window.scrollTo({ top: 0 });
        }}
        exitLabel="Change filters"
        onNewSession={begin}
        newSessionLabel="New drill"
      />
    );
  }

  // ── Setup ──
  const p = facets.pool;
  const answeredPct = p.scope ? Math.round(((p.right + p.missed) / p.scope) * 100) : 0;
  return (
    <div>
      <PageHeader title="Practice" subtitle={SUBTITLE} />
      <Card>
        {/* hero instrument: how much of this slice of the bank is done, and what is left */}
        <CardBody className="flex items-center gap-5">
          <div className="w-[4.5rem] shrink-0 text-center">
            <AnimatedNumber value={answeredPct} format={(v) => `${v}%`} className="font-display text-[31px] font-bold leading-none tracking-tight sm:text-[39px]" />
            <div className="mt-1.5 text-xs text-[var(--muted)]">answered</div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <span className="min-w-0 truncate text-sm font-semibold">{comp ? `${comp.code} ${comp.name}` : "Your question bank"}</span>
              <span className="text-xs tabular-nums text-[var(--muted)]">{p.scope} questions</span>
            </div>
            <BankBar right={p.right} missed={p.missed} unseen={p.unseen} focus={f.pool} />
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
              <Legend tone="liquid" n={p.right} label="right" />
              <Legend tone="danger" n={p.missed} label="missed before" />
              <Legend tone="empty" n={p.unseen} label="unseen" />
            </div>
          </div>
        </CardBody>

        <div className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
          <Row label="Focus">
            <Segmented
              id="practice-focus"
              ariaLabel="Focus"
              value={f.pool}
              onChange={(v) => v && set({ pool: v })}
              options={POOLS.map((o) => {
                const count = o.v === "all" ? p.scope : o.v === "unseen" ? p.unseen : p.missed;
                return { value: o.v, label: o.l, count, disabled: count === 0, title: o.title };
              })}
            />
          </Row>

          <Row label="Competency">
            <div className="relative w-full sm:max-w-md">
              <select
                aria-label="Competency"
                value={f.competency}
                onChange={(e) => set({ competency: e.target.value })}
                className="h-11 w-full cursor-pointer appearance-none truncate rounded-2xl border border-[var(--border)] bg-[var(--surface)] pl-3.5 pr-10 text-sm font-medium text-[var(--foreground)] focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary)]/15"
              >
                <option value="all">All competencies ({facets.competency.total})</option>
                {domains.map((d) => (
                  <optgroup key={d.id} label={`Domain ${d.code}: ${d.name}`}>
                    {comps
                      .filter((c) => c.domainId === d.id)
                      .map((c) => {
                        const count = facets.competency.m.get(c.id) ?? 0;
                        return (
                          <option key={c.id} value={c.id} disabled={count === 0 && c.id !== f.competency}>
                            {c.code} {c.name} ({count})
                          </option>
                        );
                      })}
                  </optgroup>
                ))}
              </select>
              <ChevronDown size={16} aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            </div>
          </Row>

          <Row label="Type">
            <Segmented
              id="practice-type"
              ariaLabel="Question type"
              value={f.type}
              onChange={(v) => v && set({ type: v })}
              options={[
                { value: "all", label: "All", count: facets.type.total },
                ...TYPES.map((t) => {
                  const count = facets.type.m.get(t) ?? 0;
                  return { value: t as string, label: TYPE_LABEL[t], count, disabled: count === 0, title: count === 0 ? "None with the other filters" : undefined };
                }),
              ]}
            />
          </Row>

          <Row label="Difficulty">
            <Segmented
              id="practice-difficulty"
              ariaLabel="Difficulty"
              value={f.difficulty}
              onChange={(v) => v && set({ difficulty: v })}
              options={[
                { value: "all", label: "Any", count: facets.difficulty.total },
                ...DIFFS.map((d) => {
                  const count = facets.difficulty.m.get(d.v) ?? 0;
                  return { value: d.v, label: d.l, count, disabled: count === 0, title: count === 0 ? "None with the other filters" : undefined };
                }),
              ]}
            />
          </Row>

          {n > 0 && (
            <Row label="Session">
              <Segmented
                id="practice-size"
                ariaLabel="Session length"
                value={effSize === n ? "all" : String(effSize)}
                onChange={(v) => {
                  if (!v) return;
                  haptic("tap");
                  setSize(v === "all" ? "all" : (Number(v) as 10 | 20));
                }}
                options={[...sizes.map((s) => ({ value: String(s), label: `${s} questions` })), { value: "all", label: `All ${n}` }]}
              />
            </Row>
          )}
        </div>

        {/* direct child of the Card so the phone tray can stay sticky while the card scrolls */}
        <ActionTray className="mx-3 mb-3 md:mx-0 md:mb-0 md:mt-0 md:px-5 md:pb-5">
          {n > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 pl-1 md:pl-0">
                <div className="whitespace-nowrap text-sm">
                  <span className="font-bold tabular-nums">{n}</span> <span className="sm:hidden">match</span>
                  <span className="hidden sm:inline">{n === 1 ? "question matches" : "questions match"}</span>
                </div>
                <div className="hidden text-xs text-[var(--muted)] sm:block">{effSize} this session, least-seen first</div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {dirty && (
                  <Button variant="ghost" onClick={() => set(DEFAULTS)} className="px-3 md:h-10">
                    <RotateCcw size={14} /> Reset
                  </Button>
                )}
                <Button onClick={begin} className="md:h-10">
                  Start drill <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          ) : (
            // Dead end → the fix is the primary action: drop the one filter that brings most back.
            <div className="flex items-center justify-between gap-3" role="status">
              <div className="min-w-0 pl-1 md:pl-0">
                <div className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-[var(--danger)]">
                  <SearchX size={15} className="shrink-0" /> <span className="sm:hidden">No match</span>
                  <span className="hidden sm:inline">Nothing matches</span>
                </div>
                <div className="hidden text-xs text-[var(--muted)] sm:block">{dirty ? "This filter mix is empty" : "No questions in this bank yet"}</div>
              </div>
              {dirty && (
                <div className="flex shrink-0 items-center gap-1.5">
                  {relax && (
                    <Button variant="ghost" onClick={() => set(DEFAULTS)} className="hidden px-3 sm:inline-flex md:h-10">
                      <RotateCcw size={14} /> Reset all
                    </Button>
                  )}
                  {relax ? (
                    <Button onClick={() => set({ ...f, [relax.key]: DEFAULTS[relax.key] })} className="md:h-10">
                      Drop {nameOf(relax.key)} ({relax.count})
                    </Button>
                  ) : (
                    <Button onClick={() => set(DEFAULTS)} className="md:h-10">
                      <RotateCcw size={14} /> Reset all
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </ActionTray>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 px-5 py-3.5 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:items-center sm:gap-4">
      <div className="text-[13px] font-medium text-[var(--muted)]">{label}</div>
      <div className="flex min-w-0 flex-wrap gap-2">{children}</div>
    </div>
  );
}

// "Right" pours the exam's liquid (like the shared Bar); missed keeps the danger status;
// unseen is the empty glass of the track.
const SEG = {
  liquid: "bg-[linear-gradient(90deg,var(--glow),var(--primary))]",
  danger: "bg-[var(--danger)]",
  empty: "bg-transparent ring-1 ring-inset ring-[var(--muted)]/45",
} as const;

// The bank as one capsule: right / missed / unseen. The chosen focus stays lit.
function BankBar({ right, missed, unseen, focus }: { right: number; missed: number; unseen: number; focus: Pool }) {
  const total = right + missed + unseen;
  const seg = (v: number) => (total ? `${(v / total) * 100}%` : "0%");
  const lit = (k: "right" | "missed") => focus === "all" || (focus === "missed" && k === "missed");
  return (
    <div
      role="img"
      aria-label={`${right} answered right, ${missed} missed before, ${unseen} unseen`}
      className="mt-2.5 flex h-3 w-full gap-[3px] overflow-hidden rounded-full bg-[var(--surface-2)] p-[2px] ring-1 ring-inset ring-[var(--border)]"
    >
      {[
        { k: "right" as const, v: right, c: SEG.liquid },
        { k: "missed" as const, v: missed, c: SEG.danger },
      ]
        .filter((s) => s.v > 0)
        .map((s) => (
          <span
            key={s.k}
            style={{ width: seg(s.v) }}
            className={cn("h-full rounded-full motion-safe:transition-[width,opacity] motion-safe:duration-500", s.c, !lit(s.k) && "opacity-25")}
          />
        ))}
    </div>
  );
}

function Legend({ tone, n, label }: { tone: keyof typeof SEG; n: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className={cn("h-2 w-2 rounded-full", SEG[tone])} />
      <span className="font-semibold tabular-nums text-[var(--foreground)]">{n}</span> {label}
    </span>
  );
}
