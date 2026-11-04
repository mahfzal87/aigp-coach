"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowLeftRight, Check, ChevronDown, ChevronUp, KeyRound, Lightbulb, Map as MapIcon, RotateCcw, Swords, Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { celebrate, buzzFail } from "@/lib/celebrate";
import { mapLeafKey, totalLeaves, type Confusable, type LawMapDef, type LawRegion } from "@/lib/lawlab-types";
import { competencyToDomainCode, getActiveMeta, getCompetency, getPackExtras } from "@/lib/content";
import type { Attempt, DomainCode, MockSession } from "@/lib/types";
import { useLawLab, useLawLabHydrated } from "@/store/lawlab";
import { useHydrated, useProgress } from "@/store/progress";
import { AnimatedNumber, Reveal } from "@/components/motion";
import { Badge, Bar, Button, buttonVariants, Card, CardBody, Chip, PageHeader } from "@/components/ui";
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

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";
// Stretches a 32–36px control's tap area to 44px without changing how it looks.
const HIT = "relative after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-['']";
// Scroll targets clear the floating header / phone dock (shell tokens).
const SCROLL_TOP = "scroll-mt-[calc(var(--header-h)+16px)]";
const SCROLL_BOTTOM = "scroll-mb-[calc(var(--bottom-nav-h)+20px)] md:scroll-mb-6";
const EDGE_HOVER = "hover:border-[color-mix(in_srgb,var(--primary)_40%,var(--border))]";

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

function cssPx(name: string, fallback: number) {
  if (typeof window === "undefined") return fallback;
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isFinite(v) ? v : fallback;
}

function useSpringTransition(stiffness = 380, damping = 30) {
  const reduce = useReducedMotion();
  return reduce ? { duration: 0 } : ({ type: "spring", stiffness, damping, mass: 0.9 } as const);
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
        {mode === "maps" && (
          <MapsSection region={region} onRegion={setRegion} open={open} onToggle={toggleMap} onCollapse={collapseMap} onNext={nextMap} />
        )}
        {mode === "confuse" && <ConfusablesSection />}
        {mode === "drill" && <TriggerDrill run={drill} setRun={setDrill} onOpenMap={openMap} onConfusables={() => setMode("confuse")} />}
      </div>
    </div>
  );
}

// ── Mode switch: a glass capsule with the liquid lens ──
const TABS: { m: Mode; label: string; Icon: typeof MapIcon }[] = [
  { m: "maps", label: "Mindmaps", Icon: MapIcon },
  { m: "confuse", label: "Confusables", Icon: ArrowLeftRight },
  { m: "drill", label: "Trigger Drill", Icon: Swords },
];

function ModeTabs({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const lens = useSpringTransition();
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
    <Card role="tablist" aria-label="Law Lab mode" onKeyDown={onKey} className="mb-5 grid grid-cols-3 gap-1 rounded-full p-1">
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
              "press relative flex min-h-11 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-2 text-[13px] font-semibold sm:min-h-10 sm:text-sm",
              FOCUS,
              active ? "text-[var(--primary)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {active && (
              <motion.span
                layoutId="lawlab-mode-lens"
                transition={lens}
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[var(--primary)]/12 ring-1 ring-[var(--primary)]/25"
              />
            )}
            <Icon size={15} aria-hidden="true" className="relative hidden shrink-0 sm:block" />
            <span className="relative truncate">{label}</span>
            {counts[m] !== null && <span className="relative hidden text-xs tabular-nums sm:inline">{counts[m]}</span>}
          </button>
        );
      })}
    </Card>
  );
}

// ── Status band: the next map + its action, the mastery strip, live weak spots ──
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
                <h2 className="line-clamp-2 text-[18px] leading-snug">{next ? next.def.name : "Every map locked in"}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-[var(--muted)]">
                  <span>{next ? `${next.n} of ${next.total} facts locked` : "Keep them sharp with the drill"}</span>
                  {next?.def.weight === 3 && <Badge tone="primary">High yield</Badge>}
                </div>
              </div>
              <Button size="sm" className="h-11 shrink-0 sm:h-9" onClick={() => (next ? onOpenMap(next.def.id) : onDrill())}>
                {next ? (next.n > 0 ? "Continue" : "Start") : "Run drill"}
              </Button>
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between gap-3 text-[13px] text-[var(--muted)]">
                <span className="min-w-0 truncate">
                  <span className="font-display text-[22px] font-bold text-[var(--foreground)]">
                    <AnimatedNumber value={pct} />%
                  </span>{" "}
                  of {total} facts locked
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <Trophy size={14} className="text-[var(--gold)]" aria-hidden="true" /> Drill best{" "}
                  <span className="font-semibold tabular-nums text-[var(--foreground)]">
                    {drillBest ? (
                      <>
                        <AnimatedNumber value={drillBest} />/{DRILL_ROUNDS}
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
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

// The hero instrument: one liquid segment per map, width ∝ its fact count, fill ∝ locked.
function MasteryStrip({ per }: { per: MapProgress[] }) {
  const done = per.filter((p) => p.total > 0 && p.n >= p.total).length;
  return (
    <div className="flex w-full gap-[3px]" role="img" aria-label={`${done} of ${per.length} maps fully locked in`}>
      {per.map((p) => (
        <div key={p.def.id} title={`${p.def.short}: ${p.n}/${p.total}`} className="min-w-[3px]" style={{ flex: `${p.total} 1 0%` }}>
          <Bar value={(100 * p.n) / Math.max(1, p.total)} tone={p.n >= p.total ? "success" : "primary"} className="rounded-[4px]" />
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
  const empty = anyAttempts ? "Ranks after 5 answers per topic." : "No practice answers yet.";
  const startLink = (
    <Link href="/practice" className={cn(buttonVariants({ variant: "soft", size: "sm" }), "shrink-0")}>
      Start practice
    </Link>
  );

  if (!column) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--border)] pt-3.5">
        <span className="text-[13px] text-[var(--muted)]">Weakest in practice</span>
        <span className="text-[13px]">{empty}</span>
        <span className="ml-auto">{startLink}</span>
      </div>
    );
  }

  return (
    <div className="min-w-0 border-t border-[var(--border)] pt-3.5 @xl:border-l @xl:border-t-0 @xl:pl-6 @xl:pt-0">
      <div className="mb-1.5 text-[13px] text-[var(--muted)] @xl:px-1.5">Weakest in practice</div>
      {worst.length > 0 ? (
        <ul className="flex flex-wrap gap-x-1 gap-y-0.5 @xl:flex-col @xl:flex-nowrap @xl:gap-0">
          {worst.map((w) => (
            <li key={w.cid} className="min-w-0">
              <Link
                href={`/practice?competency=${w.cid}`}
                title={`Practise ${w.code} ${w.name}`}
                className={cn("press flex min-h-10 items-center gap-2 rounded-xl px-1 text-[13px] @xl:min-h-9 @xl:px-1.5 @xl:hover:bg-[var(--surface-2)]", FOCUS)}
              >
                <Badge tone={w.pct < 70 ? "danger" : w.pct < 80 ? "warning" : "success"} className="tabular-nums">
                  {w.code} <span className="font-bold">{w.pct}%</span>
                </Badge>
                <span className="hidden min-w-0 flex-1 truncate @xl:block">{w.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          {empty} {startLink}
        </div>
      )}
      {trend && <MockTrend code={trend.code} vals={trend.vals} />}
    </div>
  );
}

// Law-domain score across the last full mocks: a tiny sparkline + the latest figure.
function MockTrend({ code, vals }: { code: DomainCode; vals: number[] }) {
  const last = vals[vals.length - 1];
  const dir = vals.length < 2 || last === vals[0] ? 0 : last < vals[0] ? -1 : 1;
  const tone = dir < 0 ? "var(--danger)" : dir > 0 ? "var(--success)" : "var(--muted)";
  const W = 40;
  const H = 16;
  const min = Math.min(...vals);
  const span = Math.max(1, Math.max(...vals) - min);
  const pts = vals.map((v, i) => [vals.length === 1 ? W / 2 : (i * W) / (vals.length - 1), H - 2 - ((v - min) / span) * (H - 4)] as const);
  const [lx, ly] = pts[pts.length - 1];
  return (
    <div className="mt-2 flex items-center gap-2 text-[13px] text-[var(--muted)] @xl:px-1.5">
      <span>Domain {code} mocks</span>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="shrink-0 overflow-visible">
        {pts.length > 1 && (
          <polyline
            points={pts.map((p) => p.join(",")).join(" ")}
            fill="none"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ stroke: tone, opacity: 0.75 }}
          />
        )}
        <circle cx={lx} cy={ly} r={2.75} style={{ fill: tone }} />
      </svg>
      <span className="font-semibold tabular-nums text-[var(--foreground)]">{last}%</span>
      <span className="sr-only">
        Domain {code} on your last {vals.length} full mocks: {vals.join(", ")} percent.
      </span>
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
  const pick = (r: RegionFilter) => {
    haptic("tap");
    onRegion(r);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {showRegions && (
          <div role="group" aria-label="Filter maps by region" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 py-1.5 [scrollbar-width:none] sm:mx-0 sm:px-0">
            <Chip selected={active === "All"} onClick={() => pick("All")} className={cn("shrink-0 gap-1.5", HIT)}>
              All <span className="tabular-nums">{maps.length}</span>
            </Chip>
            {regions.map(({ r, n }) => (
              <Chip key={r} selected={active === r} onClick={() => pick(r)} className={cn("shrink-0 gap-1.5", HIT)}>
                {REGION_LABEL[r]} <span className="tabular-nums">{n}</span>
              </Chip>
            ))}
          </div>
        )}
        <p className="flex shrink-0 items-center gap-1.5 text-[13px] text-[var(--muted)]">
          <span aria-hidden="true" className="grid h-4 w-4 place-items-center rounded-full bg-[var(--primary)] text-[var(--primary-fg)]">
            <Check size={10} strokeWidth={3.5} />
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
            className={cn(done ? "stroke-[var(--success)]" : "stroke-[var(--primary)]", "motion-safe:transition-[stroke-dasharray] motion-safe:duration-500")}
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
    <li id={`map-${def.id}`} className={SCROLL_TOP}>
      <button
        type="button"
        onClick={() => {
          haptic("tap");
          onToggle();
        }}
        aria-expanded={open}
        aria-controls={bodyId}
        className={cn("press flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left hover:bg-[var(--surface-2)] sm:px-5", FOCUS, "focus-visible:ring-inset")}
      >
        <Ring pct={pct} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-display text-[16px] font-bold leading-tight">{def.name}</span>
            <Badge>{def.kind}</Badge>
            {def.weight === 3 && <Badge tone="primary">High yield</Badge>}
          </div>
          <p className="mt-1 hidden truncate text-[13px] text-[var(--muted)] sm:block">{def.tagline}</p>
        </div>
        <span className={cn("shrink-0 text-[13px] font-semibold tabular-nums", n >= total ? "text-[var(--success)]" : "text-[var(--muted)]")}>
          {n}/{total}
        </span>
        <ChevronDown size={18} aria-hidden="true" className={cn("shrink-0 text-[var(--muted)] motion-safe:transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div id={bodyId} className="space-y-6 px-4 pb-5 pt-1 sm:px-5">
          <p className="text-[13px] leading-snug text-[var(--muted)] sm:hidden">{def.tagline}</p>
          <MindMap def={def} locked={locked} onToggle={toggle} />
          <KeywordChips def={def} />
          <Distinctions def={def} />
          <Traps def={def} />
          <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-11 shrink-0 sm:h-9"
              onClick={() => {
                haptic("tap");
                onCollapse();
              }}
            >
              <ChevronUp size={14} aria-hidden="true" /> Collapse
            </Button>
            {next && (
              <Button
                variant="outline"
                size="sm"
                className="h-11 min-w-0 sm:h-9"
                onClick={() => {
                  haptic("tap");
                  onNext();
                }}
              >
                <span className="truncate">Next: {next.short}</span>
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
    <div className="mb-2 flex min-h-8 items-center justify-between gap-3">
      <div className={cn("flex items-center gap-1.5 text-[13px] font-semibold", danger ? "text-[var(--danger)]" : "text-[var(--muted)]")}>
        {icon}
        {text}
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
        icon={<KeyRound size={14} aria-hidden="true" />}
        text="Trigger words"
        action={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2.5"
            onClick={() => {
              haptic("tap");
              setRevealed(all ? [] : def.keywords.map((_, i) => i));
            }}
          >
            {all ? "Hide all" : "Reveal all"}
          </Button>
        }
      />
      <div className="flex flex-wrap gap-1.5">
        {def.keywords.map((k, i) => {
          const isOpen = revealed.includes(i);
          return (
            <Chip key={i} selected={isOpen} onClick={() => flip(i)} className={cn("font-bold", HIT)}>
              {isOpen && <Check size={12} strokeWidth={3} aria-hidden="true" />}
              {k.term}
            </Chip>
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
      <SectionLabel icon={<ArrowLeftRight size={14} aria-hidden="true" />} text="Don't confuse it with" />
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
      <SectionLabel icon={<AlertTriangle size={14} aria-hidden="true" />} text="How they'll trick you" danger />
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

// ── Confusables: one glass panel, the tell is each pair's hero line ──
function ConfusablesSection() {
  const list = CONFUSABLES();
  const [tellsOnly, setTellsOnly] = useState(false);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-[var(--muted)]">
          <span className="font-semibold tabular-nums text-[var(--foreground)]">{list.length}</span> pairs the exam loves to swap
        </p>
        <Chip
          selected={tellsOnly}
          onClick={() => {
            haptic("tap");
            setTellsOnly((v) => !v);
          }}
          className={cn("shrink-0", HIT)}
        >
          {tellsOnly && <Check size={12} strokeWidth={3} aria-hidden="true" />}
          Tells only
        </Chip>
      </div>
      <Card>
        <ul className="divide-y divide-[var(--border)]">
          {list.map((c) => (
            <ConfusableRow key={c.id} c={c} tellOnly={tellsOnly} />
          ))}
        </ul>
      </Card>
    </div>
  );
}

function ConfusableRow({ c, tellOnly }: { c: Confusable; tellOnly: boolean }) {
  // Wide: dimension | A | B.  Narrow: the dimension becomes a label row above A | B.
  const grid = "grid grid-cols-2 @md:grid-cols-[minmax(84px,128px)_minmax(0,1fr)_minmax(0,1fr)]";
  return (
    <li className="@container p-4 sm:p-5">
      <h3 className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[15px] font-bold leading-snug">
        <span>{c.a}</span>
        <ArrowLeftRight size={14} aria-hidden="true" className="text-[var(--muted)]" />
        <span className="sr-only">versus</span>
        <span>{c.b}</span>
      </h3>

      {/* the tell: the verdict, set as the pair's hero line */}
      <p className="mt-2 flex gap-2.5 font-display text-[17px] font-semibold leading-snug sm:text-[18px]">
        <Lightbulb size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--primary)]" />
        <span>
          <span className="sr-only">The tell: </span>
          {c.tell}
        </span>
      </p>

      {!tellOnly && (
        <Card role="table" aria-label={`${c.a} versus ${c.b}`} className="mt-4 overflow-hidden rounded-[14px] text-[13px] leading-snug">
          <div role="row" className={cn(grid, "text-xs font-semibold text-[var(--muted)]")}>
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
              <div role="rowheader" className="col-span-2 px-3 pt-2.5 text-xs font-semibold text-[var(--muted)] @md:col-span-1 @md:py-2.5">
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
        </Card>
      )}
    </li>
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
  const reduce = useReducedMotion();
  const popIn = useSpringTransition(520, 16);
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

  // After an answer, focus "Next" (keyboard flow) and keep it clear of the phone dock.
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
    const top = cssPx("--header-h", 64);
    const bottom = window.matchMedia("(min-width: 768px)").matches ? 0 : cssPx("--bottom-nav-h", 76);
    if (r.top < top || r.bottom > window.innerHeight - bottom) el.scrollIntoView({ block: "start", behavior: reducedMotion() ? "auto" : "smooth" });
  }, [runQs]);

  // ── start ──
  if (!run) {
    return (
      <Card ref={cardRef} className={SCROLL_TOP}>
        <CardBody className="space-y-4 py-8 text-center">
          <Swords size={30} aria-hidden="true" className="mx-auto text-[var(--primary)]" />
          <div>
            <h2 className="text-[22px]">Trigger Drill</h2>
            <p className="mx-auto mt-1 max-w-xs text-[15px] text-[var(--muted)]">Name the law a stem phrase points to.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[13px] text-[var(--muted)]">
            <span>
              {Math.min(DRILL_ROUNDS, poolSize)} rounds from {poolSize} triggers
            </span>
            <Badge tone={drillBest ? "gold" : "default"}>
              <Trophy size={12} aria-hidden="true" /> {drillBest ? `Best ${drillBest}/${DRILL_ROUNDS}` : "No best yet"}
            </Badge>
          </div>
          <Button size="lg" onClick={start} className="mx-auto">
            Start drill
          </Button>
          <p className="hidden items-center justify-center gap-1.5 text-xs text-[var(--muted)] pointer-fine:flex">
            <Kbd>1</Kbd>–<Kbd>4</Kbd> to answer, <Kbd>Enter</Kbd> for next
          </p>
        </CardBody>
      </Card>
    );
  }

  // ── result ──
  if (finished) {
    const isBest = score > run.prevBest;
    const misses = run.qs.filter((_, i) => run.results[i] === false);
    return (
      <Card ref={cardRef} className={SCROLL_TOP}>
        <CardBody className="space-y-5">
          <div className="text-center">
            <div className="font-display text-[52px] font-extrabold leading-none">
              <AnimatedNumber value={score} />
              <span className="text-[26px] text-[var(--muted)]">/{total}</span>
            </div>
            <p className="mt-2 text-[15px] font-medium">{verdict(score, total)}</p>
            <div className="mt-3 flex justify-center">
              {isBest ? (
                <motion.span initial={reduce ? false : { scale: 0.5, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ ...popIn, delay: 0.25 }}>
                  <Badge tone="gold" className="px-3 py-1 text-[13px]">
                    <Trophy size={13} aria-hidden="true" /> New personal best
                  </Badge>
                </motion.span>
              ) : (
                <Badge>
                  <Trophy size={12} aria-hidden="true" /> Best {Math.max(drillBest, run.prevBest)}/{DRILL_ROUNDS}
                </Badge>
              )}
            </div>
            <div className="mx-auto mt-5 max-w-sm">
              <LiquidTrack total={total} results={run.results} current={null} />
            </div>
          </div>

          {misses.length > 0 && (
            <div>
              <SectionLabel icon={<X size={14} aria-hidden="true" />} text={`${misses.length} missed`} danger />
              <ul className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
                {misses.map((m) => (
                  <li key={m.term} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1 text-[13px] leading-snug">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-bold">“{m.term}”</span>
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
              <RotateCcw size={15} aria-hidden="true" /> Run it again
            </Button>
            {misses.length === 0 && (
              <Button variant="outline" onClick={onConfusables} className="sm:flex-1">
                <ArrowLeftRight size={15} aria-hidden="true" /> Study confusables
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  // ── round ──
  const cur = q!;
  const wasRight = answered && run.picked === cur.answer;
  return (
    <Card ref={cardRef} className={SCROLL_TOP}>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between gap-3 text-[13px] text-[var(--muted)]">
          <span className="tabular-nums">
            Round <span className="font-semibold text-[var(--foreground)]">{run.idx + 1}</span> of {total}
          </span>
          <span className="flex items-center gap-3 tabular-nums">
            <span>
              Score <span className="font-semibold text-[var(--foreground)]">{score}</span>
            </span>
            <span className="flex items-center gap-1" title="Personal best">
              <Trophy size={13} className="text-[var(--gold)]" aria-hidden="true" /> {run.prevBest ? `${run.prevBest}/${DRILL_ROUNDS}` : "—"}
            </span>
          </span>
        </div>
        <LiquidTrack total={total} results={run.results} current={run.idx} />

        {/* each round arrives in sequence */}
        <Reveal key={run.idx} y={6} className="space-y-4">
          <div>
            <p className="text-[13px] text-[var(--muted)]">This phrase in a stem points to…</p>
            <div className="mt-1 font-display text-[26px] font-extrabold leading-tight">“{cur.term}”</div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Answer options">
            {cur.options.map((opt, i) => {
              const isCorrect = opt === cur.answer;
              const isPicked = run.picked === opt;
              const state = !answered ? "idle" : isCorrect ? (isPicked ? "won" : "reveal") : isPicked ? "wrong" : "dim";
              return (
                <button
                  key={opt}
                  type="button"
                  data-drill-option=""
                  onClick={() => choose(opt)}
                  disabled={answered}
                  aria-keyshortcuts={String(i + 1)}
                  className={cn(
                    "press flex min-h-12 w-full items-center gap-3 rounded-[14px] border p-3 text-left text-sm font-semibold disabled:cursor-default",
                    FOCUS,
                    state === "idle" && cn("cursor-pointer border-[var(--border)] bg-[var(--surface-2)]", EDGE_HOVER),
                    // a right answer fills with the exam's liquid
                    state === "won" && "liquid-fill border-[color-mix(in_srgb,var(--success)_55%,var(--border))]",
                    state === "reveal" && "border-[color-mix(in_srgb,var(--success)_55%,var(--border))] bg-[var(--success)]/8",
                    state === "wrong" && "anim-shake border-[color-mix(in_srgb,var(--danger)_55%,var(--border))] bg-[var(--danger)]/10",
                    state === "dim" && "border-[var(--border)] opacity-50"
                  )}
                >
                  <NumChip n={i + 1} tone={state === "won" || state === "reveal" ? "success" : state === "wrong" ? "danger" : state === "dim" ? "muted" : "idle"} />
                  <span className="min-w-0 flex-1">{opt}</span>
                  {(state === "won" || state === "reveal") && (
                    <motion.span initial={reduce ? false : { scale: 0.2 }} animate={{ scale: 1 }} transition={popIn} className="shrink-0 text-[var(--success)]">
                      <Check size={17} strokeWidth={3} aria-hidden="true" />
                    </motion.span>
                  )}
                  {state === "wrong" && <X size={17} strokeWidth={3} aria-hidden="true" className="shrink-0 text-[var(--danger)]" />}
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
                  {wasRight ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : <X size={12} strokeWidth={3} aria-hidden="true" />}
                  {wasRight ? "Correct" : "Missed"}
                </Badge>
                <span className="text-[var(--muted)]">
                  {!wasRight && <span className="sr-only">The answer is {cur.answer}. </span>}
                  {cur.cue}
                </span>
              </div>
              <Button data-drill-next="" onClick={next} className={cn("w-full", SCROLL_BOTTOM)}>
                {run.idx + 1 < total ? "Next round" : "See result"}
              </Button>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// Keyboard key cap (the caller shows it to fine pointers only).
function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-1 font-sans text-[10px] font-semibold leading-none text-[var(--muted)]">
      {children}
    </kbd>
  );
}

type ChipTone = "idle" | "success" | "danger" | "muted";
// --primary-fg is white in light and near-black in dark, so it reads on both themes' status fills.
const CHIP_TONE: Record<ChipTone, string> = {
  idle: "border border-[var(--border)] text-[var(--muted)]",
  success: "bg-[var(--success)] text-[var(--primary-fg)]",
  danger: "bg-[var(--danger)] text-[var(--primary-fg)]",
  muted: "border border-[var(--border)] text-[var(--muted)]",
};

// Option number token (doubles as the 1–4 key hint).
function NumChip({ n, tone }: { n: number; tone: ChipTone }) {
  return (
    <span aria-hidden="true" className={cn("inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums", CHIP_TONE[tone])}>
      {n}
    </span>
  );
}

// The drill's progress as a liquid track: a right answer pours a segment full of the
// exam's liquid; a miss drains it to a thin red line (shape AND colour); the ring marks now.
function LiquidTrack({ total, results, current }: { total: number; results: boolean[]; current: number | null }) {
  const right = results.filter(Boolean).length;
  return (
    <div className="flex h-3 items-center gap-1" role="img" aria-label={`${right} right, ${results.length - right} missed, ${total} rounds`}>
      {Array.from({ length: total }, (_, i) => {
        const r = results[i];
        return (
          <div
            key={i}
            className={cn("flex h-full flex-1 items-center rounded-full", r === undefined && i === current && "ring-2 ring-[var(--primary)]/40 ring-offset-1 ring-offset-transparent")}
          >
            <Bar value={r === undefined ? 0 : 100} tone={r === false ? "danger" : "primary"} className={r === false ? "h-1" : "h-2.5"} />
          </div>
        );
      })}
    </div>
  );
}
