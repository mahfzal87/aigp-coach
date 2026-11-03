"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { AlertOctagon, AlertTriangle, BellDot, CheckCircle2, ChevronDown, ExternalLink, Info, Newspaper } from "lucide-react";
import { getUpdates } from "@/lib/updates";
import { getActiveExam, readStoredExam } from "@/lib/exam-state";
import type { LawUpdate, Severity } from "@/lib/types";
import { useProgress } from "@/store/progress";
import { Badge, Card, CardBody, PageHeader } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { Reveal } from "@/components/motion";
import { FilterChip, ScrollRow, ago } from "@/components/library-ui";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const SEV: Record<Severity, { label: string; tone: "danger" | "warning" | "accent"; color: string; icon: typeof Info }> = {
  critical: { label: "Critical", tone: "danger", color: "var(--danger)", icon: AlertOctagon },
  important: { label: "Important", tone: "warning", color: "var(--warning)", icon: AlertTriangle },
  info: { label: "Info", tone: "accent", color: "var(--accent)", icon: Info },
};
const SEV_ORDER: Severity[] = ["critical", "important", "info"];

const regionOf = (u: LawUpdate) => (u.jurisdiction.startsWith("United States") ? "United States" : u.jurisdiction);
// Comparable instant for the "last seen" mark (same value on every device).
const tsOf = (u: LawUpdate) => {
  const t = Date.parse(u.publishedDate);
  return Number.isNaN(t) ? 0 : t;
};
// The calendar day as written ("2026-07-27"), in local time — a UTC parse
// would show the 26th west of Greenwich.
function dayOf(u: LawUpdate): Date | null {
  const m = u.publishedDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}
const longDate = (d: Date) => d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
function countBy<T>(items: T[], key: (t: T) => string): Map<string, number> {
  const m = new Map<string, number>();
  for (const it of items) m.set(key(it), (m.get(key(it)) ?? 0) + 1);
  return m;
}

interface Feed {
  items: LawUpdate[]; // newest first
  now: number;
  seenBefore: number | null; // settings.lastSeenUpdateTs as it was when this visit began; null = first visit
}

export default function UpdatesPage() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [sevPick, setSev] = useState<Severity | "all">("all");
  const [regionPick, setRegion] = useState("all");

  useEffect(() => {
    let alive = true;
    let markTimer: ReturnType<typeof setTimeout> | undefined;
    const exam = getActiveExam();
    getUpdates().then((list) => {
      if (!alive || getActiveExam() !== exam) return;
      const items = [...list].sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
      // "New" = published after the mark as it stood when this visit began.
      const seenBefore = useProgress.getState().settings.lastSeenUpdateTs ?? null;
      setFeed({ items, now: Date.now(), seenBefore });
      const newest = items.reduce((m, u) => Math.max(m, tsOf(u)), 0);
      if (newest <= (seenBefore ?? 0)) return;
      // Advance the mark only once the visit has settled. On boot ExamGate may
      // still swap to a stored non-default exam and remount this page — that
      // unmount cancels the timer, so a CIPP/E visit never stamps AIGP and the
      // visible "new" badges are never consumed by a throwaway first render.
      markTimer = setTimeout(() => {
        if (getActiveExam() !== exam || exam !== readStoredExam()) return;
        const store = useProgress.getState();
        if (newest > (store.settings.lastSeenUpdateTs ?? 0)) store.setSettings({ lastSeenUpdateTs: newest });
      }, 1500);
    });
    return () => {
      alive = false;
      clearTimeout(markTimer);
    };
  }, []);

  const items = useMemo(() => feed?.items ?? [], [feed]);
  const regions = useMemo(() => [...new Set(items.map(regionOf))].sort(), [items]);
  const showRegions = regions.length > 1; // one region = a chip that equals "All"

  // Each filter counts within the other, so no chip can lead to an empty list.
  const region = showRegions && regions.includes(regionPick) ? regionPick : "all";
  const inRegion = items.filter((u) => region === "all" || regionOf(u) === region);
  const sevCounts = countBy(inRegion, (u) => u.severity);
  const sev = sevPick !== "all" && (sevCounts.get(sevPick) ?? 0) > 0 ? sevPick : "all";
  const regionCounts = countBy(items.filter((u) => sev === "all" || u.severity === sev), regionOf);
  const shown = inRegion.filter((u) => sev === "all" || u.severity === sev);
  const presentSevs = SEV_ORDER.filter((s) => items.some((u) => u.severity === s));

  if (!feed) return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  const isNew = (u: LawUpdate) => feed.seenBefore !== null && tsOf(u) > feed.seenBefore;
  const fresh = items.filter(isNew);
  const critical = items.filter((u) => u.severity === "critical").length;
  const newestDay = items.length ? dayOf(items[0]) : null;

  return (
    <div className="space-y-4">
      <PageHeader title="Law updates" subtitle="What changed, and the exam angle." />

      {items.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <Newspaper size={20} aria-hidden className="text-[var(--muted)]" />
          <p className="text-sm font-semibold">No updates yet.</p>
          <p className="text-sm text-[var(--muted)]">Your coach adds them as the law moves.</p>
        </Card>
      ) : (
        <>
          {/* Verdict + filters */}
          <Reveal>
            <Card>
              <CardBody className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-base font-bold leading-snug">
                    {fresh.length > 0 ? (
                      <BellDot size={18} aria-hidden className="shrink-0 text-[var(--primary)]" />
                    ) : feed.seenBefore !== null ? (
                      <CheckCircle2 size={18} aria-hidden className="shrink-0 text-[var(--success)]" />
                    ) : (
                      <Newspaper size={18} aria-hidden className="shrink-0 text-[var(--muted)]" />
                    )}
                    <span className="min-w-0">
                      {fresh.length > 0
                        ? `${fresh.length} new since your last visit`
                        : feed.seenBefore !== null
                          ? "You're up to date"
                          : `${items.length} update${items.length === 1 ? "" : "s"}${critical ? ` · ${critical} critical` : ""}`}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {fresh.length > 0 && fresh.some((u) => u.severity === "critical")
                        ? "Includes a critical one · "
                        : feed.seenBefore === null && critical
                          ? "Start with the critical ones · "
                          : ""}
                      {newestDay ? (
                        <>
                          Newest <span className="font-semibold text-[var(--foreground)] tabular-nums">{longDate(newestDay)}</span> · {ago(newestDay.getTime(), feed.now)}
                        </>
                      ) : (
                        <>Newest {items[0].publishedDate}</>
                      )}
                    </p>
                  </div>
                </div>

                {presentSevs.length > 1 && (
                  <ScrollRow activeKey={sev} className="-mx-5 sm:mx-0">
                    <div role="group" aria-label="Filter by severity" className="flex w-max gap-1.5 px-5 sm:w-auto sm:flex-wrap sm:px-0">
                      <FilterChip label="All" count={inRegion.length} active={sev === "all"} onClick={() => { haptic("tap"); setSev("all"); }} />
                      {presentSevs.map((s) => {
                        const n = sevCounts.get(s) ?? 0;
                        return (
                          <FilterChip
                            key={s}
                            label={SEV[s].label}
                            count={n}
                            dot={SEV[s].color}
                            active={sev === s}
                            disabled={n === 0}
                            title={n === 0 ? `None in ${region}` : undefined}
                            onClick={() => { haptic("tap"); setSev(sev === s ? "all" : s); }}
                          />
                        );
                      })}
                    </div>
                  </ScrollRow>
                )}
                {showRegions && (
                  <ScrollRow activeKey={region} className="-mx-5 sm:mx-0">
                    <div role="group" aria-label="Filter by region" className="flex w-max gap-1.5 px-5 sm:w-auto sm:flex-wrap sm:px-0">
                      <FilterChip label="All regions" count={items.filter((u) => sev === "all" || u.severity === sev).length} active={region === "all"} onClick={() => { haptic("tap"); setRegion("all"); }} />
                      {regions.map((r) => {
                        const n = regionCounts.get(r) ?? 0;
                        return (
                          <FilterChip
                            key={r}
                            label={r}
                            count={n}
                            active={region === r}
                            disabled={n === 0}
                            title={n === 0 ? `No ${sev} updates here` : undefined}
                            onClick={() => { haptic("tap"); setRegion(region === r ? "all" : r); }}
                          />
                        );
                      })}
                    </div>
                  </ScrollRow>
                )}
              </CardBody>
            </Card>
          </Reveal>

          {/* The dated feed — newest first */}
          <Reveal delay={0.05}>
            <Card className="overflow-hidden">
              <ul className="divide-y divide-[var(--border)]">
                {shown.map((u) => (
                  <UpdateRow key={u.id} u={u} isNew={isNew(u)} />
                ))}
              </ul>
            </Card>
          </Reveal>
        </>
      )}
    </div>
  );
}

function UpdateRow({ u, isNew }: { u: LawUpdate; isNew: boolean }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const s = SEV[u.severity] ?? SEV.info;
  const Icon = s.icon;
  const d = dayOf(u);
  return (
    <li className="relative">
      {/* severity rail — the at-a-glance signal; the label beside it is the text one */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: s.color }} />
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          haptic("tap");
          setOpen((o) => !o);
        }}
        className="flex w-full cursor-pointer items-start gap-3 py-3.5 pl-5 pr-4 text-left transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)] sm:gap-4 sm:pr-5"
      >
        {/* date block */}
        <div className="w-10 shrink-0 text-center leading-none sm:w-11" aria-hidden={d ? true : undefined}>
          {d ? (
            <>
              <div className="text-lg font-bold tabular-nums">{d.getDate()}</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">{d.toLocaleDateString(undefined, { month: "short" })}</div>
              <div className="mt-0.5 text-[10px] tabular-nums text-[var(--muted)]">{d.getFullYear()}</div>
            </>
          ) : (
            <div className="text-[10px] text-[var(--muted)]">{u.publishedDate}</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1 font-semibold" style={{ color: s.color }}>
              <Icon size={13} aria-hidden /> {s.label}
            </span>
            <span className="min-w-0 text-[var(--muted)]">{u.jurisdiction}</span>
            {d && <span className="sr-only">, {longDate(d)}</span>}
            {isNew && <Badge tone="primary">New</Badge>}
            {!u.bokRelevant && <Badge>Background</Badge>}
          </div>
          <div className="mt-1 text-sm font-bold leading-snug">{u.title}</div>
        </div>
        <ChevronDown size={16} aria-hidden className={cn("mt-1 shrink-0 text-[var(--muted)] transition-transform duration-200 motion-reduce:transition-none", open && "rotate-180")} />
      </button>
      {open && (
        <div id={id} className="border-t border-[var(--border)] pb-4 pl-5 pr-4 pt-3 sm:pl-20 sm:pr-5">
          <Markdown className="leading-relaxed">{u.bodyMd}</Markdown>
          {u.sourceUrl && (
            <a href={u.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex h-11 items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline sm:h-8">
              Read the source <ExternalLink size={13} aria-hidden />
            </a>
          )}
        </div>
      )}
    </li>
  );
}
