"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Brain, Lightbulb, SearchX } from "lucide-react";
import { getActiveMeta, getCompetency, getDomain, getFlashcards, getNotesByCompetency, getTopicsByCompetency } from "@/lib/content";
import { LESSON_PASS } from "@/lib/gamify";
import { haptic } from "@/lib/haptics";
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
  strong: { label: "Strong", tone: "success", chip: "bg-[var(--success)]/15 text-[color-mix(in_srgb,var(--success)_75%,var(--foreground))]", dot: "bg-[var(--success)]" },
  shaky: { label: "Shaky", tone: "warning", chip: "bg-[var(--warning)]/16 text-[color-mix(in_srgb,var(--warning)_70%,var(--foreground))]", dot: "bg-[var(--warning)]" },
  weak: { label: "Weak", tone: "danger", chip: "bg-[var(--danger)]/14 text-[color-mix(in_srgb,var(--danger)_78%,var(--foreground))]", dot: "bg-[var(--danger)]" },
  untouched: { label: "Not tested", tone: "default", chip: "bg-[var(--surface-2)] text-[var(--muted)]", dot: "bg-[var(--muted)]/40" },
};

type Section = "topics" | "notes" | "cards";

function lessonState(row: Row | undefined): { badge: string; tone: "success" | "accent" | "warning" | "default"; detail: string; action: string } {
  if (!row) return { badge: "Not started", tone: "default", detail: "", action: "Start lesson" };
  const best = Math.round((row.best ?? 0) * 100);
  if (row.session) return { badge: "In progress", tone: "accent", detail: `Step ${row.session.step + 1} of ${row.session.total}`, action: "Resume lesson" };
  if (row.status === "done") return { badge: "Passed", tone: "success", detail: `Best ${best}%`, action: "Review lesson" };
  if (row.status === "retake") return { badge: `Best ${best}%`, tone: "warning", detail: `${PASS_PCT}% passes`, action: "Retake lesson" };
  return { badge: "Not started", tone: "default", detail: `${row.steps} steps, about ${row.minutes} min`, action: "Start lesson" };
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

  // Only sections with content get a tab.
  const sections = [
    topics.length > 0 && { value: "topics" as const, label: "Topics", count: topics.length },
    notes.length > 0 && { value: "notes" as const, label: "Notes", count: notes.length },
    cards.length > 0 && { value: "cards" as const, label: "Flashcards", count: cards.length },
  ].filter((s): s is { value: Section; label: string; count: number } => !!s);
  const [picked, setPicked] = useState<Section>("topics");
  const section = sections.some((s) => s.value === picked) ? picked : sections[0]?.value;

  useEffect(() => {
    notes.forEach((n) => markNoteRead(n.id));
  }, [notes, markNoteRead]);

  if (!competency) return <SheetNotFound />;
  const domain = getDomain(competency.domainId);
  const row = plan.units.flatMap((u) => u.rows).find((r) => r.id === id);
  const lesson = lessonState(row);
  const bank = row?.qCount ?? 0;

  return (
    <div className="space-y-5">
      <Link href="/learn" className="-ml-1 inline-flex h-11 items-center gap-1.5 rounded-full px-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] sm:h-9">
        <ArrowLeft size={16} aria-hidden /> Study sheets
      </Link>

      <header className="px-1">
        <div className="text-[13px] font-medium text-[var(--muted)]">
          Domain {domain?.code} · {competency.code}
        </div>
        <h1 className="mt-1 text-[28px] font-extrabold leading-[1.1] sm:text-[32px]">{competency.name}</h1>
        <p className="mt-1.5 line-clamp-3 text-[15px] text-[var(--muted)]">{competency.description}</p>
      </header>

      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[var(--muted)]">
            <Badge tone={lesson.tone}>{lesson.badge}</Badge>
            {lesson.detail && <span>{lesson.detail}</span>}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <NavButton href={`/lesson/${id}`} className="group w-full sm:w-auto">
              {lesson.action} <ArrowRight size={15} className="motion-safe:transition-transform motion-safe:duration-200 group-hover:translate-x-0.5" aria-hidden />
            </NavButton>
            {bank > 0 && (
              <NavButton href={`/practice?competency=${id}`} variant="outline" className="w-full sm:w-auto">
                <Brain size={15} aria-hidden /> Drill {bank} questions
              </NavButton>
            )}
          </div>
        </CardBody>
      </Card>

      {sections.length > 1 && section && <SheetTabs value={section} options={sections} onChange={setPicked} />}

      {section === "topics" && (
        <Card id="sheet-panel-topics" role={sections.length > 1 ? "tabpanel" : undefined} aria-labelledby={sections.length > 1 ? "sheet-tab-topics" : undefined} className="overflow-hidden">
          <TopicStrip topics={topics} status={status} />
          <ol className="divide-y divide-[var(--border)]">
            {topics.map((t, i) => {
              const st = status.get(t.id) ?? "untouched";
              return (
                <li key={t.id} id={t.id} className="scroll-mt-24 space-y-3 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] font-display text-[13px] font-extrabold tabular-nums text-[var(--muted)]">{i + 1}</span>
                    <h2 className="min-w-0 flex-1 text-lg font-bold leading-snug">{t.title}</h2>
                    {st !== "untouched" && (
                      <Badge tone={TOPIC_STATUS[st].tone} className="shrink-0">
                        {TOPIC_STATUS[st].label}
                      </Badge>
                    )}
                  </div>
                  <div className="prose-note text-[15px] leading-relaxed">
                    <Markdown>{t.conceptMd}</Markdown>
                  </div>
                  <div className="rounded-[14px] bg-[var(--accent)]/7 p-4">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[color-mix(in_srgb,var(--accent)_85%,var(--foreground))]">
                      <Lightbulb size={14} aria-hidden /> Example
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

      {section === "notes" && (
        <Card id="sheet-panel-notes" role="tabpanel" aria-labelledby="sheet-tab-notes" className="overflow-hidden">
          <ol className="divide-y divide-[var(--border)]">
            {notes.map((n) => (
              <li key={n.id} className="p-5 sm:p-6">
                <h2 className="mb-2 text-lg font-bold leading-snug">{n.title}</h2>
                <Markdown>{n.bodyMd}</Markdown>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {section === "cards" && (
        <Card id="sheet-panel-cards" role={sections.length > 1 ? "tabpanel" : undefined} aria-labelledby={sections.length > 1 ? "sheet-tab-cards" : undefined}>
          <CardBody>
            <FlashcardDeck cards={cards} />
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="font-display text-[17px] font-bold">Done reading?</div>
            <div className="mt-0.5 text-[13px] text-[var(--muted)]">{topics.length ? `Test yourself on all ${topics.length} topics.` : "Test yourself on this competency."}</div>
          </div>
          <NavButton href={`/lesson/${id}`} variant="soft" className="w-full shrink-0 sm:w-auto">
            {lesson.action}
          </NavButton>
        </CardBody>
      </Card>
    </div>
  );
}

// Section switcher with the liquid lens: one spring pill glides to the active tab.
function SheetTabs({ value, options, onChange }: { value: Section; options: { value: Section; label: string; count: number }[]; onChange: (v: Section) => void }) {
  const reduce = useReducedMotion();
  const lens = reduce ? { duration: 0 } : ({ type: "spring", stiffness: 380, damping: 30, mass: 0.9 } as const);
  const select = (v: Section) => {
    haptic("select");
    onChange(v);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = options.findIndex((o) => o.value === value);
    const nextOpt = options[(i + (e.key === "ArrowRight" ? 1 : options.length - 1)) % options.length];
    select(nextOpt.value);
    document.getElementById(`sheet-tab-${nextOpt.value}`)?.focus();
  };
  return (
    <div role="tablist" aria-label="Sheet sections" onKeyDown={onKey} className="inline-flex max-w-full gap-0.5 rounded-full bg-[var(--surface-2)] p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            id={`sheet-tab-${o.value}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`sheet-panel-${o.value}`}
            tabIndex={active ? 0 : -1}
            onClick={() => select(o.value)}
            className={cn(
              "press relative inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold",
              // stretch the tap target to 44px on phones without growing the pill
              "before:absolute before:inset-x-0 before:-inset-y-1 before:content-[''] md:before:hidden",
              active ? "text-[color-mix(in_srgb,var(--primary)_82%,var(--foreground))]" : "text-[var(--muted)] hover:text-[var(--foreground)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            )}
          >
            {active && <motion.span layoutId="sheet-tabs-lens" transition={lens} aria-hidden className="absolute inset-0 rounded-full bg-[var(--glass-tint-strong)] shadow-[var(--e1)] ring-1 ring-[var(--primary)]/30" />}
            <span className="relative">{o.label}</span>
            <span className="relative font-medium tabular-nums">{o.count}</span>
          </button>
        );
      })}
    </div>
  );
}

// This competency's topics at a glance — one chip per topic, coloured (and
// labelled) by recent accuracy; each jumps to its section.
function TopicStrip({ topics, status }: { topics: Topic[]; status: Map<string, TopicStatus> }) {
  const order: TopicStatus[] = ["strong", "shaky", "weak", "untouched"];
  const counts = order.map((s) => ({ s, n: topics.filter((t) => (status.get(t.id) ?? "untouched") === s).length })).filter((c) => c.n > 0);
  return (
    <div className="border-b border-[var(--border)] p-5 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="text-[13px] font-semibold">Jump to a topic</div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--muted)]">
          {counts.map(({ s, n }) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", TOPIC_STATUS[s].dot)} aria-hidden />
              {n} {TOPIC_STATUS[s].label.toLowerCase()}
            </span>
          ))}
        </div>
      </div>
      <nav aria-label="Jump to a topic" className="mt-3 flex flex-wrap gap-1.5">
        {topics.map((t, i) => {
          const st = status.get(t.id) ?? "untouched";
          return (
            <a
              key={t.id}
              href={`#${t.id}`}
              title={`${i + 1}. ${t.title} — ${TOPIC_STATUS[st].label}`}
              aria-label={`Topic ${i + 1}: ${t.title} (${TOPIC_STATUS[st].label})`}
              className={cn(
                "press grid h-11 min-w-11 place-items-center rounded-full px-2 font-display text-[13px] font-extrabold tabular-nums hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] md:h-9 md:min-w-9",
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
    <Card className="mx-auto max-w-md">
      <CardBody className="py-10 text-center">
        <SearchX size={28} className="mx-auto text-[var(--muted)]" aria-hidden />
        <h1 className="mt-3 text-xl font-bold">Study sheet not found</h1>
        <p className="mt-1 text-[15px] text-[var(--muted)]">This link doesn&apos;t match any {meta.name} competency.</p>
        <div className="mt-5 flex justify-center gap-2">
          <NavButton href="/learn">All study sheets</NavButton>
          <NavButton href="/" variant="outline">
            Study plan
          </NavButton>
        </div>
      </CardBody>
    </Card>
  );
}
