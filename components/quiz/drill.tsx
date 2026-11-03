"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown, CornerDownLeft, Flag, RotateCcw, Scale, TriangleAlert, X } from "lucide-react";
import type { Confidence, Question, RootCause } from "@/lib/types";
import { correctLabels, isAnswerCorrect, shuffle } from "@/lib/scoring";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { useProgress } from "@/store/progress";
import { Badge, Button, Card, CardBody } from "@/components/ui";
import { AnimatedNumber, MotionBar, Reveal } from "@/components/motion";
import { ActionTray, Kbd, LetterChip, SegmentTrack, ToggleChip } from "@/components/practice-kit";
import { QuestionView, orderedOptions, requiredPicks } from "@/components/quiz/question-view";

export const CONFIDENCE_LEVELS: { v: Confidence; label: string; key: string }[] = [
  { v: 1, label: "Sure", key: "S" },
  { v: 2, label: "Unsure", key: "U" },
  { v: 3, label: "Guess", key: "G" },
];

// Same K/T/R vocabulary as Analytics and the Strategy tip.
export const ROOT_CAUSES: { v: RootCause; label: string; hint: string; key: string }[] = [
  { v: "K", label: "Knowledge", hint: "Didn't know the rule", key: "K" },
  { v: "T", label: "Technique", hint: "Knew it, fell for the bait", key: "T" },
  { v: "R", label: "Read error", hint: "Misread the stem or an option", key: "R" },
];

const PASS_LINE = 62; // raw-percent equivalent of the 300 scaled pass mark (lib/scoring.ts)

interface Entry {
  q: Question;
  chosen: string[];
  correct: boolean;
  confidence: Confidence;
  attemptId: string | null;
  rootCause?: RootCause;
}

export interface DrillProps {
  questions: Question[];
  mode?: "practice" | "strategy";
  onExit?: () => void;
  /** Keep the given order (Practice pre-sorts least-seen first). Default: shuffle. */
  ordered?: boolean;
  /** Context line above the progress track, e.g. "Practice · II.C · Hard". */
  label?: string;
  /** Summary action that leaves the drill (default "Back"). */
  exitLabel?: string;
  /** Summary "go again" action. Default: the same questions, reshuffled. */
  onNewSession?: () => void;
  newSessionLabel?: string;
}

// Self-contained practice runner over a fixed question list (Practice, Strategy
// technique drills, the mock miss drill). Each run (first pass, "retry misses",
// "again") is its own keyed DrillRun, so loop state always starts clean.
export function Drill(props: DrillProps) {
  const { questions, ordered = false } = props;
  const sig = useMemo(() => questions.map((q) => q.id).join("|"), [questions]);
  const [srcSig, setSrcSig] = useState(sig);
  const [run, setRun] = useState(() => ({ id: 1, queue: ordered ? [...questions] : shuffle(questions), retry: false }));
  // A genuinely new question set from the parent starts a fresh run.
  if (sig !== srcSig) {
    setSrcSig(sig);
    setRun({ id: run.id + 1, queue: ordered ? [...questions] : shuffle(questions), retry: false });
  }
  const again = () => setRun({ id: run.id + 1, queue: ordered ? [...questions] : shuffle(questions), retry: false });
  return (
    <DrillRun
      key={run.id}
      {...props}
      queue={run.queue}
      retry={run.retry}
      onAgain={props.onNewSession ?? again}
      onRetryMisses={(qs) => setRun({ id: run.id + 1, queue: shuffle(qs), retry: true })}
    />
  );
}

function submitBlocker(n: number, need: number | null): string | null {
  if (need === 1) return n === 0 ? "Pick an answer first" : null;
  if (need === null) return n === 0 ? "Pick at least one" : null;
  if (n === 0) return `Pick ${need} answers`;
  if (n < need) return `Pick ${need - n} more`;
  if (n > need) return `Only ${need} — unpick ${n - need}`;
  return null;
}

function scrollToTop(el: HTMLElement | null) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 88;
  if (window.scrollY > top) window.scrollTo({ top: Math.max(0, top) });
}

function DrillRun({
  queue,
  retry,
  mode = "practice",
  label,
  onExit,
  exitLabel = "Back",
  newSessionLabel,
  onNewSession,
  onAgain,
  onRetryMisses,
}: DrillProps & { queue: Question[]; retry: boolean; onAgain: () => void; onRetryMisses: (qs: Question[]) => void }) {
  const recordAttempt = useProgress((s) => s.recordAttempt);
  const setRootCause = useProgress((s) => s.setRootCause);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [confidence, setConfidence] = useState<Confidence>(2);
  const [log, setLog] = useState<Entry[]>([]);
  const [ended, setEnded] = useState(false);
  const [nudge, setNudge] = useState(false);
  const startRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const nudgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q: Question | undefined = queue[idx];
  const opts = useMemo(() => (q ? orderedOptions(q) : []), [q]);
  const blocker = q ? submitBlocker(selected.length, requiredPicks(q)) : null;
  const entry = revealed ? log[log.length - 1] : undefined;
  const isLast = idx + 1 >= queue.length;
  const contextLine = retry ? [label, "Retry misses"].filter(Boolean).join(" · ") : label;

  // The answer clock starts when a question appears.
  useEffect(() => {
    startRef.current = Date.now();
  }, [idx]);
  // After the reveal, focus Next: Enter continues and screen readers land on the action.
  useEffect(() => {
    if (revealed) rootRef.current?.querySelector<HTMLButtonElement>("[data-drill-next]")?.focus({ preventScroll: true });
  }, [revealed]);
  useEffect(
    () => () => {
      if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
    },
    []
  );

  function toggle(lbl: string) {
    if (!q || revealed) return;
    setNudge(false);
    if (q.isMultiselect) setSelected((s) => (s.includes(lbl) ? s.filter((x) => x !== lbl) : [...s, lbl]));
    else setSelected([lbl]);
  }

  function flashNudge() {
    haptic("tap");
    setNudge(true);
    if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
    nudgeTimer.current = setTimeout(() => setNudge(false), 2400);
  }

  function submit() {
    if (!q || revealed) return;
    if (blocker) return flashNudge();
    const correct = isAnswerCorrect(q, selected);
    recordAttempt({ questionId: q.id, competencyId: q.competencyId, chosen: selected, correct, confidence, timeMs: Date.now() - startRef.current, mode });
    // the attempt we just recorded (for K/T/R tagging)
    const all = useProgress.getState().attempts;
    let attemptId: string | null = null;
    for (let i = all.length - 1; i >= 0; i--) {
      if (all[i].questionId === q.id) {
        attemptId = all[i].id;
        break;
      }
    }
    haptic(correct ? "success" : "error");
    setNudge(false);
    setLog((l) => [...l, { q, chosen: selected, correct, confidence, attemptId }]);
    setRevealed(true);
  }

  function next() {
    if (!revealed) return;
    if (isLast) {
      setEnded(true);
    } else {
      setIdx(idx + 1);
      setSelected([]);
      setRevealed(false);
      setConfidence(2);
    }
    scrollToTop(rootRef.current);
  }

  function end() {
    if (log.length === 0) return onExit?.();
    haptic("tap");
    setEnded(true);
    scrollToTop(rootRef.current);
  }

  function tag(i: number, rc: RootCause) {
    const e = log[i];
    if (!e) return;
    const nextRc = e.rootCause === rc ? undefined : rc; // tap the active tag again to clear it
    if (e.attemptId) setRootCause(e.attemptId, nextRc);
    haptic("tap");
    setLog(log.map((x, j) => (j === i ? { ...x, rootCause: nextRc } : x)));
  }

  // Desktop shortcuts: 1–n / letters pick · S U G confidence · Enter submit & next · K T R tag.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (ended || e.defaultPrevented || e.isComposing || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target instanceof HTMLElement ? e.target : null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (t?.closest('[role="dialog"], [role="menu"], [role="listbox"], [aria-modal="true"]')) return; // overlays keep their keys
      if (e.key === "Enter") {
        if (e.repeat) return;
        const toggleEl = t?.closest("[data-kbd-toggle]");
        if (toggleEl) {
          // Enter on an unpressed option/chip presses it (native); on a pressed one it advances.
          if (toggleEl.getAttribute("aria-pressed") !== "true") return;
        } else if (t?.closest("button, a, summary, [role=button]")) {
          return; // other focused controls keep their own Enter
        }
        e.preventDefault();
        if (revealed) next();
        else submit();
        return;
      }
      if (e.key.length !== 1) return;
      const up = e.key.toUpperCase();
      if (!revealed) {
        if (/^[1-9]$/.test(e.key)) {
          const o = opts[Number(e.key) - 1];
          if (o) {
            e.preventDefault();
            toggle(o.label);
          }
          return;
        }
        if (opts.some((o) => o.label === up)) {
          e.preventDefault();
          toggle(up);
          return;
        }
        const c = CONFIDENCE_LEVELS.find((x) => x.key === up);
        if (c) {
          e.preventDefault();
          setConfidence(c.v);
        }
      } else if (entry && !entry.correct) {
        const rc = ROOT_CAUSES.find((x) => x.key === up);
        if (rc) {
          e.preventDefault();
          tag(log.length - 1, rc.v);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (queue.length === 0) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-[var(--muted)]">No questions to drill here yet.</p>
          {onExit && (
            <Button variant="outline" onClick={onExit}>
              {exitLabel}
            </Button>
          )}
        </CardBody>
      </Card>
    );
  }

  if (ended || !q) {
    return (
      <div ref={rootRef}>
        <Summary
          log={log}
          total={queue.length}
          label={contextLine}
          onTag={tag}
          onRetry={() => onRetryMisses(log.filter((e) => !e.correct).map((e) => e.q))}
          onAgain={onAgain}
          againLabel={onNewSession ? newSessionLabel ?? "New drill" : "Run again"}
          onExit={onExit}
          exitLabel={exitLabel}
        />
      </div>
    );
  }

  const right = log.filter((e) => e.correct).length;
  const letters = opts.map((o) => o.label).sort();
  const firstLetter = letters[0] ?? "A";
  const lastLetter = letters[letters.length - 1] ?? "D";

  return (
    <div ref={rootRef}>
      {/* session header: context · progress · end */}
      <div className="mb-4">
        {contextLine && <div className="mb-2 truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{contextLine}</div>}
        <div className="flex items-center gap-3">
          <SegmentTrack results={log.map((e) => e.correct)} total={queue.length} current={idx} className="min-w-0 flex-1" />
          <span className="shrink-0 text-xs font-semibold tabular-nums text-[var(--muted)]">
            {idx + 1} / {queue.length}
            {queue.length > 40 && log.length > 0 && <span className="font-medium"> · {right} right</span>}
          </span>
          {(log.length > 0 || onExit) && (
            <Button variant="ghost" size="sm" onClick={end} className="-mr-2 h-11 shrink-0 md:h-9" aria-label={log.length > 0 ? "End session and see the summary" : "Leave this drill"}>
              <Flag size={14} /> End
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardBody>
          <QuestionView question={q} selected={selected} onToggle={toggle} revealed={revealed} showTrap />

          {entry && !entry.correct && (
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-sm font-semibold">Why did you miss it?</span>
              <CauseChips value={entry.rootCause} onPick={(rc) => tag(log.length - 1, rc)} showKeys />
            </div>
          )}

          <ActionTray>
            {!revealed ? (
              <div className="flex items-center justify-between gap-2">
                <div role="group" aria-label="Confidence" className="flex min-w-0 items-center gap-1.5">
                  <span className="mr-1 hidden text-xs font-medium text-[var(--muted)] md:inline">Confidence</span>
                  {CONFIDENCE_LEVELS.map((c) => (
                    <ToggleChip
                      key={c.v}
                      active={confidence === c.v}
                      data-kbd-toggle=""
                      title={`${c.label} · key ${c.key}`}
                      onClick={() => {
                        haptic("tap");
                        setConfidence(c.v);
                      }}
                      className="h-11 px-3 text-[13px] md:h-10"
                    >
                      {c.label}
                    </ToggleChip>
                  ))}
                </div>
                <div className="relative flex shrink-0 items-center gap-3">
                  {blocker && (
                    <span aria-hidden className={cn("hidden text-xs md:inline", nudge ? "font-semibold text-[var(--danger)]" : "text-[var(--muted)]")}>
                      {blocker}
                    </span>
                  )}
                  <Button
                    onClick={submit}
                    aria-disabled={!!blocker}
                    aria-describedby={blocker ? "drill-submit-why" : undefined}
                    className={cn("md:h-10", blocker && "cursor-not-allowed opacity-50")}
                  >
                    Submit
                    <Kbd className="border-0 bg-[var(--primary-fg)]/20 text-[var(--primary-fg)]">
                      <CornerDownLeft size={11} />
                    </Kbd>
                  </Button>
                  {nudge && blocker && (
                    <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg bg-[var(--foreground)] px-2.5 py-1.5 text-xs font-semibold text-[var(--background)] shadow-[var(--e2)] md:hidden">
                      {blocker}
                    </span>
                  )}
                  <span id="drill-submit-why" className="sr-only" aria-live="polite">
                    {blocker ?? ""}
                  </span>
                </div>
              </div>
            ) : (
              entry && (
                <div className="flex items-center justify-between gap-3">
                  <Verdict entry={entry} />
                  <Button data-drill-next="" onClick={next} className="shrink-0 md:h-10">
                    {isLast ? "Finish" : "Next"} <ArrowRight size={16} />
                    <Kbd className="border-0 bg-[var(--primary-fg)]/20 text-[var(--primary-fg)]">
                      <CornerDownLeft size={11} />
                    </Kbd>
                  </Button>
                </div>
              )
            )}
          </ActionTray>
        </CardBody>
      </Card>

      {/* one-line key legend (mouse/trackpad devices only) */}
      <div className="mt-3 hidden flex-wrap items-center justify-end gap-x-4 gap-y-1 text-[11px] text-[var(--muted)] pointer-fine:flex">
        {!revealed ? (
          <>
            <span className="inline-flex items-center gap-1">
              <Kbd>1</Kbd>–<Kbd>{opts.length}</Kbd> or <Kbd>{firstLetter}</Kbd>–<Kbd>{lastLetter}</Kbd> pick
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>S</Kbd>
              <Kbd>U</Kbd>
              <Kbd>G</Kbd> confidence
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>
                <CornerDownLeft size={10} />
              </Kbd>{" "}
              submit
            </span>
          </>
        ) : (
          <>
            {entry && !entry.correct && (
              <span className="inline-flex items-center gap-1">
                <Kbd>K</Kbd>
                <Kbd>T</Kbd>
                <Kbd>R</Kbd> tag the miss
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Kbd>
                <CornerDownLeft size={10} />
              </Kbd>{" "}
              {isLast ? "finish" : "next"}
            </span>
          </>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {entry ? (entry.correct ? "Correct." : `Incorrect. The answer is ${correctLabels(entry.q).join(", ")}.`) : ""}
      </p>
    </div>
  );
}

function Verdict({ entry }: { entry: Entry }) {
  const correct = correctLabels(entry.q);
  const tookNear = !entry.correct && !!entry.q.nearMiss && entry.chosen.includes(entry.q.nearMiss);
  const sub = entry.correct
    ? entry.confidence === 3
      ? "Guessed right — read the why"
      : null
    : tookNear
      ? "You took the near-miss"
      : entry.confidence === 1
        ? "Confident miss"
        : null;
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        className={cn(
          "anim-pop grid h-8 w-8 shrink-0 place-items-center rounded-full",
          entry.correct ? "bg-[var(--success)] text-[var(--primary-fg)]" : "bg-[var(--danger)] text-white"
        )}
      >
        {entry.correct ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
      </span>
      <div className="min-w-0 leading-tight">
        <div className={cn("text-sm font-bold", entry.correct ? "text-[var(--success)]" : "text-[var(--danger)]")}>
          {entry.correct ? "Correct" : `Incorrect · answer ${correct.join(", ")}`}
        </div>
        {sub && <div className="mt-0.5 truncate text-xs text-[var(--muted)]">{sub}</div>}
      </div>
    </div>
  );
}

function CauseChips({ value, onPick, showKeys, small }: { value?: RootCause; onPick: (rc: RootCause) => void; showKeys?: boolean; small?: boolean }) {
  return (
    <div role="group" aria-label="Why did you miss it?" className="flex flex-wrap gap-1.5">
      {ROOT_CAUSES.map((c) => {
        const on = value === c.v;
        return (
          <ToggleChip
            key={c.v}
            active={on}
            data-kbd-toggle=""
            title={on ? `${c.hint} — tap again to clear` : c.hint}
            onClick={() => onPick(c.v)}
            className={small ? "px-2.5" : undefined}
          >
            {c.label}
            {on ? <X size={12} aria-hidden /> : showKeys ? <Kbd>{c.key}</Kbd> : null}
          </ToggleChip>
        );
      })}
    </div>
  );
}

// ─── End-of-session summary ───

function Summary({
  log,
  total,
  label,
  onTag,
  onRetry,
  onAgain,
  againLabel,
  onExit,
  exitLabel,
}: {
  log: Entry[];
  total: number;
  label?: string;
  onTag: (i: number, rc: RootCause) => void;
  onRetry: () => void;
  onAgain: () => void;
  againLabel: string;
  onExit?: () => void;
  exitLabel: string;
}) {
  const n = log.length;
  const right = log.filter((e) => e.correct).length;
  const acc = n ? Math.round((right / n) * 100) : 0;
  // confident misses first — they are the costly ones
  const misses = log
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => !e.correct)
    .sort((a, b) => Number(b.e.confidence === 1) - Number(a.e.confidence === 1));
  const untagged = misses.filter(({ e }) => !e.rootCause).length;

  return (
    <Reveal className="space-y-4">
      <Card>
        <CardBody className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                {n < total ? `Ended early · ${n} of ${total}` : "Session complete"}
                {label ? ` · ${label}` : ""}
              </div>
              <div className="mt-1 flex items-baseline gap-2.5">
                <AnimatedNumber value={acc} format={(v) => `${v}%`} className="text-4xl font-bold tracking-tight" />
                <span className="text-sm text-[var(--muted)]">
                  {right} of {n} right
                </span>
              </div>
            </div>
            {n >= 5 && <Badge tone={acc >= PASS_LINE ? "success" : "danger"}>{acc >= PASS_LINE ? "Above the pass line" : "Below the pass line"}</Badge>}
          </div>
          <SegmentTrack results={log.map((e) => e.correct)} total={n} />
          <ConfidenceCheck log={log} />
        </CardBody>
      </Card>

      {/* next step first, the detail after */}
      <div className="flex flex-col gap-2 sm:flex-row">
        {misses.length > 0 && (
          <Button onClick={onRetry}>
            <RotateCcw size={15} /> Retry {misses.length} {misses.length === 1 ? "miss" : "misses"}
          </Button>
        )}
        <Button variant={misses.length > 0 ? "outline" : "primary"} onClick={onAgain}>
          {againLabel} {misses.length === 0 && <ArrowRight size={15} />}
        </Button>
        {onExit && (
          <Button variant="ghost" onClick={onExit}>
            {exitLabel}
          </Button>
        )}
      </div>

      {misses.length > 0 && (
        <Card>
          <div className="flex items-center justify-between gap-3 px-5 pb-1 pt-4">
            <span className="text-sm font-semibold">Misses · {misses.length}</span>
            <span className="text-xs text-[var(--muted)]">{untagged > 0 ? `${untagged} untagged — tag why` : "All tagged"}</span>
          </div>
          <ul className="divide-y divide-[var(--border)]">
            {misses.map(({ e, i }) => (
              <MissRow key={`${e.q.id}-${i}`} entry={e} onTag={(rc) => onTag(i, rc)} />
            ))}
          </ul>
        </Card>
      )}
    </Reveal>
  );
}

function ConfidenceCheck({ log }: { log: Entry[] }) {
  const rows = CONFIDENCE_LEVELS.map((c) => {
    const es = log.filter((e) => e.confidence === c.v);
    return { ...c, n: es.length, right: es.filter((e) => e.correct).length };
  }).filter((r) => r.n > 0);
  const misses = log.filter((e) => !e.correct).length;
  const sureMiss = log.filter((e) => e.confidence === 1 && !e.correct).length;
  const nearTaken = log.filter((e) => !e.correct && !!e.q.nearMiss && e.chosen.includes(e.q.nearMiss)).length;
  const sure = rows.find((r) => r.v === 1);
  return (
    <div>
      <div className="mb-2.5 text-sm font-semibold">Confidence check</div>
      <div className="space-y-2.5">
        {rows.map((r) => {
          const p = Math.round((r.right / r.n) * 100);
          return (
            <div key={r.v} className="grid grid-cols-[4.25rem_minmax(0,1fr)_5.5rem] items-center gap-3 text-sm">
              <span className="font-medium">{r.label}</span>
              <MotionBar value={p} tone={p >= 80 ? "success" : p >= 60 ? "warning" : "danger"} />
              <span className="text-right text-xs tabular-nums text-[var(--muted)]">
                {r.right}/{r.n} · {p}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 space-y-1.5 text-xs">
        {sureMiss > 0 && (
          <p className="flex items-center gap-1.5 font-semibold text-[var(--danger)]">
            <TriangleAlert size={14} className="shrink-0" /> {sureMiss} confident {sureMiss === 1 ? "miss" : "misses"} — review {sureMiss === 1 ? "it" : "them"} first.
          </p>
        )}
        {nearTaken > 0 && (
          <p className="flex items-center gap-1.5 font-semibold text-[var(--warning)]">
            <Scale size={14} className="shrink-0" /> {nearTaken} of {misses} {misses === 1 ? "miss" : "misses"} took the near-miss.
          </p>
        )}
        {sureMiss === 0 && sure && sure.n >= 3 && (
          <p className="flex items-center gap-1.5 font-semibold text-[var(--success)]">
            <Check size={14} className="shrink-0" /> Every &ldquo;Sure&rdquo; was right.
          </p>
        )}
      </div>
    </div>
  );
}

function MissRow({ entry, onTag }: { entry: Entry; onTag: (rc: RootCause) => void }) {
  const [open, setOpen] = useState(false);
  const correct = correctLabels(entry.q);
  const tookNear = !!entry.q.nearMiss && entry.chosen.includes(entry.q.nearMiss);
  const square = entry.q.isMultiselect;
  return (
    <li className="px-5 py-3.5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          haptic("tap");
          setOpen((o) => !o);
        }}
        className="flex w-full cursor-pointer items-start gap-3 text-left"
      >
        <div className="min-w-0 flex-1">
          {!open && <div className="line-clamp-2 text-sm font-medium">{entry.q.stem}</div>}
          <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[var(--muted)]", !open && "mt-1.5")}>
            <span className="inline-flex items-center gap-1">
              You
              {entry.chosen.length === 0 ? " —" : [...entry.chosen].sort().map((l) => <LetterChip key={l} label={l} tone="danger" square={square} className="h-5 w-5 text-[10px]" />)}
              <ArrowRight size={12} className="mx-0.5" /> answer
              {correct.map((l) => (
                <LetterChip key={l} label={l} tone="success" square={square} className="h-5 w-5 text-[10px]" />
              ))}
            </span>
            {entry.confidence === 1 && <span className="font-semibold text-[var(--danger)]">Confident miss</span>}
            {tookNear && <span className="font-semibold text-[var(--warning)]">Took the near-miss</span>}
            <span className="font-medium text-[var(--accent)]">{open ? "Hide" : "Review"}</span>
          </div>
        </div>
        <ChevronDown size={16} className={cn("mt-0.5 shrink-0 text-[var(--muted)] transition-transform", open && "rotate-180")} />
      </button>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className="hidden text-xs text-[var(--muted)] sm:inline">Why?</span>
        <CauseChips value={entry.rootCause} onPick={onTag} small />
      </div>
      {open && (
        <div className="mt-3">
          <QuestionView question={entry.q} selected={entry.chosen} onToggle={() => {}} revealed disabled showTrap />
        </div>
      )}
    </li>
  );
}
