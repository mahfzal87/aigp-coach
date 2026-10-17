// Frameworks & policies library — every instrument broken into its distinct
// sections as scannable bullets. Current as of October 2026.

export type InstrumentKind = "Law" | "Framework" | "Standard" | "Principles";

export interface Instrument {
  id: string;
  name: string;
  kind: InstrumentKind;
  jurisdiction: string;
  status: string; // one-line binding/effective summary
  sections: { heading: string; bullets: string[] }[];
}

export const INSTRUMENTS: Instrument[] = [
  {
    id: "eu-ai-act",
    name: "EU AI Act (Regulation 2024/1689)",
    kind: "Law",
    jurisdiction: "European Union",
    status: "Binding. Phased application 2025–2028 (as amended by the 2026 Digital Omnibus).",
    sections: [
      { heading: "Risk tiers", bullets: [
        "Prohibited (Art. 5): social scoring · untargeted facial-image scraping · emotion recognition in workplace/education · exploiting vulnerabilities · predictive policing on profiling alone · real-time remote biometric ID in public for law enforcement (narrow exceptions)",
        "High-risk: Annex I (safety components of regulated products) + Annex III (hiring, credit, education, biometrics, critical infrastructure, law enforcement, migration, justice/elections)",
        "Limited/transparency risk (Art. 50): chatbots, deepfakes, AI-generated content, emotion recognition — disclosure duties",
        "Minimal risk: everything else — no mandatory obligations",
        "Art. 6(3) carve-out: an Annex III system escapes high-risk if it only performs a narrow procedural task — unless it profiles people",
      ]},
      { heading: "Actor roles", bullets: [
        "Provider — develops + places on market under its own name (heaviest duties)",
        "Deployer — uses the system under its own authority (use-side duties)",
        "Importer / distributor — supply-chain roles with checking duties",
        "Role flip (Art. 25): rebrand, substantial modification, or repurposing to high-risk makes you the new provider",
      ]},
      { heading: "Provider obligations (high-risk)", bullets: [
        "Risk-management system across the lifecycle",
        "Data governance — relevant, representative, bias-examined training data",
        "Technical documentation + automatic logging",
        "Transparency + instructions for use to deployers",
        "Human oversight by design · accuracy, robustness, cybersecurity (Art. 15)",
        "Conformity assessment → EU declaration of conformity → CE mark → EU database registration",
        "Post-market monitoring, serious-incident reporting, corrective actions (fix / withdraw / disable / recall, Art. 20)",
      ]},
      { heading: "Deployer obligations (high-risk)", bullets: [
        "Use per the provider's instructions; assign competent human oversight",
        "Ensure input data is relevant and representative (where controlled)",
        "Monitor, suspend on risk, report serious incidents; keep logs",
        "Inform workers before workplace use and people affected by decisions",
        "FRIA — fundamental-rights impact assessment for public bodies + private credit-scoring/insurance deployers",
      ]},
      { heading: "GPAI models", bullets: [
        "All providers: technical docs, info to downstream providers, EU copyright policy, public training-content summary",
        "Systemic risk presumed above 10²⁵ FLOPs of training compute → adversarial testing, risk mitigation, incident reporting, cybersecurity",
        "GPAI Code of Practice: signing gives a presumption of conformity",
        "Open-source models get partial documentation exemptions — unless systemic-risk",
      ]},
      { heading: "Penalties", bullets: [
        "€35M or 7% of global turnover — prohibited practices",
        "€15M or 3% — most other obligations, incl. GPAI",
        "€7.5M or 1% — supplying incorrect or misleading information",
        "SMEs and start-ups pay the LOWER of the two caps",
      ]},
      { heading: "Timeline (post-Omnibus)", bullets: [
        "1 Aug 2024 — in force · 2 Feb 2025 — prohibitions + AI literacy",
        "2 Aug 2025 — GPAI rules, governance bodies, penalties",
        "2 Aug 2026 — Art. 50 transparency applies (NOT deferred)",
        "2 Dec 2026 — end of the marking grace: machine-readable marking for generative systems that were already on the market before 2 Aug 2026 (new systems had to mark from day one)",
        "2 Dec 2027 — Annex III high-risk obligations (deferred from Aug 2026)",
        "2 Aug 2028 — Annex I embedded high-risk obligations (deferred from Aug 2027)",
      ]},
    ],
  },
  {
    id: "gdpr-art22",
    name: "GDPR — automated decisions (Art. 22) applied to AI",
    kind: "Law",
    jurisdiction: "European Union",
    status: "Binding since 2018; the privacy backbone under every EU AI deployment.",
    sections: [
      { heading: "The Article 22 rule", bullets: [
        "Right not to be subject to a SOLELY automated decision with legal or similarly significant effects",
        "Exceptions: necessary for a contract · authorized by law · explicit consent (implicit consent never qualifies)",
        "Remedy = redress: human intervention, express your view, contest the decision",
      ]},
      { heading: "Principles that bite on AI", bullets: [
        "Lawful basis, purpose limitation, transparency for training and use",
        "Data minimization balanced with model utility — never 'collect everything'",
        "DPIA for high-risk processing; it seeds the AI impact assessment",
        "Special-category data (biometrics, health) needs an Art. 9 gate",
        "Data-subject rights (access, erasure, objection) apply to training data too",
      ]},
    ],
  },
  {
    id: "sk-basic-act",
    name: "South Korea — AI Basic Act",
    kind: "Law",
    jurisdiction: "South Korea",
    status: "Binding; effective 22 Jan 2026. Regulator: MSIT.",
    sections: [
      { heading: "Core concepts", bullets: [
        "'High-impact AI' (deliberately not 'high-risk'): significantly affects life, safety, or fundamental rights",
        "Covers healthcare, energy, transport, hiring, biometrics, loans, public services",
        "Second comprehensive national AI law in the world, innovation-first posture",
      ]},
      { heading: "Operator obligations", bullets: [
        "Self-assess high-impact status BEFORE deployment (no notified-body pre-approval)",
        "Meaningful explanation of outcomes · user-protection plan · human oversight mechanism",
        "Generative AI: notify users + label/watermark AI-generated content",
        "Foreign operators above thresholds: appoint a domestic (Korean) representative",
      ]},
      { heading: "Enforcement vs. the EU", bullets: [
        "No mandatory third-party conformity assessment (the big contrast with the EU)",
        "Fines up to ₩30M — orders of magnitude below EU penalties",
        "AI Safety Institute established; MSIT ran a first-year enforcement grace through 2026",
      ]},
    ],
  },
  {
    id: "us-federal",
    name: "US federal layer — FTC §5, NAIIA, Take It Down",
    kind: "Law",
    jurisdiction: "United States (federal)",
    status: "No comprehensive federal AI law; sectoral statutes + FTC enforcement fill the space.",
    sections: [
      { heading: "FTC Act §5", bullets: [
        "Bars unfair or deceptive acts — the catch-all for overstated AI claims and undisclosed facial recognition",
        "Also the enforcement hook for the Take It Down Act's platform duties",
      ]},
      { heading: "TAKE IT DOWN Act (2025)", bullets: [
        "Criminalizes publishing non-consensual intimate imagery — explicitly including AI deepfakes",
        "Covered platforms: notice-and-removal within 48 hours (incl. identical copies)",
        "Signed 19 May 2025; FTC platform enforcement live since 19 May 2026",
      ]},
      { heading: "NAIIA (2020) — the trap", bullets: [
        "Coordinates federal AI R&D and creates the National AI Initiative Office",
        "Imposes NO private-sector duties and gives NO anti-discrimination guidance",
        "Anti-bias guidance actually comes from EEOC, FCRA, ADA, Fair Housing Act",
      ]},
      { heading: "Classic statutes applied to AI", bullets: [
        "FCRA — consumer reports in credit/employment: adverse-action notice + dispute rights",
        "ADA / Title VII (EEOC) — AI hiring tools and disparate impact",
        "Fair Housing Act — algorithmic tenant screening and lending",
      ]},
    ],
  },
  {
    id: "us-states",
    name: "US state patchwork — CO, TX, CA, IL, NYC",
    kind: "Law",
    jurisdiction: "United States (states)",
    status: "The operative US rules for private-sector AI; know each law's one-line identity.",
    sections: [
      { heading: "Colorado — SB 26-189", bullets: [
        "The original Colorado AI Act (SB 24-205) was repealed before ever taking effect",
        "Replacement covers ADMT that materially influences consequential decisions",
        "Attorney-General-only enforcement (no private right of action) · effective 1 Jan 2027",
        "Impact-based regime — duties attach regardless of intent",
      ]},
      { heading: "Texas — TRAIGA", bullets: [
        "Effective 1 Jan 2026 · intent-based: prohibitions on AI deployed TO discriminate, manipulate, or harm",
        "Government-use rules, AG enforcement, regulatory sandbox",
        "The clean contrast: Texas asks what you meant; Colorado asks what happened",
      ]},
      { heading: "California — the trio", bullets: [
        "SB 53 (TFAIA, eff. 1 Jan 2026): FIRST US frontier-model law — models above 10²⁶ training operations; publish a safety framework; transparency reports; catastrophic-risk incident reports to Cal OES (15 days, 24h if imminent); up to $1M per violation; extra duties above $500M revenue",
        "AB 2013 (eff. 1 Jan 2026): publish summaries of generative-AI training datasets",
        "SB 942: AI-content provenance/detection tooling for large providers",
      ]},
      { heading: "Illinois + NYC", bullets: [
        "Illinois BIPA — biometric consent with a private right of action (the litigation engine)",
        "Illinois HB 3773 — AI employment discrimination under the Human Rights Act (eff. 1 Jan 2026)",
        "NYC Local Law 144 — independent bias audits + notice for automated hiring tools",
      ]},
    ],
  },
  {
    id: "nist-ai-rmf",
    name: "NIST AI Risk Management Framework (AI 100-1)",
    kind: "Framework",
    jurisdiction: "United States (voluntary, used globally)",
    status: "Voluntary — the exam's favorite contrast with the binding EU AI Act.",
    sections: [
      { heading: "The four functions", bullets: [
        "GOVERN — cultivate the risk culture, policies, roles; informs the other three",
        "MAP — establish context and IDENTIFY risks",
        "MEASURE — ASSESS, analyze, and TRACK identified risks",
        "MANAGE — PRIORITIZE and ACT on risks (mitigate, respond, recover)",
      ]},
      { heading: "Trustworthy-AI characteristics (7)", bullets: [
        "Valid & reliable · Safe · Secure & resilient",
        "Explainable & interpretable · Privacy-enhanced",
        "Fair with harmful bias managed · Accountable & transparent",
        "'Profitable' is never one — a recurring NOT-question answer",
      ]},
      { heading: "Companions", bullets: [
        "Playbook — suggested actions per subcategory",
        "Generative AI Profile (NIST AI 600-1) — GenAI-specific risks layered on the RMF",
        "ARIA program — Assessing Risks and Impacts of AI (evaluation methodology)",
      ]},
    ],
  },
  {
    id: "oecd",
    name: "OECD AI Principles (2019, updated 2024)",
    kind: "Principles",
    jurisdiction: "International (46+ adherents)",
    status: "Non-binding; the definitional bedrock other laws borrow (incl. the EU's AI-system definition).",
    sections: [
      { heading: "Five values-based principles", bullets: [
        "Inclusive growth, sustainable development & well-being",
        "Human-centered values & fairness (rule of law, human rights, democracy)",
        "Transparency & explainability",
        "Robustness, security & safety",
        "Accountability",
      ]},
      { heading: "Exam patterns", bullets: [
        "'Least relevant principle' questions: for a security/vendor-trust scenario, the odd one out is usually inclusive growth & well-being",
        "Frameworks OPERATIONALIZE principles — principles are the why, frameworks the how",
      ]},
    ],
  },
  {
    id: "iso",
    name: "ISO/IEC AI standards (22989 · 42001 · 42005)",
    kind: "Standard",
    jurisdiction: "International",
    status: "Voluntary standards; 42001 is third-party certifiable.",
    sections: [
      { heading: "The BoK trio", bullets: [
        "ISO/IEC 22989 — AI concepts and terminology (the vocabulary)",
        "ISO/IEC 42001 — AI management system; certifiable, the 'ISO 27001 of AI'",
        "ISO/IEC 42005 — AI system impact assessment guidance",
      ]},
      { heading: "Adjacent standards worth recognizing", bullets: [
        "ISO/IEC 23894 — AI risk management",
        "ISO/IEC 23053 — ML framework description",
        "EN 18286 (2026) — European harmonized quality-management standard supporting EU AI Act conformity",
      ]},
    ],
  },
  {
    id: "pbd-fips",
    name: "Privacy by Design & the FIPs",
    kind: "Principles",
    jurisdiction: "International heritage",
    status: "Non-binding doctrine that modern privacy statutes codify.",
    sections: [
      { heading: "Privacy by Design (Cavoukian, 7 principles)", bullets: [
        "Proactive not reactive · privacy as the DEFAULT setting",
        "Privacy embedded into design · full functionality (positive-sum)",
        "End-to-end security · visibility & transparency · respect for the user",
      ]},
      { heading: "Fair Information Practices", bullets: [
        "Notice/openness · choice/consent · collection limitation (minimization)",
        "Use limitation · data quality · security safeguards · accountability",
        "Over-collection violates minimization; re-purposing violates use limitation",
      ]},
    ],
  },
  {
    id: "asilomar",
    name: "Asilomar AI Principles (2017)",
    kind: "Principles",
    jurisdiction: "International (Future of Life Institute)",
    status: "Non-binding; cited in scenarios about user choice and explanation.",
    sections: [
      { heading: "The exam-relevant cluster", bullets: [
        "Human control — humans choose whether and how to delegate decisions",
        "Failure transparency — if an AI causes harm, the reason must be ascertainable",
        "Personal privacy — people control data AI systems derive about them",
        "Judicial transparency — judicial decisions need satisfactory explanations auditable by humans",
      ]},
      { heading: "Pattern", bullets: [
        "Auto-deciding for users without explanation = human control + failure transparency + personal privacy violated together",
      ]},
    ],
  },
];
