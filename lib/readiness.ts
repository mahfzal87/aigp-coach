import { competencyToDomainCode, getCompetencies, getDomains, getQuestionsByCompetency } from "@/lib/content";
import { toScaledScore } from "@/lib/scoring";
import type {
  Attempt,
  CompetencyMastery,
  DomainCode,
  DomainMastery,
  MockSession,
  Readiness,
  Verdict,
} from "@/lib/types";

const MIN_SEEN = 5; // cold-start threshold

// Exponentially recency-weighted accuracy over a competency's attempts.
function recencyWeightedAccuracy(attempts: Attempt[]): number {
  if (attempts.length === 0) return 0;
  const sorted = [...attempts].sort((a, b) => a.ts - b.ts);
  let num = 0;
  let den = 0;
  const n = sorted.length;
  sorted.forEach((a, i) => {
    // most recent gets weight ~1, older decays
    const w = Math.pow(0.92, n - 1 - i);
    num += w * (a.correct ? 1 : 0);
    den += w;
  });
  return den === 0 ? 0 : num / den;
}

// Calibration: reward when confidence matches correctness. conf 1(sure)->1.0, 2->0.5, 3(guess)->0.0
function calibration(attempts: Attempt[]): number {
  if (attempts.length === 0) return 0.5;
  let sum = 0;
  for (const a of attempts) {
    const confScore = a.confidence === 1 ? 1 : a.confidence === 2 ? 0.5 : 0;
    const correctScore = a.correct ? 1 : 0;
    sum += 1 - Math.abs(confScore - correctScore);
  }
  return sum / attempts.length;
}

export function competencyMastery(competencyId: string, attempts: Attempt[]): CompetencyMastery {
  const compAttempts = attempts.filter((a) => a.competencyId === competencyId);
  const seen = new Set(compAttempts.map((a) => a.questionId)).size;
  const total = Math.max(1, getQuestionsByCompetency(competencyId).length);
  const targetSeen = Math.max(4, Math.min(total, total)); // cover the available bank
  const coverage = Math.min(1, seen / targetSeen);
  const acc = recencyWeightedAccuracy(compAttempts);
  const cal = calibration(compAttempts);

  let mastery = 100 * (0.55 * acc + 0.25 * coverage + 0.2 * cal);
  const insufficient = compAttempts.length < MIN_SEEN;
  if (insufficient) {
    // damp toward 50 when we have little signal
    const k = compAttempts.length / MIN_SEEN;
    mastery = 50 * (1 - k) + mastery * k;
  }
  return {
    competencyId,
    seen,
    attempts: compAttempts.length,
    recentAccuracy: acc,
    coverage,
    calibration: cal,
    mastery: Math.round(mastery),
    insufficient,
  };
}

export function allCompetencyMastery(attempts: Attempt[]): CompetencyMastery[] {
  return getCompetencies().map((c) => competencyMastery(c.id, attempts));
}

export function domainMastery(attempts: Attempt[]): DomainMastery[] {
  const comps = allCompetencyMastery(attempts);
  return getDomains().map((d) => {
    const cs = getCompetencies().filter((c) => c.domainId === d.id);
    let num = 0;
    let den = 0;
    let anySignal = false;
    for (const c of cs) {
      const cm = comps.find((x) => x.competencyId === c.id)!;
      const w = c.maxQ; // blueprint weight
      num += w * cm.mastery;
      den += w;
      if (!cm.insufficient) anySignal = true;
    }
    return { code: d.code as DomainCode, mastery: den ? Math.round(num / den) : 0, insufficient: !anySignal };
  });
}

export function computeReadiness(attempts: Attempt[], mocks: MockSession[]): Readiness {
  const domains = domainMastery(attempts);
  const comps = allCompetencyMastery(attempts);

  // drill readiness = blueprint-weighted mean of domain mastery
  const totalW = getDomains().reduce((s, d) => s + (d.minQ + d.maxQ) / 2, 0);
  let drill = 0;
  for (const d of domains) {
    const dd = getDomains().find((x) => x.code === d.code)!;
    drill += ((dd.minQ + dd.maxQ) / 2 / totalW) * d.mastery;
  }

  // mock contribution
  const finishedMocks = mocks.filter((m) => m.finishedAt && typeof m.scaledScore === "number");
  const hasMock = finishedMocks.length > 0;
  let overall = drill;
  let projectedScaled: number;
  if (hasMock) {
    const latest = finishedMocks.sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))[0];
    const mockNorm = ((latest.scaledScore as number) - 100) / 400 * 100; // 0..100
    overall = 0.6 * drill + 0.4 * mockNorm;
    // projected scaled blends mock scaled with drill-implied scaled
    const drillScaled = toScaledScore(drill / 100);
    projectedScaled = Math.round(0.5 * (latest.scaledScore as number) + 0.5 * drillScaled);
  } else {
    projectedScaled = toScaledScore(drill / 100);
  }
  overall = Math.round(Math.max(0, Math.min(100, overall)));

  const projectedPercent = Math.round((projectedScaled - 100) / 400 * 100);

  // weakest competencies (exclude pure cold-start noise unless nothing else)
  const ranked = [...comps].sort((a, b) => a.mastery - b.mastery);
  const weakest = ranked.slice(0, 3).map((c) => ({ competencyId: c.competencyId, mastery: c.mastery }));

  // verdict
  const everyDomainOk = domains.every((d) => d.mastery >= 80 && !d.insufficient);
  const totalAttempts = attempts.length;
  let verdict: Verdict;
  const reasons: string[] = [];

  if (totalAttempts < 10) {
    verdict = "unknown";
    reasons.push("Not enough practice yet — answer more questions to get a reliable read.");
  } else if (projectedPercent >= 92 && everyDomainOk && hasMock) {
    verdict = "ready";
    reasons.push(`Projected ~${projectedPercent}% (scaled ${projectedScaled}/500), every domain ≥ 80, and a full mock completed.`);
  } else if (projectedPercent >= 83) {
    verdict = "almost";
    if (!hasMock) reasons.push("Take at least one full 100-question mock to confirm readiness.");
    const weakDomain = domains.find((d) => d.mastery < 80);
    if (weakDomain) reasons.push(`Domain ${weakDomain.code} is below 80 (${weakDomain.mastery}).`);
    if (projectedPercent < 92) reasons.push(`Projected ~${projectedPercent}% — push toward 92%+ for a safe margin.`);
  } else {
    verdict = "not-yet";
    reasons.push(`Projected ~${projectedPercent}% (scaled ${projectedScaled}/500) — below the comfortable pass margin.`);
    const weakDomain = domains.filter((d) => d.mastery < 70).map((d) => d.code);
    if (weakDomain.length) reasons.push(`Weak domains: ${weakDomain.join(", ")}.`);
  }

  return {
    overall,
    projectedScaled,
    projectedPercent: Math.max(0, Math.min(100, projectedPercent)),
    verdict,
    reasons,
    weakest,
    domainMastery: domains,
    hasMock,
  };
}
