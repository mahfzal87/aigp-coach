import { getActivePack } from "@/lib/exam-registry";
import type { ExamMeta, ExamPack } from "@/lib/exam-pack";
import type { Competency, Domain, DomainCode, Flashcard, Question, StudyNote, Topic } from "@/lib/types";

// Bundled content is the source of truth. Synchronous accessors over the
// ACTIVE exam pack (lib/exam-registry.ts) — pages never import content files
// directly, so adding an exam never touches a page.

interface Derived {
  questions: Question[];
  questionToTopic: Map<string, Topic>;
  poolIds: Set<string>;
}

// Derivations (merge + de-dupe + indexes) are computed once per pack.
const derivedCache = new Map<string, Derived>();

function derived(): Derived {
  const pack = getActivePack();
  let d = derivedCache.get(pack.meta.slug);
  if (!d) {
    const seen = new Set<string>();
    const questions = pack.questions.filter((q) => (seen.has(q.id) ? false : (seen.add(q.id), true)));
    const questionToTopic = new Map<string, Topic>();
    for (const t of pack.topics) for (const qid of t.questionIds) if (!questionToTopic.has(qid)) questionToTopic.set(qid, t);
    d = { questions, questionToTopic, poolIds: new Set(pack.examPool.map((q) => q.id)) };
    derivedCache.set(pack.meta.slug, d);
  }
  return d;
}

export function getActiveMeta(): ExamMeta {
  return getActivePack().meta;
}

export function getPackExtras(): Pick<ExamPack, "lawlab" | "library" | "strategyTiles" | "paperDefs" | "updates"> {
  return getActivePack();
}

export function isPoolQuestion(q: Question): boolean {
  return derived().poolIds.has(q.id);
}

// ── Topics (the learn→test spine of each competency) ──

export function getTopics(): Topic[] {
  return getActivePack().topics;
}

export function getTopicsByCompetency(competencyId: string): Topic[] {
  return getActivePack().topics.filter((t) => t.competencyId === competencyId).sort((a, b) => a.sort - b.sort);
}

export function getTopicForQuestion(questionId: string): Topic | undefined {
  return derived().questionToTopic.get(questionId);
}

export function getDomains(): Domain[] {
  return [...getActivePack().domains].sort((a, b) => a.sort - b.sort);
}

export function getDomain(idOrCode: string): Domain | undefined {
  return getActivePack().domains.find((d) => d.id === idOrCode || d.code === idOrCode);
}

export function getCompetencies(): Competency[] {
  return [...getActivePack().competencies].sort((a, b) => a.sort - b.sort);
}

export function getCompetenciesByDomain(domainId: string): Competency[] {
  return getActivePack().competencies.filter((c) => c.domainId === domainId).sort((a, b) => a.sort - b.sort);
}

export function getCompetency(id: string): Competency | undefined {
  return getActivePack().competencies.find((c) => c.id === id);
}

export function getQuestions(): Question[] {
  return derived().questions;
}

export function getQuestionsByCompetency(competencyId: string): Question[] {
  return derived().questions.filter((q) => q.competencyId === competencyId);
}

export function getQuestion(id: string): Question | undefined {
  return derived().questions.find((q) => q.id === id);
}

export function getFlashcards(): Flashcard[] {
  return getActivePack().flashcards;
}

export function getNotes(): StudyNote[] {
  return [...getActivePack().notes].sort((a, b) => a.sort - b.sort);
}

export function getNotesByCompetency(competencyId: string): StudyNote[] {
  return getActivePack().notes.filter((n) => n.competencyId === competencyId).sort((a, b) => a.sort - b.sort);
}

export function getStrategyNotes(): StudyNote[] {
  return getActivePack().notes.filter((n) => n.competencyId === null);
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
