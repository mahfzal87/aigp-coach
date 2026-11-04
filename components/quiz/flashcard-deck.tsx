"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import type { Flashcard } from "@/lib/types";
import { getCompetency } from "@/lib/content";
import { isDue } from "@/lib/sm2";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { useProgress } from "@/store/progress";
import { Badge, Button, buttonVariants } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { m, springSoft } from "@/components/motion";
import { Callout, Kbd, SegmentTrack } from "@/components/practice-kit";

// SM-2 grades (lib/sm2.ts): 0 = Again (relearn), 3 Hard, 4 Good, 5 Easy.
const GRADES = [
  { g: 0, label: "Again", key: "1", tone: "danger", text: "text-[color-mix(in_srgb,var(--danger)_82%,var(--foreground))]" },
  { g: 3, label: "Hard", key: "2", tone: "warning", text: "text-[color-mix(in_srgb,var(--warning)_70%,var(--foreground))]" },
  { g: 4, label: "Good", key: "3", tone: "primary", text: "text-[color-mix(in_srgb,var(--primary)_82%,var(--foreground))]" },
  { g: 5, label: "Easy", key: "4", tone: "success", text: "text-[color-mix(in_srgb,var(--success)_80%,var(--foreground))]" },
] as const;

interface DeckState {
  sig: string;
  order: string[]; // card ids for this pass; an "Again" card returns once at the end
  idx: number;
  flipped: boolean;
  results: boolean[]; // per reviewed card: knew it (grade ≥ 3)?
  tally: Record<number, number>;
  requeued: string[];
}

function fresh(cards: Flashcard[], sig: string): DeckState {
  return { sig, order: cards.map((c) => c.id), idx: 0, flipped: false, results: [], tally: {}, requeued: [] };
}

function dueIn(ms: number): string {
  const d = Math.max(1, Math.round(ms / 86_400_000));
  return d < 30 ? `${d}d` : `${Math.round(d / 30)}mo`;
}

// A face of the card. Both faces share one grid cell, so the card is as tall as its
// longer side, and backface-visibility hides whichever side faces away.
const FACE =
  "col-start-1 row-start-1 flex min-h-48 flex-col gap-3 rounded-[18px] border border-[var(--border)] p-5 [-webkit-backface-visibility:hidden] [backface-visibility:hidden]";

export function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  const reduce = useReducedMotion();
  const grade = useProgress((s) => s.gradeFlashcard);
  const states = useProgress((s) => s.flashcards);
  const [now] = useState(() => Date.now());
  const rootRef = useRef<HTMLDivElement>(null);

  const sig = useMemo(() => cards.map((c) => c.id).join("|"), [cards]);
  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);
  const [deck, setDeck] = useState(() => fresh(cards, sig));
  if (deck.sig !== sig) setDeck(fresh(cards, sig)); // a different card set restarts the deck

  if (cards.length === 0) return <p className="text-sm text-[var(--muted)]">No flashcards here yet.</p>;

  const done = deck.idx >= deck.order.length;
  const card = done ? undefined : byId.get(deck.order[deck.idx]);
  const compIds = new Set(cards.map((c) => c.competencyId));
  const comp = compIds.size === 1 ? getCompetency(cards[0].competencyId) : undefined;

  function focusDeck() {
    rootRef.current?.focus({ preventScroll: true });
  }

  function flip() {
    if (done) return;
    haptic("tap");
    setDeck((d) => ({ ...d, flipped: !d.flipped }));
    focusDeck(); // keeps 1–4 working after the click
  }

  function rate(g: number) {
    if (!card || !deck.flipped) return;
    haptic(g >= 3 ? "select" : "tap");
    grade(card.id, g);
    setDeck((d) => {
      const again = g < 3 && !d.requeued.includes(card.id);
      return {
        ...d,
        order: again ? [...d.order, card.id] : d.order,
        requeued: again ? [...d.requeued, card.id] : d.requeued,
        idx: d.idx + 1,
        flipped: false,
        results: [...d.results, g >= 3],
        tally: { ...d.tally, [g]: (d.tally[g] ?? 0) + 1 },
      };
    });
    focusDeck();
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (done || e.metaKey || e.ctrlKey || e.altKey) return;
    if (!deck.flipped && (e.key === " " || e.key === "Enter")) {
      e.preventDefault();
      flip();
      return;
    }
    const gr = deck.flipped ? GRADES.find((x) => x.key === e.key) : undefined;
    if (gr) {
      e.preventDefault();
      rate(gr.g);
    }
  }

  if (done || !card) {
    const reviewed = deck.results.length;
    const knew = deck.results.filter(Boolean).length;
    return (
      <Callout className="flex flex-col items-center gap-3 px-5 py-7 text-center">
        <span className="anim-pop grid h-11 w-11 place-items-center rounded-full bg-[var(--success)]/15 text-[color-mix(in_srgb,var(--success)_80%,var(--foreground))]">
          <Check size={22} strokeWidth={2.75} />
        </span>
        <div>
          <h3 className="text-[17px]">Deck done</h3>
          <p className="mt-0.5 text-sm text-[var(--muted)]">
            You knew {knew} of {reviewed} {reviewed === 1 ? "card" : "cards"}.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {GRADES.filter((x) => deck.tally[x.g]).map((x) => (
            <Badge key={x.g} tone={x.tone}>
              {deck.tally[x.g]} {x.label.toLowerCase()}
            </Badge>
          ))}
        </div>
        <div className="mt-1 flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row">
          <Button variant="outline" onClick={() => setDeck(fresh(cards, sig))}>
            <RotateCcw size={15} /> Review again
          </Button>
          {comp && (
            <Link href={`/practice?competency=${comp.id}`} className={buttonVariants({ variant: "primary" })}>
              Practice {comp.code} questions
            </Link>
          )}
        </div>
      </Callout>
    );
  }

  const st = states[card.id];
  const isRepeat = deck.idx >= cards.length; // an "Again" card coming back this session
  const status = isRepeat
    ? { l: "Relearn", tone: "danger" as const }
    : !st
      ? { l: "New", tone: "accent" as const }
      : isDue(st, now)
        ? { l: "Due", tone: "warning" as const }
        : { l: `Next in ${dueIn(st.due - now)}`, tone: "default" as const };

  return (
    <div ref={rootRef} tabIndex={-1} onKeyDown={onKey} className="outline-none">
      <div className="mb-3 flex items-center gap-3">
        <SegmentTrack results={deck.results} total={deck.order.length} current={deck.idx} className="min-w-0 flex-1" />
        <span className="shrink-0 text-xs font-semibold tabular-nums text-[var(--muted)]">
          {deck.idx + 1} / {deck.order.length}
        </span>
      </div>

      {/* each card slides in fresh (keyed), so the next answer never shows mid-turn */}
      <m.div key={deck.idx} initial={reduce ? false : { opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={springSoft} className="[perspective:1400px]">
        <m.div
          className="grid [transform-style:preserve-3d]"
          initial={false}
          animate={{ rotateY: deck.flipped ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 24, mass: 0.9 }}
        >
          {/* front: the prompt, lit faintly by the exam's light */}
          <button
            type="button"
            onClick={flip}
            aria-hidden={deck.flipped}
            tabIndex={deck.flipped ? -1 : 0}
            className={cn(
              FACE,
              "cursor-pointer justify-between bg-[var(--primary)]/6 text-left hover:border-[color-mix(in_srgb,var(--primary)_40%,var(--border))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              deck.flipped && "pointer-events-none"
            )}
          >
            <span className="flex justify-end">
              <Badge tone={status.tone}>{status.l}</Badge>
            </span>
            <span className="block font-display text-[20px] font-bold leading-snug">{card.front}</span>
            <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
              <span className="pointer-fine:hidden">Tap to flip</span>
              <span className="hidden items-center gap-1 pointer-fine:inline-flex">
                Click or press <Kbd>Space</Kbd>
              </span>
            </span>
          </button>

          {/* back: the answer (turned 180° so it reads right once the card flips) */}
          <div aria-hidden={!deck.flipped} className={cn(FACE, "bg-[var(--surface-2)] [transform:rotateY(180deg)]", !deck.flipped && "pointer-events-none")}>
            <span className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-[var(--muted)]">Answer</span>
              <button type="button" tabIndex={deck.flipped ? 0 : -1} onClick={flip} className="-m-2 cursor-pointer p-2 text-xs font-semibold text-[var(--accent)] hover:underline">
                Flip back
              </button>
            </span>
            <span className="block text-sm font-medium text-[var(--muted)]">{card.front}</span>
            <div className="border-t border-[var(--border)] pt-3">
              <Markdown className="text-[15px] leading-relaxed">{card.back}</Markdown>
            </div>
          </div>
        </m.div>
      </m.div>

      {deck.flipped ? (
        <div className="mt-3">
          <div className="mb-2 text-center text-xs text-[var(--muted)]">How well did you know it?</div>
          <div className="grid grid-cols-4 gap-2" role="group" aria-label="Grade this card">
            {GRADES.map((x) => (
              <Button key={x.g} variant="outline" onClick={() => rate(x.g)} className={cn("px-2", x.text)}>
                {x.label}
                <Kbd>{x.key}</Kbd>
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3 flex justify-center">
          <Button onClick={flip}>Show answer</Button>
        </div>
      )}
    </div>
  );
}
