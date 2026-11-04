"use client";

import { getPackExtras } from "@/lib/content";
import { useEffect, useId, useMemo, useState } from "react";
import { AlertOctagon, AlertTriangle, BellDot, CheckCircle2, ChevronDown, ExternalLink, Info, Newspaper } from "lucide-react";
import { getUpdates } from "@/lib/updates";
import { getActiveExam, readStoredExam } from "@/lib/exam-state";
import type { LawUpdate, Severity } from "@/lib/types";
import { useProgress } from "@/store/progress";
import { Badge, Card, CardBody, PageHeader, buttonVariants } from "@/components/ui";
import { Markdown } from "@/components/markdown";
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
      // Stamp across the bundled feed too: the nav dot compares against the bundle,
      // so a lagging online feed must not leave the dot stuck on.
      const newest = [...items, ...getPackExtras().updates].reduce((m, u) => Math.max(m, tsOf(u)), 0);
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
  const freshCritical = fresh.filter((u) => u.severity === "critical").length;
  const newestDay = items.length ? dayOf(items[0]) : null;
  const headline =
    fresh.length > 0
      ? { icon: <BellDot size={22} aria-hidden className="shrink-0 text-[var(--primary)]" />, text: `${fresh.length} new since your last visit`, crit: freshCritical }
      : feed.seenBefore !== null
        ? { icon: <CheckCircle2 size={22} aria-hidden className="shrink-0 text-[var(--success)]" />, text: "You're up to date", crit: 0 }
        : { icon: <Newspaper size={22} aria-hidden className="shrink-0 text-[var(--muted)]" />, text: `${items.length} update${items.length === 1 ? "" : "s"}`, crit: critical };

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
          {/* Verdict + filters — the screen's lit hero */}
          <Card className="mesh">
              <CardBody className="space-y-4 p-6">
                <div>
                  <h2 className="flex items-start gap-2.5 text-[25px] font-extrabold leading-tight">
                    <span className="mt-[5px] shrink-0">{headline.icon}</span>
                    <span className="min-w-0">
                      {headline.text}
                      {headline.crit > 0 && (
                        <Badge tone="danger" className="ml-2 align-[0.3em] font-sans">
                          {headline.crit} critical
                        </Badge>
                      )}
                    </span>
                  </h2>
                  <p className="mt-1.5 text-sm text-[var(--muted)]">
                    {newestDay ? (
                      <>
                        Newest <span className="font-semibold text-[var(--foreground)] tabular-nums">{longDate(newestDay)}</span> ({ago(newestDay.getTime(), feed.now)})
                      </>
                    ) : (
                      <>Newest {items[0].publishedDate}</>
                    )}
                  </p>
                </div>

                {presentSevs.length > 1 && (
                  <ScrollRow activeKey={sev} className="-mx-6 sm:mx-0">
                    <div role="group" aria-label="Filter by severity" className="flex w-max gap-1.5 px-6 sm:w-auto sm:flex-wrap sm:px-0">
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
                  <ScrollRow activeKey={region} className="-mx-6 sm:mx-0">
                    <div role="group" aria-label="Filter by region" className="flex w-max gap-1.5 px-6 sm:w-auto sm:flex-wrap sm:px-0">
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

          {/* The dated feed — newest first */}
          <Card className="overflow-hidden">
            <ul className="divide-y divide-[var(--border)]">
              {shown.map((u) => (
                <UpdateRow key={u.id} u={u} isNew={isNew(u)} />
              ))}
            </ul>
          </Card>
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
      {/* severity rail — a slim pill inset from the glass edge; the label beside it is the text signal */}
      <span aria-hidden className="absolute bottom-3.5 left-2 top-3.5 w-[3px] rounded-full" style={{ background: s.color }} />
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          haptic("tap");
          setOpen((o) => !o);
        }}
        className="flex w-full cursor-pointer items-start gap-3 py-3.5 pl-5 pr-4 text-left transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)] sm:pr-5"
      >
        {/* date tile — a quiet tint on the glass; new items take the exam's light */}
        <div
          aria-hidden={d ? true : undefined}
          className={cn(
            "w-12 shrink-0 rounded-[14px] py-2 text-center leading-none",
            isNew ? "bg-[var(--primary)]/12 ring-1 ring-[var(--primary)]/30" : "bg-[var(--surface-2)]"
          )}
        >
          {d ? (
            <>
              <div className={cn("font-display text-xl font-bold tabular-nums", isNew && "text-[color-mix(in_srgb,var(--primary)_82%,var(--foreground))]")}>{d.getDate()}</div>
              <div className="mt-1 text-[11px] font-semibold text-[var(--muted)]">{d.toLocaleDateString(undefined, { month: "short" })}</div>
              <div className="mt-0.5 text-[10px] tabular-nums text-[var(--muted)]">{d.getFullYear()}</div>
            </>
          ) : (
            <div className="px-1 text-[10px] text-[var(--muted)]">{u.publishedDate}</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1 font-semibold" style={{ color: `color-mix(in srgb, ${s.color} 82%, var(--foreground))` }}>
              <Icon size={13} aria-hidden /> {s.label}
            </span>
            <span className="min-w-0 text-[var(--muted)]">{u.jurisdiction}</span>
            {d && <span className="sr-only">, {longDate(d)}</span>}
            {isNew && (
              <Badge tone="primary" className="anim-pop">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" /> New
              </Badge>
            )}
            {!u.bokRelevant && <Badge>Background</Badge>}
          </div>
          <div className="mt-1 text-[15px] font-semibold leading-snug">{u.title}</div>
        </div>
        <ChevronDown size={16} aria-hidden className={cn("mt-1 shrink-0 text-[var(--muted)] transition-transform duration-200 motion-reduce:transition-none", open && "rotate-180")} />
      </button>
      {open && (
        <div id={id} className="border-t border-[var(--border)] pb-3 pl-5 pr-4 pt-3 sm:pl-20 sm:pr-5">
          <Markdown className="leading-relaxed">{u.bodyMd}</Markdown>
          {u.sourceUrl && (
            <a href={u.sourceUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-3 mt-1 h-11 sm:h-9")}>
              Read the source <ExternalLink size={13} aria-hidden />
            </a>
          )}
        </div>
      )}
    </li>
  );
}
