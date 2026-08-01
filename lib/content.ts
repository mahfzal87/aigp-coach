import { domains } from "@/content/curriculum";
import { competencies } from "@/content/curriculum";
import { questions as questionsBase } from "@/content/questions";
import { questionsExtra } from "@/content/questions-extra";
import { questionsBatch3 } from "@/content/questions-batch3";
import { flashcards } from "@/content/flashcards";
import { notes } from "@/content/notes";
import type { Competency, Domain, DomainCode, Flashcard, Question, StudyNote } from "@/lib/types";

// Bundled content is the source of truth (also seeded to Supabase). Synchronous accessors.

// Combined bank (base + extra), de-duplicated by id.
const questions: Question[] = (() => {
  const seen = new Set<string>();
  return [...questionsBase, ...questionsExtra, ...questionsBatch3].filter((q) => (seen.has(q.id) ? false : (seen.add(q.id), true)));
})();

export function getDomains(): Domain[] {
  return [...domains].sort((a, b) => a.sort - b.sort);
}

export function getDomain(idOrCode: string): Domain | undefined {
  return domains.find((d) => d.id === idOrCode || d.code === idOrCode);
}

export function getCompetencies(): Competency[] {
  return [...competencies].sort((a, b) => a.sort - b.sort);
}

export function getCompetenciesByDomain(domainId: string): Competency[] {
  return competencies.filter((c) => c.domainId === domainId).sort((a, b) => a.sort - b.sort);
}

export function getCompetency(id: string): Competency | undefined {
  return competencies.find((c) => c.id === id);
}

export function getQuestions(): Question[] {
  return questions;
}

export function getQuestionsByCompetency(competencyId: string): Question[] {
  return questions.filter((q) => q.competencyId === competencyId);
}

export function getQuestion(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}

export function getFlashcards(): Flashcard[] {
  return flashcards;
}

export function getNotes(): StudyNote[] {
  return [...notes].sort((a, b) => a.sort - b.sort);
}

export function getNotesByCompetency(competencyId: string): StudyNote[] {
  return notes.filter((n) => n.competencyId === competencyId).sort((a, b) => a.sort - b.sort);
}

export function getStrategyNotes(): StudyNote[] {
  return notes.filter((n) => n.competencyId === null);
}

// Map competencyId -> domainCode (used widely in scoring/readiness).
export function competencyToDomainCode(competencyId: string): DomainCode | undefined {
  const c = getCompetency(competencyId);
  if (!c) return undefined;
  return getDomain(c.domainId)?.code;
}

// Blueprint weight per competency = its max question count (natural exam weighting).
export function competencyWeight(competencyId: string): number {
  return getCompetency(competencyId)?.maxQ ?? 1;
}
