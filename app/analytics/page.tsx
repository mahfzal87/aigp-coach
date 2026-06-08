"use client";

import { useMemo } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getCompetencies } from "@/lib/content";
import { allCompetencyMastery } from "@/lib/readiness";
import { useHydrated, useProgress } from "@/store/progress";
import { Card, CardBody, PageHeader, Stat } from "@/components/ui";

export default function AnalyticsPage() {
  const hydrated = useHydrated();
  const attempts = useProgress((s) => s.attempts);

  const mastery = useMemo(() => allCompetencyMastery(attempts), [attempts]);
  const comps = getCompetencies();

  const masteryData = mastery.map((m) => ({ name: comps.find((c) => c.id === m.competencyId)?.code ?? m.competencyId, mastery: m.mastery, insufficient: m.insufficient }));

  const wrong = attempts.filter((a) => !a.correct);
  const ktr = useMemo(() => {
    const counts = { K: 0, T: 0, R: 0, untagged: 0 };
    for (const a of wrong) {
      if (a.rootCause) counts[a.rootCause]++;
      else counts.untagged++;
    }
    return [
      { name: "Knowledge", value: counts.K, color: "#6366f1" },
      { name: "Technique", value: counts.T, color: "#f59e0b" },
      { name: "Read error", value: counts.R, color: "#ef4444" },
      { name: "Untagged", value: counts.untagged, color: "#94a3b8" },
    ].filter((d) => d.value > 0);
  }, [wrong]);

  const calibration = useMemo(() => {
    if (attempts.length === 0) return null;
    // accuracy among "sure" answers
    const sure = attempts.filter((a) => a.confidence === 1);
    const guess = attempts.filter((a) => a.confidence === 3);
    const acc = (arr: typeof attempts) => (arr.length ? Math.round((arr.filter((a) => a.correct).length / arr.length) * 100) : null);
    return { sure: acc(sure), sureN: sure.length, guess: acc(guess), guessN: guess.length };
  }, [attempts]);

  const avgTime = useMemo(() => {
    const timed = attempts.filter((a) => a.mode !== "mock" && a.timeMs > 0);
    if (!timed.length) return null;
    return Math.round(timed.reduce((s, a) => s + a.timeMs, 0) / timed.length / 1000);
  }, [attempts]);

  if (!hydrated) return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  if (attempts.length === 0) {
    return (
      <div>
        <PageHeader title="Analytics" />
        <Card><CardBody className="text-center text-sm text-[var(--muted)]">No data yet — answer some questions in Practice to populate your analytics.</CardBody></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Where you stand, by competency — and why you miss." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Attempts" value={attempts.length} />
        <Stat label="Accuracy" value={`${Math.round((attempts.filter((a) => a.correct).length / attempts.length) * 100)}%`} />
        <Stat label="Avg time/Q" value={avgTime != null ? `${avgTime}s` : "—"} hint="Target ≈ 99s" />
        <Stat label="Misses" value={wrong.length} />
      </div>

      <Card><CardBody>
        <div className="mb-3 text-sm font-semibold">Mastery by competency</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={masteryData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted)" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted)" }} />
            <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="mastery" radius={[4, 4, 0, 0]}>
              {masteryData.map((d, i) => (
                <Cell key={i} fill={d.insufficient ? "#94a3b8" : d.mastery >= 80 ? "#16a34a" : d.mastery >= 60 ? "#d97706" : "#dc2626"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-2 text-xs text-[var(--muted)]">Grey = not enough attempts yet. Green ≥ 80, amber 60–79, red &lt; 60.</p>
      </CardBody></Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardBody>
          <div className="mb-3 text-sm font-semibold">Why you miss (K / T / R)</div>
          {ktr.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={ktr} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {ktr.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-[var(--muted)]">No misses tagged yet.</p>}
          <p className="mt-1 text-xs text-[var(--muted)]">Lots of Technique/Read-error misses? That&apos;s the 85→95 gap — drill the Strategy section.</p>
        </CardBody></Card>

        <Card><CardBody>
          <div className="mb-3 text-sm font-semibold">Confidence calibration</div>
          {calibration ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between"><span>When you felt <strong>Sure</strong> ({calibration.sureN})</span><span className="font-semibold">{calibration.sure != null ? `${calibration.sure}% right` : "—"}</span></div>
              <div className="flex items-center justify-between"><span>When you <strong>Guessed</strong> ({calibration.guessN})</span><span className="font-semibold">{calibration.guess != null ? `${calibration.guess}% right` : "—"}</span></div>
              <p className="text-xs text-[var(--muted)]">Well-calibrated = high accuracy when sure, low when guessing. Overconfidence (low accuracy when &quot;sure&quot;) is a warning sign.</p>
            </div>
          ) : <p className="text-sm text-[var(--muted)]">No data.</p>}
        </CardBody></Card>
      </div>
    </div>
  );
}
