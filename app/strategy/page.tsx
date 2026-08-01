"use client";

import { useState } from "react";
import { AlertTriangle, Check, Crosshair, Swords, X } from "lucide-react";
import { getQuestions } from "@/lib/content";
import { ATTACK_STEPS, DECISION_RULES, TIME_TILES, TRAP_WORDS, TYPE_PLAYBOOK } from "@/content/strategy-structured";
import type { QuestionType } from "@/lib/types";
import { Badge, Button, Card, CardBody, PageHeader } from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion";
import { haptic } from "@/lib/haptics";
import { Drill } from "@/components/quiz/drill";

export default function StrategyPage() {
  const [drillType, setDrillType] = useState<QuestionType | null>(null);

  if (drillType) {
    const qs = getQuestions().filter((q) => q.type === drillType);
    return (
      <div>
        <PageHeader title={`Technique drill — ${TYPE_PLAYBOOK.find((t) => t.type === drillType)?.label}`} action={<Button variant="outline" onClick={() => setDrillType(null)}>Exit</Button>} />
        <Drill questions={qs} mode="strategy" onExit={() => setDrillType(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Question strategy" subtitle="The margin between 85% and 95% is technique, not knowledge. Scan, absorb, drill." />

      {/* Time discipline */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {TIME_TILES.map((t) => (
          <Card key={t.label}><CardBody className="p-4">
            <div className="text-2xl font-bold tabular-nums text-[var(--primary)]">{t.stat}</div>
            <div className="text-xs font-semibold">{t.label}</div>
            <div className="mt-0.5 text-[11px] leading-snug text-[var(--muted)]">{t.sub}</div>
          </CardBody></Card>
        ))}
      </div>

      {/* 6-step attack — visual stepper */}
      <Card><CardBody>
        <div className="mb-4 flex items-center gap-2 text-base font-bold"><Crosshair size={17} className="text-[var(--primary)]" /> The 6-step attack — run it on every question</div>
        <Stagger className="space-y-0">
          {ATTACK_STEPS.map((s, i) => (
            <StaggerItem key={i}>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--primary)]/12 text-sm font-bold text-[var(--primary)]">{i + 1}</div>
                  {i < ATTACK_STEPS.length - 1 && <div className="w-px flex-1 bg-[var(--border)]" />}
                </div>
                <div className={i < ATTACK_STEPS.length - 1 ? "pb-5" : ""}>
                  <div className="text-sm font-bold leading-8">{s.title}</div>
                  <p className="-mt-1 text-sm leading-relaxed text-[var(--muted)]">{s.desc}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </CardBody></Card>

      {/* Per-type playbook with drill launchers */}
      <div>
        <div className="mb-3 flex items-center gap-2 px-1 text-base font-bold"><Swords size={17} className="text-[var(--accent)]" /> Playbook by question type</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {TYPE_PLAYBOOK.map((t) => {
            const n = getQuestions().filter((q) => q.type === t.type).length;
            return (
              <Card key={t.type} className="liftable flex flex-col"><CardBody className="flex flex-1 flex-col gap-2.5 p-4">
                <div className="flex items-center justify-between">
                  <Badge tone="accent">{t.label}</Badge>
                  <span className="text-[11px] text-[var(--muted)]">{n} in bank</span>
                </div>
                <div className="flex items-start gap-1.5 text-sm leading-snug"><Check size={15} className="mt-0.5 shrink-0 text-[var(--success)]" /> <span><span className="font-semibold">Winning move:</span> {t.move}</span></div>
                <div className="flex items-start gap-1.5 text-sm leading-snug text-[var(--muted)]"><AlertTriangle size={15} className="mt-0.5 shrink-0 text-[var(--warning)]" /> <span>{t.trap}</span></div>
                <div className="mt-auto pt-1">
                  <Button size="sm" variant="outline" className="w-full" disabled={n === 0} onClick={() => { haptic("tap"); setDrillType(t.type); }}>Drill this type</Button>
                </div>
              </CardBody></Card>
            );
          })}
        </div>
      </div>

      {/* Trap radar — chip clouds */}
      <Card><CardBody>
        <div className="mb-3 text-base font-bold">Trap radar — words that decide answers</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--danger)]"><X size={13} /> Distrust in an option</div>
            <div className="flex flex-wrap gap-1.5">
              {TRAP_WORDS.wrong.map((w) => <span key={w} className="rounded-full bg-[var(--danger)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--danger)]">{w}</span>)}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--success)]"><Check size={13} /> Lean toward</div>
            <div className="flex flex-wrap gap-1.5">
              {TRAP_WORDS.right.map((w) => <span key={w} className="rounded-full bg-[var(--success)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--success)]">{w}</span>)}
            </div>
          </div>
        </div>
      </CardBody></Card>

      {/* Decision rules IAPP rewards */}
      <Card><CardBody>
        <div className="mb-3 text-base font-bold">What IAPP rewards — the six house rules</div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {DECISION_RULES.map((r) => (
            <div key={r.rule} className="rounded-xl border border-[var(--border)] p-3">
              <div className="text-sm font-bold">{r.rule}</div>
              <div className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">{r.detail}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]"><Badge>Tip</Badge> After each miss, tag it Knowledge / Technique / Read-error — Analytics shows your pattern.</p>
      </CardBody></Card>
    </div>
  );
}
