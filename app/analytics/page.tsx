"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore, type ComponentType } from "react";
import { useTheme } from "next-themes";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeft, ArrowRight, BarChart3, Crosshair, Tags } from "lucide-react";
import { getActiveMeta, getCompetenciesByDomain, getDomains, getQuestionsByCompetency } from "@/lib/content";
import { allCompetencyMastery } from "@/lib/readiness";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { Attempt } from "@/lib/types";
import { useHydrated, useProgress } from "@/store/progress";
import { Bar as ProgressBar, Card, CardBody, PageHeader } from "@/components/ui";
import { ButtonLink, DragRow, Label, MIN_SEEN, MasteryBar, SectionHead, StatStrip, TARGET, TargetLegend, rankDrag, toneVar, type Tone } from "@/components/progress-kit";

// Recharts paints SVG attributes, where var() does not resolve — so the chart
// carries literals that mirror the Glass Box tokens in app/globals.css. The
// halo and hover band are translucent so they sit on glass panels over the
// exam light instead of printing solid blocks.
const CHART = {
  light: {
    success: "#15803d",
    warning: "#b45309",
    danger: "#dc2626",
    muted: "#5a6078",
    fg: "#14172b",
    halo: "rgba(246, 248, 251, 0.85)",
    grid: "rgba(20, 23, 43, 0.08)",
    target: "#7d8499",
    cursor: "rgba(20, 23, 43, 0.05)",
  },
  dark: {
    success: "#22c55e",
    warning: "#fbbf24",
    danger: "#f87171",
    muted: "#9aa0b8",
    fg: "#eceef8",
    halo: "rgba(16, 19, 31, 0.9)",
    grid: "rgba(255, 255, 255, 0.07)",
    target: "#7a819a",
    cursor: "rgba(255, 255, 255, 0.06)",
  },
};
type Palette = (typeof CHART)["light"];

interface CompRow {
  id: string;
  code: string;
  name: string;
  value: number; // bar length (0 while there is too little data)
  mastery: number;
  insufficient: boolean;
  attempts: number;
  acc: number;
  seen: number;
  bank: number;
}

const pctOf = (xs: Attempt[]) => (xs.length ? Math.round((xs.filter((a) => a.correct).length / xs.length) * 100) : null);

export default function AnalyticsPage() {
  const hydrated = useHydrated();
  const attempts = useProgress((s) => s.attempts);
  const mastery = useMemo(() => allCompetencyMastery(attempts), [attempts]);

  if (!hydrated) return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  // 44px hit area; the negative top margin keeps the visual rhythm of a small text link.
  const back = (
    <Link href="/profile" className="-mt-3 inline-flex items-center gap-1 py-3 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
      <ArrowLeft size={16} /> Progress
    </Link>
  );

  if (attempts.length === 0) {
    return (
      <div>
        {back}
        <PageHeader title="Analytics" subtitle="Where you stand and why you miss." />
        <FirstRun />
      </div>
    );
  }

  const meta = getActiveMeta();
  const comps = getDomains().flatMap((d) => getCompetenciesByDomain(d.id));
  const byId = new Map(mastery.map((m) => [m.competencyId, m]));
  const rows: CompRow[] = comps.flatMap((c) => {
    const m = byId.get(c.id);
    if (!m) return [];
    return [
      {
        id: c.id,
        code: c.code,
        name: c.name,
        value: m.insufficient ? 0 : m.mastery,
        mastery: m.mastery,
        insufficient: m.insufficient,
        attempts: m.attempts,
        acc: Math.round(m.recentAccuracy * 100),
        seen: m.seen,
        bank: getQuestionsByCompetency(c.id).length,
      },
    ];
  });

  const n = attempts.length;
  const unique = new Set(attempts.map((a) => a.questionId)).size;
  const accuracy = pctOf(attempts);
  const last50 = n > 50 ? [...attempts].sort((a, b) => b.ts - a.ts).slice(0, 50) : null;
  const misses = attempts.filter((a) => !a.correct);
  const tagged = misses.filter((a) => a.rootCause).length;

  // Median, not mean: one tab left open shouldn't distort pace. Mock answers carry no per-question time.
  const timed = attempts
    .filter((a) => a.mode !== "mock" && a.timeMs > 0)
    .map((a) => a.timeMs)
    .sort((a, b) => a - b);
  const median = timed.length ? (timed.length % 2 ? timed[(timed.length - 1) / 2] : (timed[timed.length / 2 - 1] + timed[timed.length / 2]) / 2) : null;
  const paceS = median != null ? Math.round(median / 1000) : null;
  const budgetS = Math.round((meta.minutes * 60) / meta.questionsTotal);

  const drag = rankDrag(comps, mastery);
  const sufficient = rows.filter((r) => !r.insufficient).length;

  return (
    <div>
      {back}
      <PageHeader title="Analytics" subtitle="Where you stand and why you miss." />

      <div className="space-y-6">
        <StatStrip
          items={[
            { label: "Answered", value: n.toLocaleString(), hint: `${unique.toLocaleString()} unique questions` },
            { label: "Accuracy", value: accuracy == null ? "—" : `${accuracy}%`, hint: last50 ? `${pctOf(last50)}% in your last 50` : `${n - misses.length} of ${n} right` },
            {
              label: "Pace",
              value: paceS != null ? `${paceS} s` : "—",
              hint: paceS != null ? `median, ${budgetS} s allowed` : "timed in Practice drills",
              tone: paceS != null && paceS > budgetS ? "warning" : undefined,
            },
            { label: "Misses", value: misses.length.toLocaleString(), hint: `${tagged.toLocaleString()} tagged with a cause` },
          ]}
        />

        <Card>
          <CardBody className="pb-2">
            <SectionHead
              title="Mastery by competency"
              meta={
                sufficient > 0 ? (
                  <span className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                    <Legend color="var(--success)" label={`${TARGET}+`} />
                    <Legend color="var(--warning)" label="60–79" />
                    <Legend color="var(--danger)" label="<60" />
                    <TargetLegend />
                  </span>
                ) : undefined
              }
              className="mb-2 flex-wrap"
            />
            {sufficient === 0 ? (
              // No blank grid: until one competency has enough answers, say what unlocks the chart.
              <p className="pb-3 pt-1 text-sm text-[var(--muted)]">Bars appear at {MIN_SEEN} answers per competency. Start with the list below.</p>
            ) : (
              <MasteryChart rows={rows} />
            )}
          </CardBody>
          <div className="border-t border-[var(--border)]">
            <Label className="px-5 pb-1 pt-4">Drill these first</Label>
            {drag.length ? (
              <ul className="divide-y divide-[var(--border)] pb-1">
                {drag.map((d) => (
                  <DragRow key={d.comp.id} item={d} />
                ))}
              </ul>
            ) : (
              <p className="px-5 pb-4 pt-1 text-sm text-[var(--muted)]">Every competency is at {TARGET}+. Keep mocks sharp.</p>
            )}
          </div>
        </Card>

        <MissCauses attempts={attempts} />
        <Calibration attempts={attempts} />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

// ─── Mastery chart (Recharts, horizontal so every label stays readable on a phone) ───

function useCanHover(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(hover: hover)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(hover: hover)").matches,
    () => true
  );
}

function useElementWidth<T extends HTMLElement>() {
  const [el, setEl] = useState<T | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!el) return;
    const ro = new ResizeObserver((entries) => setWidth(Math.round(entries[0]?.contentRect.width ?? 0)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return [setEl, width] as const;
}

const ROW_H = 30;

function MasteryChart({ rows }: { rows: CompRow[] }) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const C = resolvedTheme === "dark" ? CHART.dark : CHART.light;
  const canHover = useCanHover();
  const [ref, width] = useElementWidth<HTMLDivElement>();

  // Phones get codes only (names live in the tooltip and the list below).
  const wide = width >= 520;
  const axisW = wide ? Math.min(300, Math.max(236, Math.round(width * 0.42))) : 46;
  const nameChars = Math.floor((axisW - 52) / 5.9);
  const height = rows.length * ROW_H + 48; // + reference label on top, axis below
  const fill = (r: CompRow) => (r.insufficient ? C.muted : r.mastery >= TARGET ? C.success : r.mastery >= 60 ? C.warning : C.danger);

  return (
    <div ref={ref} className="w-full select-none" style={{ height }}>
      {width > 0 && (
        <BarChart width={width} height={height} data={rows} layout="vertical" margin={{ top: 22, right: 30, bottom: 0, left: 0 }} barCategoryGap={8} accessibilityLayer>
          <CartesianGrid horizontal={false} stroke={C.grid} />
          <XAxis type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} height={24} />
          <YAxis
            type="category"
            dataKey="code"
            width={axisW}
            axisLine={false}
            tickLine={false}
            interval={0}
            tick={(p: { y?: number | string; payload?: { value?: string } }) => (
              <CompTick y={Number(p.y ?? 0)} code={String(p.payload?.value ?? "")} rows={rows} wide={wide} nameChars={nameChars} plotX={axisW} C={C} />
            )}
          />
          <Tooltip cursor={{ fill: C.cursor }} isAnimationActive={false} content={(p) => <CompTip active={p.active} payload={p.payload} canHover={canHover} />} />
          <ReferenceLine x={TARGET} stroke={C.target} strokeDasharray="4 4" label={{ value: `Target ${TARGET}`, position: "top", fontSize: 10, fill: C.muted }} />
          {/* No grow animation: a static chart never screenshots half-drawn. */}
          <Bar
            dataKey="value"
            barSize={14}
            radius={[0, 7, 7, 0]}
            isAnimationActive={false}
            style={{ cursor: canHover ? "pointer" : "default" }}
            onClick={(d) => {
              // Touch shows the tooltip instead; the list below is the tap target.
              if (!canHover) return;
              const id = (d.payload as CompRow | undefined)?.id;
              if (!id) return;
              haptic("tap");
              router.push(`/practice?competency=${id}`);
            }}
          >
            {rows.map((r) => (
              <Cell key={r.id} fill={fill(r)} />
            ))}
            <LabelList
              // Carry the row id, not the value: label indexes count rendered bars only, so they
              // drift from the data rows as soon as some rows have no bar.
              valueAccessor={(entry) => String((entry.payload as CompRow | undefined)?.id ?? "")}
              content={(p) => {
                // Rows without enough data are annotated by CompTick (zero-length bars get no label).
                const r = rows.find((row) => row.id === p.value);
                if (!r || r.insufficient) return null;
                const x = Number(p.x ?? 0);
                const y = Number(p.y ?? 0);
                const w = Number(p.width ?? 0);
                const h = Number(p.height ?? 0);
                // Translucent halo keeps the number legible where the dashed target line crosses it.
                return (
                  <text
                    x={x + w + 6}
                    y={y + h / 2}
                    dy="0.35em"
                    fill={C.fg}
                    stroke={C.halo}
                    strokeWidth={3}
                    strokeLinejoin="round"
                    paintOrder="stroke"
                    fontSize={11}
                    fontWeight={700}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {r.mastery}
                  </text>
                );
              }}
            />
          </Bar>
        </BarChart>
      )}
    </div>
  );
}

function CompTick({ y, code, rows, wide, nameChars, plotX, C }: { y: number; code: string; rows: CompRow[]; wide: boolean; nameChars: number; plotX: number; C: Palette }) {
  const r = rows.find((row) => row.code === code);
  const name = r ? (r.name.length > nameChars ? `${r.name.slice(0, nameChars - 1).trimEnd()}…` : r.name) : "";
  return (
    <g>
      <text x={2} y={y} dy="0.35em" fill={C.fg} fontSize={11} fontWeight={600} style={{ fontVariantNumeric: "tabular-nums" }}>
        {code}
      </text>
      {wide && (
        <text x={46} y={y} dy="0.35em" fill={C.muted} fontSize={11}>
          {name}
        </text>
      )}
      {r?.insufficient && (
        <text x={plotX + 4} y={y} dy="0.35em" fill={C.muted} fontSize={10.5} style={{ fontVariantNumeric: "tabular-nums" }}>
          {r.attempts ? `${r.attempts} of ${MIN_SEEN} answers` : "not started"}
        </text>
      )}
    </g>
  );
}

// Floating chrome, so it uses the strong glass (a Card here would flatten inside the chart's Card).
function CompTip({ active, payload, canHover }: { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }>; canHover: boolean }) {
  const r = active ? (payload?.[0]?.payload as CompRow | undefined) : undefined;
  if (!r) return null;
  return (
    <div className="glass-float max-w-[260px] rounded-[14px] px-3 py-2.5 text-xs">
      <div className="font-semibold">
        <span className="tabular-nums">{r.code}</span> {r.name}
      </div>
      {r.insufficient ? (
        <div className="mt-1 tabular-nums text-[var(--muted)]">
          {r.attempts} of {MIN_SEEN} answers so far
        </div>
      ) : (
        <dl className="mt-1.5 grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 tabular-nums">
          <dt className="text-[var(--muted)]">Mastery</dt>
          <dd className="text-right font-semibold">{r.mastery}</dd>
          <dt className="text-[var(--muted)]">Recent accuracy</dt>
          <dd className="text-right font-semibold">{r.acc}%</dd>
          <dt className="text-[var(--muted)]">Questions seen</dt>
          <dd className="text-right font-semibold">
            {r.seen} of {r.bank}
          </dd>
        </dl>
      )}
      {canHover && <div className="mt-1.5 font-semibold text-[var(--accent)]">Click to drill</div>}
    </div>
  );
}

// ─── Why you miss: K / T / R, each with what to do about it ───

function topCompetency(xs: Attempt[]): string | null {
  const counts = new Map<string, number>();
  for (const a of xs) counts.set(a.competencyId, (counts.get(a.competencyId) ?? 0) + 1);
  let best: string | null = null;
  let bestN = 0;
  for (const [id, c] of counts) if (c > bestN) [best, bestN] = [id, c];
  return best;
}

function MissCauses({ attempts }: { attempts: Attempt[] }) {
  const misses = attempts.filter((a) => !a.correct);
  const tagged = misses.filter((a) => a.rootCause);
  const kTop = topCompetency(tagged.filter((a) => a.rootCause === "K"));
  const causes = [
    { key: "K", label: "Knowledge", color: "var(--accent)", n: tagged.filter((a) => a.rootCause === "K").length, action: "Relearn it in the lesson", href: kTop ? `/lesson/${kTop}` : "/" },
    { key: "T", label: "Technique", color: "var(--warning)", n: tagged.filter((a) => a.rootCause === "T").length, action: "Drill the Strategy playbook", href: "/strategy" },
    { key: "R", label: "Read error", color: "var(--danger)", n: tagged.filter((a) => a.rootCause === "R").length, action: "Slow down, reread the stem", href: null },
  ];
  const total = tagged.length;
  const top = [...causes].sort((a, b) => b.n - a.n)[0];
  const share = (k: number) => Math.round((k / Math.max(1, total)) * 100);

  return (
    <Card>
      <CardBody>
        <SectionHead title="Why you miss" meta={misses.length ? `${total} of ${misses.length} tagged` : undefined} />
        {total === 0 ? (
          <EmptyRow
            icon={Tags}
            title={misses.length ? "No misses tagged yet" : "No misses yet"}
            hint={misses.length ? "Tag misses in Practice drills" : "Misses get tagged in Practice"}
            href="/practice"
            cta="Start a drill"
          />
        ) : (
          <>
            <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
              <span className="font-semibold">Mostly {top.label.toLowerCase()}</span>
              <span className="tabular-nums text-[var(--muted)]">{share(top.n)}% of tagged misses</span>
            </div>
            <div className="mt-3 flex h-2.5 w-full gap-px overflow-hidden rounded-full bg-[var(--surface-2)]" role="img" aria-label={causes.map((c) => `${c.label} ${c.n}`).join(", ")}>
              {causes.map((c) => (c.n > 0 ? <div key={c.key} className="h-full" style={{ width: `${share(c.n)}%`, background: c.color }} /> : null))}
            </div>
            <ul className="mt-3 grid gap-x-4 gap-y-1 sm:grid-cols-3">
              {causes.map((c) => {
                const body = (
                  <>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className={cn("flex min-w-0 items-center gap-1.5", c.key === top.key && "font-semibold")}>
                        <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
                        <span className="truncate">{c.label}</span>
                      </span>
                      <span className="shrink-0 tabular-nums">
                        <span className="font-semibold">{c.n}</span>
                        <span className="ml-1 text-xs text-[var(--muted)]">{share(c.n)}%</span>
                      </span>
                    </div>
                    <div className={cn("mt-0.5 text-xs", c.href ? "font-semibold text-[var(--accent)]" : "text-[var(--muted)]")}>{c.action}</div>
                  </>
                );
                // The whole cause is the tap target (≥ 44px) when there is somewhere to go.
                return (
                  <li key={c.key} className="min-w-0">
                    {c.href ? (
                      <Link
                        href={c.href}
                        onClick={() => haptic("tap")}
                        className="press -mx-2 block min-h-[44px] rounded-xl px-2 py-1.5 transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/50"
                      >
                        {body}
                      </Link>
                    ) : (
                      <div className="min-h-[44px] py-1.5">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
        <p className="mt-4 text-xs text-[var(--muted)]">{total > 0 && total < 5 ? "Small sample. Keep tagging." : "Tagging is one tap after a miss."}</p>
      </CardBody>
    </Card>
  );
}

// ─── Confidence calibration: are "Sure" answers actually right? ───

function Calibration({ attempts }: { attempts: Attempt[] }) {
  const sure = attempts.filter((a) => a.confidence === 1);
  const guess = attempts.filter((a) => a.confidence === 3);
  const sureAcc = pctOf(sure);
  const guessAcc = pctOf(guess);
  const marked = sure.length + guess.length;

  let verdict: { text: string; tone: Tone };
  if (sure.length < 5 && guess.length < 5) verdict = { text: "Too few marks to judge yet", tone: "muted" };
  else if (sure.length >= 5 && (sureAcc ?? 0) < TARGET) verdict = { text: "Overconfident: verify before committing", tone: "danger" };
  else if (guess.length >= 5 && (guessAcc ?? 0) >= 60) verdict = { text: "Underconfident: trust your first read", tone: "warning" };
  else verdict = { text: "Well calibrated: keep marking", tone: "success" };

  return (
    <Card>
      <CardBody>
        <SectionHead title="Confidence calibration" meta={marked ? `${marked} marked` : undefined} />
        {marked === 0 ? (
          <EmptyRow icon={Crosshair} title="No confidence marks yet" hint="Mark Sure or Guess as you answer" href="/practice" cta="Start a drill" />
        ) : (
          <>
            <div className="text-sm font-semibold" style={{ color: toneVar(verdict.tone) }}>
              {verdict.text}
            </div>
            <ul className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <li className="min-w-0">
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                  <span>When sure</span>
                  <span className="tabular-nums">
                    <span className="font-semibold">{sureAcc == null ? "—" : `${sureAcc}% right`}</span>
                    <span className="ml-1.5 text-xs text-[var(--muted)]">of {sure.length}</span>
                  </span>
                </div>
                <MasteryBar value={sureAcc ?? 0} tone={sureAcc == null ? "muted" : sureAcc >= TARGET ? "success" : sureAcc >= 60 ? "warning" : "danger"} />
                <div className="mt-1.5 text-xs text-[var(--muted)]">Below {TARGET}% means overconfident</div>
              </li>
              <li className="min-w-0">
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                  <span>When guessing</span>
                  <span className="tabular-nums">
                    <span className="font-semibold">{guessAcc == null ? "—" : `${guessAcc}% right`}</span>
                    <span className="ml-1.5 text-xs text-[var(--muted)]">of {guess.length}</span>
                  </span>
                </div>
                <ProgressBar value={guessAcc ?? 0} tone={guessAcc != null && guessAcc >= 60 ? "warning" : "accent"} className="h-2" />
                <div className="mt-1.5 text-xs text-[var(--muted)]">Above 60% means underconfident</div>
              </li>
            </ul>
          </>
        )}
        <p className="mt-4 text-xs text-[var(--muted)]">Calibration is 20% of mastery.</p>
      </CardBody>
    </Card>
  );
}

function EmptyRow({ icon: Icon, title, hint, href, cta }: { icon: ComponentType<{ size?: number; className?: string }>; title: string; hint: string; href: string; cta: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <Icon size={18} className="shrink-0 text-[var(--muted)]" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-0.5 text-xs text-[var(--muted)]">{hint}</div>
      </div>
      <ButtonLink href={href} size="sm" variant="outline">
        {cta}
      </ButtonLink>
    </div>
  );
}

// ─── First run: nothing answered yet — say what fills each section ───

function FirstRun() {
  const items = [
    { title: "Mastery by competency", hint: `${MIN_SEEN} answers each` },
    { title: "Why you miss", hint: "Tag each miss" },
    { title: "Confidence calibration", hint: "Mark Sure or Guess" },
  ];
  return (
    <Card>
      <CardBody className="py-8 sm:py-10">
        <div className="mx-auto max-w-sm text-center">
          <BarChart3 size={22} className="mx-auto text-[var(--muted)]" />
          <h2 className="mt-3 text-[19px]">No answers yet</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Your first drill fills this page.</p>
        </div>
        <ul className="mx-auto mt-5 max-w-sm divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {items.map((it) => (
            <li key={it.title} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="font-medium">{it.title}</span>
              <span className="text-xs text-[var(--muted)]">{it.hint}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <ButtonLink href="/practice" className="group">
            Start a drill <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </ButtonLink>
          <ButtonLink href="/mock" variant="ghost">
            Take a mock
          </ButtonLink>
        </div>
      </CardBody>
    </Card>
  );
}
