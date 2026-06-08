"use client";

import { useState } from "react";
import type { Flashcard } from "@/lib/types";
import { useProgress } from "@/store/progress";
import { Button, Card, CardBody } from "@/components/ui";

const GRADES: [number, string, "danger" | "warning" | "primary" | "success"][] = [
  [0, "Again", "danger"],
  [3, "Hard", "warning"],
  [4, "Good", "primary"],
  [5, "Easy", "success"],
];

export function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  const grade = useProgress((s) => s.gradeFlashcard);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) return <p className="text-sm text-[var(--muted)]">No flashcards here yet.</p>;
  if (idx >= cards.length)
    return (
      <Card><CardBody className="text-center text-sm">
        <p className="mb-3">Deck complete — {cards.length} card{cards.length === 1 ? "" : "s"} reviewed.</p>
        <Button variant="outline" onClick={() => { setIdx(0); setFlipped(false); }}>Restart</Button>
      </CardBody></Card>
    );

  const card = cards[idx];

  function rate(g: number) {
    grade(card.id, g);
    setFlipped(false);
    setIdx((i) => i + 1);
  }

  return (
    <div>
      <div className="mb-2 text-xs text-[var(--muted)]">Card {idx + 1} / {cards.length}</div>
      <Card>
        <button onClick={() => setFlipped((f) => !f)} className="block w-full text-left">
          <CardBody className="min-h-40">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">{flipped ? "Answer" : "Question"}</div>
            <div className="mt-2 text-base leading-relaxed">{flipped ? card.back : card.front}</div>
            {!flipped && <div className="mt-4 text-xs text-[var(--muted)]">Tap to reveal</div>}
          </CardBody>
        </button>
      </Card>
      {flipped ? (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {GRADES.map(([g, l, tone]) => (
            <Button key={g} variant="outline" onClick={() => rate(g)} className={`border-[var(--${tone})] text-[var(--${tone})]`}>{l}</Button>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex justify-center">
          <Button onClick={() => setFlipped(true)}>Show answer</Button>
        </div>
      )}
    </div>
  );
}
