"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarDays, Target } from "lucide-react";
import { computeReadiness } from "@/lib/readiness";
import { useHydrated, useProgress } from "@/store/progress";
import { Badge, Card, CardBody } from "@/components/ui";
import { ContinueCard, CurriculumBoard } from "@/components/curriculum";
import type { Verdict } from "@/lib/types";

const VERDICT: Record<Verdict, { label: string; tone: "success" | "warning" | "danger" | "default" }> = {
  ready: { label: "Exam ready", tone: "success" },
  almost: { label: "Almost there", tone: "warning" },
  "not-yet": { label: "Not yet ready", tone: "danger" },
  unknown: { label: "Building your baseline", tone: "default" },
};

export default function StudyPlanPage() {
  const hydrated = useHydrated();
  const attempts = useProgress((s) => s.attempts);
  const mocks = useProgress((s) => s.mocks);
  const examDate = useProgress((s) => s.settings.examDate);

  const readiness = useMemo(() => computeReadiness(attempts, mocks), [attempts, mocks]);

  if (!hydrated) return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  const v = VERDICT[readiness.verdict];
  const daysLeft = examDate ? Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Study Plan</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Work through the four BoK domains in order, then test against each.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={v.tone}>{v.label}</Badge>
          {daysLeft !== null && daysLeft >= 0 && (
            <Badge tone={daysLeft <= 14 ? "warning" : "default"}><CalendarDays size={12} /> {daysLeft} days to exam</Badge>
          )}
        </div>
      </div>

      <ContinueCard />

      {attempts.length > 0 && (
        <Card><CardBody className="flex items-center gap-3 py-3.5">
          <Target size={16} className="shrink-0 text-[var(--accent)]" />
          <p className="text-sm text-[var(--muted)]">
            Readiness <span className="font-semibold text-[var(--foreground)] tabular-nums">{readiness.overall}/100</span> · projected <span className="font-semibold text-[var(--foreground)] tabular-nums">{readiness.projectedScaled}/500</span> · pass needs 300.
            {" "}<Link href="/profile" className="font-semibold text-[var(--accent)] underline">Details</Link>
          </p>
        </CardBody></Card>
      )}

      <CurriculumBoard />
    </div>
  );
}
