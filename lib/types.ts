// ─── Content types (source of truth in /content, mirrored in Supabase) ───

export type DomainCode = "I" | "II" | "III" | "IV";

export interface Domain {
  id: string; // slug, e.g. "domain-i"
  code: DomainCode;
  name: string;
  summary: string;
  minQ: number;
  maxQ: number;
  sort: number;
}

export interface Competency {
  id: string; // slug, e.g. "ii-c"
  domainId: string;
  code: string; // e.g. "II.C"
  name: string;
  description: string;
  minQ: number;
  maxQ: number;
  sort: number;
}

export interface StudyNote {
  id: string;
  competencyId: string | null; // null = cross-cutting (e.g. strategy)
  title: string;
  bodyMd: string;
  tags: string[];
  sort: number;
  source?: string;
}

export type QuestionType =
  | "best" // best / most effective
  | "not" // NOT / least / except
  | "ordering"
  | "role" // role identification
  | "distinction"
  | "recall";

export type TrapType =
  | "too-narrow"
  | "absolute"
  | "premature"
  | "true-but-irrelevant"
  | "synonym-bait"
  | "wrong-economics"
  | "none";

export interface QuestionOption {
  label: string; // "A".."E"
  text: string;
  isCorrect: boolean;
  sort: number;
}

export interface Question {
  id: string;
  competencyId: string;
  type: QuestionType;
  difficulty: 1 | 2 | 3;
  scenario?: string;
  stem: string;
  isMultiselect: boolean;
  options: QuestionOption[];
  // rationale
  correctExplanation: string;
  whyWrong: Record<string, string>; // { B: "...", C: "..." }
  strategyNote?: string;
  trapType: TrapType;
  bokRef: string;
  source: "authored" | "community" | "curated";
}

export interface Flashcard {
  id: string;
  competencyId: string;
  front: string;
  back: string;
  tags: string[];
}

export type Severity = "info" | "important" | "critical";

export interface LawUpdate {
  id: string;
  title: string;
  bodyMd: string;
  sourceUrl?: string;
  jurisdiction: string;
  publishedDate: string; // ISO date
  bokRelevant: boolean;
  severity: Severity;
  status: "published" | "pending_review";
}

// ─── Progress types (client-side, localStorage) ───

export type Confidence = 1 | 2 | 3; // 1=sure, 2=unsure, 3=guess
export type RootCause = "K" | "T" | "R"; // knowledge / technique / read-error

export interface Attempt {
  id: string;
  questionId: string;
  competencyId: string;
  chosen: string[]; // option labels
  correct: boolean;
  confidence: Confidence;
  rootCause?: RootCause;
  timeMs: number;
  mode: "practice" | "mock" | "strategy";
  sessionId?: string;
  ts: number; // epoch ms
}

export interface FlashcardState {
  cardId: string;
  ease: number; // SM-2 ease factor
  intervalDays: number;
  due: number; // epoch ms
  reps: number;
  lapses: number;
  lastGrade: number;
  lastReviewed: number;
}

export interface MockSession {
  id: string;
  startedAt: number;
  finishedAt?: number;
  questionIds: string[];
  answers: Record<string, string[]>; // questionId -> chosen labels
  correctCount?: number;
  scaledScore?: number;
  perDomain?: Record<DomainCode, { correct: number; total: number }>;
  durationMs?: number;
}

export interface Settings {
  examDate?: string; // ISO
  updatesApiEnabled: boolean;
  lastSeenUpdateTs?: number;
  sound?: boolean; // celebration/feedback sounds (default on)
}

export interface ProgressExport {
  version: number;
  exportedAt: string;
  attempts: Attempt[];
  flashcards: Record<string, FlashcardState>;
  mocks: MockSession[];
  settings: Settings;
  readNotes: string[];
  xp?: number;
  streakCount?: number;
  longestStreak?: number;
  lastActiveDate?: string | null;
  lessons?: Record<string, { score: number; bestScore: number; at: number }>;
}

// ─── Derived analytics types ───

export interface CompetencyMastery {
  competencyId: string;
  seen: number;
  attempts: number;
  recentAccuracy: number; // 0..1
  coverage: number; // 0..1
  calibration: number; // 0..1
  mastery: number; // 0..100
  insufficient: boolean;
}

export interface DomainMastery {
  code: DomainCode;
  mastery: number; // 0..100
  insufficient: boolean;
}

export type Verdict = "ready" | "almost" | "not-yet" | "unknown";

export interface Readiness {
  overall: number; // 0..100
  projectedScaled: number; // 100..500
  projectedPercent: number; // 0..100
  verdict: Verdict;
  reasons: string[];
  weakest: { competencyId: string; mastery: number }[];
  domainMastery: DomainMastery[];
  hasMock: boolean;
}
