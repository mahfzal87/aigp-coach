import type { QuestionType } from "@/lib/types";

// Structured, scannable strategy content (replaces the markdown wall).
// Exam-neutral on purpose: the Strategy page serves every IAPP pack (AIGP,
// CIPP/E, …), so examples name both worlds — controller/processor and
// provider/deployer. TIME_TILES is AIGP pacing; other packs bring their own.

export const TIME_TILES = [
  { stat: "~90s", label: "per question", sub: "100 Q in 165 min leaves a buffer" },
  { stat: "2 min", label: "flag & move", sub: "never let one scenario eat the buffer" },
  { stat: "0", label: "blanks", sub: "no penalty — always answer" },
  { stat: "3", label: "passes", sub: "sure → flagged → multiselect/ordering" },
];

export const ATTACK_STEPS = [
  { title: "Read the stem first", desc: "Name the domain, the stage, and whose duty it is — controller or processor, provider or deployer." },
  { title: "Classify the type", desc: "BEST · NOT/EXCEPT · ordering · role · distinction. Each has its own winning move." },
  { title: "Predict, then look", desc: "Decide what a seasoned professional would do before reading A–D. Anchoring resists bait." },
  { title: "Cut the obvious two", desc: "Absolutes, tech-only fixes, outsourced accountability, or the wrong stage." },
  { title: "Pick the proactive option", desc: "Between the final two, the more comprehensive, by-design answer usually wins." },
  { title: "Re-read the operative word", desc: "FIRST step? MOST effective? LEAST likely? The decision hides in one word." },
];

export const TYPE_PLAYBOOK: { type: QuestionType; label: string; move: string; trap: string }[] = [
  { type: "best", label: "Best / Most", move: "Choose the holistic, accountable option — balanced, cross-functional, by design.", trap: "Distractors are narrow, purely technical, or premature." },
  { type: "not", label: "NOT / Least", move: "Find the outlier: true but irrelevant, the wrong stage, or a law applied to the wrong purpose.", trap: "Three options belong together; one doesn't. Restate it that way." },
  { type: "ordering", label: "Ordering", move: "Understand before you act: purpose → applicable law → risks & gaps → controls. Governance before technical, always.", trap: "A sequence that opens with the tool, the data or the fix is usually wrong." },
  { type: "role", label: "Role ID", move: "Decides purposes and means = controller; acts on its instructions = processor. Builds and brands the AI = provider; uses it under own authority = deployer.", trap: "Overstepping flips the role: a processor that decides becomes a controller; a deployer that rebrands becomes a provider." },
  { type: "distinction", label: "Distinction", move: "If two options name near-neighbour concepts, the question IS the difference. Recite each definition.", trap: "Synonym bait: erasure ≠ restriction, transparency ≠ explainability." },
];

export const TRAP_WORDS = {
  wrong: ["all", "always", "never", "only", "entirely", "regardless", "exclusively", "guarantee", "eliminate", "delegate everything", "ignore the law", "most profitable", "after launch"],
  right: ["comprehensive", "cross-functional", "balanced", "proportionate", "proactive", "by design", "continuous", "documented", "human review", "risk-based"],
};

export const DECISION_RULES = [
  { rule: "People and process before tools", detail: "A cross-functional team and clear ownership come FIRST; audits and tooling follow." },
  { rule: "Bake it in early", detail: "Privacy, security and ethics by design and by default — never bolted on after launch." },
  { rule: "Balance, don't maximize", detail: "Minimization balanced with utility; innovation balanced with rights and oversight." },
  { rule: "Assess before, monitor after", detail: "Impact assessments come before launch; monitoring and review never stop." },
  { rule: "Money never wins", detail: "Cost or convenience never justifies keeping risky or unlawful processing running." },
  { rule: "Humans keep control", detail: "Human review before consequential decisions; people keep meaningful choice." },
];
