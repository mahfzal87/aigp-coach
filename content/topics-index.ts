import type { Question, Topic } from "@/lib/types";
import { topicsI, questionsTopicsI } from "@/content/topics-i";
import { topicsII, questionsTopicsII } from "@/content/topics-ii";
import { topicsIII, questionsTopicsIII } from "@/content/topics-iii";
import { topicsIV, questionsTopicsIV } from "@/content/topics-iv";

// Aggregates the per-domain topic files (authored comprehensively from the
// aigp-exam-coach skill references). Each topic pairs a plain-English concept
// + example with the exam-style question(s) that test it.
export const topics: Topic[] = [...topicsI, ...topicsII, ...topicsIII, ...topicsIV];
export const topicQuestions: Question[] = [
  ...questionsTopicsI,
  ...questionsTopicsII,
  ...questionsTopicsIII,
  ...questionsTopicsIV,
];
