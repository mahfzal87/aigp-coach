"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, CheckCircle2, Circle, GraduationCap, PlayCircle } from "lucide-react";
import { getCompetenciesByDomain, getDomains, getQuestionsByCompetency } from "@/lib/content";
import { LESSON_PASS } from "@/lib/gamify";
import { useProgress } from "@/store/progress";
import { Badge, Bar, Button, Card, CardBody } from "@/components/ui";

type RowState = "done" | "current" | "todo";

interface Row {
  id: string;
  code: string;
  name: string;
  kind: "lesson" | "test";
  qCount: number;
  best: number | null;
  state: RowState;
}

export function useCurriculum() {
  const lessons = useProgress((s) => s.lessons);
  return useMemo(() => {
    let foundCurrent = false;
    const units = getDomains().map((d) => {
      const comps = getCompetenciesByDomain(d.id);
      const rows: Row[] = comps.map((c) => {
        const best = lessons[c.id]?.bestScore ?? null;
        const done = (best ?? 0) >= LESSON_PASS;
        let state: RowState = done ? "done" : "todo";
        if (!done && !foundCurrent) { state = "current"; foundCurrent = true; }
        return { id: c.id, code: c.code, name: c.name, kind: "lesson", qCount: getQuestionsByCompetency(c.id).length, best, state };
      });
      const testId = `test-${d.code}`;
      const testBest = lessons[testId]?.bestScore ?? null;
      const allDone = comps.every((c) => (lessons[c.id]?.bestScore ?? 0) >= LESSON_PASS);
      const testDone = (testBest ?? 0) >= LESSON_PASS;
      let testState: RowState = testDone ? "done" : allDone && !foundCurrent ? "current" : "todo";
      if (testState === "current") foundCurrent = true;
      rows.push({ id: testId, code: "TEST", name: `${d.name} — domain test`, kind: "test", qCount: 10, best: testBest, state: testState });
      const pct = Math.round((rows.filter((r) => r.state === "done").length / rows.length) * 100);
      return { domain: d, rows, pct };
    });
    const current = units.flatMap((u) => u.rows).find((r) => r.state === "current") ?? null;
    return { units, current };
  }, [lessons]);
}

export function CurriculumBoard() {
  const { units } = useCurriculum();
  return (
    <div className="space-y-5">
      {units.map(({ domain, rows, pct }) => (
        <Card key={domain.id}>
          <CardBody className="space-y-1 p-0">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Domain {domain.code}</div>
                <div className="text-[15px] font-bold">{domain.name}</div>
              </div>
              <div className="flex w-28 flex-col items-end gap-1">
                <span className="text-xs font-semibold tabular-nums text-[var(--muted)]">{pct}%</span>
                <Bar value={pct} tone={pct === 100 ? "success" : "primary"} />
              </div>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {rows.map((r) => <ModuleRow key={r.id} row={r} />)}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function ModuleRow({ row }: { row: Row }) {
  const Icon = row.state === "done" ? CheckCircle2 : row.kind === "test" ? GraduationCap : row.state === "current" ? PlayCircle : Circle;
  const iconColor = row.state === "done" ? "text-[var(--success)]" : row.state === "current" ? "text-[var(--primary)]" : "text-[var(--muted)] opacity-50";
  return (
    <Link href={`/lesson/${row.id}`} className="press flex cursor-pointer items-center gap-3 px-5 py-3.5 hover:bg-[var(--surface-2)]">
      <Icon size={20} className={`shrink-0 ${iconColor}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold">{row.kind === "test" ? row.name : `${row.code} · ${row.name}`}</span>
          {row.state === "current" && <Badge tone="primary">Up next</Badge>}
        </div>
        <div className="mt-0.5 text-xs text-[var(--muted)]">
          {row.kind === "test" ? "10 questions, checks the whole domain" : `${row.qCount} questions in bank`}
          {row.best !== null && ` · best ${Math.round(row.best * 100)}%`}
        </div>
      </div>
      <span className="text-xs font-semibold text-[var(--accent)]">
        {row.state === "done" ? "Review" : row.state === "current" ? "Start" : "Open"} <ArrowRight size={12} className="inline" />
      </span>
    </Link>
  );
}

export function ContinueCard() {
  const { current } = useCurriculum();
  if (!current) {
    return (
      <Card><CardBody className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[15px] font-bold">All modules complete 🎓</div>
          <p className="mt-0.5 text-sm text-[var(--muted)]">Keep sharp with mixed practice and full mock exams.</p>
        </div>
        <Link href="/mock"><Button>Take a mock</Button></Link>
      </CardBody></Card>
    );
  }
  return (
    <Card className="border-[var(--primary)]/40">
      <CardBody className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Continue where you left off</div>
          <div className="mt-0.5 truncate text-[15px] font-bold">{current.kind === "test" ? current.name : `${current.code} · ${current.name}`}</div>
        </div>
        <Link href={`/lesson/${current.id}`}><Button>Continue <ArrowRight size={15} /></Button></Link>
      </CardBody>
    </Card>
  );
}
