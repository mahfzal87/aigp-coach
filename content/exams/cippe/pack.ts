import type { ExamPack } from "@/lib/exam-pack";
import { domainsCippe, competenciesCippe } from "./curriculum";
import { topicsD1 } from "./topics-d1";
import { topicsD2 } from "./topics-d2";
import { topicsD3 } from "./topics-d3";
import { topicsD4 } from "./topics-d4";
import { topicsD5 } from "./topics-d5";
import { questionsD1, poolD1 } from "./questions-d1";
import { questionsD2, poolD2 } from "./questions-d2";
import { questionsD3, poolD3 } from "./questions-d3";
import { questionsD4, poolD4 } from "./questions-d4";
import { questionsD5, poolD5 } from "./questions-d5";
import { flashcardsCippe } from "./flashcards";
import { updatesCippe } from "./updates";
import { LAW_MAPS_CIPPE, CONFUSABLES_CIPPE } from "./lawlab";
import {
  DISTINCTIONS_CIPPE,
  FACTS_CIPPE,
  FACT_TAGS_CIPPE,
  GLOSSARY_CIPPE,
  GLOSSARY_TAGS_CIPPE,
  INSTRUMENTS_CIPPE,
  PENALTY_LADDER_CIPPE,
  TIMELINE_CIPPE,
} from "./library";

// CIPP/E — Certified Information Privacy Professional / Europe.
// Exam facts: 90 questions (75 scored + 15 pretest), 150 minutes,
// pass = 300 on the 100–500 scale. BoK v1.3.3, effective 1 Sept 2025.

const pool = [...poolD1, ...poolD2, ...poolD3, ...poolD4, ...poolD5];

export const cippePack: ExamPack = {
  meta: {
    slug: "cippe",
    name: "CIPP/E",
    fullName: "Certified Information Privacy Professional / Europe",
    bokLabel: "BoK v1.3.3 · 2025–26",
    questionsTotal: 90,
    scoredQuestions: 75,
    minutes: 150,
    passScaled: 300,
  },
  domains: domainsCippe,
  competencies: competenciesCippe,
  topics: [...topicsD1, ...topicsD2, ...topicsD3, ...topicsD4, ...topicsD5],
  questions: [...questionsD1, ...questionsD2, ...questionsD3, ...questionsD4, ...questionsD5, ...pool],
  examPool: pool,
  paperDefs: [
    { id: "form-a", name: "Full Mock · Form A", tagline: "Blueprint-proportional 90-question paper, real-exam timing.", kind: "full", length: 90, minutes: 150 },
    { id: "gauntlet", name: "Hard Gauntlet", tagline: "30 questions, every one rated ★★★. Built to fail you.", kind: "gauntlet", length: 30, minutes: 50 },
    { id: "trap-lab", name: "Trap Lab", tagline: "30 questions that each carry a named trap. Spot the bait.", kind: "trap", length: 30, minutes: 50 },
    { id: "deep-i", name: "Domain I Deep-Dive", tagline: "18 questions across every Domain I competency.", kind: "domain", domain: "I", length: 18, minutes: 30 },
    { id: "deep-ii", name: "Domain II Deep-Dive", tagline: "18 questions across every Domain II competency.", kind: "domain", domain: "II", length: 18, minutes: 30 },
    { id: "deep-iii", name: "Domain III Deep-Dive", tagline: "18 questions across every Domain III competency.", kind: "domain", domain: "III", length: 18, minutes: 30 },
    { id: "deep-iv", name: "Domain IV Deep-Dive", tagline: "18 questions across every Domain IV competency.", kind: "domain", domain: "IV", length: 18, minutes: 30 },
    { id: "deep-v", name: "Domain V Deep-Dive", tagline: "18 questions across every Domain V competency.", kind: "domain", domain: "V", length: 18, minutes: 30 },
  ],
  flashcards: flashcardsCippe,
  notes: [],
  updates: updatesCippe,
  lawlab: {
    maps: LAW_MAPS_CIPPE,
    confusables: CONFUSABLES_CIPPE,
    blurb: "GDPR and its neighbours, as facts you lock in.",
    weaknessCompetencies: competenciesCippe.map((c) => c.id),
  },
  library: {
    glossary: GLOSSARY_CIPPE,
    glossaryTags: GLOSSARY_TAGS_CIPPE,
    facts: FACTS_CIPPE,
    factTags: FACT_TAGS_CIPPE,
    distinctions: DISTINCTIONS_CIPPE,
    timeline: TIMELINE_CIPPE,
    timelineTitle: "European data protection timeline",
    penaltyLadder: PENALTY_LADDER_CIPPE,
    penaltyTitle: "GDPR fine tiers (Art. 83)",
    penaltyNote: "Fines are the HIGHER of the fixed amount or the % of total worldwide annual turnover; Art. 83 factors decide where in the band you land.",
    instruments: INSTRUMENTS_CIPPE,
  },
  strategyTiles: [
    { stat: "~100s", label: "per question", sub: "90 Q in 150 min leaves a buffer" },
    { stat: "2 min", label: "flag & move", sub: "never let one scenario eat the buffer" },
    { stat: "0", label: "blanks", sub: "no penalty — always answer" },
    { stat: "3", label: "passes", sub: "sure → flagged → the coin-flip pairs" },
  ],
};
