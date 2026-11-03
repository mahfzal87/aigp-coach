"use client";

import { useMemo, useState } from "react";
import { BookA, ChevronDown, Landmark, Scale, Search } from "lucide-react";
import { getCompetency, getNotes, getPackExtras } from "@/lib/content";
import type { ExamPack } from "@/lib/exam-pack";
import { Badge, Card, CardBody, PageHeader } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { Stagger, StaggerItem } from "@/components/motion";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const TABS = ["Facts", "Distinctions", "Frameworks", "Glossary", "Deep dives"] as const;
type Tab = (typeof TABS)[number];
type Library = ExamPack["library"];
type Instrument = Library["instruments"][number];
export type InstrumentExtras = Pick<Library, "timeline" | "timelineTitle" | "penaltyLadder" | "penaltyTitle" | "penaltyNote">;

const KIND_TONE: Record<string, "danger" | "accent" | "primary" | "warning"> = {
  Law: "danger",
  Framework: "accent",
  Standard: "primary",
  Principles: "warning",
  Treaty: "accent",
  Directive: "danger",
};

export default function ReferencePage() {
  const LIB = getPackExtras().library;
  const FACT_TAGS = ["All", ...LIB.factTags];
  const GLOSSARY_TAGS = ["All", ...LIB.glossaryTags];
  const [tab, setTab] = useState<Tab>("Facts");
  const [q, setQ] = useState("");
  const [factTag, setFactTag] = useState<string>("All");
  const [glossTag, setGlossTag] = useState<string>("All");
  const term = q.trim().toLowerCase();

  const facts = useMemo(() => LIB.facts.filter((f) => (factTag === "All" || f.tag === factTag) && (!term || f.fact.toLowerCase().includes(term))), [LIB, factTag, term]);
  const dists = useMemo(() => LIB.distinctions.filter((d) => !term || (d.a + d.b + d.diff).toLowerCase().includes(term)), [LIB, term]);
  const notes = useMemo(() => getNotes().filter((n) => !term || (n.title + n.bodyMd).toLowerCase().includes(term)), [term]);
  const instruments = useMemo(
    () => LIB.instruments.filter((i) => !term || (i.name + " " + i.jurisdiction + " " + i.sections.map((s) => s.heading + " " + s.bullets.join(" ")).join(" ")).toLowerCase().includes(term)),
    [LIB, term]
  );
  const glossary = useMemo(
    () => LIB.glossary.filter((g) => (glossTag === "All" || g.tag === glossTag) && (!term || (g.term + " " + g.def).toLowerCase().includes(term))).sort((a, b) => a.term.localeCompare(b.term)),
    [LIB, glossTag, term]
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Reference library" subtitle="Built to scan, not to read — facts, contrasts, frameworks, and the glossary; deep dives when you need them." />

      {/* Search + tabs */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search everything… ('penalties', 'FRIA', 'federated learning')"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        />
      </div>
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => { haptic("tap"); setTab(t); }} className={cn("press flex-1 cursor-pointer whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold", tab === t ? "bg-[var(--primary)]/12 text-[var(--primary)]" : "text-[var(--muted)] hover:bg-[var(--surface-2)]")}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Facts" && (
        <>
          <div className="flex flex-wrap gap-1.5">
            {FACT_TAGS.map((t) => (
              <button key={t} onClick={() => setFactTag(t)} className={cn("press cursor-pointer rounded-full px-3 py-1 text-xs font-semibold", factTag === t ? "bg-[var(--primary)] text-[var(--primary-fg)]" : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]")}>{t}</button>
            ))}
          </div>
          <Stagger className="grid gap-2.5 sm:grid-cols-2">
            {facts.map((f) => (
              <StaggerItem key={f.n}>
                <div className="flex h-full gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--primary)]/10 text-xs font-bold tabular-nums text-[var(--primary)]">{f.n}</div>
                  <div>
                    <p className="text-sm leading-relaxed">{f.fact}</p>
                    <Badge className="mt-1.5">{f.tag}</Badge>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          {facts.length === 0 && <p className="text-sm text-[var(--muted)]">No facts match.</p>}
        </>
      )}

      {tab === "Distinctions" && (
        <Stagger className="grid gap-2.5 sm:grid-cols-2">
          {dists.map((d) => (
            <StaggerItem key={d.a + d.b}>
              <div className="h-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span className="text-[var(--accent)]">{d.a}</span>
                  <span className="text-[10px] font-semibold uppercase text-[var(--muted)]">vs</span>
                  <span className="text-[var(--warning)]">{d.b}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{d.diff}</p>
              </div>
            </StaggerItem>
          ))}
          {dists.length === 0 && <p className="text-sm text-[var(--muted)]">No distinctions match.</p>}
        </Stagger>
      )}

      {tab === "Frameworks" && (
        <div className="space-y-2.5">
          <p className="flex items-center gap-1.5 px-1 text-xs text-[var(--muted)]"><Landmark size={13} /> Every law, framework, and standard on the exam — expand one for its sections as bullets.</p>
          {instruments.map((ins) => (
            <InstrumentCard key={ins.id} ins={ins} defaultOpen={Boolean(term)} extras={ins.id === LIB.instruments[0]?.id ? LIB : null} />
          ))}
          {instruments.length === 0 && <p className="text-sm text-[var(--muted)]">No frameworks match.</p>}
        </div>
      )}

      {tab === "Glossary" && (
        <>
          <div className="flex flex-wrap gap-1.5">
            {GLOSSARY_TAGS.map((t) => (
              <button key={t} onClick={() => setGlossTag(t)} className={cn("press cursor-pointer rounded-full px-3 py-1 text-xs font-semibold", glossTag === t ? "bg-[var(--primary)] text-[var(--primary-fg)]" : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]")}>{t}</button>
            ))}
          </div>
          <p className="flex items-center gap-1.5 px-1 text-xs text-[var(--muted)]"><BookA size={13} /> {glossary.length} term{glossary.length === 1 ? "" : "s"}, A→Z.</p>
          <Stagger className="grid gap-2.5 sm:grid-cols-2">
            {glossary.map((g) => (
              <StaggerItem key={g.term}>
                <div className="h-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold leading-snug">{g.term}</span>
                    <Badge className="shrink-0">{g.tag}</Badge>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{g.def}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          {glossary.length === 0 && <p className="text-sm text-[var(--muted)]">No terms match.</p>}
        </>
      )}

      {tab === "Deep dives" && (
        <div className="space-y-2.5">
          {notes.map((n) => {
            const c = n.competencyId ? getCompetency(n.competencyId) : null;
            return <DeepDive key={n.id} title={n.title} chip={c?.code ?? "Strategy"} body={n.bodyMd} defaultOpen={Boolean(term)} />;
          })}
          {notes.length === 0 && <p className="text-sm text-[var(--muted)]">No deep dives match.</p>}
        </div>
      )}
    </div>
  );
}

function InstrumentCard({ ins, defaultOpen, extras }: { ins: Instrument; defaultOpen: boolean; extras: InstrumentExtras | null }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="overflow-hidden">
      <button onClick={() => { haptic("tap"); setOpen((o) => !o); }} className="press flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left">
        <ChevronDown size={16} className={cn("shrink-0 text-[var(--muted)] transition-transform duration-200", open && "rotate-180")} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold">{ins.name}</span>
            <Badge tone={KIND_TONE[ins.kind] ?? "primary"}>{ins.kind}</Badge>
          </div>
          <div className="mt-0.5 text-xs text-[var(--muted)]">{ins.jurisdiction} · {ins.status}</div>
        </div>
      </button>
      {open && (
        <CardBody className="border-t border-[var(--border)] pt-4">
          <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
            {ins.sections.map((sec) => (
              <div key={sec.heading}>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--primary)]">{sec.heading}</div>
                <ul className="space-y-1.5">
                  {sec.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed">
                      <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[var(--muted)]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {extras && (
            <div className="mt-5 space-y-5 border-t border-[var(--border)] pt-5">
              <div>
                <div className="mb-3 text-sm font-bold">{extras.timelineTitle}</div>
                <div className="space-y-0">
                  {extras.timeline.map((t, i) => (
                    <div key={t.date} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn("mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2", t.status === "done" && "border-[var(--success)] bg-[var(--success)]", t.status === "active" && "border-[var(--primary)] bg-[var(--primary)] ring-4 ring-[var(--primary)]/20", t.status === "deferred" && "border-[var(--warning)] bg-transparent")} />
                        {i < extras.timeline.length - 1 && <div className="w-px flex-1 bg-[var(--border)]" />}
                      </div>
                      <div className={i < extras.timeline.length - 1 ? "pb-4" : ""}>
                        <div className="text-sm font-bold tabular-nums">{t.date} {t.status === "deferred" && <Badge tone="warning" className="ml-1">deferred</Badge>}{t.status === "active" && <Badge tone="primary" className="ml-1">now live</Badge>}</div>
                        <p className="text-sm leading-relaxed text-[var(--muted)]">{t.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2 text-sm font-bold"><Scale size={15} className="text-[var(--accent)]" /> {extras.penaltyTitle}</div>
                <p className="mb-3 text-xs text-[var(--muted)]">{extras.penaltyNote}</p>
                <div className="space-y-3">
                  {extras.penaltyLadder.map((p) => (
                    <div key={p.tier}>
                      <div className="mb-1 flex items-baseline justify-between text-sm">
                        <span className="font-semibold">{p.what}</span>
                        <span className="font-bold tabular-nums text-[var(--danger)]">{p.amount} <span className="text-xs text-[var(--muted)]">or</span> {p.pct}</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                        <div className="h-full rounded-full bg-[var(--danger)]/70" style={{ width: `${p.width}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardBody>
      )}
    </Card>
  );
}

function DeepDive({ title, chip, body, defaultOpen }: { title: string; chip: string; body: string; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <button onClick={() => { haptic("tap"); setOpen((o) => !o); }} className="press flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left">
        <ChevronDown size={16} className={cn("shrink-0 text-[var(--muted)] transition-transform duration-200", open && "rotate-180")} />
        <span className="flex-1 text-sm font-bold">{title}</span>
        <Badge tone="primary">{chip}</Badge>
      </button>
      {open && (
        <CardBody className="prose-note border-t border-[var(--border)] pt-4 text-sm leading-relaxed">
          <Markdown>{body}</Markdown>
        </CardBody>
      )}
    </Card>
  );
}
