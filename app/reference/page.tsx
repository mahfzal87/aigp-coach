"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { CalendarClock, ChevronDown, CornerDownRight, Scale, Search, X } from "lucide-react";
import { getCompetency, getNotes, getPackExtras } from "@/lib/content";
import type { ExamPack } from "@/lib/exam-pack";
import type { StudyNote } from "@/lib/types";
import { Badge, Bar, Button, Card, Input, PageHeader } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { FilterChip, GroupLabel, Hl, LensTabs, ScrollRow, Tick, matches, setUrlParam, tokenize, useUrlParams } from "@/components/library-ui";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

type Library = ExamPack["library"];
type Instrument = Library["instruments"][number];
type Fact = Library["facts"][number];
type Distinction = Library["distinctions"][number];
type Term = Library["glossary"][number];
export type InstrumentExtras = Pick<Library, "timeline" | "timelineTitle" | "penaltyLadder" | "penaltyTitle" | "penaltyNote">;

// Deep links: /reference?tab=glossary&q=consent
const TABS = [
  { key: "facts", label: "Facts" },
  { key: "distinctions", label: "Distinctions" },
  { key: "frameworks", label: "Frameworks" },
  { key: "glossary", label: "Glossary" },
  { key: "deep-dives", label: "Deep dives" },
] as const;
type TabKey = (typeof TABS)[number]["key"];
const isTabKey = (v: string | null | undefined): v is TabKey => TABS.some((t) => t.key === v);

type Tone = "default" | "primary" | "accent" | "warning" | "danger";
function kindTone(kind: string): Tone {
  const k = kind.toLowerCase();
  if (k.includes("historical")) return "default";
  if (k.startsWith("law") || k.startsWith("directive") || k.startsWith("regulation")) return "danger";
  if (k.startsWith("standard")) return "primary";
  if (k.startsWith("principles")) return "warning";
  return "accent"; // frameworks, treaties, rights instruments, adequacy frameworks
}

// ── Search model ──

type Hit = { heading: string; text: string };
type FwRow =
  | { type: "timeline"; id: string; hits: Hit[] }
  | { type: "penalty"; id: string; hits: Hit[] }
  | { type: "instrument"; id: string; ins: Instrument; hits: Hit[] };

const amountLabel = (p: Library["penaltyLadder"][number]) => (p.pct && p.pct !== "—" ? `${p.amount} or ${p.pct}` : p.amount);

/** Lines that contain every search word; failing that, lines with any of them. */
function hitsOf(lines: Hit[], tokens: string[]): Hit[] {
  if (!tokens.length) return [];
  const all = lines.filter((l) => matches(`${l.heading} ${l.text}`, tokens));
  return all.length ? all : lines.filter((l) => tokens.some((t) => `${l.heading} ${l.text}`.toLowerCase().includes(t)));
}

/** Frameworks tab rows: the pack's key dates and fines first, then every instrument. */
function frameworkRows(L: Library, tokens: string[]): FwRow[] {
  const rows: FwRow[] = [];
  const hay = (lines: Hit[]) => lines.map((l) => `${l.heading} ${l.text}`).join(" ");
  if (L.timeline.length) {
    const lines = L.timeline.map((t) => ({ heading: t.date, text: t.label }));
    if (matches(`${L.timelineTitle} ${hay(lines)}`, tokens)) rows.push({ type: "timeline", id: "timeline", hits: hitsOf(lines, tokens) });
  }
  if (L.penaltyLadder.length) {
    const lines = L.penaltyLadder.map((p) => ({ heading: amountLabel(p), text: p.what }));
    if (matches(`${L.penaltyTitle} ${L.penaltyNote} ${hay(lines)}`, tokens)) rows.push({ type: "penalty", id: "penalty", hits: hitsOf(lines, tokens) });
  }
  for (const ins of L.instruments) {
    const lines = ins.sections.flatMap((s) => s.bullets.map((b) => ({ heading: s.heading, text: b })));
    if (matches(`${ins.name} ${ins.kind} ${ins.jurisdiction} ${ins.status} ${hay(lines)}`, tokens)) rows.push({ type: "instrument", id: ins.id, ins, hits: hitsOf(lines, tokens) });
  }
  return rows;
}

/** "X vs. Y — takeaway" → aligned halves plus the shared takeaway. */
function splitDiff(diff: string): { left: string; right: string; note?: string } | null {
  const m = diff.match(/^(.+?)\s+vs\.?\s+(.+)$/i);
  if (!m) return null;
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const trim = (s: string) => s.trim().replace(/\.$/, "");
  let right = m[2].trim();
  let note: string | undefined;
  const dash = right.indexOf(" — ");
  const sentence = right.search(/\.\s+[A-Z]/);
  if (dash > 0) {
    note = right.slice(dash + 3).trim();
    right = right.slice(0, dash);
  } else if (sentence > 0) {
    note = right.slice(sentence + 1).trim();
    right = right.slice(0, sentence);
  }
  return { left: cap(trim(m[1])), right: cap(trim(right)), note: note ? cap(note) : undefined };
}

function countBy<T>(items: T[], key: (t: T) => string): Map<string, number> {
  const m = new Map<string, number>();
  for (const it of items) m.set(key(it), (m.get(key(it)) ?? 0) + 1);
  return m;
}

/** Plain-text excerpt of a note around the first search hit (for the collapsed preview). */
function noteSnippet(md: string, tokens: string[]): string | undefined {
  const lines = md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .split(/\n+/)
    .map((l) => l.replace(/^\s*(?:[-•]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
  const line = lines.find((l) => matches(l, tokens)) ?? lines.find((l) => tokens.some((t) => l.toLowerCase().includes(t)));
  if (!line) return undefined;
  // Open the excerpt a little before the hit so the mark survives the 2-line clamp.
  const at = Math.min(...tokens.map((t) => line.toLowerCase().indexOf(t)).filter((i) => i >= 0));
  if (!Number.isFinite(at) || at < 60) return line;
  const start = line.lastIndexOf(" ", at - 40);
  return `…${line.slice(start > 0 ? start + 1 : at - 40)}`;
}

// ── Page ──

export default function ReferencePage() {
  const LIB = getPackExtras().library;
  const params = useUrlParams();
  const [qState, setQState] = useState<string | null>(null);
  const [tabState, setTabState] = useState<TabKey | null>(null);
  const [factTagState, setFactTag] = useState("All");
  const [glossTagState, setGlossTag] = useState("All");

  const q = qState ?? params?.get("q") ?? "";
  const tokens = useMemo(() => tokenize(q), [q]);
  const searching = tokens.length > 0;

  const notesAll = useMemo(() => getNotes(), []);
  const glossAll = useMemo(() => [...LIB.glossary].sort((a, b) => a.term.localeCompare(b.term)), [LIB]);
  const fwAll = useMemo(() => frameworkRows(LIB, []), [LIB]);

  const res = useMemo(
    () => ({
      facts: LIB.facts.filter((f) => matches(`${f.fact} ${f.tag}`, tokens)),
      distinctions: LIB.distinctions.filter((d) => matches(`${d.a} ${d.b} ${d.diff}`, tokens)),
      frameworks: frameworkRows(LIB, tokens),
      glossary: glossAll.filter((g) => matches(`${g.term} ${g.def} ${g.tag}`, tokens)),
      notes: notesAll.filter((n) => matches(`${n.title} ${n.bodyMd}`, tokens)),
    }),
    [LIB, glossAll, notesAll, tokens]
  );

  const total: Record<TabKey, number> = {
    facts: LIB.facts.length,
    distinctions: LIB.distinctions.length,
    frameworks: fwAll.length,
    glossary: LIB.glossary.length,
    "deep-dives": notesAll.length,
  };
  const hits: Record<TabKey, number> = {
    facts: res.facts.length,
    distinctions: res.distinctions.length,
    frameworks: res.frameworks.length,
    glossary: res.glossary.length,
    "deep-dives": res.notes.length,
  };
  // A pack without deep dives (CIPP/E) shows no Deep dives tab at all.
  const tabs = TABS.filter((t) => total[t.key] > 0);
  const urlTab = params?.get("tab");
  const chosen: TabKey = tabState ?? (isTabKey(urlTab) ? urlTab : "facts");
  const home: TabKey = tabs.some((t) => t.key === chosen) ? chosen : (tabs[0]?.key ?? "facts");
  const firstHit = tabs.find((t) => hits[t.key] > 0)?.key;
  // While searching, an empty tab hands over to the first tab with matches;
  // clearing the search returns to the tab you picked.
  const tab: TabKey = searching && hits[home] === 0 && firstHit ? firstHit : home;
  const nothing = searching && !firstHit;

  const factCounts = countBy(res.facts, (f) => f.tag);
  const factTag = factTagState !== "All" && (factCounts.get(factTagState) ?? 0) > 0 ? factTagState : "All";
  const glossCounts = countBy(res.glossary, (g) => g.tag);
  const glossTag = glossTagState !== "All" && (glossCounts.get(glossTagState) ?? 0) > 0 ? glossTagState : "All";

  function setQuery(v: string) {
    setQState(v);
    if (params?.has("q")) setUrlParam("q", null);
  }
  function pickTab(k: TabKey) {
    haptic("tap");
    setTabState(k);
    setUrlParam("tab", k === "facts" ? null : k);
  }
  const found = tabs.reduce((s, t) => s + hits[t.key], 0);

  return (
    <div className="space-y-4">
      <PageHeader title="Reference library" subtitle="Built to scan — facts, contrasts, laws, terms." />

      {/* The search instrument: one glass panel — the field, then sections with live counts */}
      <Card className="space-y-1.5 p-1.5">
        <div className="relative">
          <Search size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <Input
            value={q}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && q) {
                e.preventDefault();
                setQuery("");
              }
            }}
            placeholder="Search facts, laws and terms…"
            aria-label="Search the reference library"
            aria-describedby={searching ? "ref-found" : undefined}
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
            className={cn("pl-10", q ? "pr-28" : "pr-4")}
          />
          {q && (
            <div className="absolute inset-y-0 right-0 flex items-center">
              {searching && (
                <span id="ref-found" aria-live="polite" className={cn("whitespace-nowrap pr-1 text-xs font-semibold", found ? "text-[var(--muted)]" : "text-[var(--danger)]")}>
                  <Tick value={found} /> found
                </span>
              )}
              <Button variant="ghost" size="sm" aria-label="Clear search" onClick={() => setQuery("")} className="h-11 w-11 shrink-0 px-0">
                <X size={16} />
              </Button>
            </div>
          )}
        </div>
        {tabs.length > 1 && (
          <LensTabs
            lensId="reference-tabs-lens"
            label="Library sections"
            idPrefix="ref-tab"
            panelId="ref-panel"
            active={tab}
            onPick={pickTab}
            items={tabs.map((t) => {
              const n = searching ? hits[t.key] : total[t.key];
              return { key: t.key, label: t.label, count: n, disabled: searching && n === 0, title: searching && n === 0 ? "No matches here" : undefined };
            })}
          />
        )}
      </Card>

      <div role="tabpanel" id="ref-panel" aria-labelledby={`ref-tab-${tab}`}>
        {nothing ? (
          <Card className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <Search size={20} aria-hidden className="text-[var(--muted)]" />
            <p className="text-sm">
              <span className="font-semibold">Nothing matches “{q.trim()}”.</span> <span className="text-[var(--muted)]">Try a single keyword.</span>
            </p>
            <Button size="sm" variant="outline" onClick={() => setQuery("")}>Clear search</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {tab === "facts" && (
              <>
                <TagChips label="Filter facts by topic" tags={LIB.factTags} counts={factCounts} total={res.facts.length} active={factTag} onPick={setFactTag} />
                <FactsList facts={res.facts} order={LIB.factTags} tag={factTag} tokens={tokens} />
              </>
            )}
            {tab === "distinctions" && <DistinctionsList items={res.distinctions} tokens={tokens} />}
            {tab === "frameworks" && <FrameworksList LIB={LIB} rows={res.frameworks} tokens={tokens} />}
            {tab === "glossary" && (
              <>
                <TagChips label="Filter terms by topic" tags={LIB.glossaryTags} counts={glossCounts} total={res.glossary.length} active={glossTag} onPick={setGlossTag} />
                <GlossaryList items={glossTag === "All" ? res.glossary : res.glossary.filter((g) => g.tag === glossTag)} showTag={glossTag === "All"} tokens={tokens} />
              </>
            )}
            {tab === "deep-dives" && <DeepDiveList notes={res.notes} tokens={tokens} />}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tag chips (Facts, Glossary) — one scrolling row on phones, wrapped on desktop ──

function TagChips({ label, tags, counts, total, active, onPick }: { label: string; tags: string[]; counts: Map<string, number>; total: number; active: string; onPick: (t: string) => void }) {
  return (
    <ScrollRow activeKey={active} className="-mx-4 sm:mx-0">
      <div role="group" aria-label={label} className="flex w-max gap-1.5 px-4 sm:w-auto sm:flex-wrap sm:px-0">
        <FilterChip label="All" count={total} active={active === "All"} onClick={() => onPick("All")} />
        {tags.map((t) => {
          const n = counts.get(t) ?? 0;
          return <FilterChip key={t} label={t} count={n} active={active === t} disabled={n === 0} onClick={() => onPick(active === t ? "All" : t)} />;
        })}
      </div>
    </ScrollRow>
  );
}

// ── Facts: numbered ruled list, grouped by topic ──

function FactsList({ facts, order, tag, tokens }: { facts: Fact[]; order: string[]; tag: string; tokens: string[] }) {
  const keys = [...order, ...[...new Set(facts.map((f) => f.tag))].filter((t) => !order.includes(t))];
  const groups = keys
    .filter((k) => tag === "All" || k === tag)
    .map((k) => ({ key: k, items: facts.filter((f) => f.tag === k) }))
    .filter((g) => g.items.length);
  return (
    <Card className="overflow-hidden">
      {groups.map((g, gi) => (
        <section key={g.key} aria-label={g.key} className={cn(gi > 0 && "border-t border-[var(--border)]")}>
          <GroupLabel count={g.items.length}>{g.key}</GroupLabel>
          <ul className="divide-y divide-[var(--border)]">
            {g.items.map((f) => (
              <li key={f.n} className="flex gap-3 px-4 py-2.5 sm:px-5">
                <span className="w-5 shrink-0 text-right text-xs font-semibold leading-6 tabular-nums text-[var(--muted)]">{f.n}</span>
                <p className="min-w-0 text-sm leading-6">
                  <Hl text={f.fact} tokens={tokens} />
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Card>
  );
}

// ── Distinctions: A | B side by side, each under its half of the definition ──

function DistinctionsList({ items, tokens }: { items: Distinction[]; tokens: string[] }) {
  return (
    <Card className="overflow-hidden">
      <ul className="divide-y divide-[var(--border)]">
        {items.map((d) => {
          const s = splitDiff(d.diff);
          return (
            <li key={d.a + d.b} className="px-4 py-3.5 sm:px-5">
              {s ? (
                <div className="grid gap-y-1.5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-x-4">
                  <Side name={d.a} text={s.left} tokens={tokens} />
                  <span className="text-xs font-medium italic text-[var(--muted)] sm:pt-0.5">vs</span>
                  <Side name={d.b} text={s.right} tokens={tokens} />
                </div>
              ) : (
                <>
                  <div className="text-sm font-bold">
                    <Hl text={d.a} tokens={tokens} /> <span className="px-1 text-xs font-medium italic text-[var(--muted)]">vs</span> <Hl text={d.b} tokens={tokens} />
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-[var(--muted)]">
                    <Hl text={d.diff} tokens={tokens} />
                  </p>
                </>
              )}
              {s?.note && (
                <p className="mt-2 flex gap-1.5 text-xs leading-relaxed text-[var(--muted)]">
                  <CornerDownRight size={13} aria-hidden className="mt-0.5 shrink-0" />
                  <span className="min-w-0">
                    <Hl text={s.note} tokens={tokens} />
                  </span>
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function Side({ name, text, tokens }: { name: string; text: string; tokens: string[] }) {
  return (
    <div className="min-w-0">
      <div className="text-sm font-bold leading-snug">
        <Hl text={name} tokens={tokens} />
      </div>
      <p className="mt-0.5 text-sm leading-relaxed text-[var(--muted)]">
        <Hl text={text} tokens={tokens} />
      </p>
    </div>
  );
}

// ── Frameworks: ruled accordion — key dates, fines, then each instrument ──

function FrameworksList({ LIB, rows, tokens }: { LIB: Library; rows: FwRow[]; tokens: string[] }) {
  const now = LIB.timeline.find((t) => t.status === "active") ?? LIB.timeline.filter((t) => t.status === "done").pop();
  const top = LIB.penaltyLadder[0];
  return (
    <Card className="overflow-hidden">
      <ul className="divide-y divide-[var(--border)]">
        {rows.map((row) => {
          if (row.type === "timeline")
            return (
              <AccordionRow
                key={row.id}
                icon={<CalendarClock size={15} aria-hidden className="shrink-0 text-[var(--primary)]" />}
                title={<Hl text={LIB.timelineTitle} tokens={tokens} />}
                badge={<Badge tone="primary">Key dates</Badge>}
                meta={now ? `Now: ${now.date} — ${now.label}` : undefined}
                preview={<HitPreview hits={row.hits} tokens={tokens} />}
              >
                <Timeline items={LIB.timeline} tokens={tokens} />
              </AccordionRow>
            );
          if (row.type === "penalty")
            return (
              <AccordionRow
                key={row.id}
                icon={<Scale size={15} aria-hidden className="shrink-0 text-[var(--danger)]" />}
                title={<Hl text={LIB.penaltyTitle} tokens={tokens} />}
                badge={<Badge tone="danger">Fines</Badge>}
                meta={top ? `Top tier: ${amountLabel(top)} · ${top.what}` : undefined}
                preview={<HitPreview hits={row.hits} tokens={tokens} />}
              >
                <PenaltyLadder LIB={LIB} tokens={tokens} />
              </AccordionRow>
            );
          const ins = row.ins;
          return (
            <AccordionRow
              key={row.id}
              title={<Hl text={ins.name} tokens={tokens} />}
              badge={<Badge tone={kindTone(ins.kind)}>{ins.kind}</Badge>}
              meta={<Hl text={`${ins.jurisdiction} · ${ins.status}`} tokens={tokens} />}
              preview={<HitPreview hits={row.hits} tokens={tokens} />}
            >
              <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
                {ins.sections.map((sec) => (
                  <div key={sec.heading} className="min-w-0">
                    <div className="mb-1.5 text-[13px] font-semibold text-[color-mix(in_srgb,var(--primary)_82%,var(--foreground))]">
                      <Hl text={sec.heading} tokens={tokens} />
                    </div>
                    <ul className="space-y-1.5">
                      {sec.bullets.map((b, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-relaxed">
                          <span aria-hidden className="mt-[0.6rem] h-1 w-1 shrink-0 rounded-full bg-[var(--muted)]" />
                          <span className="min-w-0">
                            <Hl text={b} tokens={tokens} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </AccordionRow>
          );
        })}
      </ul>
    </Card>
  );
}

function HitPreview({ hits, tokens }: { hits: Hit[]; tokens: string[] }) {
  if (!hits.length) return null;
  const more = hits.length - 3;
  return (
    <ul className="mt-2 space-y-1">
      {hits.slice(0, 3).map((h, i) => (
        <li key={i} className="text-xs leading-relaxed">
          <span className="font-semibold text-[var(--muted)]">{h.heading} · </span>
          <Hl text={h.text} tokens={tokens} />
        </li>
      ))}
      {more > 0 && <li className="text-xs font-semibold text-[var(--accent)]">+{more} more inside</li>}
    </ul>
  );
}

function Timeline({ items, tokens }: { items: Library["timeline"]; tokens: string[] }) {
  return (
    <ol>
      {items.map((t, i) => (
        <li key={t.date + i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2",
                t.status === "done" && "border-[var(--success)] bg-[var(--success)]",
                t.status === "active" && "border-[var(--primary)] bg-[var(--primary)] ring-4 ring-[var(--primary)]/20",
                t.status === "deferred" && "border-[var(--warning)] bg-transparent"
              )}
            />
            {i < items.length - 1 && <div className="w-px flex-1 bg-[var(--border)]" />}
          </div>
          <div className={cn("min-w-0", i < items.length - 1 && "pb-4")}>
            <div className="flex flex-wrap items-center gap-1.5 text-sm font-bold tabular-nums">
              <Hl text={t.date} tokens={tokens} />
              {t.status === "deferred" && <Badge tone="warning">deferred</Badge>}
              {t.status === "active" && <Badge tone="primary">now live</Badge>}
            </div>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              <Hl text={t.label} tokens={tokens} />
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function PenaltyLadder({ LIB, tokens }: { LIB: Library; tokens: string[] }) {
  return (
    <div>
      <p className="mb-4 text-xs leading-relaxed text-[var(--muted)]">
        <Hl text={LIB.penaltyNote} tokens={tokens} />
      </p>
      <div className="space-y-3.5">
        {LIB.penaltyLadder.map((p) => (
          <div key={p.tier}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 font-semibold">
                <Hl text={p.what} tokens={tokens} />
              </span>
              <span className="shrink-0 font-bold tabular-nums text-[var(--danger)]">{amountLabel(p)}</span>
            </div>
            <Bar value={p.width} tone="danger" className="h-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Glossary: dense A→Z rows, term | definition ──

function GlossaryList({ items, showTag, tokens }: { items: Term[]; showTag: boolean; tokens: string[] }) {
  return (
    <Card className="overflow-hidden">
      <ul className="divide-y divide-[var(--border)]">
        {items.map((g) => (
          <li key={g.term} className="grid gap-x-6 gap-y-0.5 px-4 py-2.5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:px-5">
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-6">
                <Hl text={g.term} tokens={tokens} />
              </div>
              {showTag && <div className="text-[11px] leading-4 text-[var(--muted)]">{g.tag}</div>}
            </div>
            <p className="min-w-0 text-sm leading-6 text-[var(--muted)]">
              <Hl text={g.def} tokens={tokens} />
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ── Deep dives ──

function DeepDiveList({ notes, tokens }: { notes: StudyNote[]; tokens: string[] }) {
  return (
    <Card className="overflow-hidden">
      <ul className="divide-y divide-[var(--border)]">
        {notes.map((n) => {
          const c = n.competencyId ? getCompetency(n.competencyId) : null;
          const snip = tokens.length ? noteSnippet(n.bodyMd, tokens) : undefined;
          return (
            <AccordionRow
              key={n.id}
              title={<Hl text={n.title} tokens={tokens} />}
              badge={<Badge tone="primary">{c?.code ?? "Strategy"}</Badge>}
              preview={
                snip ? (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
                    <Hl text={snip} tokens={tokens} />
                  </p>
                ) : undefined
              }
            >
              <Markdown className="leading-relaxed">{n.bodyMd}</Markdown>
            </AccordionRow>
          );
        })}
      </ul>
    </Card>
  );
}

// ── Accordion row (Frameworks, Deep dives) ──

function AccordionRow({ title, icon, badge, meta, preview, children }: { title: ReactNode; icon?: ReactNode; badge?: ReactNode; meta?: ReactNode; preview?: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          haptic("tap");
          setOpen((o) => !o);
        }}
        className="flex w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)] sm:px-5"
      >
        <ChevronDown size={16} aria-hidden className={cn("mt-0.5 shrink-0 text-[var(--muted)] transition-transform duration-200 motion-reduce:transition-none", open && "rotate-180")} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {icon}
            <span className="text-sm font-bold leading-snug">{title}</span>
            {badge}
          </div>
          {meta && <div className={cn("mt-0.5 text-xs leading-relaxed text-[var(--muted)]", !open && "line-clamp-2")}>{meta}</div>}
          {!open && preview}
        </div>
      </button>
      {open && (
        <div id={id} className="border-t border-[var(--border)] px-4 pb-5 pt-4 sm:pl-12 sm:pr-5">
          {children}
        </div>
      )}
    </li>
  );
}
