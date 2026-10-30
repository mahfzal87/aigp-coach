import { competencyToDomainCode, getCompetency, getDomains, getQuestions } from "@/lib/content";
import { isAnswerCorrect } from "@/lib/scoring";
import type { DomainCode, MockSession, Question } from "@/lib/types";

// ─── Mock-exam analytics ───
// Everything here is derived purely from finished MockSessions (which keep every
// paper's questionIds + answers forever), so insights survive reloads, sync and
// content updates — a retired question simply drops out of the aggregates.

export const TRAP_LABEL: Record<string, string> = {
  "too-narrow": "Too narrow",
  absolute: "Absolute wording",
  premature: "Premature step",
  "true-but-irrelevant": "True but irrelevant",
  "synonym-bait": "Synonym bait",
  "wrong-economics": "Wrong economics",
};

export const TYPE_LABEL: Record<string, string> = {
  best: "Best / Most",
  not: "NOT / Least",
  ordering: "Ordering",
  role: "Role ID",
  distinction: "Distinction",
  recall: "Recall",
  multiselect: "Multi-select",
};

export interface DomainStat {
  code: DomainCode;
  correct: number;
  total: number;
  acc: number | null; // 0..1 across all sessions
  latestAcc: number | null; // 0..1 in the most recent session
  trend: number | null; // latestAcc − acc of all earlier sessions (pp, −1..1)
}

export interface WeakSpot {
  id: string;
  code: string;
  name: string;
  wrong: number;
  total: number;
  acc: number; // 0..1
}

export interface TechniqueStat {
  key: string;
  label: string;
  missed: number;
  seen: number;
  rate: number; // missed/seen
}

export interface MissRecord {
  q: Question;
  times: number; // how many mock sessions got it wrong
  lastChosen: string[];
  lastAt: number;
  lastSkipped: boolean;
}

export interface MockInsights {
  sessions: MockSession[]; // finished, ascending by finish time
  questionsFaced: number;
  latestScore: number | null;
  prevScore: number | null;
  bestScore: number | null;
  passRate: number; // share of sessions ≥ 300
  series: { idx: number; score: number; name: string; at: number }[];
  domains: DomainStat[];
  weakSpots: WeakSpot[];
  trapStats: TechniqueStat[];
  typeStats: TechniqueStat[];
  misses: MissRecord[]; // every question ever missed in a mock, latest first
}

export function computeMockInsights(mocks: MockSession[]): MockInsights {
  const sessions = mocks
    .filter((m) => m.finishedAt && typeof m.scaledScore === "number")
    .sort((a, b) => (a.finishedAt ?? 0) - (b.finishedAt ?? 0));

  const byId = new Map(getQuestions().map((q) => [q.id, q]));

  const domAll: Record<DomainCode, { c: number; t: number }> = { I: { c: 0, t: 0 }, II: { c: 0, t: 0 }, III: { c: 0, t: 0 }, IV: { c: 0, t: 0 } };
  const domPrior: Record<DomainCode, { c: number; t: number }> = { I: { c: 0, t: 0 }, II: { c: 0, t: 0 }, III: { c: 0, t: 0 }, IV: { c: 0, t: 0 } };
  const domLatest: Record<DomainCode, { c: number; t: number }> = { I: { c: 0, t: 0 }, II: { c: 0, t: 0 }, III: { c: 0, t: 0 }, IV: { c: 0, t: 0 } };
  const comp = new Map<string, { c: number; t: number }>();
  const trap = new Map<string, { m: number; s: number }>();
  const typ = new Map<string, { m: number; s: number }>();
  const missMap = new Map<string, MissRecord>();
  let questionsFaced = 0;

  sessions.forEach((m, si) => {
    const isLatest = si === sessions.length - 1;
    for (const qid of m.questionIds) {
      const q = byId.get(qid);
      if (!q) continue; // retired from the bank
      questionsFaced++;
      const chosen = m.answers[qid] ?? [];
      const ok = chosen.length > 0 && isAnswerCorrect(q, chosen);

      const dc = competencyToDomainCode(q.competencyId);
      if (dc) {
        domAll[dc].t++;
        if (ok) domAll[dc].c++;
        const bucket = isLatest ? domLatest : domPrior;
        bucket[dc].t++;
        if (ok) bucket[dc].c++;
      }

      const cs = comp.get(q.competencyId) ?? { c: 0, t: 0 };
      cs.t++;
      if (ok) cs.c++;
      comp.set(q.competencyId, cs);

      if (q.trapType !== "none") {
        const ts = trap.get(q.trapType) ?? { m: 0, s: 0 };
        ts.s++;
        if (!ok) ts.m++;
        trap.set(q.trapType, ts);
      }
      const typeKey = q.isMultiselect ? "multiselect" : q.type;
      const ys = typ.get(typeKey) ?? { m: 0, s: 0 };
      ys.s++;
      if (!ok) ys.m++;
      typ.set(typeKey, ys);

      if (!ok) {
        const prev = missMap.get(qid);
        missMap.set(qid, {
          q,
          times: (prev?.times ?? 0) + 1,
          lastChosen: chosen,
          lastAt: m.finishedAt ?? m.startedAt,
          lastSkipped: chosen.length === 0,
        });
      }
    }
  });

  const domains: DomainStat[] = getDomains().map((d) => {
    const a = domAll[d.code];
    const l = domLatest[d.code];
    const p = domPrior[d.code];
    const acc = a.t ? a.c / a.t : null;
    const latestAcc = l.t ? l.c / l.t : null;
    const priorAcc = p.t ? p.c / p.t : null;
    return {
      code: d.code,
      correct: a.c,
      total: a.t,
      acc,
      latestAcc,
      trend: latestAcc !== null && priorAcc !== null ? latestAcc - priorAcc : null,
    };
  });

  const weakSpots: WeakSpot[] = [...comp.entries()]
    .filter(([, v]) => v.t >= 3)
    .map(([id, v]) => {
      const c = getCompetency(id);
      return { id, code: c?.code ?? id, name: c?.name ?? id, wrong: v.t - v.c, total: v.t, acc: v.c / v.t };
    })
    .filter((w) => w.acc < 0.85)
    .sort((a, b) => a.acc - b.acc)
    .slice(0, 5);

  const toTech = (m: Map<string, { m: number; s: number }>, labels: Record<string, string>): TechniqueStat[] =>
    [...m.entries()]
      .filter(([, v]) => v.s >= 4 && v.m > 0)
      .map(([key, v]) => ({ key, label: labels[key] ?? key, missed: v.m, seen: v.s, rate: v.m / v.s }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 3);

  const series = sessions.map((m, i) => ({
    idx: i + 1,
    score: m.scaledScore as number,
    name: m.examName ?? "Mock",
    at: m.finishedAt ?? m.startedAt,
  }));

  return {
    sessions,
    questionsFaced,
    latestScore: sessions.length ? (sessions[sessions.length - 1].scaledScore as number) : null,
    prevScore: sessions.length > 1 ? (sessions[sessions.length - 2].scaledScore as number) : null,
    bestScore: sessions.length ? Math.max(...sessions.map((m) => m.scaledScore as number)) : null,
    passRate: sessions.length ? sessions.filter((m) => (m.scaledScore ?? 0) >= 300).length / sessions.length : 0,
    series,
    domains,
    weakSpots,
    trapStats: toTech(trap, TRAP_LABEL),
    typeStats: toTech(typ, TYPE_LABEL),
    misses: [...missMap.values()].sort((a, b) => b.lastAt - a.lastAt),
  };
}
