"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getActiveMeta, getFlashcards, getNotes } from "@/lib/content";
import { Badge, Card, PageHeader } from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion";
import { DomainHeader, useCurriculum, type Row } from "@/components/curriculum";

// Study sheets: every competency's topics as a read-only sheet — the same
// domain boards as the Study Plan, but each row opens reading, not a lesson.
export default function StudySheetsPage() {
  const meta = getActiveMeta();
  const plan = useCurriculum();
  const cards = getFlashcards();
  const notes = getNotes();
  const countFor = (list: { competencyId: string | null }[], id: string) => list.filter((x) => x.competencyId === id).length;

  return (
    <div>
      <PageHeader title="Study sheets" subtitle={`Read every topic, no questions · ${meta.name} ${meta.bokLabel}`} />
      <Stagger className="space-y-5" delay={0.04}>
        {plan.units.map((u) => {
          const lessons = u.rows.filter((r) => r.kind === "lesson");
          const topics = lessons.reduce((n, r) => n + r.topicCount, 0);
          return (
            <StaggerItem key={u.domain.id} y={12}>
              <Card className="overflow-hidden">
                <DomainHeader domain={u.domain} right={<span className="text-xs font-semibold tabular-nums text-[var(--muted)]">{topics} topics</span>} />
                <ul className="divide-y divide-[var(--border)]">
                  {lessons.map((r) => (
                    <SheetRow key={r.id} row={r} cards={countFor(cards, r.id)} notes={countFor(notes, r.id)} />
                  ))}
                </ul>
              </Card>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}

function SheetRow({ row, cards, notes }: { row: Row; cards: number; notes: number }) {
  const extras = [
    `${row.topicCount} topic${row.topicCount === 1 ? "" : "s"}`,
    cards ? `${cards} card${cards === 1 ? "" : "s"}` : null,
    notes ? `${notes} note${notes === 1 ? "" : "s"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <li>
      <Link
        href={`/learn/${row.id}`}
        className="group flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]/50 sm:px-5"
      >
        <span className="hidden w-10 shrink-0 text-xs font-semibold tabular-nums text-[var(--muted)] sm:block">{row.code}</span>
        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 text-sm font-semibold leading-snug sm:line-clamp-1">{row.name}</div>
          <div className="mt-0.5 text-xs text-[var(--muted)]">
            <span className="font-semibold sm:hidden">{row.code} · </span>
            {extras}
          </div>
        </div>
        {row.status === "done" && <Badge tone="success" className="shrink-0">Passed</Badge>}
        {row.status === "paused" && <Badge tone="accent" className="shrink-0 whitespace-nowrap">In progress</Badge>}
        {row.status === "retake" && <Badge tone="warning" className="shrink-0 whitespace-nowrap">Best {Math.round((row.best ?? 0) * 100)}%</Badge>}
        <ChevronRight size={16} className="shrink-0 text-[var(--muted)] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </li>
  );
}
