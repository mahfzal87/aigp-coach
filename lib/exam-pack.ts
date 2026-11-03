import type { Competency, Domain, Flashcard, LawUpdate, Question, StudyNote, Topic } from "@/lib/types";
import type { Confusable, LawMapDef } from "@/lib/lawlab-types";
import type { ExamSlug } from "@/lib/exam-state";

// Everything one IAPP exam needs to run inside the app. Content stays plain
// TypeScript; the registry (lib/exam-registry.ts) resolves the active pack and
// lib/content.ts keeps its synchronous accessors on top of it.

export interface ExamMeta {
  slug: ExamSlug;
  name: string; // "AIGP"
  fullName: string; // "AI Governance Professional"
  bokLabel: string; // "BoK v2.1 · 2026" (shell subtitle)
  questionsTotal: number; // on the real exam
  scoredQuestions: number;
  minutes: number;
  passScaled: number; // 300 on the IAPP 100–500 scale
}

export interface ExamPaperDef {
  id: string;
  name: string;
  tagline: string;
  kind: "full" | "gauntlet" | "trap" | "domain" | "sprint";
  length: number; // target — clamped to what the bank can supply
  minutes: number;
  domain?: Domain["code"];
}

export interface ExamPack {
  meta: ExamMeta;
  domains: Domain[];
  competencies: Competency[];
  topics: Topic[];
  questions: Question[]; // full merged bank (practice + pool), de-duplicated by the registry consumer
  examPool: Question[]; // the hard slice fixed papers draw from first
  paperDefs: ExamPaperDef[];
  flashcards: Flashcard[];
  notes: StudyNote[];
  updates: LawUpdate[];
  lawlab: {
    maps: LawMapDef[];
    confusables: Confusable[];
    blurb: string; // one-liner under the Law Lab title
    weaknessCompetencies: string[]; // competency ids the live weakness strip ranks
  };
  library: {
    glossary: { term: string; def: string; tag: string }[];
    glossaryTags: string[];
    facts: { n: number; fact: string; tag: string }[];
    factTags: string[];
    distinctions: { a: string; b: string; diff: string }[];
    timeline: { date: string; label: string; status: "done" | "active" | "deferred" }[];
    timelineTitle: string;
    penaltyLadder: { tier: string; amount: string; pct: string; what: string; width: number }[];
    penaltyTitle: string;
    penaltyNote: string;
    instruments: {
      id: string;
      name: string;
      kind: string;
      jurisdiction: string;
      status: string;
      sections: { heading: string; bullets: string[] }[];
    }[];
  };
  strategyTiles: { stat: string; label: string; sub: string }[];
}
