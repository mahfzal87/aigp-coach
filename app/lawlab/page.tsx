"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  KeyRound,
  Lightbulb,
  Map as MapIcon,
  Minus,
  RotateCcw,
  Swords,
  TrendingDown,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { celebrate, buzzFail } from "@/lib/celebrate";
import { mapLeafKey, totalLeaves, type Confusable, type LawMapDef, type LawRegion } from "@/lib/lawlab-types";
import { competencyToDomainCode, getActiveMeta, getCompetency, getPackExtras } from "@/lib/content";
import type { Attempt, DomainCode, MockSession } from "@/lib/types";
import { useLawLab, useLawLabHydrated } from "@/store/lawlab";
import { useHydrated, useProgress } from "@/store/progress";
import { AnimatedNumber, Reveal } from "@/components/motion";
import { Badge, Bar, Button, Card, CardBody, PageHeader } from "@/components/ui";
import { MindMap } from "@/components/mindmap";

// Active pack's Law Lab data (maps, confusables, weakness competency list).
const lab = () => getPackExtras().lawlab;
const LAW_MAPS = () => lab().maps;
const CONFUSABLES = () => lab().confusables;
const LAW_COMPS_F = () => lab().weaknessCompetencies;

type Mode = "maps" | "confuse" | "drill";
type RegionFilter = "All" | LawRegion;
const REGIONS: LawRegion[] = ["EU", "US", "APAC", "Global", "Org"];
const REGION_LABEL: Record<LawRegion, string> = { EU: "EU", US: "US", APAC: "APAC", Global: "Global", Org: "In the org" };
const DRILL_ROUNDS = 10;

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/50";
// Stretches a 36px control's tap area to 44px without changing how it looks.
const HIT = "relative after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']";

interface MapProgress {
  def: LawMapDef;
  n: number;
  total: number;
}

function lockedIn(def: LawMapDef, locked: Record<string, true>) {
  return def.branches.reduce((n, b) => n + b.leaves.reduce((m, _, i) => m + (locked[mapLeafKey(def.id, b.id, i)] ? 1 : 0), 0), 0);
}

function reducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

// Deep links: /lawlab?mode=drill · /lawlab?mode=confuse · /lawlab?map=<map id>
function readDeepLink(): { mode: Mode; map: string | null } {
  if (typeof window === "undefined") return { mode: "maps", map: null };
  const p = new URLSearchParams(window.location.search);
  const map = p.get("map");
  const validMap = map && LAW_MAPS().some((m) => m.id === map) ? map : null;
  const m = p.get("mode");
  return { mode: validMap ? "maps" : m === "confuse" || m === "drill" ? m : "maps", map: validMap };
}

function writeModeToUrl(mode: Mode) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("map");
    if (mode === "maps") url.searchParams.delete("mode");
    else url.searchParams.set("mode", mode);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  } catch {
    /* history unavailable — the mode still switches */
  }
}

export default function LawLabPage() {
  const hydrated = useHydrated();
  const labHydrated = useLawLabHydrated();
  const ready = hydrated && labHydrated;

  const [deep] = useState(readDeepLink);
  const [mode, setModeState] = useState<Mode>(deep.mode);
  const [region, setRegion] = useState<RegionFilter>("All");
  const [open, setOpen] = useState<Set<string>>(() => new Set(deep.map ? [deep.map] : LAW_MAPS().slice(0, 1).map((m) => m.id)));
  const [scrollReq, setScrollReq] = useState<{ id: string; block: ScrollLogicalPosition; n: number } | null>(
    deep.map ? { id: deep.map, block: "start", n: 0 } : null
  );
  const [drill, setDrill] = useState<DrillRun | null>(null); // lifted so a run survives a trip to its maps

  // Scroll requests land after the target row has rendered.
  useEffect(() => {
    if (!ready || !scrollReq) return;
    document.getElementById(`map-${scrollReq.id}`)?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: scrollReq.block });
  }, [ready, scrollReq]);

  if (!ready) return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  const setMode = (m: Mode) => {
    setModeState(m);
    writeModeToUrl(m);
  };
  const requestScroll = (id: string, block: ScrollLogicalPosition) => setScrollReq((s) => ({ id, block, n: (s?.n ?? 0) + 1 }));

  const openMap = (id: string) => {
    const def = LAW_MAPS().find((m) => m.id === id);
    if (!def) return;
    haptic("tap");
    setMode("maps");
    setRegion((r) => (r === "All" || r === def.region ? r : "All"));
    setOpen((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    requestScroll(id, "start");
  };
  const toggleMap = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const collapseMap = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    requestScroll(id, "nearest");
  };
  const nextMap = (from: string, to: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.delete(from);
      next.add(to);
      return next;
    });
    requestScroll(to, "start");
  };

  return (
    <div>
      <PageHeader title="Law Lab" subtitle={lab().blurb} />
      <LabStatus onOpenMap={openMap} onDrill={() => setMode("drill")} />
      <ModeTabs
        mode={mode}
        onChange={(m) => {
          haptic("tap");
          setMode(m);
        }}
      />
      <div role="tabpanel" id={`ll-panel-${mode}`} aria-labelledby={`ll-tab-${mode}`}>
        <Reveal key={mode} y={6}>
          {mode === "maps" && (
            <MapsSection region={region} onRegion={setRegion} open={open} onToggle={toggleMap} onCollapse={collapseMap} onNext={nextMap} />
          )}
          {mode === "confuse" && <ConfusablesSection />}
          {mode === "drill" && <TriggerDrill run={drill} setRun={setDrill} onOpenMap={openMap} onConfusables={() => setMode("confuse")} />}
        </Reveal>
      </div>
    </div>
  );
}

// ── Mode switch (segmented tabs) ──
const TABS: { m: Mode; label: string; Icon: typeof MapIcon }[] = [
  { m: "maps", label: "Mindmaps", Icon: MapIcon },
  { m: "confuse", label: "Confusables", Icon: ArrowLeftRight },
  { m: "drill", label: "Trigger Drill", Icon: Swords },
];

function ModeTabs({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const counts: Record<Mode, number | null> = { maps: LAW_MAPS().length, confuse: CONFUSABLES().length, drill: null };
  const onKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const i = TABS.findIndex((t) => t.m === mode);
    const to =
      e.key === "ArrowRight" ? (i + 1) % TABS.length : e.key === "ArrowLeft" ? (i - 1 + TABS.length) % TABS.length : e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    onChange(TABS[to].m);
    document.getElementById(`ll-tab-${TABS[to].m}`)?.focus();
  };
  return (
    <div
      role="tablist"
      aria-label="Law Lab mode"
      onKeyDown={onKey}
      className="mb-5 grid grid-cols-3 gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-1"
    >
      {TABS.map(({ m, label, Icon }) => {
        const active = mode === m;
        return (
          <button
            key={m}
            id={`ll-tab-${m}`}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls={`ll-panel-${m}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(m)}
            className={cn(
              "press flex min-h-11 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold sm:min-h-10 sm:text-sm",
              FOCUS,
              active ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            <Icon size={15} aria-hidden="true" className="hidden shrink-0 sm:block" />
            <span className="truncate">{label}</span>
            {counts[m] !== null && <span className="hidden text-xs tabular-nums text-[var(--muted)] sm:inline">{counts[m]}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ── Status band: verdict + next action, mastery strip, live weak spots ──
function LabStatus({ onOpenMap, onDrill }: { onOpenMap: (id: string) => void; onDrill: () => void }) {
  const locked = useLawLab((s) => s.locked);
  const drillBest = useLawLab((s) => s.drillBest);
  const attempts = useProgress((s) => s.attempts);
  const mocks = useProgress((s) => s.mocks);
  const weak = useMemo(() => computeWeak(attempts, mocks), [attempts, mocks]);
  const hasWeak = weak.worst.length > 0 || !!weak.trend;

  const per: MapProgress[] = LAW_MAPS().map((def) => ({ def, n: lockedIn(def, locked), total: totalLeaves(def) }));
  const n = per.reduce((a, p) => a + p.n, 0);
  const total = per.reduce((a, p) => a + p.total, 0);
  const pct = total ? Math.round((100 * n) / total) : 0;
  const next = pickNext(per);

  return (
    <Card className="mb-4">
      <CardBody className="@container p-4 sm:p-5">
        {/* Two columns only when there are weak spots to show; otherwise a slim footer row. */}
        <div className={cn("grid gap-4", hasWeak && "@xl:grid-cols-[minmax(0,1fr)_17rem] @xl:gap-6")}>
          <div className="flex min-w-0 flex-col justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">
                  {next ? (next.n > 0 ? "Continue" : "Start here") : "Every map locked in"}
                </div>
                <div className="mt-0.5 line-clamp-2 text-[15px] font-bold leading-snug">{next ? next.def.name : "Keep the triggers warm"}</div>
                <div className="mt-0.5 text-xs text-[var(--muted)]">
                  {next ? (
                    <>
                      <span className="tabular-nums">
                        {next.n}/{next.total}
                      </span>{" "}
                      facts locked{next.def.weight === 3 && " · High yield"}
                    </>
                  ) : (
                    "A drill a day keeps them sharp"
                  )}
                </div>
              </div>
              <Button size="sm" className="h-11 shrink-0 sm:h-9" onClick={() => (next ? onOpenMap(next.def.id) : onDrill())}>
                {next ? "Open map" : "Run drill"} <ArrowRight size={14} />
              </Button>
            </div>

            <div>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs font-semibold text-[var(--muted)]">
                <span className="min-w-0 truncate">
                  <span className="text-[17px] font-bold text-[var(--foreground)]">
                    <AnimatedNumber value={pct} />%
                  </span>{" "}
                  locked in · <span className="tabular-nums">{n}/{total}</span> facts
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <Trophy size={13} className="text-[var(--gold)]" aria-hidden="true" /> Drill best{" "}
                  <span className="tabular-nums text-[var(--foreground)]">{drillBest ? `${drillBest}/${DRILL_ROUNDS}` : "—"}</span>
                </span>
              </div>
              <MasteryStrip per={per} />
            </div>
          </div>
          <WeakSpots worst={weak.worst} trend={weak.trend} anyAttempts={attempts.length > 0} column={hasWeak} />
        </div>
      </CardBody>
    </Card>
  );
}

// In-progress maps first (finish what you started), else the highest-yield untouched map.
function pickNext(per: MapProgress[]): MapProgress | null {
  const open = per.filter((p) => p.n < p.total);
  if (open.length === 0) return null;
  const started = open.filter((p) => p.n > 0).sort((a, b) => b.def.weight - a.def.weight || b.n / b.total - a.n / a.total);
  return started[0] ?? [...open].sort((a, b) => b.def.weight - a.def.weight)[0];
}

// The hero instrument: one segment per map, width ∝ its fact count, fill ∝ locked.
function MasteryStrip({ per }: { per: MapProgress[] }) {
  const done = per.filter((p) => p.total > 0 && p.n >= p.total).length;
  return (
    <div className="flex w-full gap-[3px]" role="img" aria-label={`${done} of ${per.length} maps fully locked in`}>
      {per.map((p) => (
        <div key={p.def.id} title={`${p.def.short} · ${p.n}/${p.total}`} className="min-w-[3px]" style={{ flex: `${p.total} 1 0%` }}>
          <Bar value={(100 * p.n) / Math.max(1, p.total)} tone={p.n >= p.total ? "success" : "primary"} className="rounded-[3px]" />
        </div>
      ))}
    </div>
  );
}

// ── Live weak spots, ranked from the real attempt history ──
interface WeakRow {
  cid: string;
  code: string;
  name: string;
  pct: number;
}

function computeWeak(attempts: Attempt[], mocks: MockSession[]) {
  const comps = LAW_COMPS_F();
  const worst: WeakRow[] = comps
    .map((cid) => {
      const list = attempts.filter((a) => a.competencyId === cid);
      const c = getCompetency(cid);
      return {
        cid,
        n: list.length,
        pct: list.length ? Math.round((100 * list.filter((a) => a.correct).length) / list.length) : 0,
        code: c?.code ?? cid,
        name: c?.name ?? "",
      };
    })
    .filter((r) => r.n >= 5)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3);

  // The pack's "law domain" = the domain holding most ranked competencies (AIGP → II).
  // Packs whose competencies spread evenly (CIPP/E) have none, so no mock readout.
  const codes = comps.map((cid) => competencyToDomainCode(cid)).filter((c): c is DomainCode => !!c);
  const tally = new Map<DomainCode, number>();
  for (const c of codes) tally.set(c, (tally.get(c) ?? 0) + 1);
  const top = [...tally.entries()].sort((a, b) => b[1] - a[1])[0];
  const lawDomain = top && top[1] / codes.length > 0.5 ? top[0] : null;

  let trend: { code: DomainCode; vals: number[] } | null = null;
  if (lawDomain) {
    const fullIds = new Set(getPackExtras().paperDefs.filter((d) => d.kind === "full").map((d) => d.id));
    const minLen = Math.round(getActiveMeta().questionsTotal * 0.9);
    const vals = mocks
      .filter((m) => m.finishedAt && (m.examId ? fullIds.has(m.examId) : m.questionIds.length >= minLen) && m.perDomain?.[lawDomain]?.total)
      .sort((a, b) => a.startedAt - b.startedAt)
      .slice(-3)
      .map((m) => Math.round((100 * m.perDomain![lawDomain].correct) / m.perDomain![lawDomain].total));
    if (vals.length) trend = { code: lawDomain, vals };
  }
  return { worst, trend };
}

function WeakSpots({
  worst,
  trend,
  anyAttempts,
  column,
}: {
  worst: WeakRow[];
  trend: { code: DomainCode; vals: number[] } | null;
  anyAttempts: boolean;
  column: boolean; // true → right-hand column on wide cards; false → slim footer row
}) {
  const first = trend?.vals[0] ?? 0;
  const last = trend?.vals[trend.vals.length - 1] ?? 0;
  const TrendIcon = !trend || trend.vals.length < 2 || first === last ? Minus : last < first ? TrendingDown : TrendingUp;
  const label = (
    <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">
      <TrendingDown size={13} className="text-[var(--danger)]" aria-hidden="true" /> Weakest in practice
    </div>
  );

  if (!column) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--border)] pt-3.5">
        {label}
        <p className="text-xs text-[var(--muted)]">
          {anyAttempts ? "Ranks after 5 answers per topic." : "No practice answers yet."}{" "}
          <Link href="/practice" className={cn("font-semibold text-[var(--accent)] hover:underline", FOCUS)}>
            Start practice →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 border-t border-[var(--border)] pt-3.5 @xl:border-l @xl:border-t-0 @xl:pl-6 @xl:pt-0">
      <div className="mb-2">{label}</div>
      {worst.length > 0 ? (
        <ul className="flex flex-wrap gap-x-1 gap-y-0.5 @xl:flex-col @xl:flex-nowrap @xl:gap-0">
          {worst.map((w) => (
            <li key={w.cid} className="min-w-0">
              <Link
                href={`/practice?competency=${w.cid}`}
                title={`Practise ${w.code} ${w.name}`}
                className={cn(
                  "press group flex min-h-10 items-center gap-2 rounded-lg px-1 text-xs @xl:min-h-8 @xl:px-1.5 @xl:hover:bg-[var(--surface-2)]",
                  FOCUS
                )}
              >
                <Badge tone={w.pct < 70 ? "danger" : w.pct < 80 ? "warning" : "success"} className="tabular-nums">
                  {w.code} · {w.pct}%
                </Badge>
                <span className="hidden min-w-0 flex-1 truncate text-[var(--foreground)] @xl:block">{w.name}</span>
                <ArrowRight size={12} aria-hidden="true" className="hidden shrink-0 text-[var(--muted)] group-hover:text-[var(--foreground)] @xl:block" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-[var(--muted)]">
          {anyAttempts ? "Ranks after 5 answers per topic." : "No practice answers yet."}{" "}
          <Link href="/practice" className={cn("font-semibold text-[var(--accent)] hover:underline", FOCUS)}>
            Start practice →
          </Link>
        </p>
      )}
      {trend && (
        <div
          className="mt-2 flex items-center gap-1.5 whitespace-nowrap text-xs text-[var(--muted)] @xl:px-1.5"
          title={`Domain ${trend.code} score on your last ${trend.vals.length} full mock${trend.vals.length === 1 ? "" : "s"}`}
        >
          <TrendIcon
            size={13}
            aria-hidden="true"
            className={cn("shrink-0", TrendIcon === TrendingDown && "text-[var(--danger)]", TrendIcon === TrendingUp && "text-[var(--success)]")}
          />
          <span>Domain {trend.code} mocks</span>
          <span className="font-semibold tabular-nums text-[var(--foreground)]">{trend.vals.join(" → ")}%</span>
        </div>
      )}
    </div>
  );
}

// ── Mindmaps ──
function MapsSection({
  region,
  onRegion,
  open,
  onToggle,
  onCollapse,
  onNext,
}: {
  region: RegionFilter;
  onRegion: (r: RegionFilter) => void;
  open: Set<string>;
  onToggle: (id: string) => void;
  onCollapse: (id: string) => void;
  onNext: (from: string, to: string) => void;
}) {
  const maps = LAW_MAPS();
  // Only regions that actually hold maps; no row at all when everything shares one region.
  const regions = REGIONS.map((r) => ({ r, n: maps.filter((m) => m.region === r).length })).filter((x) => x.n > 0);
  const showRegions = regions.length > 1;
  const active: RegionFilter = showRegions && regions.some((x) => x.r === region) ? region : "All";
  const list = active === "All" ? maps : maps.filter((m) => m.region === active);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {showRegions && (
          <div role="group" aria-label="Filter maps by region" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
            <RegionChip label="All" n={maps.length} active={active === "All"} onClick={() => onRegion("All")} />
            {regions.map(({ r, n }) => (
              <RegionChip key={r} label={REGION_LABEL[r]} n={n} active={active === r} onClick={() => onRegion(r)} />
            ))}
          </div>
        )}
        <p className="flex shrink-0 items-center gap-1.5 text-xs text-[var(--muted)]">
          <span aria-hidden="true" className="grid h-3.5 w-3.5 place-items-center rounded-full bg-[var(--primary)] text-[var(--primary-fg)]">
            <Check size={9} strokeWidth={3.5} />
          </span>
          Tap a fact you know cold
        </p>
      </div>

      <Card className="overflow-hidden">
        <ul className="divide-y divide-[var(--border)]">
          {list.map((def, i) => {
            const next = list[i + 1];
            return (
              <MapRow
                key={def.id}
                def={def}
                open={open.has(def.id)}
                next={next}
                onToggle={() => onToggle(def.id)}
                onCollapse={() => onCollapse(def.id)}
                onNext={() => next && onNext(def.id, next.id)}
              />
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function RegionChip({ label, n, active, onClick }: { label: string; n: number; active: boolean; onClick: () => void }) {
  return (
    <Button
      size="sm"
      variant={active ? "primary" : "outline"}
      aria-pressed={active}
      onClick={() => {
        haptic("tap");
        onClick();
      }}
      className={cn("shrink-0 gap-1.5 rounded-full px-3.5", HIT)}
    >
      {label}
      <span className={cn("tabular-nums", active ? "opacity-75" : "text-[var(--muted)]")}>{n}</span>
    </Button>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const done = pct >= 100;
  return (
    <span className="relative grid h-9 w-9 shrink-0 place-items-center" aria-hidden="true">
      <svg width="36" height="36" viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" strokeWidth="3.5" className="stroke-[var(--border)]" />
        {pct > 0 && (
          <circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`${(Math.min(100, pct) / 100) * c} ${c}`}
            className={done ? "stroke-[var(--success)]" : "stroke-[var(--accent)]"}
          />
        )}
      </svg>
      {done ? (
        <Check size={15} strokeWidth={3} className="relative text-[var(--success)]" />
      ) : (
        <span className="relative text-[10px] font-bold tabular-nums text-[var(--muted)]">{pct}</span>
      )}
    </span>
  );
}

function MapRow({
  def,
  open,
  next,
  onToggle,
  onCollapse,
  onNext,
}: {
  def: LawMapDef;
  open: boolean;
  next?: LawMapDef;
  onToggle: () => void;
  onCollapse: () => void;
  onNext: () => void;
}) {
  const locked = useLawLab((s) => s.locked);
  const toggle = useLawLab((s) => s.toggle);
  const total = totalLeaves(def);
  const n = lockedIn(def, locked);
  const pct = total ? Math.round((100 * n) / total) : 0;
  const bodyId = `map-body-${def.id}`;

  return (
    <li id={`map-${def.id}`} className="scroll-mt-20">
      <button
        type="button"
        onClick={() => {
          haptic("tap");
          onToggle();
        }}
        aria-expanded={open}
        aria-controls={bodyId}
        className={cn("press flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left hover:bg-[var(--surface-2)]/50 sm:px-5", FOCUS, "focus-visible:ring-inset")}
      >
        <Ring pct={pct} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-[15px] font-bold leading-tight">{def.name}</span>
            {def.weight === 3 && <Badge tone="streak">High yield</Badge>}
          </div>
          <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-[var(--muted)]">
            <span className="shrink-0">{def.kind}</span>
            <span aria-hidden="true">·</span>
            <span className={cn("shrink-0 tabular-nums", n >= total && "font-semibold text-[var(--success)]")}>
              {n}/{total} locked
            </span>
            <span className="hidden min-w-0 truncate sm:inline">· {def.tagline}</span>
          </div>
        </div>
        <ChevronDown size={18} aria-hidden="true" className={cn("shrink-0 text-[var(--muted)] transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div id={bodyId} className="space-y-6 px-4 pb-5 pt-1 sm:px-5">
          <p className="text-[13px] leading-snug text-[var(--muted)] sm:hidden">{def.tagline}</p>
          <MindMap def={def} locked={locked} onToggle={toggle} />
          <KeywordChips def={def} />
          <Distinctions def={def} />
          <Traps def={def} />
          <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] pt-4">
            <Button variant="ghost" size="sm" className="h-11 shrink-0 sm:h-9" onClick={() => { haptic("tap"); onCollapse(); }}>
              <ChevronUp size={14} /> Collapse
            </Button>
            {next && (
              <Button variant="outline" size="sm" className="h-11 min-w-0 sm:h-9" onClick={() => { haptic("tap"); onNext(); }}>
                <span className="truncate">Next: {next.short}</span> <ArrowRight size={14} className="shrink-0" />
              </Button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

function SectionLabel({ icon, text, danger, action }: { icon: ReactNode; text: string; danger?: boolean; action?: ReactNode }) {
  return (
    <div className="mb-2 flex min-h-6 items-center justify-between gap-3">
      <div className={cn("flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide", danger ? "text-[var(--danger)]" : "text-[var(--muted)]")}>
        {icon} {text}
      </div>
      {action}
    </div>
  );
}

// Trigger words: same-height chips; revealed cues collect underneath in tap order.
function KeywordChips({ def }: { def: LawMapDef }) {
  const [revealed, setRevealed] = useState<number[]>([]);
  if (def.keywords.length === 0) return null;
  const all = revealed.length === def.keywords.length;
  const flip = (i: number) => {
    haptic("tap");
    setRevealed((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };
  return (
    <div>
      <SectionLabel
        icon={<KeyRound size={13} />}
        text="Trigger words · tap to reveal"
        action={
          <button
            type="button"
            onClick={() => {
              haptic("tap");
              setRevealed(all ? [] : def.keywords.map((_, i) => i));
            }}
            className={cn("shrink-0 rounded-md px-1.5 py-1 text-xs font-semibold text-[var(--accent)] hover:underline", HIT, FOCUS)}
          >
            {all ? "Hide all" : "Reveal all"}
          </button>
        }
      />
      <div className="flex flex-wrap gap-1.5">
        {def.keywords.map((k, i) => {
          const isOpen = revealed.includes(i);
          return (
            <Button
              key={i}
              size="sm"
              variant="outline"
              aria-pressed={isOpen}
              onClick={() => flip(i)}
              className={cn("px-2.5 font-bold", HIT, isOpen && "border-[var(--primary)]/60 text-[var(--primary)]")}
            >
              {isOpen && <Check size={12} strokeWidth={3} />}
              {k.term}
            </Button>
          );
        })}
      </div>
      {revealed.length > 0 && (
        <ul className="mt-3 divide-y divide-[var(--border)] border-t border-[var(--border)]" aria-live="polite">
          {revealed.map((i) => (
            <li key={i} className="flex flex-col gap-0.5 py-2 text-[13px] leading-snug sm:flex-row sm:gap-3">
              <span className="shrink-0 font-bold sm:w-44">{def.keywords[i].term}</span>
              <span className="text-[var(--muted)]">{def.keywords[i].cue}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Distinctions({ def }: { def: LawMapDef }) {
  if (def.distinctions.length === 0) return null;
  return (
    <div>
      <SectionLabel icon={<ArrowLeftRight size={13} />} text="Don't confuse it with" />
      <ul className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
        {def.distinctions.map((d, i) => (
          <li key={i} className="py-2.5 text-[13px] leading-snug">
            <span className="font-bold">{d.vs}:</span> <span className="text-[var(--muted)]">{d.point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Traps({ def }: { def: LawMapDef }) {
  if (def.traps.length === 0) return null;
  return (
    <div>
      <SectionLabel icon={<AlertTriangle size={13} />} text="How they'll trick you" danger />
      <ul className="divide-y divide-[var(--danger)]/15 border-t border-[var(--danger)]/25">
        {def.traps.map((t, i) => (
          <li key={i} className="flex gap-2.5 py-2.5 text-[13px] leading-snug">
            <AlertTriangle size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--danger)]" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Confusables ──
function ConfusablesSection() {
  const list = CONFUSABLES();
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--muted)]">
        <span className="font-semibold tabular-nums text-[var(--foreground)]">{list.length}</span> pairs the exam loves to swap
      </p>
      {list.map((c) => (
        <ConfusableCard key={c.id} c={c} />
      ))}
    </div>
  );
}

function ConfusableCard({ c }: { c: Confusable }) {
  // Wide: dimension | A | B.  Narrow: the dimension becomes a label row above A | B.
  const grid = "grid grid-cols-2 @md:grid-cols-[minmax(84px,128px)_minmax(0,1fr)_minmax(0,1fr)]";
  return (
    <Card>
      <CardBody className="@container p-4 sm:p-5">
        <h3 className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[15px] font-bold leading-snug">
          <span>{c.a}</span>
          <ArrowLeftRight size={14} aria-hidden="true" className="text-[var(--muted)]" />
          <span className="sr-only">versus</span>
          <span>{c.b}</span>
        </h3>

        {/* the tell — the verdict, first */}
        <div className="mt-3 flex gap-2.5 rounded-xl bg-[var(--primary)]/10 px-3.5 py-3">
          <Lightbulb size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--primary)]" />
          <p className="text-[13.5px] font-semibold leading-snug">
            <span className="mr-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--primary)]">The tell</span>
            {c.tell}
          </p>
        </div>

        <div role="table" aria-label={`${c.a} versus ${c.b}`} className="mt-3 overflow-hidden rounded-xl border border-[var(--border)] text-[13px] leading-snug">
          <div role="row" className={cn(grid, "bg-[var(--surface-2)] text-xs font-bold")}>
            <div role="columnheader" className="hidden px-3 py-2 @md:block">
              <span className="sr-only">Dimension</span>
            </div>
            <div role="columnheader" className="min-w-0 px-3 py-2 @md:border-l @md:border-[var(--border)]">
              {c.a}
            </div>
            <div role="columnheader" className="min-w-0 border-l border-[var(--border)] px-3 py-2">
              {c.b}
            </div>
          </div>
          {c.rows.map((r, i) => (
            <div key={i} role="row" className={cn(grid, "border-t border-[var(--border)]")}>
              <div
                role="rowheader"
                className="col-span-2 px-3 pt-2.5 text-[11px] font-bold uppercase tracking-wide text-[var(--muted)] @md:col-span-1 @md:bg-[var(--surface-2)]/60 @md:py-2.5 @md:text-xs @md:normal-case @md:tracking-normal @md:text-[var(--foreground)]"
              >
                {r.dim}
              </div>
              <div role="cell" className="min-w-0 px-3 pb-2.5 pt-1 @md:border-l @md:border-[var(--border)] @md:py-2.5">
                {r.a || "—"}
              </div>
              <div role="cell" className="min-w-0 border-l border-[var(--border)] px-3 pb-2.5 pt-1 @md:py-2.5">
                {r.b || "—"}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// ── Trigger Drill ──
interface DrillQ {
  term: string;
  cue: string;
  answer: string; // map short name
  mapId: string;
  options: string[];
}

interface DrillRun {
  qs: DrillQ[];
  prevBest: number; // best before this run (so the result can say "new best")
  idx: number;
  picked: string | null;
  results: boolean[];
}

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const norm = (s: string) => s.trim().toLowerCase();

function buildDrill(): DrillQ[] {
  const maps = LAW_MAPS();
  // A term can live in more than one map — every owner is a right answer, so none
  // of them may appear as a distractor.
  const owners = new Map<string, Set<string>>();
  for (const m of maps) for (const k of m.keywords) owners.set(norm(k.term), (owners.get(norm(k.term)) ?? new Set<string>()).add(m.short));

  const seen = new Set<string>();
  const picked = shuffle(maps.flatMap((m) => m.keywords.map((k) => ({ ...k, answer: m.short, mapId: m.id, region: m.region }))))
    .filter((p) => (seen.has(norm(p.term)) ? false : (seen.add(norm(p.term)), true)))
    .slice(0, DRILL_ROUNDS);

  const shorts = [...new Set(maps.map((m) => m.short))];
  return picked.map((p) => {
    const valid = owners.get(norm(p.term)) ?? new Set([p.answer]);
    const sameRegion = shuffle(maps.filter((m) => m.region === p.region && !valid.has(m.short)).map((m) => m.short));
    const others = shuffle(shorts.filter((s) => !valid.has(s) && !sameRegion.includes(s)));
    const distractors = [...sameRegion.slice(0, 2), ...others, ...sameRegion.slice(2)].slice(0, 3);
    return { term: p.term, cue: p.cue, answer: p.answer, mapId: p.mapId, options: shuffle([p.answer, ...distractors]) };
  });
}

function verdict(score: number, total: number) {
  if (score === total) return "Perfect run. The triggers are wired in.";
  if (score >= total * 0.8) return "Strong. Fix the misses below.";
  if (score >= total * 0.5) return "Getting there. Review the misses.";
  return "Revisit the maps, then rerun.";
}

function TriggerDrill({
  run,
  setRun,
  onOpenMap,
  onConfusables,
}: {
  run: DrillRun | null;
  setRun: (r: DrillRun | null) => void;
  onOpenMap: (id: string) => void;
  onConfusables: () => void;
}) {
  const sound = useProgress((s) => s.settings.sound ?? false);
  const drillBest = useLawLab((s) => s.drillBest);
  const setDrillBest = useLawLab((s) => s.setDrillBest);
  const cardRef = useRef<HTMLDivElement>(null);
  const poolSize = new Set(LAW_MAPS().flatMap((m) => m.keywords.map((k) => norm(k.term)))).size;

  const total = run?.qs.length ?? DRILL_ROUNDS;
  const finished = !!run && run.idx >= run.qs.length;
  const q = run && !finished ? run.qs[run.idx] : null;
  const answered = !!run && run.picked !== null;
  const score = run ? run.results.filter(Boolean).length : 0;

  const start = () => {
    haptic("tap");
    setRun({ qs: buildDrill(), prevBest: drillBest, idx: 0, picked: null, results: [] });
  };

  const choose = (opt: string) => {
    if (!run || !q || run.picked !== null) return;
    const correct = opt === q.answer;
    const results = [...run.results, correct];
    setRun({ ...run, picked: opt, results });
    if (correct) haptic("success");
    else {
      haptic("error");
      buzzFail({ sound });
    }
    if (run.idx === run.qs.length - 1) setDrillBest(results.filter(Boolean).length); // store keeps the max
  };

  const next = () => {
    if (!run || run.picked === null) return;
    haptic("tap");
    if (run.idx + 1 >= run.qs.length && score > run.prevBest) {
      celebrate({ sound, big: false });
      haptic("milestone");
    }
    setRun({ ...run, idx: run.idx + 1, picked: null });
  };

  // Keyboard: 1–4 answer, Enter / → advance.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || !run || !q) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (run.picked === null) {
        const k = Number(e.key);
        if (k >= 1 && k <= q.options.length) {
          e.preventDefault();
          choose(q.options[k - 1]);
        }
      } else if ((e.key === "Enter" || e.key === "ArrowRight") && !(t instanceof HTMLButtonElement)) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // After an answer, focus "Next" (keyboard flow) and keep it clear of the phone nav bar.
  const roundIdx = run?.idx ?? -1;
  useEffect(() => {
    if (!answered) return;
    const btn = cardRef.current?.querySelector<HTMLButtonElement>("[data-drill-next]");
    if (!btn) return;
    btn.focus({ preventScroll: true });
    btn.scrollIntoView({ block: "nearest", behavior: reducedMotion() ? "auto" : "smooth" });
  }, [answered, roundIdx]);

  // A new run (or returning to one) brings the whole card into view.
  const runQs = run?.qs;
  useEffect(() => {
    const el = cardRef.current;
    if (!runQs || !el) return;
    const r = el.getBoundingClientRect();
    if (r.top < 64 || r.bottom > window.innerHeight - 72) el.scrollIntoView({ block: "start", behavior: reducedMotion() ? "auto" : "smooth" });
  }, [runQs]);

  // ── start ──
  if (!run) {
    return (
      <div ref={cardRef} className="scroll-mt-20">
        <Card>
          <CardBody className="space-y-5 py-8 text-center">
            <Swords size={30} aria-hidden="true" className="mx-auto text-[var(--primary)]" />
            <div>
              <h2 className="text-lg font-bold">Trigger Drill</h2>
              <p className="mx-auto mt-1 max-w-xs text-sm text-[var(--muted)]">Name the law a stem phrase points to.</p>
            </div>
            <div className="mx-auto flex w-fit items-center divide-x divide-[var(--border)] text-xs font-semibold text-[var(--muted)]">
              <span className="px-3">
                <span className="tabular-nums text-[var(--foreground)]">{Math.min(DRILL_ROUNDS, poolSize)}</span> rounds
              </span>
              <span className="px-3">
                <span className="tabular-nums text-[var(--foreground)]">{poolSize}</span> triggers
              </span>
              <span className="flex items-center gap-1 px-3">
                <Trophy size={12} className="text-[var(--gold)]" aria-hidden="true" /> Best{" "}
                <span className="tabular-nums text-[var(--foreground)]">{drillBest ? `${drillBest}/${DRILL_ROUNDS}` : "—"}</span>
              </span>
            </div>
            <Button size="lg" onClick={start} className="mx-auto">
              Start drill <ArrowRight size={16} />
            </Button>
            <p className="hidden items-center justify-center gap-1 text-xs text-[var(--muted)] pointer-fine:flex">
              <Kbd>1</Kbd>–<Kbd>4</Kbd> answer · <Kbd>Enter</Kbd> next
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // ── result ──
  if (finished) {
    const isBest = score > run.prevBest;
    const misses = run.qs.filter((_, i) => run.results[i] === false);
    return (
      <div ref={cardRef} className="scroll-mt-20">
        <Card>
        <CardBody className="space-y-5">
          <div className="text-center">
            <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">Drill result</div>
            <div className="mt-1 text-5xl font-extrabold tracking-tight">
              <AnimatedNumber value={score} />
              <span className="text-2xl text-[var(--muted)]">/{total}</span>
            </div>
            <p className="mt-1.5 text-sm font-medium">{verdict(score, total)}</p>
            <div className="mt-3 flex justify-center">
              {isBest ? (
                <Badge tone="gold">
                  <Trophy size={12} aria-hidden="true" /> New personal best
                </Badge>
              ) : (
                <Badge>
                  <Trophy size={12} aria-hidden="true" /> Best {Math.max(drillBest, run.prevBest)}/{DRILL_ROUNDS}
                </Badge>
              )}
            </div>
            <div className="mt-4 flex justify-center">
              <Pips total={total} results={run.results} current={null} />
            </div>
          </div>

          {misses.length > 0 && (
            <div>
              <SectionLabel icon={<X size={13} />} text={`Missed · ${misses.length}`} danger />
              <ul className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
                {misses.map((m) => (
                  <li key={m.term} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1 text-[13px] leading-snug">
                      <div>
                        <span className="font-bold">“{m.term}”</span> <span className="text-[var(--muted)]">→</span>{" "}
                        <span className="font-semibold text-[var(--success)]">{m.answer}</span>
                      </div>
                      <div className="mt-0.5 text-[var(--muted)]">{m.cue}</div>
                    </div>
                    <Button variant="outline" size="sm" className="h-11 shrink-0 sm:h-9" onClick={() => onOpenMap(m.mapId)}>
                      Open map
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button onClick={start} className="sm:flex-1" data-drill-again="">
              <RotateCcw size={15} /> Run it again
            </Button>
            {misses.length === 0 && (
              <Button variant="outline" onClick={onConfusables} className="sm:flex-1">
                <ArrowLeftRight size={15} /> Study confusables
              </Button>
            )}
          </div>
        </CardBody>
        </Card>
      </div>
    );
  }

  // ── round ──
  const cur = q!;
  const wasRight = answered && run.picked === cur.answer;
  return (
    <div ref={cardRef} className="scroll-mt-20">
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-[var(--muted)]">
          <span className="tabular-nums">
            Round <span className="text-[var(--foreground)]">{run.idx + 1}</span> of {total}
          </span>
          <span className="flex items-center gap-3 tabular-nums">
            <span>
              Score <span className="text-[var(--foreground)]">{score}</span>
            </span>
            <span className="flex items-center gap-1">
              <Trophy size={12} className="text-[var(--gold)]" aria-hidden="true" /> {run.prevBest ? `${run.prevBest}/${DRILL_ROUNDS}` : "—"}
            </span>
          </span>
        </div>
        <Pips total={total} results={run.results} current={run.idx} />

        <Reveal key={run.idx} y={6} className="space-y-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">This phrase in a stem points to…</div>
            <div className="mt-1 text-2xl font-extrabold leading-tight">“{cur.term}”</div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Answer options">
            {cur.options.map((opt, i) => {
              const isCorrect = opt === cur.answer;
              const isPicked = run.picked === opt;
              const state = !answered ? "idle" : isCorrect ? "correct" : isPicked ? "wrong" : "dim";
              return (
                <button
                  key={opt}
                  type="button"
                  data-drill-option=""
                  onClick={() => choose(opt)}
                  disabled={answered}
                  aria-keyshortcuts={String(i + 1)}
                  className={cn(
                    "press flex min-h-12 w-full items-center gap-3 rounded-xl border p-3 text-left text-sm font-semibold transition-colors disabled:cursor-default",
                    FOCUS,
                    state === "idle" && "cursor-pointer border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]",
                    state === "correct" && "border-[var(--success)] bg-[var(--success)]/10",
                    state === "wrong" && "anim-shake border-[var(--danger)] bg-[var(--danger)]/10",
                    state === "dim" && "border-[var(--border)] bg-[var(--surface)] opacity-55"
                  )}
                >
                  <NumChip
                    n={i + 1}
                    tone={state === "correct" ? "success" : state === "wrong" ? "danger" : state === "dim" ? "muted" : "idle"}
                    className={cn(state === "correct" && "anim-pop")}
                  />
                  <span className="min-w-0 flex-1">{opt}</span>
                  {state === "correct" && <Check size={16} aria-hidden="true" className="shrink-0 text-[var(--success)]" />}
                  {state === "wrong" && <X size={16} aria-hidden="true" className="shrink-0 text-[var(--danger)]" />}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div aria-live="polite">
          {answered && (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-[13px] leading-snug">
                <Badge tone={wasRight ? "success" : "danger"} className="mt-px shrink-0">
                  {wasRight ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                  {wasRight ? "Correct" : "Missed"}
                </Badge>
                <span className="text-[var(--muted)]">
                  {!wasRight && <span className="sr-only">The answer is {cur.answer}. </span>}
                  {cur.cue}
                </span>
              </div>
              <Button data-drill-next="" onClick={next} className="w-full scroll-mb-24 md:scroll-mb-6">
                {run.idx + 1 < total ? "Next round" : "See result"} <ArrowRight size={15} />
              </Button>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
    </div>
  );
}

// Keyboard key cap (shown to fine pointers only, by the caller).
function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] border border-[var(--border)] bg-[var(--surface-2)] px-1 font-sans text-[10px] font-semibold leading-none text-[var(--muted)]">
      {children}
    </kbd>
  );
}

type ChipTone = "idle" | "success" | "danger" | "muted";
const CHIP_TONE: Record<ChipTone, string> = {
  idle: "border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]",
  success: "bg-[var(--success)] text-[var(--primary-fg)]",
  danger: "bg-[var(--danger)] text-white",
  muted: "border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]",
};

// Option number token (doubles as the 1–4 key hint), same shape as Practice's letters.
function NumChip({ n, tone, className }: { n: number; tone: ChipTone; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums", CHIP_TONE[tone], className)}>
      {n}
    </span>
  );
}

// Ten round markers: ✓ right, ✕ missed, ring = current. Shape AND colour carry it.
function Pips({ total, results, current }: { total: number; results: boolean[]; current: number | null }) {
  const right = results.filter(Boolean).length;
  return (
    <ol className="flex items-center gap-1.5" aria-label={`${right} right, ${results.length - right} missed, ${total} rounds`}>
      {Array.from({ length: total }, (_, i) => {
        const r = results[i];
        return (
          <li
            key={i}
            aria-hidden="true"
            className={cn(
              "grid h-5 w-5 place-items-center rounded-full border transition-colors",
              r === true && "border-[var(--success)] bg-[var(--success)] text-[var(--primary-fg)]",
              r === false && "border-[var(--danger)] bg-[var(--danger)] text-white",
              r === undefined && i === current && "border-2 border-[var(--primary)]",
              r === undefined && i !== current && "border-[var(--border)]"
            )}
          >
            {r === true && <Check size={11} strokeWidth={3.5} />}
            {r === false && <X size={11} strokeWidth={3.5} />}
          </li>
        );
      })}
    </ol>
  );
}
