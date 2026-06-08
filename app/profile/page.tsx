"use client";

import Link from "next/link";
import { useMemo } from "react";
import * as Icons from "lucide-react";
import { ChevronRight, Flame } from "lucide-react";
import { getDomain } from "@/lib/content";
import { computeReadiness } from "@/lib/readiness";
import { ACHIEVEMENTS, LESSON_PASS, levelFromXp } from "@/lib/gamify";
import { useHydrated, useProgress } from "@/store/progress";
import { Badge, Bar, Card, CardBody, PageHeader, Stat } from "@/components/ui";
import { ReadinessGauge } from "@/components/readiness-gauge";
import { Ring } from "@/components/gamify";
import type { Verdict } from "@/lib/types";

const VERDICT: Record<Verdict, { label: string; tone: "success" | "warning" | "danger" | "default" }> = {
  ready: { label: "Exam ready", tone: "success" },
  almost: { label: "Almost there", tone: "warning" },
  "not-yet": { label: "Not yet ready", tone: "danger" },
  unknown: { label: "Need more data", tone: "default" },
};

export default function ProfilePage() {
  const hydrated = useHydrated();
  const attempts = useProgress((s) => s.attempts);
  const mocks = useProgress((s) => s.mocks);
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streakCount);
  const longest = useProgress((s) => s.longestStreak);
  const lessons = useProgress((s) => s.lessons);

  const readiness = useMemo(() => computeReadiness(attempts, mocks), [attempts, mocks]);
  const { level, into, need } = useMemo(() => levelFromXp(xp), [xp]);

  const lessonsCompleted = Object.entries(lessons).filter(([, l]) => l.bestScore >= LESSON_PASS).length;
  const perfectLessons = Object.values(lessons).filter((l) => l.bestScore >= 1).length;
  const mocksPassed = mocks.filter((m) => (m.scaledScore ?? 0) >= 300).length;

  const earned = useMemo(() => {
    const input = { xp, level, streakCount: streak, attempts: attempts.length, correct: attempts.filter((a) => a.correct).length, lessonsCompleted, mocksPassed, perfectLessons };
    return new Set(ACHIEVEMENTS.filter((a) => a.test(input)).map((a) => a.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xp, level, streak, attempts, lessonsCompleted, mocksPassed, perfectLessons]);

  if (!hydrated) return <div className="text-sm font-bold text-[var(--muted)]">Loading…</div>;
  const v = VERDICT[readiness.verdict];

  return (
    <div className="space-y-6">
      <PageHeader title="Your stats" subtitle="Progress, readiness and trophies." />

      {/* Level + streak */}
      <Card>
        <CardBody className="flex items-center gap-5">
          <Ring value={(into / need) * 100} size={104} stroke={11} color="var(--accent)">
            <div className="font-display text-2xl font-extrabold leading-none">{level}</div>
            <div className="text-[10px] font-extrabold text-[var(--muted)]">LEVEL</div>
          </Ring>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-1.5 font-display text-lg font-extrabold text-[var(--streak)]"><Flame size={18} fill="var(--streak)" /> {streak}-day streak</div>
            <div className="text-xs font-bold text-[var(--muted)]">Longest: {longest} days · {xp} total XP · {into}/{need} to next level</div>
            <Bar value={(into / need) * 100} tone="accent" />
          </div>
        </CardBody>
      </Card>

      {/* Readiness */}
      <Card>
        <CardBody className="flex flex-col items-center gap-5 sm:flex-row">
          <ReadinessGauge value={readiness.overall} verdict={readiness.verdict} size={150} />
          <div className="flex-1">
            <Badge tone={v.tone}>{v.label}</Badge>
            <div className="mt-2 text-xs font-bold text-[var(--muted)]">Projected score</div>
            <div className="font-display text-3xl font-extrabold">{readiness.projectedScaled}<span className="text-base font-bold text-[var(--muted)]"> / 500 · ~{readiness.projectedPercent}%</span></div>
            <ul className="mt-2 space-y-0.5 text-xs font-semibold text-[var(--muted)]">
              {readiness.reasons.slice(0, 2).map((r, i) => <li key={i}>• {r}</li>)}
            </ul>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Questions" value={attempts.length} />
        <Stat label="Accuracy" value={`${attempts.length ? Math.round((attempts.filter((a) => a.correct).length / attempts.length) * 100) : 0}%`} />
        <Stat label="Lessons done" value={lessonsCompleted} />
        <Stat label="Mocks passed" value={mocksPassed} />
      </div>

      {/* Domain mastery */}
      <Card><CardBody>
        <div className="mb-4 font-display text-base font-extrabold">Mastery by unit</div>
        <div className="space-y-3">
          {readiness.domainMastery.map((d) => (
            <div key={d.code}>
              <div className="mb-1 flex justify-between text-sm font-bold"><span>Unit {d.code} — {getDomain(d.code)?.name}</span><span className="text-[var(--muted)]">{d.insufficient ? "—" : d.mastery}</span></div>
              <Bar value={d.mastery} tone={d.mastery >= 80 ? "success" : d.mastery >= 60 ? "warning" : "danger"} />
            </div>
          ))}
        </div>
        <Link href="/analytics" className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[var(--accent)]">Full analytics <ChevronRight size={14} /></Link>
      </CardBody></Card>

      {/* Achievements */}
      <Card><CardBody>
        <div className="mb-4 font-display text-base font-extrabold">Trophies <span className="text-sm font-bold text-[var(--muted)]">{earned.size}/{ACHIEVEMENTS.length}</span></div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {ACHIEVEMENTS.map((a) => {
            const got = earned.has(a.id);
            const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[a.icon] ?? Icons.Award;
            return (
              <div key={a.id} className="flex flex-col items-center text-center" title={a.desc}>
                <div className="grid h-16 w-16 place-items-center rounded-2xl" style={{ background: got ? "var(--gold)" : "var(--surface-2)", boxShadow: got ? "0 4px 0 0 #d9a800" : "none" }}>
                  <Icon size={28} className={got ? "text-white" : "text-[var(--muted)] opacity-50"} />
                </div>
                <div className={`mt-1 text-[10px] font-extrabold ${got ? "" : "text-[var(--muted)]"}`}>{a.name}</div>
              </div>
            );
          })}
        </div>
      </CardBody></Card>
    </div>
  );
}
