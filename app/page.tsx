"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarDays, Flame, Target } from "lucide-react";
import { computeReadiness } from "@/lib/readiness";
import { streakAlive, todayStr, DAILY_GOAL_XP } from "@/lib/gamify";
import { useHydrated, useProgress } from "@/store/progress";
import { Badge, Card, CardBody } from "@/components/ui";
import { AnimatedNumber, MotionBar, Reveal } from "@/components/motion";
import { ContinueCard, CurriculumBoard } from "@/components/curriculum";
import type { Verdict } from "@/lib/types";

const VERDICT: Record<Verdict, { label: string; tone: "success" | "warning" | "danger" | "default" }> = {
  ready: { label: "Exam ready", tone: "success" },
  almost: { label: "Almost there", tone: "warning" },
  "not-yet": { label: "Not yet ready", tone: "danger" },
  unknown: { label: "Building your baseline", tone: "default" },
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Late-night session";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function StudyPlanPage() {
  const hydrated = useHydrated();
  const attempts = useProgress((s) => s.attempts);
  const mocks = useProgress((s) => s.mocks);
  const examDate = useProgress((s) => s.settings.examDate);
  const streak = useProgress((s) => s.streakCount);
  const lastActive = useProgress((s) => s.lastActiveDate);
  const dailyXp = useProgress((s) => s.dailyXp);
  const dailyDate = useProgress((s) => s.dailyDate);

  const readiness = useMemo(() => computeReadiness(attempts, mocks), [attempts, mocks]);

  if (!hydrated) return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  const v = VERDICT[readiness.verdict];
  const daysLeft = examDate ? Math.ceil((new Date(examDate).getTime() - Date.now()) / 86400000) : null;
  const alive = streakAlive(lastActive);
  const todayXp = dailyDate === todayStr() ? dailyXp : 0;
  const goalPct = Math.min(100, (todayXp / DAILY_GOAL_XP) * 100);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Reveal>
        <Card className="mesh overflow-hidden">
          <CardBody className="space-y-4 py-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{greeting()}, Ahmad</div>
                <h1 className="mt-1 text-2xl font-bold tracking-tight">Study Plan</h1>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={v.tone}>{v.label}</Badge>
                {daysLeft !== null && daysLeft >= 0 && (
                  <Badge tone={daysLeft <= 14 ? "warning" : "default"}><CalendarDays size={12} /> {daysLeft} days to exam</Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <AnimatedNumber value={readiness.overall} className="text-3xl font-bold" />
                  <span className="text-sm text-[var(--muted)]">/100 readiness</span>
                </div>
                <div className="mt-0.5 text-xs text-[var(--muted)]">
                  projected <span className="font-semibold text-[var(--foreground)] tabular-nums">{readiness.projectedScaled}</span>/500 · pass ≥ 300
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Flame size={22} className={alive ? "anim-flame text-[var(--streak)]" : "text-[var(--muted)] opacity-40"} fill={alive ? "var(--streak)" : "none"} />
                <div>
                  <div className="text-sm font-bold tabular-nums">{streak}-day streak</div>
                  <div className="text-xs text-[var(--muted)]">{alive ? "alive — keep it going" : "study today to restart it"}</div>
                </div>
              </div>
              <div className="min-w-40 flex-1">
                <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
                  <span>Today</span>
                  <span className="tabular-nums">{todayXp}/{DAILY_GOAL_XP} pts</span>
                </div>
                <MotionBar value={goalPct} tone={goalPct >= 100 ? "success" : "gold"} className="h-2" />
              </div>
            </div>
          </CardBody>
        </Card>
      </Reveal>

      <Reveal delay={0.06}><ContinueCard /></Reveal>

      {attempts.length > 0 && (
        <Reveal delay={0.1}>
          <div className="flex items-center gap-2 px-1 text-xs text-[var(--muted)]">
            <Target size={13} className="text-[var(--accent)]" />
            Weakest right now: {readiness.weakest.slice(0, 2).map((w) => w.competencyId.toUpperCase()).join(", ") || "—"} ·{" "}
            <Link href="/profile" className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline">full breakdown</Link>
          </div>
        </Reveal>
      )}

      <CurriculumBoard />
    </div>
  );
}
