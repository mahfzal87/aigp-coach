"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ArrowLeft, ArrowRight, Brain, Lightbulb, SearchX } from "lucide-react";
import { getActiveMeta, getCompetency, getDomain, getFlashcards, getNotesByCompetency, getTopicsByCompetency } from "@/lib/content";
import { LESSON_PASS } from "@/lib/gamify";
import { computeTopicStats, type TopicStatus } from "@/lib/topic-stats";
import { cn } from "@/lib/utils";
import type { Topic } from "@/lib/types";
import { useProgress } from "@/store/progress";
import { Badge, Card, CardBody } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { FlashcardDeck } from "@/components/quiz/flashcard-deck";
import { NavButton, useCurriculum, type Row } from "@/components/curriculum";

const PASS_PCT = Math.round(LESSON_PASS * 100);

const TOPIC_STATUS: Record<TopicStatus, { label: string; tone: "success" | "warning" | "danger" | "default"; chip: string; dot: string }> = {
  strong: { label: "Strong", tone: "success", chip: "bg-[var(--success)]/15 text-[var(--success)]", dot: "bg-[var(--success)]" },
  shaky: { label: "Shaky", tone: "warning", chip: "bg-[var(--warning)]/15 text-[var(--warning)]", dot: "bg-[var(--warning)]" },
  weak: { label: "Weak", tone: "danger", chip: "bg-[var(--danger)]/15 text-[var(--danger)]", dot: "bg-[var(--danger)]" },
  untouched: { label: "Not tested", tone: "default", chip: "bg-[var(--surface-2)] text-[var(--muted)]", dot: "bg-[var(--muted)]/40" },
};

function lessonState(row: Row | undefined): { badge: string; tone: "success" | "accent" | "warning" | "default"; detail: string; action: string } {
  if (!row) return { badge: "Not started", tone: "default", detail: "", action: "Start lesson" };
  const best = Math.round((row.best ?? 0) * 100);
  if (row.session) return { badge: "In progress", tone: "accent", detail: `step ${row.session.step + 1} of ${row.session.total}`, action: "Resume lesson" };
  if (row.status === "done") return { badge: "Passed", tone: "success", detail: `best ${best}%`, action: "Review lesson" };
  if (row.status === "retake") return { badge: `Best ${best}%`, tone: "warning", detail: `${PASS_PCT}% passes`, action: "Retake lesson" };
  return { badge: "Not started", tone: "default", detail: `${row.steps} steps · ~${row.minutes} min`, action: "Start lesson" };
}

// A competency's study sheet: every topic's concept + example to read through,
// with the learner's per-topic standing, plus notes and flashcards — and the
// lesson that tests it one click away.
export default function StudySheetPage() {
  const { competency: id } = useParams<{ competency: string }>();
  const competency = getCompetency(id);
  const attempts = useProgress((s) => s.attempts);
  const markNoteRead = useProgress((s) => s.markNoteRead);
  const plan = useCurriculum();

  const topics = useMemo(() => getTopicsByCompetency(id), [id]);
  const notes = useMemo(() => getNotesByCompetency(id), [id]);
  const cards = useMemo(() => getFlashcards().filter((f) => f.competencyId === id), [id]);
  const status = useMemo(() => {
    const map = new Map<string, TopicStatus>();
    for (const s of computeTopicStats(attempts)) if (s.topic.competencyId === id) map.set(s.topic.id, s.status);
    return map;
  }, [attempts, id]);

  useEffect(() => {
    notes.forEach((n) => markNoteRead(n.id));
  }, [notes, markNoteRead]);

  if (!competency) return <SheetNotFound />;
  const domain = getDomain(competency.domainId);
  const row = plan.units.flatMap((u) => u.rows).find((r) => r.id === id);
  const lesson = lessonState(row);
  const bank = row?.qCount ?? 0;

  return (
    <div className="space-y-6">
      <Link href="/learn" className="-ml-1 inline-flex h-11 items-center gap-1 rounded-lg px-1 text-sm sm:h-9 text-[var(--muted)] hover:text-[var(--foreground)]">
        <ArrowLeft size={16} aria-hidden /> Study sheets
      </Link>

      <header>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Domain {domain?.code} · {competency.code}
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{competency.name}</h1>
        <p className="mt-1 line-clamp-3 text-sm text-[var(--muted)]">{competency.description}</p>
      </header>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)]">
              <Badge tone={lesson.tone}>{lesson.badge}</Badge>
              {lesson.detail && <span>{lesson.detail}</span>}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <NavButton href={`/lesson/${id}`} className="group w-full sm:w-auto">
                {lesson.action} <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </NavButton>
              {bank > 0 && (
                <NavButton href={`/practice?competency=${id}`} variant="outline" className="w-full sm:w-auto">
                  <Brain size={15} aria-hidden /> Drill {bank} questions
                </NavButton>
              )}
            </div>
          </div>
          {topics.length > 0 && <TopicStrip topics={topics} status={status} />}
        </CardBody>
      </Card>

      {topics.length > 0 && (
        <Card className="overflow-hidden">
          <ol className="divide-y divide-[var(--border)]">
            {topics.map((t, i) => {
              const st = status.get(t.id) ?? "untouched";
              return (
                <li key={t.id} id={t.id} className="scroll-mt-24 space-y-3 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-[11px] font-bold tabular-nums text-[var(--muted)]">{i + 1}</span>
                    <h2 className="min-w-0 flex-1 text-base font-bold leading-snug">{t.title}</h2>
                    {st !== "untouched" && (
                      <Badge tone={TOPIC_STATUS[st].tone} className="shrink-0">
                        {TOPIC_STATUS[st].label}
                      </Badge>
                    )}
                  </div>
                  <div className="prose-note text-[15px] leading-relaxed">
                    <Markdown>{t.conceptMd}</Markdown>
                  </div>
                  <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/6 p-4">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                      <Lightbulb size={13} aria-hidden /> Example
                    </div>
                    <div className="prose-note text-sm leading-relaxed">
                      <Markdown>{t.exampleMd}</Markdown>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      )}

      {notes.length > 0 && (
        <section aria-labelledby="sheet-notes" className="space-y-3">
          <h2 id="sheet-notes" className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Deep-dive notes
          </h2>
          {notes.map((n) => (
            <Card key={n.id}>
              <CardBody>
                <h3 className="mb-2 text-lg font-semibold">{n.title}</h3>
                <Markdown>{n.bodyMd}</Markdown>
              </CardBody>
            </Card>
          ))}
        </section>
      )}

      {cards.length > 0 && (
        <section aria-labelledby="sheet-cards" className="space-y-3">
          <h2 id="sheet-cards" className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Flashcards · {cards.length}
          </h2>
          <Card>
            <CardBody>
              <FlashcardDeck cards={cards} />
            </CardBody>
          </Card>
        </section>
      )}

      <Card className="mesh">
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-[15px] font-bold">Done reading?</div>
            <div className="mt-0.5 text-xs text-[var(--muted)]">
              {topics.length ? `Test yourself on all ${topics.length} topics.` : "Test yourself on this competency."}
            </div>
          </div>
          <NavButton href={`/lesson/${id}`} className="group w-full shrink-0 sm:w-auto">
            {lesson.action} <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
          </NavButton>
        </CardBody>
      </Card>
    </div>
  );
}

// This competency's topics at a glance — one chip per topic, coloured (and
// labelled) by recent accuracy; each jumps to its section.
function TopicStrip({ topics, status }: { topics: Topic[]; status: Map<string, TopicStatus> }) {
  const order: TopicStatus[] = ["strong", "shaky", "weak", "untouched"];
  const counts = order.map((s) => ({ s, n: topics.filter((t) => (status.get(t.id) ?? "untouched") === s).length })).filter((c) => c.n > 0);
  return (
    <div className="border-t border-[var(--border)] pt-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{topics.length} topics</div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
          {counts.map(({ s, n }) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", TOPIC_STATUS[s].dot)} aria-hidden />
              {n} {TOPIC_STATUS[s].label.toLowerCase()}
            </span>
          ))}
        </div>
      </div>
      <nav aria-label="Jump to a topic" className="mt-2.5 flex flex-wrap gap-1.5">
        {topics.map((t, i) => {
          const st = status.get(t.id) ?? "untouched";
          return (
            <a
              key={t.id}
              href={`#${t.id}`}
              title={`${i + 1}. ${t.title} — ${TOPIC_STATUS[st].label}`}
              aria-label={`Topic ${i + 1}: ${t.title} (${TOPIC_STATUS[st].label})`}
              className={cn(
                "press grid h-11 min-w-11 place-items-center rounded-lg px-2 text-xs font-bold tabular-nums hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/50 md:h-9 md:min-w-9",
                TOPIC_STATUS[st].chip
              )}
            >
              {i + 1}
            </a>
          );
        })}
      </nav>
    </div>
  );
}

function SheetNotFound() {
  const meta = getActiveMeta();
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <SearchX size={28} className="mx-auto text-[var(--muted)]" aria-hidden />
      <h1 className="mt-3 text-xl font-bold">Study sheet not found</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">This link doesn&apos;t match any {meta.name} competency.</p>
      <div className="mt-5 flex justify-center gap-2">
        <NavButton href="/learn">All study sheets</NavButton>
        <NavButton href="/" variant="outline">
          Study plan
        </NavButton>
      </div>
    </div>
  );
}
