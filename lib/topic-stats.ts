import { getTopics } from "@/lib/content";
import type { Attempt, Topic } from "@/lib/types";

// Per-topic performance, derived by joining attempts to each topic's questions.
// No store migration needed: attempts already carry questionId.

export type TopicStatus = "strong" | "shaky" | "weak" | "untouched";

export interface TopicStat {
  topic: Topic;
  attempts: number;
  correct: number;
  accuracy: number; // 0..1 (recency-weighted)
  lastCorrect: boolean | null;
  status: TopicStatus;
}

export function computeTopicStats(attempts: Attempt[]): TopicStat[] {
  // newest-first index per question for recency weighting
  const byQuestion = new Map<string, Attempt[]>();
  for (const a of attempts) {
    const list = byQuestion.get(a.questionId);
    if (list) list.push(a);
    else byQuestion.set(a.questionId, [a]);
  }
  for (const list of byQuestion.values()) list.sort((a, b) => b.ts - a.ts);

  return getTopics().map((topic) => {
    const rel: Attempt[] = topic.questionIds.flatMap((qid) => byQuestion.get(qid) ?? []);
    rel.sort((a, b) => b.ts - a.ts);
    const n = rel.length;
    if (n === 0) {
      return { topic, attempts: 0, correct: 0, accuracy: 0, lastCorrect: null, status: "untouched" as const };
    }
    // Recency-weighted accuracy: newest attempt weighs most (w = 0.75^rank).
    let wSum = 0;
    let wCorrect = 0;
    rel.forEach((a, i) => {
      const w = Math.pow(0.75, i);
      wSum += w;
      if (a.correct) wCorrect += w;
    });
    const accuracy = wCorrect / wSum;
    const correct = rel.filter((a) => a.correct).length;
    const lastCorrect = rel[0].correct;
    const status: TopicStatus = accuracy >= 0.8 && lastCorrect ? "strong" : accuracy >= 0.55 ? "shaky" : "weak";
    return { topic, attempts: n, correct, accuracy, lastCorrect, status };
  });
}

export function weakestTopics(attempts: Attempt[], limit = 6): TopicStat[] {
  return computeTopicStats(attempts)
    .filter((s) => s.status === "weak" || s.status === "shaky")
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit);
}
