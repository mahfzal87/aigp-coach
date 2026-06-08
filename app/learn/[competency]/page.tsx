"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, Brain } from "lucide-react";
import { getCompetency, getDomain, getFlashcards, getNotesByCompetency } from "@/lib/content";
import { useProgress } from "@/store/progress";
import { Badge, Button, Card, CardBody } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { FlashcardDeck } from "@/components/quiz/flashcard-deck";

export default function CompetencyPage() {
  const params = useParams<{ competency: string }>();
  const id = params.competency;
  const competency = getCompetency(id);
  const markNoteRead = useProgress((s) => s.markNoteRead);

  const notes = getNotesByCompetency(id);
  const cards = getFlashcards().filter((f) => f.competencyId === id);

  useEffect(() => {
    notes.forEach((n) => markNoteRead(n.id));
  }, [notes, markNoteRead]);

  if (!competency) {
    return (
      <div>
        <p className="text-sm text-[var(--muted)]">Competency not found.</p>
        <Link href="/learn" className="text-[var(--primary)] hover:underline">← Back to Learn</Link>
      </div>
    );
  }
  const domain = getDomain(competency.domainId);

  return (
    <div className="space-y-6">
      <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
        <ArrowLeft size={16} /> All competencies
      </Link>
      <div>
        <Badge tone="primary">Domain {domain?.code} · {competency.code}</Badge>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{competency.name}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{competency.description}</p>
      </div>

      {notes.length > 0 && (
        <div className="space-y-4">
          {notes.map((n) => (
            <Card key={n.id}>
              <CardBody>
                <h2 className="mb-2 text-lg font-semibold">{n.title}</h2>
                <Markdown>{n.bodyMd}</Markdown>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {cards.length > 0 && (
        <Card>
          <CardBody>
            <h2 className="mb-3 text-lg font-semibold">Flashcards</h2>
            <FlashcardDeck cards={cards} />
          </CardBody>
        </Card>
      )}

      <Card className="hover:border-[var(--primary)]">
        <CardBody className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="text-[var(--primary)]" />
            <div className="text-sm font-medium">Ready to test this competency?</div>
          </div>
          <Link href="/practice"><Button variant="outline">Practice now</Button></Link>
        </CardBody>
      </Card>
    </div>
  );
}
