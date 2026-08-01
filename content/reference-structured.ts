// Structured, scannable reference data (facts, distinctions, timeline, penalties).

export type FactTag = "EU" | "US & global" | "Frameworks" | "Develop" | "Deploy";

export const FACTS: { n: number; fact: string; tag: FactTag }[] = [
  { n: 1, fact: "EU AI Act risk tiers: Prohibited > High-risk > Limited/transparency > Minimal — risk attaches to the USE, not the tech.", tag: "EU" },
  { n: 2, fact: "Untargeted facial-image scraping = PROHIBITED (Art. 5), not merely high-risk. Recruitment, credit, education = high-risk (Annex III).", tag: "EU" },
  { n: 3, fact: "Penalties: €35M/7% (prohibited) · €15M/3% (most obligations + GPAI) · €7.5M/1% (false info). SMEs pay the LOWER cap.", tag: "EU" },
  { n: 4, fact: "Transparency timing: tell users it's AI at the FIRST interaction, in advance — never after.", tag: "EU" },
  { n: 5, fact: "Provider develops + places on market under its name; deployer uses under its own authority.", tag: "EU" },
  { n: 6, fact: "Rebrand, substantial modification, or purpose change to high-risk ⇒ the deployer BECOMES the provider (Art. 25).", tag: "EU" },
  { n: 7, fact: "GPAI systemic-risk presumption: training compute > 10²⁵ FLOPs. Code of Practice ⇒ presumption of conformity.", tag: "EU" },
  { n: 8, fact: "Post-Omnibus dates: transparency 2 Aug 2026 (unchanged) · Annex III high-risk 2 Dec 2027 · Annex I 2 Aug 2028.", tag: "EU" },
  { n: 9, fact: "FRIA is a DEPLOYER duty — public bodies plus private credit-scoring and life/health-insurance deployers.", tag: "EU" },
  { n: 10, fact: "South Korea AI Basic Act (eff. 22 Jan 2026): 'high-impact' not 'high-risk'; NO mandatory third-party conformity assessment; domestic rep for foreign operators; fines ≤ ₩30M.", tag: "US & global" },
  { n: 11, fact: "Take It Down Act: NCII incl. AI deepfakes; platforms remove within 48 hours; FTC enforcement since 19 May 2026.", tag: "US & global" },
  { n: 12, fact: "NAIIA = federal AI R&D coordination. It provides NO anti-discrimination guidance — the perennial 'LEAST likely' answer.", tag: "US & global" },
  { n: 13, fact: "Colorado repealed its AI Act pre-effect; SB 26-189 (eff. 1 Jan 2027) covers ADMT that materially influences consequential decisions — AG-only enforcement.", tag: "US & global" },
  { n: 14, fact: "Texas TRAIGA (eff. 1 Jan 2026) is intent-based; Colorado SB 189 is impact/transparency-based. Favorite contrast.", tag: "US & global" },
  { n: 15, fact: "GDPR Art. 22 exceptions: contract necessity / authorizing law / EXPLICIT consent. Remedy = redress (human review, express view, contest).", tag: "US & global" },
  { n: 16, fact: "NIST AI RMF: GOVERN (culture, informs the rest) · MAP (context, identify) · MEASURE (assess, track) · MANAGE (prioritize, act). Voluntary.", tag: "Frameworks" },
  { n: 17, fact: "NIST trustworthy-AI: valid & reliable · safe · secure & resilient · explainable & interpretable · privacy-enhanced · fair · accountable & transparent. ('Profitable' is never one.)", tag: "Frameworks" },
  { n: 18, fact: "ISO 22989 = terminology · 42001 = certifiable AI management system · 42005 = AI impact assessment.", tag: "Frameworks" },
  { n: 19, fact: "OECD principles: inclusive growth & well-being · human-centred values & fairness · transparency & explainability · robustness/security/safety · accountability. Frameworks OPERATIONALIZE principles.", tag: "Frameworks" },
  { n: 20, fact: "Transparency answers WHAT happened; explainability answers HOW/WHY the decision was made. Distinct, mutually supporting.", tag: "Frameworks" },
  { n: 21, fact: "Planning order: business problem → use case → applicable laws → gaps & risks → data. Data is LAST.", tag: "Develop" },
  { n: 22, fact: "Bias types: sampling (who's in the sample) · temporal (over time) · computational/statistical (external skew) · confirmation · projection.", tag: "Develop" },
  { n: 23, fact: "Federated learning trains where the data lives; differential privacy adds noise; synthetic data boosts accuracy; anonymization strips identifiers.", tag: "Develop" },
  { n: 24, fact: "Model card = summary (purpose, performance, limits, intended use). AI system inventory = full repository (docs, incident plans, source links, contacts).", tag: "Develop" },
  { n: 25, fact: "Deactivation triggers = regulatory or performance — never profit, never automatically on a new version. Feature flags localize without redeploy.", tag: "Deploy" },
];

export const DISTINCTIONS: { a: string; b: string; diff: string }[] = [
  { a: "Transparency", b: "Explainability", diff: "What happened vs. how/why the decision was made (NIST §3.5). Never synonyms." },
  { a: "Model card", b: "AI system inventory", diff: "Short summary of purpose/performance/limits vs. the full artifact repository with incident plans and source links." },
  { a: "Red teaming", b: "Threat modeling", diff: "Actively simulates attacks vs. maps what threats could arise on paper." },
  { a: "Red teaming", b: "Security testing", diff: "Adversarial, creative attack simulation vs. less-adversarial evaluation of security properties." },
  { a: "Audit", b: "Red teaming", diff: "Checks consistency and compliance vs. attacks the system to break it." },
  { a: "Differential privacy", b: "Federated learning", diff: "Adds statistical noise to protect individuals vs. trains at the data source so raw data never moves." },
  { a: "Synthetic data", b: "Anonymized data", diff: "Newly generated look-alike data vs. real data with identifiers stripped." },
  { a: "Provider (EU)", b: "Deployer (EU)", diff: "Develops and places on market under own name (heavy duties) vs. uses under own authority (lighter duties)." },
  { a: "High-risk (EU)", b: "High-impact (Korea)", diff: "Prescriptive + mandatory conformity assessment vs. innovation-first with self-assessment only." },
  { a: "Prohibited (EU)", b: "High-risk (EU)", diff: "Banned outright (social scoring, facial scraping) vs. allowed under strict controls (hiring, credit)." },
  { a: "DPIA", b: "FRIA", diff: "GDPR data-protection risk (controller) vs. AI Act fundamental-rights risk (deployer duty)." },
  { a: "MEASURE (NIST)", b: "MANAGE (NIST)", diff: "Assess, analyze, and track risks vs. prioritize and act on them." },
  { a: "Overfitting", b: "Model drift", diff: "Memorizes training data — fails on new data (training problem) vs. degrades after deployment as the world changes (monitoring problem)." },
  { a: "Disparate treatment", b: "Disparate impact", diff: "Intentional discrimination vs. neutral practice with unequal outcomes — AI hiring suits are usually impact." },
  { a: "Recognition", b: "Detection", diff: "Match input to a known catalog/identity vs. find anomalies or events." },
  { a: "Personalization", b: "Optimization", diff: "Unique experience from an individual profile vs. improving a process outcome." },
];

export const EU_TIMELINE: { date: string; label: string; status: "done" | "active" | "deferred" }[] = [
  { date: "1 Aug 2024", label: "In force (entry into force of the AI Act)", status: "done" },
  { date: "2 Feb 2025", label: "Prohibitions (Art. 5) + AI literacy apply", status: "done" },
  { date: "2 Aug 2025", label: "GPAI rules, governance bodies, penalties apply", status: "done" },
  { date: "2 Aug 2026", label: "Article 50 transparency applies (UNCHANGED by Omnibus)", status: "active" },
  { date: "2 Dec 2027", label: "Annex III high-risk obligations (deferred from Aug 2026 by the Digital Omnibus)", status: "deferred" },
  { date: "2 Aug 2028", label: "Annex I embedded high-risk obligations (deferred from Aug 2027)", status: "deferred" },
];

export const PENALTY_LADDER: { tier: string; amount: string; pct: string; what: string; width: number }[] = [
  { tier: "Top", amount: "€35M", pct: "7%", what: "Prohibited practices (Art. 5)", width: 100 },
  { tier: "Middle", amount: "€15M", pct: "3%", what: "Most other obligations + GPAI", width: 62 },
  { tier: "Lowest", amount: "€7.5M", pct: "1%", what: "Incorrect / misleading information", width: 34 },
];
