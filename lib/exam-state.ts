// Active-exam state. The module-level slug ALWAYS starts as the default exam so
// the server render and the first client (hydration) render agree; ExamGate
// activates the stored choice after mount and remounts the app subtree.
// Switching exams writes the choice and does a full reload for clean state.

export const DEFAULT_EXAM = "aigp";
export const EXAM_SLUGS = ["aigp", "cippe"] as const;
export type ExamSlug = (typeof EXAM_SLUGS)[number];

const KEY = "coach-active-exam";

let active: ExamSlug = DEFAULT_EXAM;

export function getActiveExam(): ExamSlug {
  return active;
}

export function readStoredExam(): ExamSlug {
  try {
    const v = localStorage.getItem(KEY);
    return (EXAM_SLUGS as readonly string[]).includes(v ?? "") ? (v as ExamSlug) : DEFAULT_EXAM;
  } catch {
    return DEFAULT_EXAM;
  }
}

// Whether the user has picked an exam on this device (drives the tiles screen).
export function hasStoredExam(): boolean {
  try {
    return (EXAM_SLUGS as readonly string[]).includes(localStorage.getItem(KEY) ?? "");
  } catch {
    return true; // storage unavailable — don't trap the user on the picker
  }
}

export function clearStoredExam(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

// Called once by ExamGate (client, post-mount). Changes which exam the content
// accessors and the per-exam storage keys resolve to.
export function activateStoredExam(): ExamSlug {
  active = readStoredExam();
  return active;
}

// Server-side use only (the audit route loops every pack). Never call from UI —
// the UI path is switchExam(), which reloads for clean state.
export function __setActiveExamUnsafe(slug: ExamSlug) {
  active = slug;
}

// `to` lets the picker return someone to the deep link they arrived on.
export function switchExam(slug: ExamSlug, to = "/") {
  try {
    localStorage.setItem(KEY, slug);
  } catch {
    /* storage unavailable — switch still applies for this load via reload default */
  }
  // Same-origin paths only ("//host" is protocol-relative — an open redirect).
  window.location.assign(to.startsWith("/") && !to.startsWith("//") && !to.startsWith("/\\") ? to : "/");
}

// Physical localStorage keys are per exam. The AIGP keys keep their legacy names
// so existing users migrate with zero data movement.
export function progressKeyFor(slug: ExamSlug): string {
  return slug === "aigp" ? "aigp-coach-progress" : `coach-progress__${slug}`;
}

export function progressStorageKey(): string {
  return progressKeyFor(active);
}

export function lawlabStorageKey(): string {
  return active === "aigp" ? "aigp-lawlab" : `coach-lawlab__${active}`;
}
