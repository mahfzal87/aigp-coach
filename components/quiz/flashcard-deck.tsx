"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, Check, RotateCcw } from "lucide-react";
import type { Flashcard } from "@/lib/types";
import { getCompetency } from "@/lib/content";
import { isDue } from "@/lib/sm2";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { useProgress } from "@/store/progress";
import { Badge, Button } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { Reveal } from "@/components/motion";
import { Callout, Kbd, SegmentTrack } from "@/components/practice-kit";

// SM-2 grades (lib/sm2.ts): 0 = Again (relearn), 3 Hard, 4 Good, 5 Easy.
const GRADES = [
  { g: 0, label: "Again", key: "1", text: "text-[var(--danger)]" },
  { g: 3, label: "Hard", key: "2", text: "text-[var(--warning)]" },
  { g: 4, label: "Good", key: "3", text: "text-[var(--primary)]" },
  { g: 5, label: "Easy", key: "4", text: "text-[var(--success)]" },
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

export function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  const router = useRouter();
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
      <Reveal>
        <Callout className="flex flex-col items-center gap-3 px-5 py-6 text-center">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--success)]/15 text-[var(--success)]">
            <Check size={20} strokeWidth={2.75} />
          </span>
          <div>
            <div className="text-base font-semibold">Deck done · {cards.length} {cards.length === 1 ? "card" : "cards"}</div>
            <div className="mt-1 text-xs text-[var(--muted)]">
              Knew {knew} of {reviewed} reviews
              {GRADES.filter((x) => deck.tally[x.g]).map((x) => (
                <span key={x.g}>
                  {" · "}
                  <span className={cn("font-semibold", x.text)}>{deck.tally[x.g]}</span> {x.label.toLowerCase()}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-1 flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row">
            <Button variant="outline" onClick={() => setDeck(fresh(cards, sig))}>
              <RotateCcw size={15} /> Review again
            </Button>
            {comp && (
              <Button onClick={() => router.push(`/practice?competency=${comp.id}`)}>
                Practice {comp.code} questions <ArrowRight size={15} />
              </Button>
            )}
          </div>
        </Callout>
      </Reveal>
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

      {!deck.flipped ? (
        <button
          type="button"
          onClick={flip}
          className="press flex min-h-44 w-full cursor-pointer flex-col justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/50"
        >
          <span className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Prompt</span>
            <Badge tone={status.tone}>{status.l}</Badge>
          </span>
          <span className="block text-lg font-semibold leading-snug">{card.front}</span>
          <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <span className="pointer-fine:hidden">Tap to reveal</span>
            <span className="hidden items-center gap-1 pointer-fine:inline-flex">
              Click or press <Kbd>Space</Kbd>
            </span>
          </span>
        </button>
      ) : (
        <Reveal y={6} className="flex min-h-44 flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <span className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Answer</span>
            <button type="button" onClick={flip} className="-m-2 cursor-pointer p-2 text-xs font-semibold text-[var(--accent)] hover:underline">
              Hide
            </button>
          </span>
          <span className="block text-sm font-medium text-[var(--muted)]">{card.front}</span>
          <div className="border-t border-[var(--border)] pt-3">
            <Markdown className="text-[15px] leading-relaxed">{card.back}</Markdown>
          </div>
        </Reveal>
      )}

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
