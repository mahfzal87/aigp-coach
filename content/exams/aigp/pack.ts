import type { ExamPack } from "@/lib/exam-pack";
import { domains, competencies } from "@/content/curriculum";
import { questions as questionsBase } from "@/content/questions";
import { questionsExtra } from "@/content/questions-extra";
import { questionsBatch3 } from "@/content/questions-batch3";
import { examPool } from "@/content/exam-pool-index";
import { topics, topicQuestions } from "@/content/topics-index";
import { flashcards } from "@/content/flashcards";
import { notes } from "@/content/notes";
import { updates } from "@/content/updates";
import { LAW_MAPS, CONFUSABLES } from "@/content/lawlab";
import { DISTINCTIONS, EU_TIMELINE, FACTS, PENALTY_LADDER } from "@/content/reference-structured";
import { INSTRUMENTS } from "@/content/frameworks";
import { GLOSSARY } from "@/content/glossary";
import { TIME_TILES } from "@/content/strategy-structured";

// AIGP — the original pack. Content lives in /content at the repo root (its
// pre-multi-exam home); this file only assembles it.

export const aigpPack: ExamPack = {
  meta: {
    slug: "aigp",
    name: "AIGP",
    fullName: "AI Governance Professional",
    bokLabel: "BoK v2.1 · 2026",
    questionsTotal: 100,
    scoredQuestions: 85,
    minutes: 165,
    passScaled: 300,
  },
  domains,
  competencies,
  topics,
  questions: [...questionsBase, ...questionsExtra, ...questionsBatch3, ...topicQuestions, ...examPool],
  examPool,
  paperDefs: [
    { id: "form-a", name: "Full Mock · Form A", tagline: "Blueprint-proportional 100-question paper, real-exam timing.", kind: "full", length: 100, minutes: 165 },
    { id: "form-b", name: "Full Mock · Form B", tagline: "Second fixed paper — different questions than Form A.", kind: "full", length: 100, minutes: 165 },
    { id: "form-c", name: "Full Mock · Form C", tagline: "Third fixed paper — fresh set again.", kind: "full", length: 100, minutes: 165 },
    { id: "gauntlet", name: "Hard Gauntlet", tagline: "50 questions, every one rated ★★★. Built to fail you.", kind: "gauntlet", length: 50, minutes: 83 },
    { id: "trap-lab", name: "Trap Lab", tagline: "40 questions that each carry a named trap. Spot the bait.", kind: "trap", length: 40, minutes: 66 },
    { id: "deep-i", name: "Domain I Deep-Dive", tagline: "25 questions across every Domain I competency.", kind: "domain", domain: "I", length: 25, minutes: 41 },
    { id: "deep-ii", name: "Domain II Deep-Dive", tagline: "25 questions across every Domain II competency.", kind: "domain", domain: "II", length: 25, minutes: 41 },
    { id: "deep-iii", name: "Domain III Deep-Dive", tagline: "25 questions across every Domain III competency.", kind: "domain", domain: "III", length: 25, minutes: 41 },
    { id: "deep-iv", name: "Domain IV Deep-Dive", tagline: "25 questions across every Domain IV competency.", kind: "domain", domain: "IV", length: 25, minutes: 41 },
  ],
  flashcards,
  notes,
  updates,
  lawlab: {
    maps: LAW_MAPS,
    confusables: CONFUSABLES,
    blurb: "Every law and framework on the exam, as facts you lock in.",
    weaknessCompetencies: ["i-c", "ii-a", "ii-b", "ii-c", "ii-d"],
  },
  library: {
    glossary: GLOSSARY,
    glossaryTags: ["AI & ML", "Laws (EU)", "Laws (US & global)", "Frameworks & standards", "Risk & governance", "Privacy & security"],
    facts: FACTS,
    factTags: ["EU", "US & global", "Frameworks", "Develop", "Deploy"],
    distinctions: DISTINCTIONS,
    timeline: EU_TIMELINE,
    timelineTitle: "EU AI Act application timeline",
    penaltyLadder: PENALTY_LADDER,
    penaltyTitle: "EU AI Act penalty ladder",
    penaltyNote: "Higher of the fixed amount or % of global annual turnover. SMEs pay the LOWER cap.",
    instruments: INSTRUMENTS,
  },
  strategyTiles: TIME_TILES,
};
