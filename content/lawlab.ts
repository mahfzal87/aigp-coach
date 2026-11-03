// Law Lab — mindmaps, trigger keywords, distinctions and traps for every law,
// framework and policy instrument on the AIGP exam. Built for the final cram:
// each leaf is one lockable fact. Current as of October 2026 (post-Digital-Omnibus).

import type { Confusable, LawMapDef } from "@/lib/lawlab-types";
import { totalLeaves } from "@/lib/lawlab-types";

// Canonical Law Lab types + helpers live in lib/lawlab-types.ts (shared by all
// exam packs); re-exported here for back-compat.
export { mapLeafKey, totalLeaves } from "@/lib/lawlab-types";
export type { Confusable, LawBranch, LawKind, LawMapDef, LawRegion } from "@/lib/lawlab-types";

export const LAW_MAPS: LawMapDef[] = [
  // ───────────────────────────── EU ─────────────────────────────
  {
    id: "eu-ai-act",
    name: "EU AI Act (Reg. 2024/1689)",
    short: "EU AI Act",
    kind: "Law",
    region: "EU",
    tagline: "The world's first comprehensive AI law — risk-based product regulation with CE marking.",
    weight: 3,
    branches: [
      {
        id: "tiers",
        t: "Risk tiers",
        leaves: [
          "Prohibited (Art 5) — unacceptable risk, banned since 2 Feb 2025",
          "High-risk — Annex I (product safety) + Annex III (8 sensitive areas)",
          "Transparency risk (Art 50) — chatbots, deepfakes, emotion recognition",
          "Minimal risk — no mandatory duties (most AI)",
          "Art 6(3) filter: narrow procedural task escapes high-risk — unless profiling",
        ],
      },
      {
        id: "prohibited",
        t: "Prohibited practices",
        leaves: [
          "Social scoring (public AND private actors)",
          "Exploiting vulnerabilities: age, disability, social/economic situation",
          "Untargeted scraping of facial images (web/CCTV)",
          "Emotion recognition in workplace & education (medical/safety excepted)",
          "Predictive policing based solely on profiling",
          "Real-time remote biometric ID in public by police — narrow exceptions",
          "Biometric categorization inferring race, beliefs, orientation",
        ],
      },
      {
        id: "roles",
        t: "Actor roles",
        leaves: [
          "Provider — develops & places on market under own name (heaviest duties)",
          "Deployer — uses under its own authority (use-side duties)",
          "Importer / distributor — supply-chain checking duties",
          "Art 25 role flip: rebrand, substantial modification, or repurpose to high-risk → YOU become provider",
        ],
      },
      {
        id: "provider",
        t: "Provider duties (high-risk)",
        leaves: [
          "Risk-management system across the whole lifecycle",
          "Data governance: relevant, representative, bias-examined data",
          "Technical documentation + automatic logging",
          "Human oversight by design · accuracy, robustness, cybersecurity",
          "Conformity assessment → EU declaration → CE mark → EU database",
          "Post-market monitoring + corrective actions (fix/withdraw/recall)",
          "Serious incidents → authority ≤15 days (10 if death, 2 if critical-infra scale)",
        ],
      },
      {
        id: "deployer",
        t: "Deployer duties (high-risk)",
        leaves: [
          "Follow instructions for use; assign competent human oversight",
          "Keep input data relevant & representative (where controlled)",
          "Monitor, suspend on risk, report incidents, keep logs",
          "Inform workers before workplace use; inform affected people",
          "FRIA — public bodies + private credit-scoring & insurance deployers",
        ],
      },
      {
        id: "gpai",
        t: "GPAI models",
        leaves: [
          "All providers: tech docs, info downstream, copyright policy, training-content summary",
          "Systemic risk presumed > 10²⁵ FLOPs training compute",
          "Systemic-risk extras: adversarial testing, incident reports, cybersecurity",
          "Code of Practice signature → presumption of conformity",
          "Open-source: partial exemptions — lost if systemic-risk",
        ],
      },
      {
        id: "timeline",
        t: "Timeline (post-Omnibus)",
        leaves: [
          "2 Feb 2025 — prohibitions + AI literacy",
          "2 Aug 2025 — GPAI rules, governance bodies, penalties",
          "2 Aug 2026 — Art 50 transparency (NOT deferred by the Omnibus)",
          "2 Dec 2026 — end of marking grace for LEGACY generative systems only",
          "2 Dec 2027 — Annex III high-risk (deferred from Aug 2026)",
          "2 Aug 2028 — Annex I embedded high-risk (deferred from Aug 2027)",
        ],
      },
      {
        id: "enforce",
        t: "Governance & penalties",
        leaves: [
          "AI Office (Commission) — enforces GPAI; European AI Board coordinates states",
          "National market-surveillance authorities enforce the rest",
          "€35M / 7% global turnover — prohibited practices",
          "€15M / 3% — most other duties (incl. GPAI) · €7.5M / 1% — wrong info",
          "SMEs & start-ups pay the LOWER of the two caps",
          "Each state: ≥1 regulatory sandbox",
        ],
      },
    ],
    keywords: [
      { term: "CE mark", cue: "EU AI Act conformity — product-safety DNA" },
      { term: "Annex III", cue: "the high-risk use-case list (hiring, credit, education, biometrics…)" },
      { term: "FRIA", cue: "deployer-side fundamental-rights impact assessment (public bodies + credit/insurance)" },
      { term: "10²⁵ FLOPs", cue: "GPAI systemic-risk presumption (EU — don't confuse with CA's 10²⁶)" },
      { term: "substantial modification", cue: "Art 25 — the deployer becomes the new provider" },
      { term: "presumption of conformity", cue: "harmonized standards or GPAI Code of Practice" },
      { term: "AI literacy", cue: "Art 4 — staff duty for providers AND deployers, live since Feb 2025" },
      { term: "regulatory sandbox", cue: "supervised testing space — every member state must offer one" },
      { term: "notified body", cue: "third-party conformity assessor — biometrics & Annex I products" },
    ],
    distinctions: [
      { vs: "GDPR", point: "AI Act regulates the SYSTEM on the market; GDPR regulates PERSONAL-DATA processing. Different roles, assessments, penalties." },
      { vs: "South Korea AI Basic Act", point: "EU demands third-party conformity for some systems; Korea is self-assessment only, tiny fines." },
      { vs: "CoE AI Convention", point: "AI Act = enforceable product regulation with fines; the Convention = treaty of principles implemented nationally." },
      { vs: "NIST AI RMF", point: "Binding law vs voluntary framework — the single most-tested contrast." },
    ],
    traps: [
      "\"What applies from 2 Aug 2026?\" → transparency (Art 50) — NOT Annex III high-risk (moved to 2 Dec 2027).",
      "Conformity route default is INTERNAL control (Annex VI); notified bodies are the exception (biometrics, Annex I).",
      "Social scoring is banned for private companies too — not just governments.",
      "Penalty tiers: 35/7 prohibited · 15/3 most · 7.5/1 misinformation — they love swapping these.",
    ],
  },
  {
    id: "gdpr",
    name: "GDPR applied to AI",
    short: "GDPR",
    kind: "Law",
    region: "EU",
    tagline: "The privacy backbone under every AI deployment that touches personal data.",
    weight: 3,
    branches: [
      {
        id: "art22",
        t: "Art 22 — automated decisions",
        leaves: [
          "Right not to be subject to a SOLELY automated decision…",
          "…with legal or similarly significant effects",
          "Exceptions: contract necessity · authorized by law · EXPLICIT consent",
          "Safeguards: human intervention, express your view, contest",
          "Token human 'rubber-stamping' ≠ meaningful involvement — still Art 22",
          "CJEU SCHUFA: a credit score itself can BE the decision",
        ],
      },
      {
        id: "principles",
        t: "Principles that bite on AI",
        leaves: [
          "Lawful basis needed for TRAINING and for USE — separately",
          "Purpose limitation — repurposing data for training needs a compatibility check",
          "Data minimization vs model hunger — 'collect everything' is never the answer",
          "Transparency: meaningful info on logic, significance, consequences",
          "Accuracy & storage limitation apply to training sets too",
        ],
      },
      {
        id: "tools",
        t: "Tools & gates",
        leaves: [
          "DPIA (Art 35) — mandatory for systematic evaluation/profiling with big effects",
          "Legitimate interests = 3-part test: purpose, necessity, balancing",
          "Special categories (health, biometrics for ID) need an Art 9 gate",
          "Data-subject rights (access, erasure, objection) reach training data",
          "Data protection by design & by default (Art 25) = PbD codified",
        ],
      },
    ],
    keywords: [
      { term: "solely automated", cue: "Art 22 trigger — meaningful human involvement takes you out of it" },
      { term: "explicit consent", cue: "an Art 22 exception — implied consent never qualifies" },
      { term: "DPIA", cue: "GDPR processing-risk assessment — seeds, but isn't, the AI impact assessment" },
      { term: "legitimate interests", cue: "the usual claimed basis for scraping/training — needs the balancing test" },
      { term: "purpose limitation", cue: "old data, new training purpose → compatibility problem" },
      { term: "SCHUFA", cue: "CJEU: the score itself is the automated decision" },
    ],
    distinctions: [
      { vs: "EU AI Act", point: "Controller/processor vs provider/deployer; DPIA vs FRIA; 20M/4% vs 35M/7% caps." },
      { vs: "FRIA", point: "DPIA = data-processing risks to data subjects; FRIA = fundamental-rights impact of USING a high-risk system." },
    ],
    traps: [
      "Art 22 needs BOTH solely-automated AND significant effect — a human-reviewed rejection isn't covered.",
      "Consent must be EXPLICIT for Art 22; ordinary consent isn't enough.",
      "Anonymized ≠ out of scope if individuals are re-identifiable from model outputs.",
    ],
  },
  // ───────────────────────────── US ─────────────────────────────
  {
    id: "us-federal",
    name: "US federal layer",
    short: "US federal law",
    kind: "Law",
    region: "US",
    tagline: "No comprehensive federal AI law — sectoral statutes and the FTC fill the space.",
    weight: 3,
    branches: [
      {
        id: "ftc",
        t: "FTC Act §5",
        leaves: [
          "Unfair OR deceptive acts — the catch-all for AI claims",
          "Deceptive: overstated AI capability claims ('AI washing')",
          "Unfair: undisclosed facial recognition, biased outcomes",
          "Algorithmic disgorgement — FTC can order the MODEL deleted",
          "Also the enforcement hook for Take It Down platform duties",
        ],
      },
      {
        id: "takedown",
        t: "TAKE IT DOWN Act (2025)",
        leaves: [
          "Criminalizes non-consensual intimate imagery — AI deepfakes included",
          "Platforms: notice-and-removal within 48 hours (+ identical copies)",
          "Signed 19 May 2025 · FTC platform enforcement since 19 May 2026",
          "The headline new US law in BoK v2.1",
        ],
      },
      {
        id: "employment",
        t: "Employment & housing",
        leaves: [
          "Title VII (EEOC) — disparate impact from AI hiring tools",
          "Four-fifths rule: selection rate <80% of top group = adverse-impact flag",
          "ADA — AI screening that filters out disability; accommodation duty",
          "Fair Housing Act — algorithmic tenant screening & ad targeting",
          "Employer stays liable even when the VENDOR built the tool",
        ],
      },
      {
        id: "credit",
        t: "Credit & consumer reports",
        leaves: [
          "FCRA — consumer reports by CRAs: adverse-action notice + dispute rights",
          "AI background/tenant-score vendors can BE consumer reporting agencies",
          "ECOA / Reg B — creditors must give SPECIFIC principal reasons for denial",
          "CFPB: a black-box model is no excuse for vague reasons",
        ],
      },
      {
        id: "naiia",
        t: "NAIIA (2020) — the trap",
        leaves: [
          "Coordinates federal AI R&D; creates the National AI Initiative Office",
          "Imposes NO private-sector duties, NO anti-bias guidance",
          "Anti-discrimination rules actually come from EEOC, FCRA, ADA, FHA",
        ],
      },
    ],
    keywords: [
      { term: "algorithmic disgorgement", cue: "FTC remedy — delete the model trained on ill-gotten data" },
      { term: "48 hours", cue: "Take It Down platform removal window (NCII + deepfakes)" },
      { term: "four-fifths rule", cue: "EEOC adverse-impact screen for selection tools" },
      { term: "adverse action notice", cue: "FCRA (reports) and ECOA (credit denials) — know which statute" },
      { term: "specific reasons", cue: "ECOA/Reg B — black box is no excuse" },
      { term: "deceptive", cue: "FTC §5 — unsubstantiated AI marketing claims" },
      { term: "NAIIA", cue: "R&D coordination only — the classic 'which law does NOT…' answer" },
    ],
    distinctions: [
      { vs: "State laws", point: "Federal = sectoral + enforcement-led; states carry the comprehensive AI statutes (CO, TX, CA, IL)." },
      { vs: "FCRA vs ECOA", point: "FCRA governs the consumer REPORT (CRA duties); ECOA governs the credit DECISION (creditor must state specific reasons)." },
    ],
    traps: [
      "NAIIA creates no duties for companies — don't pick it for compliance questions.",
      "The EEOC enforces Title VII/ADA against the EMPLOYER using the tool, not usually the vendor.",
      "Take It Down is federal and criminal — don't confuse with state deepfake or ELVIS-style likeness laws.",
    ],
  },
  {
    id: "colorado",
    name: "Colorado SB 26-189 (ADMT law)",
    short: "Colorado SB 26-189",
    kind: "Law",
    region: "US",
    tagline: "The repeal-and-replace: from the landmark AI Act to a consumer ADMT-transparency law.",
    weight: 3,
    branches: [
      {
        id: "story",
        t: "The story",
        leaves: [
          "SB 24-205 (the 'Colorado AI Act') was REPEALED before taking effect",
          "Replaced by SB 26-189, signed 14 May 2026",
          "Effective 1 Jan 2027",
        ],
      },
      {
        id: "scope",
        t: "Scope",
        leaves: [
          "ADMT = automated decision-making technology",
          "Covered when it MATERIALLY INFLUENCES a consequential decision",
          "Consequential: education, employment, lending, essential gov services, health care, housing, insurance, legal services",
          "Impact-based: duties attach regardless of intent",
        ],
      },
      {
        id: "duties",
        t: "Duties",
        leaves: [
          "Pre-decision consumer disclosure that ADMT is in play",
          "Post-adverse-outcome explanation",
          "Right to correct inaccurate personal data used",
          "Right to meaningful human review of adverse decisions",
        ],
      },
      {
        id: "enforce",
        t: "Enforcement",
        leaves: [
          "Attorney General ONLY — no private right of action",
          "Violation = deceptive trade practice",
          "60-day cure period, unless knowing or repeated",
        ],
      },
    ],
    keywords: [
      { term: "ADMT", cue: "Colorado's unit of regulation (and the CPPA's California term too)" },
      { term: "materially influences", cue: "Colorado's coverage trigger for consequential decisions" },
      { term: "consequential decision", cue: "the CO/old-CO list: jobs, credit, housing, health, insurance…" },
      { term: "60-day cure", cue: "Colorado & Texas both offer it — AG enforcement softener" },
      { term: "repealed", cue: "SB 24-205 never took effect — replaced by SB 26-189" },
    ],
    distinctions: [
      { vs: "Texas TRAIGA", point: "Colorado = impact-based (what happened); Texas = intent-based (what you meant). Both AG-only with cure periods." },
      { vs: "EU AI Act", point: "No risk tiers, no conformity assessment, no registry — disclosure + explanation + human-review rights instead." },
      { vs: "Old SB 24-205", point: "Old law: developer/deployer reasonable care + impact assessments. New law: consumer transparency rights. Know which one a question describes." },
    ],
    traps: [
      "A question describing 'developer duty of reasonable care against algorithmic discrimination' is the REPEALED law — flag the repeal.",
      "Effective dates: TRAIGA 1 Jan 2026, SB 26-189 1 Jan 2027 — one year apart.",
      "No private lawsuits under either CO or TX AI law — AG only.",
    ],
  },
  {
    id: "texas",
    name: "Texas TRAIGA",
    short: "Texas TRAIGA",
    kind: "Law",
    region: "US",
    tagline: "Intent-based prohibitions plus government-use rules — effective 1 Jan 2026.",
    weight: 2,
    branches: [
      {
        id: "scope",
        t: "Scope & posture",
        leaves: [
          "Effective 1 Jan 2026 — applies to those doing business in Texas",
          "INTENT-based: liability needs purpose, not just disparate outcome",
          "Disparate impact alone is NOT a violation (the Texas signature)",
        ],
      },
      {
        id: "bans",
        t: "Prohibitions",
        leaves: [
          "Developing/deploying AI with intent to incite self-harm or crime",
          "Intentional unlawful discrimination",
          "Government: social scoring banned",
          "Government: biometric ID from public sources without consent",
        ],
      },
      {
        id: "machinery",
        t: "Machinery",
        leaves: [
          "AG enforcement + civil penalties · 60-day cure",
          "Regulatory sandbox program",
          "Texas AI Council oversight",
        ],
      },
    ],
    keywords: [
      { term: "intent-based", cue: "Texas asks what you MEANT — the contrast with Colorado" },
      { term: "sandbox (US)", cue: "TRAIGA and Utah both run AI sandboxes" },
      { term: "social scoring (state)", cue: "TRAIGA bans it for Texas GOVERNMENT — EU bans it for everyone" },
    ],
    distinctions: [
      { vs: "Colorado SB 26-189", point: "Intent vs impact; 2026 vs 2027; prohibitions vs transparency rights." },
      { vs: "EU AI Act", point: "TRAIGA's social-scoring ban is government-only; the EU ban covers private actors too." },
    ],
    traps: [
      "A biased-outcome-without-intent scenario in Texas → likely NOT a TRAIGA violation. Pick federal Title VII instead.",
    ],
  },
  {
    id: "california",
    name: "California trio (SB 53 · AB 2013 · SB 942)",
    short: "California AI laws",
    kind: "Law",
    region: "US",
    tagline: "Frontier safety, training-data transparency, and content provenance — three different laws.",
    weight: 3,
    branches: [
      {
        id: "sb53",
        t: "SB 53 — frontier models (TFAIA)",
        leaves: [
          "First US frontier-model law · effective 1 Jan 2026",
          "Covers models trained with > 10²⁶ computational operations",
          "Fuller duties above $500M annual revenue",
          "Publish a safety framework + transparency reports at deployment",
          "Catastrophic-risk incidents → Cal OES ≤15 days (24h if imminent)",
          "Up to $1M per violation + whistleblower protections",
        ],
      },
      {
        id: "ab2013",
        t: "AB 2013 — training data",
        leaves: [
          "Generative-AI developers publish training-dataset summaries",
          "Effective 1 Jan 2026 — reaches back to systems released since Jan 2022",
          "Posted publicly on the developer's website",
        ],
      },
      {
        id: "sb942",
        t: "SB 942 — content provenance",
        leaves: [
          "Large gen-AI providers: latent (hidden) disclosures in AI content",
          "Free public AI-detection tool",
          "Phasing in through 2026",
        ],
      },
      {
        id: "radar",
        t: "Also on the radar",
        leaves: [
          "CPPA ADMT regs — notice, opt-out & access rights for significant automated decisions",
          "CCPA risk assessments for high-risk processing (phasing 2027+)",
        ],
      },
    ],
    keywords: [
      { term: "10²⁶ operations", cue: "California SB 53 frontier threshold (EU's GPAI line is 10²⁵)" },
      { term: "safety framework", cue: "SB 53 publication duty for frontier developers" },
      { term: "Cal OES", cue: "where SB 53 catastrophic incidents get reported" },
      { term: "training-data summary", cue: "AB 2013 — public dataset documentation" },
      { term: "latent disclosure", cue: "SB 942 — hidden provenance marks + free detector" },
    ],
    distinctions: [
      { vs: "EU GPAI rules", point: "SB 53 targets catastrophic frontier risk at 10²⁶ ops; EU GPAI systemic tier starts at 10²⁵ FLOPs with broader duties." },
      { vs: "Each other", point: "SB 53 = model safety · AB 2013 = training-data transparency · SB 942 = output provenance. Match the duty to the statute." },
    ],
    traps: [
      "Swapping 10²⁵ (EU) and 10²⁶ (California) is a deliberate distractor — EU is the lower bar.",
      "AB 2013 is retroactive to 2022 releases — 'only new systems' is wrong.",
    ],
  },
  {
    id: "employment-ai",
    name: "Employment AI: NYC LL144 + Illinois",
    short: "NYC LL144 / Illinois",
    kind: "Law",
    region: "US",
    tagline: "The hiring-tools cluster — audits, notices, consent, and a biometrics litigation engine.",
    weight: 3,
    branches: [
      {
        id: "ll144",
        t: "NYC Local Law 144",
        leaves: [
          "AEDT = automated employment decision tool",
          "Annual INDEPENDENT bias audit (impact ratios by sex & race/ethnicity)",
          "Publish audit summary + distribution date on the website",
          "Notify NYC candidates ≥10 business days before use",
          "Daily per-violation civil penalties",
        ],
      },
      {
        id: "hb3773",
        t: "Illinois HB 3773",
        leaves: [
          "Amends the Illinois Human Rights Act · effective 1 Jan 2026",
          "AI discrimination in any employment decision = civil-rights violation",
          "ZIP code as a proxy for protected class — expressly barred",
          "Employers must NOTIFY workers when AI is used",
        ],
      },
      {
        id: "aivia",
        t: "IL AI Video Interview Act",
        leaves: [
          "Consent + explanation before AI analyzes video interviews",
          "Delete videos within 30 days on request",
          "Demographic reporting if AI alone screens out candidates",
        ],
      },
      {
        id: "bipa",
        t: "Illinois BIPA",
        leaves: [
          "Written informed consent BEFORE collecting biometrics",
          "PRIVATE right of action — the litigation engine ($1k/$5k per violation)",
          "Applies to voiceprints, face geometry, fingerprints at work",
        ],
      },
    ],
    keywords: [
      { term: "AEDT", cue: "NYC LL144's regulated unit — automated employment decision tool" },
      { term: "bias audit", cue: "LL144 — annual, independent, results published" },
      { term: "10 business days", cue: "LL144 candidate notice window" },
      { term: "ZIP code proxy", cue: "Illinois HB 3773's signature prohibition" },
      { term: "private right of action", cue: "BIPA's teeth — most AI laws are AG-only" },
    ],
    distinctions: [
      { vs: "Each other", point: "LL144 = audit + notice (city, 2023); HB 3773 = discrimination ban under civil-rights law (state, 2026); AIVIA = video-interview consent; BIPA = biometrics." },
      { vs: "Colorado", point: "Employment is just ONE consequential-decision category in Colorado; these laws are employment-specific." },
    ],
    traps: [
      "LL144 requires an independent auditor — an internal review doesn't satisfy it.",
      "BIPA is the rare US AI-adjacent law with private lawsuits — don't transplant that to CO/TX.",
    ],
  },
  // ─────────────────────────── APAC ───────────────────────────
  {
    id: "sk-basic-act",
    name: "South Korea AI Basic Act",
    short: "Korea AI Basic Act",
    kind: "Law",
    region: "APAC",
    tagline: "The world's second comprehensive AI law — innovation-first, self-assessment, tiny fines.",
    weight: 3,
    branches: [
      {
        id: "concepts",
        t: "Core concepts",
        leaves: [
          "'HIGH-IMPACT AI' — deliberately not 'high-risk'",
          "Significantly affects life, safety, or fundamental rights",
          "Healthcare, energy, transport, hiring, biometrics, loans, public services",
          "Effective 22 Jan 2026 · regulator: MSIT",
        ],
      },
      {
        id: "duties",
        t: "Operator duties",
        leaves: [
          "SELF-assess high-impact status before deployment",
          "Meaningful explanation of outcomes",
          "User-protection plan + human oversight mechanism",
          "Generative AI: notify users + label/watermark outputs",
          "Foreign operators above thresholds: appoint a DOMESTIC representative",
        ],
      },
      {
        id: "contrast",
        t: "Enforcement posture",
        leaves: [
          "NO mandatory third-party conformity assessment",
          "Fines cap ≈ ₩30M — orders of magnitude below the EU",
          "AI Safety Institute · first-year enforcement grace through 2026",
        ],
      },
    ],
    keywords: [
      { term: "high-impact AI", cue: "Korea's term — if the stem says it, think Seoul not Brussels" },
      { term: "domestic representative", cue: "Korea's hook on foreign AI operators" },
      { term: "MSIT", cue: "Korea's AI regulator (Ministry of Science & ICT)" },
      { term: "self-assessment", cue: "Korea's conformity posture — no notified bodies" },
    ],
    distinctions: [
      { vs: "EU AI Act", point: "High-impact vs high-risk; self-assessment vs conformity assessment; ₩30M vs €35M/7%; both label AI content." },
    ],
    traps: [
      "'High-impact' is Korea's word; 'high-risk' is the EU's. The stem's vocabulary tells you the jurisdiction.",
      "Korea still has generative-AI labeling — light-touch ≠ no duties.",
    ],
  },
  {
    id: "world-radar",
    name: "Rest-of-world radar",
    short: "Rest of world",
    kind: "Law",
    region: "Global",
    tagline: "One-line identities for the jurisdictions that appear as distractors.",
    weight: 1,
    branches: [
      {
        id: "lines",
        t: "One-liners",
        leaves: [
          "UK — principles-based; existing regulators; NO horizontal AI statute",
          "China — labeling + deep-synthesis + gen-AI measures; algorithm filing",
          "Japan — AI Promotion Act (2025): light-touch, no penalties",
          "Canada — AIDA DIED with Parliament's prorogation (Jan 2025)",
          "Brazil — PL 2338 risk-based bill: passed Senate, still pending",
          "Singapore — Model AI Governance Framework + AI Verify (voluntary)",
        ],
      },
    ],
    keywords: [
      { term: "pro-innovation", cue: "UK's white-paper posture — regulators, not a statute" },
      { term: "AI Verify", cue: "Singapore's voluntary testing toolkit" },
      { term: "AIDA", cue: "Canada's failed bill — status questions expect 'did not pass'" },
    ],
    distinctions: [
      { vs: "EU/Korea", point: "Only the EU and South Korea have comprehensive AI LAWS in force — everyone else is sectoral, voluntary, or pending." },
    ],
    traps: [
      "A question listing countries with binding comprehensive AI laws: EU + South Korea. Not UK, not Japan, not Canada.",
    ],
  },
  // ────────────────────── Frameworks & standards ──────────────────────
  {
    id: "nist",
    name: "NIST AI RMF 1.0",
    short: "NIST AI RMF",
    kind: "Framework",
    region: "US",
    tagline: "The voluntary US risk framework — four functions, seven trustworthy characteristics.",
    weight: 3,
    branches: [
      {
        id: "functions",
        t: "Four functions",
        leaves: [
          "GOVERN — culture, policies, roles; cross-cutting, feeds the other three",
          "MAP — establish context, IDENTIFY risks",
          "MEASURE — ASSESS, analyze, TRACK risks",
          "MANAGE — PRIORITIZE and ACT (mitigate, respond, recover)",
        ],
      },
      {
        id: "chars",
        t: "7 trustworthy characteristics",
        leaves: [
          "Valid & reliable — the PRECONDITION for the rest",
          "Safe · Secure & resilient",
          "Explainable & interpretable · Privacy-enhanced",
          "Fair — with harmful bias managed",
          "Accountable & transparent — cross-cutting",
          "'Profitable' is NEVER one — recurring NOT-question answer",
        ],
      },
      {
        id: "nature",
        t: "Nature",
        leaves: [
          "Voluntary, sector-agnostic, outcome-based",
          "Org sets its own risk tolerance — NIST doesn't",
          "Socio-technical: risks come from the system + people + context",
        ],
      },
      {
        id: "companions",
        t: "Companions",
        leaves: [
          "Playbook — suggested actions per subcategory",
          "Generative AI Profile (AI 600-1) — GenAI risks layered on the RMF",
          "ARIA — Assessing Risks and Impacts of AI",
        ],
      },
    ],
    keywords: [
      { term: "GOVERN / MAP / MEASURE / MANAGE", cue: "identify=MAP, track=MEASURE, act=MANAGE, culture=GOVERN" },
      { term: "valid & reliable", cue: "the foundation characteristic — without it nothing else counts" },
      { term: "GenAI Profile", cue: "NIST AI 600-1 — generative-risk overlay" },
      { term: "risk tolerance", cue: "set by the ORGANIZATION, never by the framework" },
    ],
    distinctions: [
      { vs: "ISO/IEC 42001", point: "RMF = non-certifiable risk framework; 42001 = certifiable management-system standard. 'Prove it to customers' → 42001." },
      { vs: "EU AI Act", point: "Voluntary vs binding — using the RMF never satisfies EU conformity by itself." },
    ],
    traps: [
      "MAP vs MEASURE: identifying a NEW risk is MAP; quantifying/tracking a known one is MEASURE.",
      "GOVERN isn't a phase you finish — it runs across everything.",
    ],
  },
  {
    id: "iso",
    name: "ISO/IEC AI standards family",
    short: "ISO standards",
    kind: "Standard",
    region: "Global",
    tagline: "Know which number does which job — that's the whole exam game here.",
    weight: 2,
    branches: [
      {
        id: "trio",
        t: "The BoK trio",
        leaves: [
          "22989 — AI concepts & terminology (the vocabulary)",
          "42001 — AI management system (AIMS); CERTIFIABLE; PDCA",
          "42005 — AI system IMPACT assessment guidance",
        ],
      },
      {
        id: "adjacent",
        t: "Adjacent numbers",
        leaves: [
          "23894 — AI risk management (ISO 31000 adapted to AI)",
          "23053 — ML framework description",
          "42006 — requirements for bodies that audit/certify an AIMS",
          "EN 18286 — European harmonized QMS supporting EU AI Act conformity",
        ],
      },
      {
        id: "which",
        t: "Which one when",
        leaves: [
          "Certify your governance program → 42001",
          "Assess societal/individual impact → 42005",
          "Shared vocabulary across teams → 22989",
          "Stand up a risk process → 23894",
        ],
      },
    ],
    keywords: [
      { term: "AIMS", cue: "42001's unit — the 'ISO 27001 of AI', third-party certifiable" },
      { term: "Plan-Do-Check-Act", cue: "42001's cycle (management-system DNA)" },
      { term: "22989", cue: "terminology — definitions questions" },
      { term: "42005", cue: "impact assessment — not certification, guidance" },
    ],
    distinctions: [
      { vs: "NIST AI RMF", point: "ISO = international, certifiable (42001); NIST = US-origin framework, no certification." },
      { vs: "Within the family", point: "42001 manage · 42005 assess impact · 23894 manage risk · 22989 define terms." },
    ],
    traps: [
      "Only 42001 is certifiable — 23894 and 42005 are guidance.",
      "42006 certifies the AUDITORS, not your company.",
    ],
  },
  {
    id: "oecd",
    name: "OECD AI Principles",
    short: "OECD Principles",
    kind: "Principles",
    region: "Global",
    tagline: "The definitional bedrock — 2019, updated 2024, borrowed by the EU AI Act.",
    weight: 2,
    branches: [
      {
        id: "values",
        t: "5 values-based principles",
        leaves: [
          "Inclusive growth, sustainable development & well-being",
          "Human-centered values & fairness (human rights, rule of law)",
          "Transparency & explainability",
          "Robustness, security & safety",
          "Accountability",
        ],
      },
      {
        id: "recs",
        t: "5 recommendations to governments",
        leaves: [
          "Invest in AI R&D",
          "Foster an inclusive AI ecosystem (data, compute, tech)",
          "Shape an enabling, interoperable governance environment",
          "Build human capacity; prepare the labor transition",
          "International cooperation on trustworthy AI",
        ],
      },
      {
        id: "legacy",
        t: "Why it matters",
        leaves: [
          "First intergovernmental AI standard (2019) · 47 adherents incl. non-members",
          "2024 update: misinformation/safety + refreshed AI-system definition",
          "The EU AI Act borrowed the OECD's AI-system definition",
          "Principles say WHY; frameworks (NIST, ISO) say HOW",
        ],
      },
    ],
    keywords: [
      { term: "intergovernmental", cue: "OECD — first such AI standard, non-binding" },
      { term: "AI-system definition", cue: "OECD's wording, adopted by the EU AI Act" },
      { term: "inclusive growth", cue: "the 'least relevant' answer in most security/vendor scenarios" },
    ],
    distinctions: [
      { vs: "UNESCO Recommendation", point: "OECD = 47 adherents, principles for policy; UNESCO = 194 states, ethics recommendation (2021)." },
      { vs: "CoE Convention", point: "OECD is soft law; the Convention is a binding treaty." },
    ],
    traps: [
      "'Least relevant OECD principle' questions: match the scenario's theme — the odd one out is usually inclusive growth & well-being.",
    ],
  },
  {
    id: "coe",
    name: "Council of Europe AI Convention",
    short: "CoE AI Convention",
    kind: "Treaty",
    region: "Global",
    tagline: "The first legally binding INTERNATIONAL treaty on AI — principles, not product rules.",
    weight: 2,
    branches: [
      {
        id: "facts",
        t: "Core facts",
        leaves: [
          "First binding international AI treaty · opened for signature 5 Sep 2024",
          "Protects human rights, democracy, and the RULE OF LAW",
          "Signatories include the EU, US, UK, Israel — beyond Europe",
          "Covers the full AI lifecycle",
        ],
      },
      {
        id: "scope",
        t: "Scope mechanics",
        leaves: [
          "Binds PUBLIC authorities + private actors acting for them",
          "For other private actors, states choose how to apply it (declaration)",
          "No fines of its own — implemented through national law",
          "HUDERIA — its risk-and-impact assessment methodology",
        ],
      },
    ],
    keywords: [
      { term: "rule of law", cue: "the Convention's triad: human rights, democracy, rule of law" },
      { term: "HUDERIA", cue: "CoE's human-rights risk assessment methodology" },
      { term: "first binding treaty", cue: "CoE Convention — the EU AI Act is a law, not a treaty" },
    ],
    distinctions: [
      { vs: "EU AI Act", point: "Treaty of principles vs enforceable regulation; worldwide signatories vs EU market; no penalty tiers vs €35M/7%." },
    ],
    traps: [
      "'First binding international AI instrument' = CoE Convention. The EU AI Act is the first comprehensive AI LAW — different superlatives.",
    ],
  },
  // ─────────────────────── Doctrine & org policy ───────────────────────
  {
    id: "pbd-fips",
    name: "Privacy by Design & the FIPs",
    short: "PbD / FIPs",
    kind: "Principles",
    region: "Global",
    tagline: "The doctrine modern privacy statutes codify — and exam stems quietly test.",
    weight: 2,
    branches: [
      {
        id: "pbd",
        t: "PbD (Cavoukian, 7)",
        leaves: [
          "Proactive not reactive",
          "Privacy as the DEFAULT setting",
          "Privacy embedded into design",
          "Full functionality — positive-sum, not zero-sum",
          "End-to-end security · visibility & transparency · respect for the user",
          "Codified as GDPR Art 25 (data protection by design & default)",
        ],
      },
      {
        id: "fips",
        t: "FIPs",
        leaves: [
          "Notice/openness · choice/consent",
          "Collection limitation (minimization) · use limitation",
          "Data quality · security safeguards · accountability",
          "Over-collection → minimization breach; re-purposing → use-limitation breach",
        ],
      },
    ],
    keywords: [
      { term: "default setting", cue: "PbD — the strictest privacy option ships ON" },
      { term: "positive-sum", cue: "PbD — privacy AND functionality, not a trade-off" },
      { term: "use limitation", cue: "FIP violated when data is repurposed for training" },
    ],
    distinctions: [
      { vs: "GDPR", point: "PbD/FIPs are the doctrine; GDPR is the statute that made them enforceable." },
    ],
    traps: [
      "Map the violation to the right FIP: collecting too much = collection limitation; new purpose = use limitation — not 'transparency' for everything.",
    ],
  },
  {
    id: "asilomar",
    name: "Asilomar AI Principles",
    short: "Asilomar",
    kind: "Principles",
    region: "Global",
    tagline: "2017, Future of Life Institute — cited in user-choice and explanation scenarios.",
    weight: 1,
    branches: [
      {
        id: "cluster",
        t: "The exam cluster",
        leaves: [
          "Human control — humans choose whether/how to delegate decisions",
          "Failure transparency — harm must have an ascertainable reason",
          "Personal privacy — people control data AI derives about them",
          "Judicial transparency — judicial decisions need auditable explanations",
        ],
      },
    ],
    keywords: [
      { term: "human control", cue: "Asilomar — the delegate-or-not principle" },
      { term: "failure transparency", cue: "Asilomar — if it harms, we must know why" },
    ],
    distinctions: [
      { vs: "OECD", point: "Asilomar = civil-society principles (2017); OECD = intergovernmental standard (2019)." },
    ],
    traps: [
      "Auto-deciding for users without explanation violates human control + failure transparency + personal privacy TOGETHER — multi-select bait.",
    ],
  },
  {
    id: "org-policy",
    name: "The org AI policy stack",
    short: "Org AI policy",
    kind: "Policy",
    region: "Org",
    tagline: "Competency I.C — your weakest policy front: governance inside the organization.",
    weight: 3,
    branches: [
      {
        id: "arch",
        t: "Policy architecture",
        leaves: [
          "Principles → policies → standards → procedures (top-down hierarchy)",
          "AI policy contents: scope, definitions, acceptable & prohibited uses",
          "Roles & RACI · lifecycle gates · exceptions process",
          "Exam default: UPDATE existing policies before writing new ones",
        ],
      },
      {
        id: "existing",
        t: "Policies to update for AI",
        leaves: [
          "Privacy & data governance · security",
          "Procurement & third-party risk",
          "HR / acceptable use · records & retention",
          "Incident response — extended to AI incidents",
        ],
      },
      {
        id: "foundations",
        t: "Program foundations",
        leaves: [
          "AI inventory/registry FIRST — you can't govern what you can't see",
          "Intake + risk-tiering gate for every new use case",
          "Cross-functional governance committee + executive sponsor",
          "Role-based training & awareness (AI literacy)",
          "Document decisions: model cards, impact assessments, decision logs",
        ],
      },
      {
        id: "tprm",
        t: "Third-party / vendor",
        leaves: [
          "Vendor due diligence BEFORE contract — evals, bias tests, security",
          "Contract clauses: audit rights, data-use limits, model-change notice",
          "Require documentation (model cards) from vendors",
          "You remain accountable for vendor AI you deploy",
        ],
      },
    ],
    keywords: [
      { term: "inventory first", cue: "the standard 'what do we do FIRST' answer for new programs" },
      { term: "update existing policies", cue: "IAPP's preferred answer over 'create a new policy'" },
      { term: "cross-functional", cue: "governance committees — legal + tech + business, never one team" },
      { term: "model-change notice", cue: "the vendor clause exam scenarios reward" },
    ],
    distinctions: [
      { vs: "External law", point: "Laws set the floor; the policy stack is how the org operationalizes them — questions ask which LAYER fails." },
    ],
    traps: [
      "'Write a brand-new AI policy' usually loses to 'update existing policies + add an AI policy where gaps remain'.",
      "Accountability can't be outsourced — vendor AI is still your deployment.",
    ],
  },
];

// ───────────────────────── Confusables (side-by-sides) ─────────────────────────

export const CONFUSABLES: Confusable[] = [
  {
    id: "aiact-gdpr",
    a: "EU AI Act",
    b: "GDPR",
    rows: [
      { dim: "Regulates", a: "AI systems on the EU market", b: "Processing of personal data" },
      { dim: "Key roles", a: "Provider / deployer", b: "Controller / processor" },
      { dim: "Assessment", a: "Conformity assessment + FRIA", b: "DPIA" },
      { dim: "Max fine", a: "€35M / 7%", b: "€20M / 4%" },
      { dim: "Badge", a: "CE mark", b: "Lawful basis" },
    ],
    tell: "Ask what's being regulated: the SYSTEM → AI Act; the DATA → GDPR. Many deployments need both.",
  },
  {
    id: "provider-deployer",
    a: "Provider (EU)",
    b: "Deployer (EU)",
    rows: [
      { dim: "Who", a: "Develops & places on market under own name", b: "Uses the system under own authority" },
      { dim: "Core duties", a: "Risk mgmt, data governance, docs, conformity, CE", b: "Follow instructions, oversight, monitor, inform people" },
      { dim: "Impact duty", a: "Conformity assessment", b: "FRIA (public bodies, credit, insurance)" },
      { dim: "Can flip?", a: "—", b: "Yes — rebrand/modify/repurpose → becomes provider (Art 25)" },
    ],
    tell: "Fine-tuning + rebranding a high-risk system makes the deployer the new provider — the most-tested flip.",
  },
  {
    id: "tiers",
    a: "Prohibited (Art 5)",
    b: "High-risk vs transparency",
    rows: [
      { dim: "Prohibited", a: "Banned outright since Feb 2025 (social scoring, manipulation…)", b: "—" },
      { dim: "High-risk", a: "—", b: "Allowed WITH controls: conformity, oversight, logging (Annex III from Dec 2027)" },
      { dim: "Transparency", a: "—", b: "Just disclose: chatbots, deepfakes, emotion recognition (Art 50, Aug 2026)" },
    ],
    tell: "Emotion recognition: in workplace/education it's PROHIBITED; elsewhere it's a transparency duty.",
  },
  {
    id: "nist-iso",
    a: "NIST AI RMF",
    b: "ISO/IEC 42001",
    rows: [
      { dim: "What", a: "Voluntary risk framework", b: "Management-system standard (AIMS)" },
      { dim: "Certifiable", a: "No", b: "Yes — third-party certification" },
      { dim: "Structure", a: "GOVERN · MAP · MEASURE · MANAGE", b: "PDCA + Annex A controls" },
      { dim: "Pick when", a: "Build internal risk practice", b: "Prove governance to customers/regulators" },
    ],
    tell: "'Demonstrate to external parties' → 42001. 'Structure our risk thinking' → NIST RMF.",
  },
  {
    id: "iso-family",
    a: "ISO 42001",
    b: "ISO 23894 / 42005 / 22989",
    rows: [
      { dim: "42001", a: "Run the AI management system (certifiable)", b: "—" },
      { dim: "23894", a: "—", b: "Risk-management guidance (31000 adapted)" },
      { dim: "42005", a: "—", b: "Impact-assessment guidance" },
      { dim: "22989", a: "—", b: "Concepts & terminology" },
    ],
    tell: "Only 42001 certifies. Impact → 42005. Risk process → 23894. Definitions → 22989.",
  },
  {
    id: "eu-korea",
    a: "EU AI Act",
    b: "Korea AI Basic Act",
    rows: [
      { dim: "Label", a: "High-RISK", b: "High-IMPACT" },
      { dim: "Conformity", a: "Assessment (sometimes notified body)", b: "Self-assessment only" },
      { dim: "Fines", a: "Up to €35M / 7%", b: "≈ ₩30M" },
      { dim: "Posture", a: "Rights-protective", b: "Innovation-first (+ grace year)" },
    ],
    tell: "The stem's vocabulary is the giveaway: 'high-impact' = Korea, 'high-risk' = EU.",
  },
  {
    id: "co-tx",
    a: "Colorado SB 26-189",
    b: "Texas TRAIGA",
    rows: [
      { dim: "Standard", a: "IMPACT-based (what happened)", b: "INTENT-based (what you meant)" },
      { dim: "Effective", a: "1 Jan 2027", b: "1 Jan 2026" },
      { dim: "Core", a: "ADMT disclosures, explanation, human review", b: "Prohibitions + government-use rules" },
      { dim: "Enforcement", a: "AG only · 60-day cure", b: "AG only · 60-day cure · sandbox" },
    ],
    tell: "Biased outcome without intent: potentially a Colorado problem, NOT a Texas one.",
  },
  {
    id: "ll144-il",
    a: "NYC Local Law 144",
    b: "Illinois HB 3773",
    rows: [
      { dim: "Level", a: "City ordinance (2023)", b: "State civil-rights law (1 Jan 2026)" },
      { dim: "Mechanism", a: "Annual independent bias audit + publish + 10-day notice", b: "AI discrimination = IHRA violation; ZIP-proxy ban; notice" },
      { dim: "Scope", a: "AEDTs for NYC hires/promotions", b: "All employment decisions in Illinois" },
    ],
    tell: "Audit-and-notice = NYC. Discrimination-ban-under-civil-rights-law = Illinois.",
  },
  {
    id: "fcra-ecoa",
    a: "FCRA",
    b: "ECOA / Reg B",
    rows: [
      { dim: "Governs", a: "Consumer REPORTS by reporting agencies", b: "CREDIT decisions by creditors" },
      { dim: "AI angle", a: "AI screening/score vendors can be CRAs", b: "Black-box denial still needs SPECIFIC reasons" },
      { dim: "Duty", a: "Adverse-action notice + accuracy + dispute rights", b: "Statement of specific principal reasons" },
    ],
    tell: "Report used → FCRA. Credit denied → ECOA. A lender using a report can owe both.",
  },
  {
    id: "soft-law",
    a: "OECD vs UNESCO",
    b: "vs CoE Convention",
    rows: [
      { dim: "OECD (2019/2024)", a: "Intergovernmental principles · 47 adherents", b: "Non-binding" },
      { dim: "UNESCO (2021)", a: "Ethics recommendation · 194 states", b: "Non-binding" },
      { dim: "CoE (2024)", a: "Treaty — human rights, democracy, rule of law", b: "BINDING on parties" },
    ],
    tell: "Only one is binding: the Council of Europe Convention. OECD defined the terms; UNESCO has the headcount.",
  },
  {
    id: "flops",
    a: "10²⁵ FLOPs",
    b: "10²⁶ operations",
    rows: [
      { dim: "Jurisdiction", a: "EU AI Act", b: "California SB 53" },
      { dim: "Triggers", a: "GPAI systemic-risk presumption", b: "Frontier-model coverage (TFAIA)" },
      { dim: "Consequence", a: "Adversarial testing, incident reports, cybersecurity", b: "Safety framework, transparency reports, Cal OES reporting" },
    ],
    tell: "EU's bar is LOWER (10²⁵). California's frontier line is 10× higher (10²⁶).",
  },
  {
    id: "dpia-fria",
    a: "DPIA (GDPR)",
    b: "FRIA (AI Act)",
    rows: [
      { dim: "Assesses", a: "Risks of data processing to data subjects", b: "Fundamental-rights impact of USING a high-risk system" },
      { dim: "Who", a: "Controller", b: "Deployer (public bodies + credit/insurance)" },
      { dim: "When", a: "Before high-risk processing", b: "Before first use of the system" },
    ],
    tell: "Same spirit, different statute and role. A deployer may need both — the FRIA can build on the DPIA.",
  },
];

export const LAWLAB_TOTAL = LAW_MAPS.reduce((n, m) => n + totalLeaves(m), 0);
