import type { StudyNote } from "@/lib/types";

// Study notes seeded from the aigp-exam-coach skill reference deep-dives.
export const notes: StudyNote[] = [
  {
    id: "note-strategy",
    competencyId: null,
    title: "How to beat IAPP's convoluted questions",
    sort: 0,
    tags: ["strategy"],
    bodyMd: `IAPP rarely tests recall — it tests **judgement under ambiguity**. Most wrong answers are *partly* true; your job is the **BEST** answer, not merely a correct one.

### The 6-step attack
1. **Read the stem first**, options hidden. Name: domain/competency · life-cycle stage · whose role.
2. **Classify the type:** BEST/MOST · NOT/LEAST/EXCEPT · ordering · role-ID · framework · distinction.
3. **Predict** your own answer before reading options (anti-bait armor).
4. **Cut the 1–2 clearly wrong** (absolute / tech-only / outsources thinking / wrong stage / true-but-irrelevant).
5. **Between the final two, pick the** more comprehensive, governance-first, proactive, by-design, balanced option.
6. **Re-read the operative word** ("first", "minimize", "least likely", "at the time of").

### Trap words in WRONG answers
*all, always, never, only, entirely, regardless* · "delegate everything to the algorithm" · "ignore legal aspects" · keeping a risky system because it's *profitable/costly to migrate* · doing by-design things "after deployment".

### Signals in RIGHT answers
*comprehensive, cross-functional, balanced, proactive, by-design, continuous, documented, human-in-the-loop, jurisdiction-aware.*

### Per type
- **BEST/MOST** → the holistic, governance-led option.
- **NOT/LEAST** → know the 3 right things to spot the 1 outlier (often true-but-irrelevant or wrong-stage).
- **Ordering** → business/legal BEFORE technical.
- **Role-ID** → provider = develops + places on market under its name; deployer = uses it; rebrand/substantial-mod ⇒ provider.
- **Distinction** → two near-neighbor terms means the question IS the distinction.`,
  },
  {
    id: "note-i-a",
    competencyId: "i-a",
    title: "Foundations — AI, harms & principles",
    sort: 1,
    tags: ["foundations"],
    bodyMd: `**ML types:** supervised (labeled), unsupervised (patterns), reinforcement (reward), semi-supervised (mix). **Generative** creates content; **agentic** acts autonomously.

**Harm taxonomy (classify by WHO is harmed):** individual · group (a demographic, e.g. surveillance) · organizational (reputational/economic) · societal (disinformation/deepfakes).

**Unique characteristics needing governance:** complexity, opacity, autonomy, speed & scale, data dependency, probabilistic vs deterministic outputs.

**Responsible-AI principles:** fairness · safety & reliability · privacy & security · transparency & explainability · accountability · human-centricity.

**Explainability ≠ transparency** (NIST §3.5): transparency = *what happened*; explainability = *how/why the decision was made*.`,
  },
  {
    id: "note-i-b",
    competencyId: "i-b",
    title: "Organizational expectations & governance structure",
    sort: 2,
    tags: ["governance"],
    bodyMd: `Privacy & security experts are **always core** stakeholders; build a **diverse, cross-functional** group (add social scientists for non-obvious bias). Training must be **comprehensive & org-wide**, including ethics — not a narrow IT cadre.

**Creating the governance STRUCTURE** = (1) does one already exist? → (2) name an **executive champion** → (3) decide **who maintains/implements** it. Identifying applicable laws and establishing data lineage are **implementation**, not structure-creation.

Governance varies by size, maturity, industry, objectives, risk tolerance. **Hybrid** model (local evaluation + central coordination) suits large multinationals.`,
  },
  {
    id: "note-i-c",
    competencyId: "i-c",
    title: "Policies across the AI life cycle",
    sort: 3,
    tags: ["policy"],
    bodyMd: `Policy must cover the whole life cycle: use-case assessment → risk management → **ethics by design** → data acquisition → model & system development → training/testing → deployment/monitoring → documentation → incident management.

**Update existing policies for AI:** privacy, security, data governance, IP. Triggers to revisit: using AI in an existing program, launching a new AI program, or new regulation.

Balance innovation with governance — innovation without oversight breeds biased models/breaches. Manage **third-party/supply-chain risk** via procurement, contracts, acceptable-use.`,
  },
  {
    id: "note-ii-c-eu",
    competencyId: "ii-c",
    title: "EU AI Act — the essentials",
    sort: 4,
    tags: ["eu-ai-act", "laws"],
    bodyMd: `**Risk attaches to the USE, not the tech.** Tiers: **Prohibited** (Art. 5 — social scoring, untargeted facial scraping, real-time public biometric ID for law enforcement w/ narrow exceptions, emotion recognition at work/school, manipulative AI) · **High-risk** (Annex III — recruitment/HR, credit scoring, education, biometrics, critical infrastructure, law enforcement, migration, justice) · **Limited/transparency** (chatbots, deepfakes) · **Minimal**.

**Roles:** Provider develops + places on market under its name (most obligations); Deployer uses under its own authority. **Rebrand or substantial modification ⇒ becomes a provider (Art. 25).**

**Transparency (Art. 50):** tell users it's AI at the **first interaction**, in advance. Label AI-generated content.

**GPAI:** all providers — technical docs, copyright policy, training-data summary. **Systemic risk > 10^25 FLOPs** → + adversarial testing, incident reporting, cybersecurity.

**Penalties:** €35M/7% (prohibited) · €15M/3% (most obligations + GPAI) · €7.5M/1% (incorrect info). SMEs pay the LOWER cap.

**Dates (as amended by the 2026 Digital Omnibus, in force 27 Jul 2026):** in force Aug 2024 · prohibitions + AI literacy 2 Feb 2025 · GPAI + governance + penalties 2 Aug 2025 · **Article 50 transparency 2 Aug 2026 (unchanged)** · **high-risk Annex III deferred to 2 Dec 2027** · **Annex I high-risk deferred to 2 Aug 2028**.

⚠️ **Omnibus exam note:** the original statutory timeline (Annex III at 2 Aug 2026, Annex I at 2 Aug 2027) may still appear in older study materials. Know BOTH: the Omnibus moved the high-risk deadlines but left prohibitions, GPAI, and Art. 50 transparency where they were.

**FRIA** is a **deployer** duty (public bodies + credit/insurance high-risk deployers).`,
  },
  {
    id: "note-ii-c-global",
    competencyId: "ii-c",
    title: "South Korea, Take It Down Act & US AI laws",
    sort: 5,
    tags: ["laws", "south-korea", "us-law"],
    bodyMd: `**South Korean AI Basic Act** — effective **22 Jan 2026**; **"high-impact AI"** (not "high-risk"); innovation-first; **no mandatory third-party conformity assessment**; fines up to **₩30M**; foreign operators need a **domestic representative**; high-impact operators must self-assess, give a "meaningful explanation," provide a user-protection plan, and keep human oversight; **1-year enforcement grace** through 2026.

**Take It Down Act** — signed **19 May 2025**; covers NCII incl. **AI deepfakes**; covered platforms must remove within **48 hours**; **FTC**-enforced; platform enforcement began **19 May 2026**.

**US federal:** no comprehensive AI law. **NAIIA** = R&D coordination (NOT anti-discrimination). Existing law applies: **FTC §5**, EEOC, FCRA, ADA, Fair Housing Act.

**US states:** **Colorado** — the original AI Act (SB 24-205) was **repealed before ever taking effect** and replaced by **SB 26-189** (signed 14 May 2026, effective **1 Jan 2027**): regulates **automated decision-making technology (ADMT)** that **"materially influences" consequential decisions** — consumer disclosures, post-adverse-outcome explanations, correction rights, meaningful human review; **AG-only enforcement** (no private right of action), 60-day cure. **Texas TRAIGA** (eff. **1 Jan 2026**) — **intent-based** (prohibited intentional harms), AG enforcement, sandbox. **Illinois BIPA** (biometric consent) + HB 3773 (AI employment discrimination, eff. 1 Jan 2026). **NYC LL144** (AEDT bias audits). **California** (CPPA ADMT regs, AB 2013 training-data transparency).

**Colorado vs Texas (favorite comparison):** Colorado SB 189 = **impact/transparency-based** on ADMT in consequential decisions; TRAIGA = **intent-based** (liability generally requires intent to discriminate/manipulate/harm).`,
  },
  {
    id: "note-ii-d",
    competencyId: "ii-d",
    title: "Frameworks & standards — NIST, OECD, ISO",
    sort: 6,
    tags: ["nist", "oecd", "iso"],
    bodyMd: `**NIST AI RMF** (voluntary) — **GOVERN** (culture) · **MAP** (context + risks identified) · **MEASURE** (risks assessed/analyzed/tracked) · **MANAGE** (risks prioritized + acted on). 7 trustworthy-AI characteristics: valid&reliable, safe, secure&resilient, explainable&interpretable, privacy-enhanced, fair, accountable&transparent. **ARIA** = Assessing Risks and Impacts of AI.

**OECD (5 principles):** inclusive growth/sustainable dev & well-being · human-centered values & fairness · transparency & explainability · robustness/security/safety · accountability.

**ISO:** 22989 (terminology) · 42001 (AI management system, certifiable "Type A") · 42005 (AI impact assessment).

**Key contrast:** NIST/OECD/ISO = voluntary; **EU AI Act = mandatory**.`,
  },
  {
    id: "note-iii",
    competencyId: "iii-b",
    title: "Develop — data, bias & training",
    sort: 7,
    tags: ["development", "bias"],
    bodyMd: `**Data lineage/provenance** ensures data is accurate, representative, unbiased. Keep **training and test sets separate** (avoid overfitting); same features in both.

**Bias types:** sampling (bad sample selection) · temporal (over time) · computational/statistical (external skew) · confirmation (seeking confirming data) · projection.

**Privacy tech:** differential privacy (adds noise) · federated learning (trains at the source, data stays put) · synthetic data (generates new data to boost accuracy).

**Release:** readiness assessment after development, before deployment (incl. model card + conformity). **Model card** = summary (performance/limitations/intended use). **AI system inventory** = full repository. **Red teaming** (adversarial attack sim) ≠ threat modeling ≠ security testing ≠ audit. **Model drift** → continuous monitoring + retraining.`,
  },
  {
    id: "note-iv",
    competencyId: "iv-a",
    title: "Deploy — decisions, vendors & deactivation",
    sort: 8,
    tags: ["deployment"],
    bodyMd: `**Use-case types:** detection (anomalies) · recognition (match to catalog/identity) · optimization (improve a process) · personalization (unique experience from a profile).

**Deployment options:** cloud / on-prem / **edge** (on-device, low latency, data stays local); as-is / fine-tuning / RAG / agentic.

**Governance models:** centralized (all HQ) · decentralized (no coordination) · **hybrid** (local + central — best for multinationals).

**Vendor terms (open source):** training-data ownership & output ownership matter most. You don't need your own patent to USE a vendor's AI. Tech stack does NOT determine applicable law — jurisdiction/sector/data/use do.

**Deactivation/localization:** triggers = regulatory/legal or performance — never profit, never auto-on-new-version. **Feature flags** disable by jurisdiction without a redeploy. **Model cards** forecast/limit secondary & unintended uses.`,
  },
];
