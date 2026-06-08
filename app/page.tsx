"use client";

import { useMemo } from "react";
import { Flame, Target } from "lucide-react";
import { DAILY_GOAL_XP, levelFromXp, todayStr } from "@/lib/gamify";
import { useHydrated, useProgress } from "@/store/progress";
import { Bar, Card, CardBody } from "@/components/ui";
import { Ring } from "@/components/gamify";
import { LessonPath } from "@/components/path/lesson-path";

export default function PathPage() {
  const hydrated = useHydrated();
  const xp = useProgress((s) => s.xp);
  const dailyXp = useProgress((s) => s.dailyXp);
  const dailyDate = useProgress((s) => s.dailyDate);
  const streak = useProgress((s) => s.streakCount);

  const today = todayStr();
  const todayXp = dailyDate === today ? dailyXp : 0;
  const { level, into, need } = useMemo(() => levelFromXp(xp), [xp]);
  const goalPct = Math.min(100, (todayXp / DAILY_GOAL_XP) * 100);

  if (!hydrated) return <div className="text-sm font-bold text-[var(--muted)]">Loading…</div>;

  return (
    <div className="space-y-6">
      {/* Daily goal + level */}
      <Card className="overflow-hidden">
        <CardBody className="flex items-center gap-5">
          <Ring value={goalPct} size={104} stroke={11} color="var(--gold)">
            <div className="font-display text-xl font-extrabold leading-none">{todayXp}</div>
            <div className="text-[10px] font-extrabold text-[var(--muted)]">/ {DAILY_GOAL_XP} XP</div>
          </Ring>
          <div className="flex-1">
            <div className="font-display text-lg font-extrabold">
              {goalPct >= 100 ? "Daily goal smashed! 🎉" : "Today's goal"}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-[var(--streak)]">
              <Flame size={16} fill="var(--streak)" /> {streak}-day streak
            </div>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[11px] font-extrabold text-[var(--muted)]">
                <span>Level {level}</span><span>{into}/{need} XP</span>
              </div>
              <Bar value={(into / need) * 100} tone="accent" />
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center gap-2 text-sm font-extrabold text-[var(--muted)]">
        <Target size={16} /> Follow the path — each stop is a bite-sized lesson.
      </div>

      <LessonPath />
    </div>
  );
}
