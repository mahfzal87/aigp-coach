import type { ExamPack } from "@/lib/exam-pack";
import { domainsCipm, competenciesCipm } from "./curriculum";
import { topicsD1 } from "./topics-d1";
import { topicsD2 } from "./topics-d2";
import { topicsD3 } from "./topics-d3";
import { topicsD4 } from "./topics-d4";
import { topicsD5 } from "./topics-d5";
import { topicsD6 } from "./topics-d6";
import { questionsD1, poolD1 } from "./questions-d1";
import { questionsD2, poolD2 } from "./questions-d2";
import { questionsD3, poolD3 } from "./questions-d3";
import { questionsD4, poolD4 } from "./questions-d4";
import { questionsD5, poolD5 } from "./questions-d5";
import { questionsD6, poolD6 } from "./questions-d6";
import { flashcardsCipm } from "./flashcards";
import { updatesCipm } from "./updates";
import { LAW_MAPS_CIPM, CONFUSABLES_CIPM } from "./lawlab";
import {
  DISTINCTIONS_CIPM,
  FACTS_CIPM,
  FACT_TAGS_CIPM,
  GLOSSARY_CIPM,
  GLOSSARY_TAGS_CIPM,
  INSTRUMENTS_CIPM,
  PENALTY_LADDER_CIPM,
  TIMELINE_CIPM,
} from "./library";

// CIPM — Certified Information Privacy Manager.
// Exam facts: 90 questions (75 scored + 15 pretest), 150 minutes,
// pass = 300 on the 100–500 scale. BoK v4.2.0, effective 1 Sept 2025.

const pool = [...poolD1, ...poolD2, ...poolD3, ...poolD4, ...poolD5, ...poolD6];

export const cipmPack: ExamPack = {
  meta: {
    slug: "cipm",
    name: "CIPM",
    fullName: "Certified Information Privacy Manager",
    bokLabel: "BoK v4.2.0 · 2025–26",
    questionsTotal: 90,
    scoredQuestions: 75,
    minutes: 150,
    passScaled: 300,
  },
  domains: domainsCipm,
  competencies: competenciesCipm,
  topics: [...topicsD1, ...topicsD2, ...topicsD3, ...topicsD4, ...topicsD5, ...topicsD6],
  questions: [...questionsD1, ...questionsD2, ...questionsD3, ...questionsD4, ...questionsD5, ...questionsD6, ...pool],
  examPool: pool,
  paperDefs: [
    { id: "form-a", name: "Full Mock · Form A", tagline: "Blueprint-proportional 90-question paper, real-exam timing.", kind: "full", length: 90, minutes: 150 },
    { id: "form-b", name: "Full Mock · Form B", tagline: "Second fixed paper — different questions than Form A.", kind: "full", length: 90, minutes: 150 },
    { id: "gauntlet", name: "Hard Gauntlet", tagline: "30 questions, every one rated ★★★. Built to fail you.", kind: "gauntlet", length: 30, minutes: 50 },
    { id: "trap-lab", name: "Trap Lab", tagline: "30 questions that each carry a named trap. Spot the bait.", kind: "trap", length: 30, minutes: 50 },
    { id: "deep-i", name: "Domain I Deep-Dive", tagline: "15 questions across every Domain I competency.", kind: "domain", domain: "I", length: 15, minutes: 25 },
    { id: "deep-ii", name: "Domain II Deep-Dive", tagline: "15 questions across every Domain II competency.", kind: "domain", domain: "II", length: 15, minutes: 25 },
    { id: "deep-iii", name: "Domain III Deep-Dive", tagline: "15 questions across every Domain III competency.", kind: "domain", domain: "III", length: 15, minutes: 25 },
    { id: "deep-iv", name: "Domain IV Deep-Dive", tagline: "15 questions across every Domain IV competency.", kind: "domain", domain: "IV", length: 15, minutes: 25 },
    { id: "deep-v", name: "Domain V Deep-Dive", tagline: "15 questions across every Domain V competency.", kind: "domain", domain: "V", length: 15, minutes: 25 },
    { id: "deep-vi", name: "Domain VI Deep-Dive", tagline: "15 questions across every Domain VI competency.", kind: "domain", domain: "VI", length: 15, minutes: 25 },
  ],
  flashcards: flashcardsCipm,
  notes: [],
  updates: updatesCipm,
  lawlab: {
    maps: LAW_MAPS_CIPM,
    confusables: CONFUSABLES_CIPM,
    blurb: "The frameworks, laws and clocks a privacy program runs on, as facts you lock in.",
    weaknessCompetencies: competenciesCipm.map((c) => c.id),
  },
  library: {
    glossary: GLOSSARY_CIPM,
    glossaryTags: GLOSSARY_TAGS_CIPM,
    facts: FACTS_CIPM,
    factTags: FACT_TAGS_CIPM,
    distinctions: DISTINCTIONS_CIPM,
    timeline: TIMELINE_CIPM,
    timelineTitle: "Privacy program frameworks & laws timeline",
    penaltyLadder: PENALTY_LADDER_CIPM,
    penaltyTitle: "What non-compliance costs",
    penaltyNote:
      "GDPR fines are the HIGHER of the fixed sum or the % of total worldwide annual turnover. US amounts apply per violation (CCPA figures CPI-adjusted since 1 Jan 2025), so they multiply fast. Bars show relative severity, not a common currency.",
    instruments: INSTRUMENTS_CIPM,
  },
  strategyTiles: [
    { stat: "~100s", label: "per question", sub: "90 Q in 150 min leaves a buffer" },
    { stat: "2 min", label: "flag & move", sub: "never let one scenario eat the buffer" },
    { stat: "0", label: "blanks", sub: "no penalty — always answer" },
    { stat: "3", label: "passes", sub: "sure → flagged → the coin-flip pairs" },
  ],
};
