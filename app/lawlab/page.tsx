"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  Check,
  ChevronDown,
  KeyRound,
  Map as MapIcon,
  RotateCcw,
  Swords,
  TrendingDown,
  Trophy,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { celebrate, buzzFail } from "@/lib/celebrate";
import { CONFUSABLES, LAW_MAPS, LAWLAB_TOTAL, mapLeafKey, totalLeaves, type LawMapDef, type LawRegion } from "@/content/lawlab";
import { useLawLab, useLawLabHydrated } from "@/store/lawlab";
import { useHydrated, useProgress } from "@/store/progress";
import { Badge, Bar, Card, CardBody, PageHeader } from "@/components/ui";
import { MindMap } from "@/components/mindmap";

const COMP_LABEL: Record<string, string> = {
  "i-c": "I.C Policies across the life cycle",
  "ii-a": "II.A Privacy laws",
  "ii-b": "II.B Other existing laws",
  "ii-c": "II.C AI-specific laws",
  "ii-d": "II.D Standards & tools",
};
const LAW_COMPS = Object.keys(COMP_LABEL);

type Mode = "maps" | "confuse" | "drill";
const REGIONS: ("All" | LawRegion)[] = ["All", "EU", "US", "APAC", "Global", "Org"];

export default function LawLabPage() {
  const hydrated = useHydrated();
  const labHydrated = useLawLabHydrated();
  const [mode, setMode] = useState<Mode>("maps");

  if (!hydrated || !labHydrated) return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  return (
    <div>
      <PageHeader
        title="Law Lab"
        subtitle="Mindmaps, trigger keywords and look-alike distinctions for every law, framework and policy on the exam. Tap a fact to lock it in."
      />
      <WeaknessStrip />
      <MasteryBand />

      <div className="mb-5 grid grid-cols-3 gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-1 text-sm font-semibold">
        {(
          [
            ["maps", "Mindmaps", MapIcon],
            ["confuse", "Confusables", ArrowLeftRight],
            ["drill", "Trigger Drill", Swords],
          ] as const
        ).map(([m, label, Icon]) => (
          <button
            key={m}
            onClick={() => {
              haptic("tap");
              setMode(m);
            }}
            className={cn(
              "press flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2",
              mode === m ? "bg-[var(--surface)] shadow-sm" : "text-[var(--muted)]"
            )}
          >
            <Icon size={15} /> <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {mode === "maps" && <MapsSection />}
      {mode === "confuse" && <ConfusablesSection />}
      {mode === "drill" && <TriggerDrill />}
    </div>
  );
}

// ── Live weakness readout from his real attempt history ──
function WeaknessStrip() {
  const attempts = useProgress((s) => s.attempts);
  const mocks = useProgress((s) => s.mocks);

  const data = useMemo(() => {
    const per = LAW_COMPS.map((cid) => {
      const list = attempts.filter((a) => a.competencyId === cid);
      const c = list.filter((a) => a.correct).length;
      return { cid, n: list.length, pct: list.length ? Math.round((100 * c) / list.length) : NaN };
    }).filter((r) => r.n >= 5);
    per.sort((a, b) => a.pct - b.pct);

    const fulls = mocks
      .filter((m) => m.finishedAt && m.questionIds.length >= 90 && m.perDomain?.II?.total)
      .sort((a, b) => a.startedAt - b.startedAt);
    const latest = fulls[fulls.length - 1];
    const latestII = latest ? Math.round((100 * latest.perDomain!.II.correct) / latest.perDomain!.II.total) : null;

    return { worst: per.slice(0, 3), latestII, latestName: latest?.examName };
  }, [attempts, mocks]);

  if (data.worst.length === 0 && data.latestII === null) return null;

  return (
    <Card className="mb-4 border-[var(--danger)]/30">
      <CardBody className="flex flex-col gap-2 py-3.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--danger)]">
          <TrendingDown size={14} /> Why this tab exists — your live numbers
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {data.worst.map((w) => (
            <span key={w.cid} className="rounded-full bg-[var(--danger)]/10 px-2.5 py-1 text-[var(--danger)]">
              {COMP_LABEL[w.cid]} · {w.pct}%
            </span>
          ))}
          {data.latestII !== null && (
            <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[var(--muted)]">
              Latest full mock ({data.latestName?.replace("Full Mock · ", "")}) — Domain II: {data.latestII}%
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// ── Overall mastery ──
function MasteryBand() {
  const locked = useLawLab((s) => s.locked);
  const drillBest = useLawLab((s) => s.drillBest);
  const n = Object.keys(locked).length;
  const pct = Math.round((100 * n) / LAWLAB_TOTAL);
  return (
    <Card className="mb-4">
      <CardBody className="py-3.5">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-bold">
            Lab mastery <span className="tabular-nums text-[var(--primary)]">{pct}%</span>
          </span>
          <span className="flex items-center gap-3 text-xs font-semibold text-[var(--muted)]">
            <span className="tabular-nums">{n}/{LAWLAB_TOTAL} facts locked</span>
            <span className="flex items-center gap-1">
              <Trophy size={13} className="text-[var(--gold)]" /> drill best {drillBest}/10
            </span>
          </span>
        </div>
        <Bar value={pct} />
      </CardBody>
    </Card>
  );
}

// ── Mindmaps ──
function MapsSection() {
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All");
  const [open, setOpen] = useState<Set<string>>(() => new Set([LAW_MAPS[0].id]));
  const maps = LAW_MAPS.filter((m) => region === "All" || m.region === region);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => {
              haptic("tap");
              setRegion(r);
            }}
            className={cn(
              "press cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold",
              region === r ? "bg-[var(--primary)] text-[var(--primary-fg)]" : "bg-[var(--surface-2)] text-[var(--muted)]"
            )}
          >
            {r === "Org" ? "In the org" : r}
          </button>
        ))}
      </div>
      {maps.map((def) => (
        <LawCard
          key={def.id}
          def={def}
          open={open.has(def.id)}
          onToggle={() =>
            setOpen((prev) => {
              const next = new Set(prev);
              if (next.has(def.id)) next.delete(def.id);
              else next.add(def.id);
              return next;
            })
          }
        />
      ))}
    </div>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 13;
  const c = 2 * Math.PI * r;
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" className="shrink-0 -rotate-90">
      <circle cx="17" cy="17" r={r} fill="none" stroke="var(--border)" strokeWidth="3.5" />
      <circle
        cx="17"
        cy="17"
        r={r}
        fill="none"
        stroke={pct >= 100 ? "#10b981" : "#0ea5e9"}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`}
      />
      <text x="17" y="17" textAnchor="middle" dominantBaseline="central" className="rotate-90" style={{ transformOrigin: "17px 17px" }} fontSize="9" fontWeight="700" fill="var(--muted)">
        {pct}
      </text>
    </svg>
  );
}

function LawCard({ def, open, onToggle }: { def: LawMapDef; open: boolean; onToggle: () => void }) {
  const locked = useLawLab((s) => s.locked);
  const toggle = useLawLab((s) => s.toggle);
  const total = totalLeaves(def);
  const n = def.branches.reduce((acc, b) => acc + b.leaves.reduce((m, _, i) => m + (locked[mapLeafKey(def.id, b.id, i)] ? 1 : 0), 0), 0);
  const pct = Math.round((100 * n) / total);

  return (
    <Card className={cn(open && "ring-1 ring-[var(--primary)]/25")}>
      <button
        onClick={() => {
          haptic("tap");
          onToggle();
        }}
        className="press flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <Ring pct={pct} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold leading-tight">{def.name}</span>
            <Badge tone={def.kind === "Law" ? "danger" : def.kind === "Treaty" ? "accent" : def.kind === "Policy" ? "gold" : "primary"}>{def.kind}</Badge>
            {def.weight === 3 && <Badge tone="streak">High yield</Badge>}
          </div>
          <div className="mt-0.5 truncate text-xs text-[var(--muted)]">{def.tagline}</div>
        </div>
        <ChevronDown size={18} className={cn("shrink-0 text-[var(--muted)] transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <CardBody className="space-y-5 border-t border-[var(--border)] pt-4">
          <MindMap def={def} locked={locked} onToggle={toggle} />
          <KeywordChips def={def} />
          {def.distinctions.length > 0 && (
            <div>
              <SectionLabel icon={<ArrowLeftRight size={13} />} text="Don't confuse it with" />
              <div className="space-y-1.5">
                {def.distinctions.map((d, i) => (
                  <div key={i} className="rounded-lg bg-[var(--surface-2)] px-3 py-2 text-[12.5px] leading-snug">
                    <span className="font-bold">{d.vs}:</span> <span className="text-[var(--muted)]">{d.point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {def.traps.length > 0 && (
            <div>
              <SectionLabel icon={<AlertTriangle size={13} />} text="How they'll trick you" danger />
              <ul className="space-y-1.5">
                {def.traps.map((t, i) => (
                  <li key={i} className="flex gap-2 rounded-lg border border-[var(--danger)]/20 bg-[var(--danger)]/5 px-3 py-2 text-[12.5px] leading-snug">
                    <span className="font-bold text-[var(--danger)]">!</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardBody>
      )}
    </Card>
  );
}

function SectionLabel({ icon, text, danger }: { icon: React.ReactNode; text: string; danger?: boolean }) {
  return (
    <div className={cn("mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide", danger ? "text-[var(--danger)]" : "text-[var(--muted)]")}>
      {icon} {text}
    </div>
  );
}

function KeywordChips({ def }: { def: LawMapDef }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  if (def.keywords.length === 0) return null;
  return (
    <div>
      <SectionLabel icon={<KeyRound size={13} />} text="Trigger words — tap to reveal what each signals" />
      <div className="flex flex-wrap gap-1.5">
        {def.keywords.map((k, i) => {
          const isOpen = revealed.has(i);
          return (
            <button
              key={i}
              onClick={() => {
                haptic("tap");
                setRevealed((prev) => {
                  const next = new Set(prev);
                  if (next.has(i)) next.delete(i);
                  else next.add(i);
                  return next;
                });
              }}
              className={cn(
                "press cursor-pointer rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors",
                isOpen ? "border-[var(--primary)]/50 bg-[var(--primary)]/8" : "border-[var(--border)] bg-[var(--surface)]"
              )}
            >
              <span className="font-bold">{k.term}</span>
              {isOpen && <span className="mt-0.5 block max-w-[280px] text-[11px] leading-snug text-[var(--muted)]">{k.cue}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Confusables ──
function ConfusablesSection() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--muted)]">
        The exam's favorite move is swapping these. Read each pair until the tell is automatic.
      </p>
      {CONFUSABLES.map((c) => (
        <Card key={c.id}>
          <CardBody className="space-y-3 py-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <span>{c.a}</span>
              <ArrowLeftRight size={14} className="text-[var(--muted)]" />
              <span>{c.b}</span>
            </div>
            <div className="overflow-hidden rounded-lg border border-[var(--border)]">
              {c.rows.map((r, i) => (
                <div key={i} className={cn("grid grid-cols-[88px_1fr_1fr] gap-px bg-[var(--border)] text-[12px] leading-snug", i > 0 && "border-t border-[var(--border)]")}>
                  <div className="bg-[var(--surface-2)] px-2.5 py-2 font-bold">{r.dim}</div>
                  <div className="bg-[var(--surface)] px-2.5 py-2">{r.a || "—"}</div>
                  <div className="bg-[var(--surface)] px-2.5 py-2">{r.b || "—"}</div>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-[var(--primary)]/8 px-3 py-2 text-[12.5px] font-medium leading-snug">
              <span className="font-bold text-[var(--primary)]">The tell:</span> {c.tell}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

// ── Trigger Drill ──
interface DrillQ {
  term: string;
  cue: string;
  answer: string; // map short
  options: string[];
}

function buildDrill(): DrillQ[] {
  const pool = LAW_MAPS.flatMap((m) => m.keywords.map((k) => ({ ...k, answer: m.short, region: m.region })));
  const shorts = [...new Set(LAW_MAPS.map((m) => m.short))];
  const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
  return picked.map((p) => {
    const sameRegion = LAW_MAPS.filter((m) => m.region === p.region && m.short !== p.answer).map((m) => m.short);
    const others = shorts.filter((s) => s !== p.answer && !sameRegion.includes(s));
    const distractors = [...sameRegion.sort(() => Math.random() - 0.5).slice(0, 2), ...others.sort(() => Math.random() - 0.5)].slice(0, 3);
    return { term: p.term, cue: p.cue, answer: p.answer, options: [p.answer, ...distractors].sort(() => Math.random() - 0.5) };
  });
}

function TriggerDrill() {
  const sound = useProgress((s) => s.settings.sound ?? false);
  const drillBest = useLawLab((s) => s.drillBest);
  const setDrillBest = useLawLab((s) => s.setDrillBest);

  const [qs, setQs] = useState<DrillQ[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const start = () => {
    haptic("tap");
    setQs(buildDrill());
    setIdx(0);
    setPicked(null);
    setScore(0);
  };

  if (!qs) {
    return (
      <Card>
        <CardBody className="space-y-4 py-8 text-center">
          <Swords size={34} className="mx-auto text-[var(--primary)]" />
          <div>
            <div className="text-lg font-bold">Trigger Drill</div>
            <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--muted)]">
              10 rapid rounds: a trigger phrase comes up — name the law, framework or standard it points to. This is exactly how stems telegraph their answer.
            </p>
          </div>
          <div className="text-xs font-semibold text-[var(--muted)]">
            Personal best: <span className="tabular-nums text-[var(--gold)]">{drillBest}/10</span>
          </div>
          <button onClick={start} className="press mx-auto flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-[var(--primary-fg)]">
            Start drill <ArrowRight size={15} />
          </button>
        </CardBody>
      </Card>
    );
  }

  if (idx >= qs.length) {
    const isBest = score > drillBest;
    return (
      <Card>
        <CardBody className="space-y-4 py-8 text-center">
          <div className="text-4xl font-extrabold tabular-nums">{score}/10</div>
          <p className="text-sm text-[var(--muted)]">
            {score === 10 ? "Perfect — the triggers are wired in." : score >= 8 ? "Strong. Re-run the ones that hesitated." : "Run it again — the drill is the fastest fix for Domain II."}
          </p>
          {isBest && (
            <div className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-[var(--gold)]/15 px-3 py-1 text-xs font-bold text-[var(--gold)]">
              <Trophy size={13} /> New personal best
            </div>
          )}
          <button onClick={start} className="press mx-auto flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-[var(--primary-fg)]">
            <RotateCcw size={15} /> Run it again
          </button>
        </CardBody>
      </Card>
    );
  }

  const q = qs[idx];
  const answered = picked !== null;

  const choose = (opt: string) => {
    if (answered) return;
    setPicked(opt);
    const correct = opt === q.answer;
    if (correct) {
      haptic("success");
      setScore((s) => s + 1);
    } else {
      buzzFail({ sound });
    }
    const final = correct ? score + 1 : score;
    if (idx === qs.length - 1 && final > drillBest) {
      setDrillBest(final);
      celebrate({ sound, big: final >= 9 });
    } else if (idx === qs.length - 1) {
      // no-op
    }
  };

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted)]">
          <span className="tabular-nums">Round {idx + 1} / {qs.length}</span>
          <span className="tabular-nums">Score {score}</span>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">This phrase in a stem points to…</div>
          <div className="mt-1 text-2xl font-extrabold leading-tight">“{q.term}”</div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {q.options.map((opt) => {
            const isCorrect = opt === q.answer;
            const isPicked = picked === opt;
            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                disabled={answered}
                className={cn(
                  "press flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm font-semibold transition-colors disabled:cursor-default",
                  !answered && "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/50",
                  answered && isCorrect && "border-[var(--success)] bg-[var(--success)]/10",
                  answered && isPicked && !isCorrect && "border-[var(--danger)] bg-[var(--danger)]/10",
                  answered && !isPicked && !isCorrect && "border-[var(--border)] opacity-50"
                )}
              >
                {opt}
                {answered && isCorrect && <Check size={16} className="shrink-0 text-[var(--success)]" />}
                {answered && isPicked && !isCorrect && <X size={16} className="shrink-0 text-[var(--danger)]" />}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className="space-y-3">
            <div className="rounded-lg bg-[var(--surface-2)] px-3 py-2 text-[12.5px] leading-snug">
              <span className="font-bold">{q.term}</span> — {q.cue}
            </div>
            <button
              onClick={() => {
                haptic("tap");
                setPicked(null);
                setIdx((i) => i + 1);
              }}
              className="press flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-2.5 text-sm font-bold text-[var(--primary-fg)]"
            >
              {idx + 1 < qs.length ? "Next round" : "See result"} <ArrowRight size={15} />
            </button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
