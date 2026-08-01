import type { QuestionType } from "@/lib/types";

// Structured, scannable strategy content (replaces the markdown wall).

export const TIME_TILES = [
  { stat: "~90s", label: "per question", sub: "100 Q in 165 min leaves a buffer" },
  { stat: "2 min", label: "flag & move", sub: "never let one scenario eat the buffer" },
  { stat: "0", label: "blanks", sub: "no penalty — always answer" },
  { stat: "3", label: "passes", sub: "sure → flagged → multiselect/ordering" },
];

export const ATTACK_STEPS = [
  { title: "Read the stem before the options", desc: "Name the domain, the life-cycle stage, and whose role it is (provider / deployer / user)." },
  { title: "Classify the question type", desc: "BEST · NOT/EXCEPT · ordering · role-ID · distinction. Each has a different winning move." },
  { title: "Predict your answer first", desc: "Decide what a good governance professional would do before reading A–D. Anchoring makes you bait-resistant." },
  { title: "Eliminate the obvious two", desc: "Absolutes, tech-only thinking, outsourced accountability, or wrong life-cycle timing." },
  { title: "Pick the governance-first option", desc: "Between the final two: more comprehensive, more proactive, more by-design usually wins." },
  { title: "Re-read the operative word", desc: "FIRST step? MOST effective? LEAST likely? The decision hides in one word." },
];

export const TYPE_PLAYBOOK: { type: QuestionType; label: string; move: string; trap: string }[] = [
  { type: "best", label: "Best / Most", move: "Choose the holistic, governance-led option — balanced, cross-functional, by-design.", trap: "Distractors are narrow, purely technical, or premature." },
  { type: "not", label: "NOT / Least", move: "Find the outlier: true-but-irrelevant, wrong life-cycle phase, or a law applied to the wrong purpose (NAIIA!).", trap: "Three options belong together; one doesn't. Restate it that way." },
  { type: "ordering", label: "Ordering", move: "Business problem → use case → laws → gaps & risks → data. Governance before technical, always.", trap: "Any sequence starting with data or model choice is wrong." },
  { type: "role", label: "Role ID", move: "Provider develops + places on market under its name. Deployer uses under its own authority.", trap: "Rebranding or substantial modification silently flips a deployer into a provider." },
  { type: "distinction", label: "Distinction", move: "If two options name near-neighbour concepts, the question IS the difference. Recite each definition.", trap: "Synonym-bait: transparency ≠ explainability, model card ≠ system inventory." },
];

export const TRAP_WORDS = {
  wrong: ["all", "always", "never", "only", "entirely", "regardless", "exclusively", "guarantee", "eliminate", "delegate everything", "ignore legal", "profitable", "after deployment"],
  right: ["comprehensive", "cross-functional", "balanced", "proactive", "by-design", "continuous", "documented", "human-in-the-loop", "lifecycle-aware", "jurisdiction-aware"],
};

export const DECISION_RULES = [
  { rule: "Diverse team beats clever tool", detail: "A multidisciplinary team is the FIRST step; audits and algorithms come after." },
  { rule: "Bake it in early", detail: "Security, ethics, privacy: by design — never bolted on post-launch." },
  { rule: "Balance, don't maximize", detail: "Minimization balanced with utility; innovation balanced with oversight." },
  { rule: "Lifecycle answers", detail: "Monitoring is continuous; readiness precedes deployment; inference testing follows it." },
  { rule: "Money never wins", detail: "Profit or migration cost never justifies keeping a risky system running." },
  { rule: "Humans keep control", detail: "Human review before consequential use; users keep meaningful choice." },
];
