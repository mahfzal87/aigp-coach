import type { Question, Topic } from "@/lib/types";

function o(label: string, text: string, isCorrect = false, sort = 0) {
  return { label, text, isCorrect, sort };
}

export const questionsTopicsII: Question[] = [
  // ───────────── II.A — new questions ─────────────
  {
    id: "n-ii-a-1",
    competencyId: "ii-a",
    type: "best",
    difficulty: 3,
    stem: "Retailer Nordkart collected customers' purchase histories for the stated purpose of fulfilling orders. Two years later its data-science team wants to reuse that same data to train a churn-prediction model. Under GDPR purpose limitation, the privacy team's BEST first move is:",
    isMultiselect: false,
    options: [
      o("A", "Assess whether model training is compatible with the original fulfillment purpose, and if it is not, establish a new lawful basis before any training starts", true, 0),
      o("B", "Proceed — the data was collected lawfully, so the company may reuse it for any internal analytics purpose", false, 1),
      o("C", "Rely on the checkout consent customers gave for order fulfillment, since training is just an extension of serving them", false, 2),
      o("D", "Strip customer names from the dataset and start training, resolving any legal questions afterward", false, 3),
    ],
    correctExplanation: "Purpose limitation means data collected for one stated purpose cannot be freely repurposed. The correct sequence is a compatibility assessment of the new purpose against the original one, and a fresh lawful basis if they are incompatible — before processing begins.",
    whyWrong: {
      B: "Lawful collection for purpose #1 does not authorize purpose #2 — that is exactly what purpose limitation prohibits.",
      C: "Consent is purpose-specific. Consent to fulfillment does not stretch to model training; calling it an 'extension' is wishful relabeling.",
      D: "Removing names rarely achieves true anonymization, and 'train first, legalize later' inverts privacy by design.",
    },
    strategyNote: "When a scenario reuses old data for a new AI purpose, the tested concept is almost always purpose limitation: assess compatibility first, then basis.",
    trapType: "premature",
    bokRef: "Domain II, Competency A",
    source: "authored",
  },
  {
    id: "n-ii-a-2",
    competencyId: "ii-a",
    type: "best",
    difficulty: 3,
    stem: "Veyra Insurance already runs mature privacy impact assessments (PIAs/DPIAs). It now deploys an AI claims-triage system and wants an algorithmic impact assessment. The MOST effective approach is to:",
    isMultiselect: false,
    options: [
      o("A", "Commission an entirely new assessment framework from scratch, since AI risk has nothing in common with privacy risk", false, 0),
      o("B", "Start from the existing PIA/DPIA process and extend it to cover the AI system's specific risks, tying it to the organization's mission, values, and context", true, 1),
      o("C", "Wait for the regulator to publish a mandatory template before assessing anything", false, 2),
      o("D", "Outsource the assessment entirely so no internal process needs to change", false, 3),
    ],
    correctExplanation: "The tested pattern: an algorithmic impact assessment is built by extending and tailoring the existing PIA/DPIA to the AI process — reusing the mature machinery and anchoring it in the organization's own mission and context, not rebuilding from zero.",
    whyWrong: {
      A: "Privacy and AI assessments overlap heavily (risk identification + mitigation plan); discarding a working process wastes the foundation the exam expects you to reuse.",
      C: "Waiting is a governance failure — assessments are needed when the risk exists, not when a template appears.",
      D: "Outsourcing severs the assessment from organizational context and accountability, which the correct answer explicitly preserves.",
    },
    strategyNote: "IAPP rewards 'evolve the existing instrument' over 'start from scratch' — the DPIA is the seed of the algorithmic impact assessment.",
    trapType: "wrong-economics",
    bokRef: "Domain II, Competency A",
    source: "authored",
  },
  {
    id: "n-ii-a-3",
    competencyId: "ii-a",
    type: "best",
    difficulty: 3,
    stem: "FitPulse, an EU fitness app, plans to train a face-based emotion model on selfies users uploaded to their public profiles. The lead engineer argues the photos are 'already public, so nothing special applies.' The privacy team's BEST response is:",
    isMultiselect: false,
    options: [
      o("A", "Agree — publicly visible data carries no privacy obligations", false, 0),
      o("B", "Biometric data used to identify or analyze people is a sensitive/special category: it needs heightened protection, a valid basis such as explicit consent, and an impact assessment before training", true, 1),
      o("C", "Proceed under legitimate interests exactly as with ordinary marketing data, since the risk profile is the same", false, 2),
      o("D", "Add a line to the privacy notice and begin training immediately", false, 3),
    ],
    correctExplanation: "Faces processed for identification or analysis are biometric data — a sensitive/special category attracting heightened requirements: a strong lawful basis (explicit consent is the standard route), stricter safeguards, and a DPIA given the high risk to individuals.",
    whyWrong: {
      A: "'Publicly accessible' is not 'free to process' — sensitivity comes from the nature of the data, not where it sits.",
      C: "Special-category data cannot be treated like ordinary data; the legitimate-interests shortcut ignores the heightened regime.",
      D: "A notice alone provides transparency but no lawful basis and no risk assessment for sensitive processing.",
    },
    strategyNote: "The 'it's public anyway' argument is a recurring trap. Biometrics = sensitive category = heightened requirements, regardless of source.",
    trapType: "true-but-irrelevant",
    bokRef: "Domain II, Competency A",
    source: "authored",
  },

  // ───────────── II.B — new questions ─────────────
  {
    id: "n-ii-b-1",
    competencyId: "ii-b",
    type: "best",
    difficulty: 3,
    stem: "Lumen Labs is assembling a training corpus for a commercial text-generation model and wants to reduce its copyright-infringement exposure. The MOST effective mitigation is to:",
    isMultiselect: false,
    options: [
      o("A", "Ensure the training inputs qualify as fair use of the existing works (or are otherwise licensed or unprotected)", true, 0),
      o("B", "Train only on material scraped from publicly accessible websites, since public availability defeats copyright", false, 1),
      o("C", "Delete the raw training corpus after training completes so no infringing copies remain on disk", false, 2),
      o("D", "Attach a disclaimer to every output stating that any resemblance to existing works is coincidental", false, 3),
    ],
    correctExplanation: "In the US, fair use of existing works does not infringe copyright — so the risk-reducing move is at the input stage: ensure training data is fair use, licensed, or unprotected.",
    whyWrong: {
      B: "'Publicly accessible' is not 'public domain.' Copyright attaches to works regardless of whether they sit behind a paywall.",
      C: "Deleting copies afterward does not undo the unauthorized copying that already occurred during training.",
      D: "Disclaimers do not change the legal character of copying; infringement is not cured by labeling.",
    },
    strategyNote: "Synonym trap: publicly available ≠ public domain. The exam's copyright fix lives at the input/training-data stage, not the output stage.",
    trapType: "synonym-bait",
    bokRef: "Domain II, Competency B",
    source: "authored",
  },
  {
    id: "n-ii-b-2",
    competencyId: "ii-b",
    type: "best",
    difficulty: 3,
    stem: "Corvid Media licenses a generative-AI platform from vendor Synthetiq to produce ad imagery. The legal team asks who will own the generated images. Given ongoing uncertainty about copyright in AI-generated works, the BEST course is to:",
    isMultiselect: false,
    options: [
      o("A", "Assume Corvid automatically owns the outputs as the 'author,' since its employees wrote the prompts", false, 0),
      o("B", "Expressly allocate ownership and usage rights of AI outputs in the contract with Synthetiq", true, 1),
      o("C", "Treat the outputs as automatically covered by work-for-hire doctrine, so no contract language is needed", false, 2),
      o("D", "Do nothing — AI outputs are public domain, so ownership questions are moot", false, 3),
    ],
    correctExplanation: "Because default IP law is unsettled for AI-generated works (courts require human authorship for many protections), ownership of generative-AI output must be specified in the contract — that is the exam's consistent answer.",
    whyWrong: {
      A: "Human-authorship doctrine makes automatic copyright in AI outputs doubtful; prompting alone may not confer authorship.",
      C: "Work-for-hire covers employees and specific commissioned categories — it does not silently resolve vendor-generated AI output.",
      D: "Even if copyright is uncertain, contract rights between the parties are real and necessary; 'moot' forfeits control.",
    },
    strategyNote: "When the law's default answer is uncertain (AI authorship), the governance answer is contractual clarity — specify output ownership.",
    trapType: "absolute",
    bokRef: "Domain II, Competency B",
    source: "authored",
  },
  {
    id: "n-ii-b-3",
    competencyId: "ii-b",
    type: "best",
    difficulty: 3,
    stem: "Hartline Logistics screens delivery-driver applicants with an AI tool that ingests resumes, driving records, and credit-history data purchased from a consumer reporting agency. An applicant is auto-rejected based partly on the credit data. Which US law is MOST directly triggered, and what does it demand?",
    isMultiselect: false,
    options: [
      o("A", "The Fair Credit Reporting Act — prior disclosure and authorization, an adverse-action notice, and the applicant's right to dispute the report", true, 0),
      o("B", "The Americans with Disabilities Act — reasonable accommodation for the applicant", false, 1),
      o("C", "The Fair Housing Act — because credit data is involved", false, 2),
      o("D", "The National AI Initiative Act — because an AI system made the decision", false, 3),
    ],
    correctExplanation: "FCRA fires precisely when consumer-report data (including credit history) feeds an employment decision: the employer needs disclosure + authorization up front, and an adverse-action notice plus dispute rights when the report contributes to rejection.",
    whyWrong: {
      B: "No disability is in play; the ADA governs disability discrimination, not credit-report use.",
      C: "The Fair Housing Act covers housing, lending, and insurance discrimination — not delivery-driver hiring.",
      D: "The NAIIA is a federal R&D-coordination statute; it imposes no duties on private employers.",
    },
    strategyNote: "Spot the trigger fact: 'credit report from a consumer reporting agency' = FCRA, whatever the decision engine is. Real laws in the wrong lane are the distractors.",
    trapType: "true-but-irrelevant",
    bokRef: "Domain II, Competency B",
    source: "authored",
  },
  {
    id: "n-ii-b-4",
    competencyId: "ii-b",
    type: "best",
    difficulty: 3,
    stem: "Meridian Stores quietly runs facial-recognition cameras in its US shops to match visitors against a shoplifter watchlist. Executives argue there is 'no consumer-protection issue because we never sell the data.' The BEST legal assessment is:",
    isMultiselect: false,
    options: [
      o("A", "Correct — consumer-protection law only concerns the sale of personal data", false, 0),
      o("B", "Failing to disclose the facial-recognition practice can itself be an unfair or deceptive practice under Section 5 of the FTC Act, alongside privacy-law exposure", true, 1),
      o("C", "Only a federal facial-recognition statute could reach this, and none exists, so the practice is safe", false, 2),
      o("D", "The FTC can act only after a data breach occurs", false, 3),
    ],
    correctExplanation: "FTC Act Section 5 prohibits unfair or deceptive acts or practices — and undisclosed facial recognition in stores is the textbook example: the deception is the concealment of the practice, independent of any data sale.",
    whyWrong: {
      A: "Section 5 turns on unfairness/deception, not on whether data is monetized.",
      C: "No AI-specific statute is needed; general consumer-protection law already applies to AI practices.",
      D: "Section 5 liability does not wait for a breach; the undisclosed practice is the violation.",
    },
    strategyNote: "'We don't sell data' answers a question nobody asked. Section 5 bites on concealment and unfairness — scan for the undisclosed practice.",
    trapType: "too-narrow",
    bokRef: "Domain II, Competency B",
    source: "authored",
  },
  {
    id: "n-ii-b-5",
    competencyId: "ii-b",
    type: "distinction",
    difficulty: 3,
    stem: "Policymakers debate how injured parties should recover when an autonomous AI system causes harm that traditional doctrines struggle to attribute. In the AI-governance vocabulary, 'liability reform' refers to:",
    isMultiselect: false,
    options: [
      o("A", "Changing the legal rules that determine who is accountable for harm caused by AI systems", true, 0),
      o("B", "Requiring manufacturers to recall defective AI products faster", false, 1),
      o("C", "Mandating that every AI deployer carry commercial insurance", false, 2),
      o("D", "Shifting all responsibility to end users through terms-of-service waivers", false, 3),
    ],
    correctExplanation: "Liability reform means amending the legal rules of accountability — who can be held responsible, and under what theory — for AI-caused harm, because doctrines built for conventional products strain against autonomous, adaptive systems.",
    whyWrong: {
      B: "Recalls are a product-safety remedy, not a change to accountability rules.",
      C: "Insurance spreads the cost of liability; it does not redefine who bears it.",
      D: "Contractual waivers are a private risk-shifting tactic, not law reform — and often unenforceable against consumers.",
    },
    strategyNote: "Reform = changing the rules themselves. Distractors offer operational mechanisms (recalls, insurance, contracts) that leave the rules untouched.",
    trapType: "too-narrow",
    bokRef: "Domain II, Competency B",
    source: "authored",
  },
  // ───────────── II.C — new questions ─────────────
  {
    id: "n-ii-c-1",
    competencyId: "ii-c",
    type: "best",
    difficulty: 3,
    stem: "Bruxa Software ships four AI features in the EU: (1) an email spam filter, (2) a CV-screening tool for employers, (3) a customer-service chatbot, and (4) a citizen 'trustworthiness score' for a municipality that gates access to public services. Which EU AI Act risk mapping is correct?",
    isMultiselect: false,
    options: [
      o("A", "Spam filter = minimal risk; CV screening = high-risk; chatbot = limited/transparency risk; citizen scoring = prohibited", true, 0),
      o("B", "All four are high-risk because they use machine learning", false, 1),
      o("C", "Spam filter = limited; CV screening = prohibited; chatbot = high-risk; citizen scoring = high-risk", false, 2),
      o("D", "All four are minimal risk unless a regulator objects", false, 3),
    ],
    correctExplanation: "Risk attaches to the use and context, not the technology: spam filtering is minimal risk; employment screening is Annex III high-risk; a chatbot carries Article 50 transparency duties; social scoring by public authorities is an Article 5 prohibited practice.",
    whyWrong: {
      B: "The Act classifies by use case, not by whether ML is involved — 'all AI is high-risk' is never the answer.",
      C: "Every assignment is shuffled one tier off: CV screening is regulated, not banned; the chatbot needs disclosure, not conformity assessment; social scoring is banned outright.",
      D: "The tiers are self-executing legal categories, not discretionary regulator labels.",
    },
    strategyNote: "Anchor each system to its tier before reading the options: banned (Art. 5) > high-risk (Annexes) > transparency (Art. 50) > minimal. One-tier-off shuffles are the classic distractor.",
    trapType: "synonym-bait",
    bokRef: "Domain II, Competency C",
    source: "authored",
  },
  {
    id: "n-ii-c-2",
    competencyId: "ii-c",
    type: "best",
    difficulty: 3,
    stem: "Portway Freight wants cameras that infer warehouse workers' emotions so supervisors can 'coach stressed staff before mistakes happen.' HR notes workers would sign a consent form. Under the EU AI Act, the compliance team should conclude:",
    isMultiselect: false,
    options: [
      o("A", "Permitted with worker consent, since consent cures the intrusion", false, 0),
      o("B", "High-risk — allowed after a conformity assessment and CE marking", false, 1),
      o("C", "Prohibited — emotion recognition in the workplace is an Article 5 practice, and a benign coaching purpose or signed consent does not lift the ban (only narrow medical or safety exceptions exist)", true, 2),
      o("D", "Limited risk — a transparency notice at the camera suffices", false, 3),
    ],
    correctExplanation: "Emotion recognition in workplace and education settings is prohibited under Article 5, with narrow medical and safety exceptions. Intent ('coaching') and consent are irrelevant to a prohibition — the practice itself is banned, at the €35M/7% penalty tier.",
    whyWrong: {
      A: "Consent cannot authorize a prohibited practice — especially in employment, where consent is rarely freely given.",
      B: "Under-classification: this is not a regulated-but-permitted Annex III use; it sits on the banned list.",
      D: "Transparency notices apply to limited-risk systems; disclosure does not legalize an Article 5 practice.",
    },
    strategyNote: "When a scenario adds sympathetic intent or consent to an Article 5 practice, both are noise. First ask: is the practice on the banned list at all?",
    trapType: "true-but-irrelevant",
    bokRef: "Domain II, Competency C",
    source: "authored",
  },
  {
    id: "n-ii-c-3",
    competencyId: "ii-c",
    type: "distinction",
    difficulty: 3,
    stem: "MedScan GmbH builds AI that controls the radiation dose inside a CT scanner (a regulated medical device). TalentGrid BV sells a stand-alone AI that ranks job applicants for employers. Under the EU AI Act, both are high-risk — but via which routes?",
    isMultiselect: false,
    options: [
      o("A", "MedScan via Annex I (a safety component of a product already subject to third-party assessment); TalentGrid via Annex III (employment is a listed stand-alone area)", true, 0),
      o("B", "Both via Annex III, which covers all high-risk AI", false, 1),
      o("C", "Both via Annex I, since both are commercial products", false, 2),
      o("D", "Neither — only government AI systems can be high-risk", false, 3),
    ],
    correctExplanation: "There are two doors into high-risk: Annex I catches AI that is a safety component of products already requiring third-party conformity assessment (medical devices, machinery, toys, vehicles); Annex III lists eight stand-alone areas, including employment and HR.",
    whyWrong: {
      B: "Annex III covers only the eight listed stand-alone areas; embedded product-safety AI enters through Annex I.",
      C: "Annex I requires an underlying regulated product; a stand-alone hiring tool has none, so it needs Annex III.",
      D: "High-risk status turns on the use area, not on whether the operator is public or private.",
    },
    strategyNote: "Ask 'is the AI inside an already-regulated product?' If yes → Annex I. If it is stand-alone in one of the eight listed areas → Annex III. The two routes also now carry different compliance deadlines.",
    trapType: "none",
    bokRef: "Domain II, Competency C",
    source: "authored",
  },
  {
    id: "n-ii-c-4",
    competencyId: "ii-c",
    type: "best",
    difficulty: 3,
    stem: "Two firms commit the same prohibited-practice violation of the EU AI Act: Kolibri (a 35-person start-up) and OmniCorp (global turnover €80B). How does the penalty regime treat them differently?",
    isMultiselect: false,
    options: [
      o("A", "Both face up to €35M or 7% of global turnover, but as an SME Kolibri pays up to the LOWER of the two amounts, while OmniCorp faces the higher", true, 0),
      o("B", "SMEs are exempt from EU AI Act penalties entirely", false, 1),
      o("C", "Both pay a flat €35M — the Act ignores company size", false, 2),
      o("D", "Kolibri's exposure is higher because start-ups face stricter scrutiny", false, 3),
    ],
    correctExplanation: "The penalty ladder is 'the higher of' a fixed amount or a turnover percentage — €35M/7% for prohibited practices — but for SMEs and start-ups proportionality flips it: they pay up to the lower of the two caps.",
    whyWrong: {
      B: "Proportionality reduces the cap; it never creates an exemption from the prohibitions.",
      C: "Fines are capped by whichever of the two measures applies — for large firms the higher, so a €80B-turnover firm risks 7% (€5.6B), not a flat €35M.",
      D: "Backwards — the SME rule is a concession, not extra scrutiny.",
    },
    strategyNote: "Memorize the ladder (35/7 > 15/3 > 7.5/1) AND the SME twist: higher-of for everyone, lower-of for SMEs.",
    trapType: "absolute",
    bokRef: "Domain II, Competency C",
    source: "authored",
  },
  {
    id: "n-ii-c-5",
    competencyId: "ii-c",
    type: "role",
    difficulty: 3,
    stem: "Four actors touch high-risk AI in the EU: (1) Credix Bank deploys a credit-scoring system on applicants; (2) Aiona Ltd is the provider that developed it; (3) the city of Aveiro deploys a benefits-eligibility system; (4) Shoply deploys a product-recommendation engine. Who must conduct a Fundamental Rights Impact Assessment (FRIA)?",
    isMultiselect: false,
    options: [
      o("A", "Credix Bank and the city of Aveiro — FRIA is a deployer duty for public bodies and for private deployers of credit-scoring and life/health-insurance systems", true, 0),
      o("B", "Aiona Ltd — impact assessments always belong to the party that built the system", false, 1),
      o("C", "All four actors, because every AI use touches fundamental rights", false, 2),
      o("D", "Only the city of Aveiro — private companies never owe FRIAs", false, 3),
    ],
    correctExplanation: "The FRIA (Art. 27) sits with deployers — specifically public bodies and public-service providers, plus private deployers of credit-scoring and life/health-insurance high-risk systems. A bank deploying credit scoring and a city deploying benefits AI both qualify; a product recommender is not even high-risk.",
    whyWrong: {
      B: "Providers run the conformity assessment; the FRIA is expressly a deployer obligation about the deployment context.",
      C: "The duty is scoped to particular deployers of high-risk systems, not to every AI use — recommendation engines fall outside.",
      D: "Too narrow: private credit-scoring and life/health-insurance deployers are explicitly captured.",
    },
    strategyNote: "Pin each assessment to its owner: conformity assessment = provider; FRIA = (certain) deployers; DPIA = the GDPR controller. Role-swap is the whole trick.",
    trapType: "too-narrow",
    bokRef: "Domain II, Competency C",
    source: "authored",
  },
  {
    id: "n-ii-c-6",
    competencyId: "ii-c",
    type: "distinction",
    difficulty: 3,
    stem: "A GPAI lab wants supervisory guidance; a citizen wants to complain about a deployed high-risk system; a provider needs a third-party conformity assessment. Which mapping of EU AI Act bodies to functions is correct?",
    isMultiselect: false,
    options: [
      o("A", "The EU AI Office supervises GPAI models and drafts Codes of Practice; national market-surveillance authorities enforce nationally and receive citizen complaints via a designated contact point; notified bodies perform third-party conformity assessments; the AI Board coordinates Member States", true, 0),
      o("B", "The AI Board directly investigates and fines companies across the EU", false, 1),
      o("C", "Notified bodies supervise GPAI providers and write the Codes of Practice", false, 2),
      o("D", "The EU AI Office is the single complaints desk for all citizens", false, 3),
    ],
    correctExplanation: "Four bodies, four jobs: AI Office (Commission-level) supervises GPAI and authors Codes of Practice; market-surveillance authorities do national enforcement, each Member State designating a point of contact for complaints; notified bodies are the independent conformity assessors; the AI Board coordinates.",
    whyWrong: {
      B: "The AI Board is a coordination forum of Member States; enforcement muscle sits with national market-surveillance authorities.",
      C: "Notified bodies certify high-risk systems; GPAI supervision belongs to the AI Office.",
      D: "Citizen complaints route to national market-surveillance contact points, not to the AI Office.",
    },
    strategyNote: "Similar-sounding institutions are deliberate bait. Tag each with one verb: Office = supervises GPAI; authorities = enforce; notified bodies = certify; Board = coordinates.",
    trapType: "synonym-bait",
    bokRef: "Domain II, Competency C",
    source: "authored",
  },

  // ───────────── II.D — new questions ─────────────
  {
    id: "n-ii-d-1",
    competencyId: "ii-d",
    type: "distinction",
    difficulty: 3,
    stem: "Sana Health wants its diagnostic AI to (1) withstand adversarial input manipulation and (2) return to normal function after an incident. Which NIST AI RMF trustworthy-AI characteristic does this target?",
    isMultiselect: false,
    options: [
      o("A", "Safe", false, 0),
      o("B", "Secure and resilient", true, 1),
      o("C", "Valid and reliable", false, 2),
      o("D", "Privacy-enhanced", false, 3),
    ],
    correctExplanation: "Withstanding attacks and recovering from incidents is the definition of 'secure and resilient' — security against adversarial action, resilience as the capacity to restore normal operation.",
    whyWrong: {
      A: "'Safe' concerns not endangering human life, health, property, or the environment — a harm lens, not an attack-and-recovery lens.",
      C: "'Valid and reliable' is about accuracy and consistent performance on the intended task, absent an adversary.",
      D: "'Privacy-enhanced' protects individuals' data and identity, which the scenario never mentions.",
    },
    strategyNote: "The seven characteristics are near-neighbors by design. Match keywords: attacks/recovery → secure & resilient; harm to people → safe; accuracy → valid & reliable.",
    trapType: "synonym-bait",
    bokRef: "Domain II, Competency D",
    source: "authored",
  },
  {
    id: "n-ii-d-2",
    competencyId: "ii-d",
    type: "not",
    difficulty: 3,
    stem: "A procurement team is vetting an AI vendor headquartered in a state with a documented record of human-rights violations and offensive cyber operations. Judged against the OECD AI Principles, which principle is LEAST relevant to the team's concerns?",
    isMultiselect: false,
    options: [
      o("A", "Inclusive growth, sustainable development and well-being", true, 0),
      o("B", "Human-centered values and fairness", false, 1),
      o("C", "Robustness, security and safety", false, 2),
      o("D", "Transparency and explainability", false, 3),
    ],
    correctExplanation: "The live concerns are security exposure, respect for human rights, and knowing what the vendor's system actually does — so the principle aimed at broad societal prosperity (inclusive growth, sustainable development and well-being) is the least relevant of the five.",
    whyWrong: {
      B: "Directly relevant — human-centered values and fairness embed human rights, democracy, and rule of law, exactly what the vendor's home state undermines.",
      C: "Directly relevant — a vendor tied to offensive cyber operations raises robustness and security questions first.",
      D: "Relevant — opacity about the system's behavior compounds every other risk.",
    },
    strategyNote: "For 'LEAST relevant' questions, all options are real principles; eliminate the ones that map to a stated fact in the scenario and pick the one aimed at a different problem.",
    trapType: "true-but-irrelevant",
    bokRef: "Domain II, Competency D",
    source: "authored",
  },
  {
    id: "n-ii-d-3",
    competencyId: "ii-d",
    type: "best",
    difficulty: 3,
    stem: "Brightlend's loan AI silently harvests applicants' financial data without telling them, denies applications with no explanation of why, and offers no way for a human to review or override the outcome. Which Asilomar AI Principles does this arrangement implicate?",
    isMultiselect: false,
    options: [
      o("A", "Human control, failure transparency, and personal privacy", true, 0),
      o("B", "Judicial transparency alone, since a decision was rendered", false, 1),
      o("C", "Shared benefit alone, since lending affects the economy", false, 2),
      o("D", "None — the Asilomar principles address only long-term superintelligence questions", false, 3),
    ],
    correctExplanation: "Three ethics-bucket principles are hit at once: removing the human's ability to choose or override subverts human control; refusing to explain why the system failed the applicant violates failure transparency; harvesting financial data without disclosure violates personal privacy.",
    whyWrong: {
      B: "Judicial transparency concerns AI used in judicial decision-making — no court is involved, and 'alone' ignores the other violations.",
      C: "Shared benefit is about broadly distributing AI's gains; it is not the principle this scenario tramples.",
      D: "Asilomar spans research, ethics-and-values, and longer-term issues — the ethics bucket applies squarely to deployed systems today.",
    },
    strategyNote: "Map each scenario fact to one principle: no override → human control; no explanation → failure transparency; undisclosed data use → personal privacy. Options that fit only one fact are too narrow.",
    trapType: "too-narrow",
    bokRef: "Domain II, Competency D",
    source: "authored",
  },
];

export const topicsII: Topic[] = [
  // ───────────── II.A — Existing privacy law applied to AI ─────────────
  {
    id: "t-ii-a-1",
    competencyId: "ii-a",
    title: "Fair Information Practices meet AI",
    conceptMd:
      "Privacy law was not written for AI, but its core principles — the **Fair Information Practices (FIPs)** — bind AI processing anyway. **Transparency** (tell people what you do with their data), **choice** and a valid **lawful basis**, **purpose limitation** (use data only for the purpose it was collected for), and **data minimization** (collect only what you actually need) all apply to training and running models. The exam's favorite twist: minimization is a **balance**, so an answer that says to minimize data *regardless of the model's effectiveness* is wrong — you weigh privacy against utility, you do not maximize one and ignore the other.",
    exampleMd:
      "Kavya's analytics start-up hoovers up users' full contact lists to power a feature that only needs email domains. When a reviewer asks which principle is most directly violated, the answer is **data minimization** — the company collected far more than the service requires, whatever it later does with the data.",
    questionIds: ["x-ii-a-1"],
    sort: 1,
  },
  {
    id: "t-ii-a-2",
    competencyId: "ii-a",
    title: "Lawful bases and purpose limitation for AI training",
    conceptMd:
      "Under the **GDPR**, every use of personal data needs a **lawful basis** — common candidates for AI training are **consent** and **legitimate interests**. Legitimate interests is never automatic: it requires a **necessity-and-balancing assessment** (often called an LIA) weighing the company's interest against the individuals' rights, and it strains in employment settings because of the **power imbalance** (employees can rarely refuse freely). **Purpose limitation** adds a second gate: data collected for one purpose cannot be silently repurposed to train a model — you must assess whether the new purpose is **compatible** with the original one, and if it is not, establish a fresh lawful basis before training starts.",
    exampleMd:
      "Nordkart's data-science team wants to train a churn model on purchase histories that were collected purely to fulfill orders. The privacy officer, Lena, blocks the kickoff: first a **compatibility assessment** of the new purpose, and — because churn prediction is not what customers were told — a new lawful basis before a single record reaches the training pipeline.",
    questionIds: ["z-ii-a-1", "n-ii-a-1"],
    sort: 2,
  },
  {
    id: "t-ii-a-3",
    competencyId: "ii-a",
    title: "Privacy by design (Cavoukian)",
    conceptMd:
      "**Privacy by Design (PbD)**, developed by **Ann Cavoukian**, says privacy must be **baked into a system's architecture from the start**, not bolted on after launch. Its stance is **proactive, not reactive**: anticipate privacy problems and prevent them, make privacy the **default setting**, and keep full functionality — privacy is not traded away for utility. For AI this means designing minimization, retention limits, and safeguards into the training pipeline itself, rather than patching them in after a complaint or breach.",
    exampleMd:
      "Two teams build a voice assistant. Priya's team decides at the whiteboard stage that raw audio is deleted after transcription and that cloud upload is off by default; Marco's team ships first and plans to 'add privacy controls in v2 if users push back.' Priya's team is practicing **privacy by design**; Marco's team is the cautionary tale.",
    questionIds: ["x-ii-a-2"],
    sort: 3,
  },
  {
    id: "t-ii-a-4",
    competencyId: "ii-a",
    title: "GDPR Article 22: automated decisions and redress",
    conceptMd:
      "**GDPR Article 22** gives individuals the right **not** to be subject to a **solely automated decision** that produces legal or similarly significant effects — a loan denial, a rejected job application. The prohibition lifts only under three exceptions: the decision is **necessary for a contract**, **authorized by EU or Member-State law** (with safeguards), or based on the person's **explicit consent** (implicit consent never qualifies). When automated decision-making is allowed, the person keeps safeguards the exam calls **redress**: the right to obtain **human intervention**, to **express their point of view**, and to **contest** the decision — not a right to the source code, and not automatic approval on appeal.",
    exampleMd:
      "Tomas applies for a mortgage at an EU bank and is refused by the bank's fully automated scoring engine. His primary avenue is **redress**: he demands a human reviewer, explains that the model misread a repaid debt, and formally contests the outcome — the three Article 22 safeguards working exactly as designed.",
    questionIds: ["q-ii-a-1", "q-ii-a-2"],
    sort: 4,
  },
  {
    id: "t-ii-a-5",
    competencyId: "ii-a",
    title: "From DPIA to algorithmic impact assessment",
    conceptMd:
      "A **DPIA (data protection impact assessment)** is the GDPR's structured study of how a high-risk processing activity endangers individuals, paired with a **mitigation plan**. When an organization needs an **algorithmic impact assessment** for an AI system, the exam-approved move is to **start from the existing PIA/DPIA process and extend it** — tailoring it to the AI's specific risks and tying it back to the organization's **mission, values, and context** — rather than inventing a parallel framework from scratch. The two instruments share a skeleton (identify risks, plan mitigations), which is precisely why one grows out of the other.",
    exampleMd:
      "Veyra Insurance already runs disciplined DPIAs for every new data flow. When it deploys an AI claims-triage engine, governance lead Ines does not commission a brand-new methodology; she **extends the DPIA template** with sections on model bias, drift, and human oversight, keeping the assessment anchored in Veyra's own risk appetite and values.",
    questionIds: ["n-ii-a-2"],
    sort: 5,
  },
  {
    id: "t-ii-a-6",
    competencyId: "ii-a",
    title: "Sensitive and biometric data in AI",
    conceptMd:
      "Some data is legally **sensitive** (a 'special category'): health information, and notably **biometric data** — measurements of the body or behavior, like faceprints, used to identify or analyze people. Sensitive categories carry **heightened requirements**: a stronger lawful basis (typically **explicit consent**), stricter safeguards, and an impact assessment before processing. Crucially, sensitivity follows the **nature of the data, not its source** — a face photo scraped from a public profile is still biometric material, so 'it was already public' is never a defense.",
    exampleMd:
      "FitPulse wants to train an emotion model on selfies from users' public profiles. Engineer Dario shrugs that the photos are 'already out there,' but privacy counsel Amira stops the project: faces analyzed by AI are **biometric, special-category data**, so FitPulse needs explicit consent and a DPIA before training — public visibility changes nothing.",
    questionIds: ["n-ii-a-3"],
    sort: 6,
  },
  {
    id: "t-ii-a-7",
    competencyId: "ii-a",
    title: "Privacy harms from AI: subjective, objective, persistence",
    conceptMd:
      "Privacy harm is not one thing. An **objective harm** is a concrete adverse use of someone's data — identity theft, a denied benefit. A **subjective harm** is the felt injury of being watched or exposed, which is real **even if the data is never misused** — chilled behavior, anxiety under surveillance. A separate failure mode is **data persistence**: keeping personal data beyond its purpose or lifecycle (for instance, after account deletion), which quietly inflates breach exposure and re-identification risk in training corpora.",
    exampleMd:
      "Halden Corp installs productivity-monitoring AI. Analyst Roos changes how she writes, takes fewer breaks, and dreads her screen — even though the logs are never used against anyone. That is a **subjective harm**. Meanwhile IT discovers the tool has retained keystroke logs of employees who left three years ago: **data persistence**, a second, silent violation.",
    questionIds: ["x-ii-a-5", "x-ii-a-4"],
    sort: 7,
  },

  // ───────────── II.B — Other existing laws applied to AI ─────────────
  {
    id: "t-ii-b-1",
    competencyId: "ii-b",
    title: "Copyright and training data: the fair-use gate",
    conceptMd:
      "Training an AI model means copying works at scale, so **copyright** is the first legal exposure of the AI supply chain. In the United States, **fair use** — a doctrine permitting limited use of protected works — is the key gate: fair use of existing works **does not infringe**, so the standard mitigation is to ensure training inputs are fair use, licensed, or unprotected **before** training. Two traps recur: **publicly accessible is not public domain** (copyright applies behind or in front of a paywall alike), and after-the-fact fixes — deleting the corpus, adding output disclaimers — do not undo copying that already happened.",
    exampleMd:
      "Lumen Labs plans to scrape news sites to train a commercial text model. Counsel Farah reroutes the plan: license the archives where possible, keep a documented **fair-use analysis** for the rest, and drop sources that fail it — because the news outlets' lawsuits would target the unauthorized **training copies**, not just look-alike outputs.",
    questionIds: ["x-ii-b-4", "n-ii-b-1"],
    sort: 1,
  },
  {
    id: "t-ii-b-2",
    competencyId: "ii-b",
    title: "AI inventorship and output ownership",
    conceptMd:
      "US IP law is built around **human authorship and inventorship**. In **Thaler v. Vidal**, the courts held that **only a human can be a named inventor on a patent** — an AI system cannot. The same human-centric doctrine makes copyright in **AI-generated outputs** uncertain, so the governance answer is contractual: when procuring or licensing generative AI, **expressly allocate ownership and usage rights of the outputs in the contract**, instead of trusting defaults like work-for-hire to sort it out.",
    exampleMd:
      "Corvid Media licenses the Synthetiq image platform for ad campaigns. Before launch, general counsel Ben insists the master agreement state that Corvid owns all generated imagery and Synthetiq keeps no reuse rights — because if the question ever reached a court, the 'author' of an AI image is exactly the kind of dispute nobody wins cheaply.",
    questionIds: ["x-ii-b-1", "n-ii-b-2"],
    sort: 2,
  },
  {
    id: "t-ii-b-3",
    competencyId: "ii-b",
    title: "Disparate treatment vs disparate impact",
    conceptMd:
      "US nondiscrimination law distinguishes two theories. **Disparate treatment** is **intentional** discrimination — a rule or decision that treats a protected group differently on purpose. **Disparate (adverse) impact** is a facially neutral practice that **unintentionally** disadvantages a protected group at a higher rate — and it is the theory that catches most AI systems, because models discriminate through correlations, not motives. Watch for **proxy variables**: an input like ZIP code that stands in for race or another protected class can create liability even though the protected attribute never appears in the data.",
    exampleMd:
      "Vanta Retail's pricing AI never sees race — but it charges more in ZIP codes that correlate tightly with protected classes, and its hiring model quietly rejects older applicants at twice the rate of younger ones. Neither outcome was intended; both are **disparate impact** problems, and 'the model did it' is not a defense.",
    questionIds: ["x-ii-b-2", "z-ii-b-1"],
    sort: 3,
  },
  {
    id: "t-ii-b-4",
    competencyId: "ii-b",
    title: "The US anti-bias toolkit — and the NAIIA trap",
    conceptMd:
      "Know what each US instrument is **for**. The **FCRA** (Fair Credit Reporting Act) fires when **consumer-report data such as credit history** feeds an employment or credit decision — demanding disclosure and authorization, an **adverse-action notice**, and a right to dispute. The **ADA** covers disability discrimination, including AI screening tools; the **EEOC** brings enforcement actions on automated hiring (persuasive agency views, not statutes); the **Fair Housing Act** polices housing, lending, and insurance. The perennial trap is the **NAIIA** (National AI Initiative Act of 2020): it merely coordinates federal AI **research and development** and imposes **no private-sector duties** — so whenever a question asks which source is *least* likely to give anti-discrimination guidance, NAIIA is the answer.",
    exampleMd:
      "Hartline Logistics' hiring AI ingests credit reports bought from a consumer reporting agency and auto-rejects Dwayne partly on that data. Compliance counsel Mei walks the stack: **FCRA** demands the adverse-action notice Dwayne never got; the ADA and EEOC guidance shape the bias review; and the intern's suggestion to 'check the NAIIA' gets a gentle correction — that statute funds research programs, not hiring rules.",
    questionIds: ["q-ii-b-1", "n-ii-b-3"],
    sort: 4,
  },
  {
    id: "t-ii-b-5",
    competencyId: "ii-b",
    title: "FTC Act Section 5: unfair or deceptive AI practices",
    conceptMd:
      "**Section 5 of the FTC Act** prohibits **unfair or deceptive acts or practices** in commerce, and it is the US government's broadest hook on AI conduct — no AI-specific statute required. Deception includes **failing to disclose** a material practice (running facial recognition on customers without telling them) and making **false claims about what an AI can do**. The liability turns on concealment and unfairness, not on whether data is sold or breached — so 'we never sell the data' answers the wrong question.",
    exampleMd:
      "Meridian Stores matches shoppers' faces against a watchlist and tells no one. When the practice leaks, the FTC's theory is straightforward **Section 5 deception**: customers were never told cameras were identifying them. That Meridian never sold a single faceprint is irrelevant — the undisclosed practice itself is the violation.",
    questionIds: ["q-ii-b-2", "n-ii-b-4"],
    sort: 5,
  },
  {
    id: "t-ii-b-6",
    competencyId: "ii-b",
    title: "Product liability and liability reform",
    conceptMd:
      "**Product liability** law makes manufacturers and sellers answer for **design defects** and **manufacturing defects** that injure people — and AI-enabled products are testing its limits, because an adaptive system's 'defect' may emerge only after deployment. **Liability reform** is the policy response: **changing the legal rules that determine who is accountable** for AI-caused harm, so injured parties can actually recover when traditional doctrines cannot cleanly attribute fault. Distinguish reform (rewriting the rules) from operational mechanisms like recalls, insurance, or contractual waivers, which shift costs without touching the rules.",
    exampleMd:
      "An autonomous delivery robot from Kerbside Inc. swerves and breaks a cyclist's arm after an over-the-air model update. The injured cyclist's lawyers struggle to pin the defect: the code was fine at sale, and the training data came from a third party. Legislators respond with a bill assigning responsibility across developer and deployer for autonomous-system harms — that bill is **liability reform** in action.",
    questionIds: ["n-ii-b-5"],
    sort: 6,
  },

  // ───────────── II.C — AI-specific laws ─────────────
  {
    id: "t-ii-c-1",
    competencyId: "ii-c",
    title: "EU AI Act: four risk tiers, keyed to use",
    conceptMd:
      "The **EU AI Act** (Regulation 2024/1689) sorts AI into four tiers, and the risk attaches to the **use and context — never to the technology itself**. **Prohibited** practices (Article 5) are banned outright; **high-risk** systems (Annexes I and III) are permitted but heavily regulated; **limited-risk** systems (Article 50) owe only **transparency** — telling people AI is involved; **minimal-risk** systems, like spam filters, owe nothing mandatory. The same underlying model can land in different tiers depending on what it is used for, which is why 'all machine learning is high-risk' is always a wrong answer.",
    exampleMd:
      "Bruxa Software's product catalog spans all four tiers at once: its spam filter is **minimal** risk, its CV-screening tool for employers is **high-risk** (employment is a listed area), its customer chatbot owes an Article 50 **transparency** disclosure, and the citizen 'trustworthiness score' it prototyped for a municipality is a **prohibited** social-scoring practice it must abandon.",
    questionIds: ["n-ii-c-1"],
    sort: 1,
  },
  {
    id: "t-ii-c-2",
    competencyId: "ii-c",
    title: "Article 5: the prohibited practices",
    conceptMd:
      "**Article 5** bans practices posing unacceptable risk: **social scoring**; **untargeted scraping of facial images** from the internet or CCTV; **emotion recognition in the workplace or education** (narrow medical and safety exceptions only); **biometric categorization** of sensitive traits; **predictive policing based solely on profiling**; manipulative or exploitative AI targeting vulnerabilities; and **real-time remote biometric identification in public spaces for law enforcement**, save for three narrow, judicially authorized exceptions (victim searches, imminent threats, serious-crime suspects). Prohibitions carry the top penalty tier — **€35M or 7% of global turnover** — and neither benign intent nor consent lifts a ban. The classic exam error is **under-classification**: calling a banned practice 'high-risk.'",
    exampleMd:
      "ClearGaze Ltd builds a facial-recognition database by scraping millions of face images from public websites, while its client Portway Freight installs emotion-reading cameras to 'coach stressed warehouse staff.' Both have crossed Article 5 lines — untargeted facial scraping and workplace emotion recognition are **prohibited**, full stop, and the signed consent forms Portway collected change nothing.",
    questionIds: ["q-ii-c-1", "n-ii-c-2"],
    sort: 2,
  },
  {
    id: "t-ii-c-3",
    competencyId: "ii-c",
    title: "Two doors into high-risk: Annex I vs Annex III",
    conceptMd:
      "There are two routes into the high-risk tier. **Annex I** captures AI that is a **safety component of a product already requiring third-party conformity assessment** — machinery, medical devices, toys, vehicles. **Annex III** lists **eight stand-alone areas**: biometrics; critical infrastructure; education; **employment/HR**; access to essential services (including **credit scoring** and life/health-insurance pricing); law enforcement; migration and borders; justice and democratic processes. **Article 6(3)** offers a carve-out: an Annex III system escapes high-risk status if it only performs a **narrow procedural task** posing no significant risk — but never if it **profiles natural persons**.",
    exampleMd:
      "MedScan GmbH's AI controls radiation dosing inside a CT scanner, so it is high-risk **via Annex I** — it lives inside an already-regulated medical device. TalentGrid BV's stand-alone applicant-ranking tool is high-risk **via Annex III** (employment). TalentGrid's other product, which merely converts uploaded CVs into a standard file format, invokes **Article 6(3)** — a narrow procedural task with no profiling — and stays out of the high-risk regime.",
    questionIds: ["q-ii-c-8", "n-ii-c-3"],
    sort: 3,
  },
  {
    id: "t-ii-c-4",
    competencyId: "ii-c",
    title: "Provider vs deployer — and Article 25 role-switching",
    conceptMd:
      "A **provider** develops an AI system or GPAI model and **places it on the market under its own name or trademark** — it carries the heavy duties: risk management, data governance, technical documentation, the **conformity assessment**, CE marking, registration, post-market monitoring. A **deployer** uses the system **under its own authority** and owes lighter duties: follow the instructions, assign **competent human oversight**, monitor and suspend on risk, keep logs, inform workers and affected persons. Under **Article 25**, a deployer, importer, or distributor **becomes a provider** — inheriting the full provider burden — if it (1) **rebrands** the system, (2) makes a **substantial modification**, or (3) **changes the intended purpose** so the system turns high-risk. Non-EU providers must appoint an EU **authorized representative**.",
    exampleMd:
      "GenSys SA sells its CV-screening model across the EU under its own brand — GenSys is the **provider** and owns the conformity assessment. Hirewell GmbH licenses it to filter its own applicants — a **deployer** with oversight and monitoring duties. Then Hirewell repaints the interface, names it 'HireWell AI,' and markets it to other employers: with that rebrand, **Article 25 converts Hirewell into a provider**, full obligations included.",
    questionIds: ["q-ii-c-2", "z-ii-c-7"],
    sort: 4,
  },
  {
    id: "t-ii-c-5",
    competencyId: "ii-c",
    title: "GPAI models, systemic risk, and the Code of Practice",
    conceptMd:
      "**General-purpose AI (GPAI)** models — foundation models usable across many tasks — have their own chapter. **Every** GPAI provider must keep technical documentation, give information to downstream providers, adopt an **EU copyright-compliance policy**, and publish a **summary of training content**. A model is presumed to carry **systemic risk** when its training compute exceeds **10^25 FLOPs**, triggering extra duties: model evaluation with **adversarial testing/red-teaming**, systemic-risk mitigation, serious-incident reporting, and cybersecurity. Until harmonized standards exist, following the AI Office's **Codes of Practice** is the main compliance route and earns a **presumption of conformity**; free open-source GPAI gets partial documentation exemptions unless it has systemic risk.",
    exampleMd:
      "Aurine AI trains its flagship model with 3 × 10^25 FLOPs of compute — over the threshold, so it is presumed a **systemic-risk GPAI**: red-teaming, incident reporting, and cybersecurity hardening join its baseline duties. Its compliance lead, Sofia, signs the company up to the AI Office's **Code of Practice**, buying a presumption of conformity while the formal standards are still being written.",
    questionIds: ["q-ii-c-3", "z-ii-c-6"],
    sort: 5,
  },
  {
    id: "t-ii-c-6",
    competencyId: "ii-c",
    title: "Article 50 transparency: disclose at first interaction",
    conceptMd:
      "**Article 50** covers the limited-risk tier: people must be told they are interacting with AI **at the time of the first interaction or exposure — in advance**, not after the first exchange, not buried in sign-up terms, and not only on request. **AI-generated content must be labeled in a machine-readable way**, and **deepfakes** must be disclosed as artificially generated or manipulated. These duties apply from **2 August 2026** — the 2026 Digital Omnibus deferred the high-risk deadlines but left Article 50 untouched, making 'what applies from August 2026' a transparency question.",
    exampleMd:
      "Vela Apps launches its shopping chatbot in the EU in September 2026. Product manager Jonas wants the 'you are chatting with AI' notice tucked into the terms of service; counsel Maja overrules him — the banner must appear **when the chat first opens**, and the AI-generated product images the bot sends must carry **machine-readable AI-content labels**. Both duties are live now; the deferred high-risk dates are irrelevant to a chatbot.",
    questionIds: ["q-ii-c-4", "z-ii-c-3"],
    sort: 6,
  },
  {
    id: "t-ii-c-7",
    competencyId: "ii-c",
    title: "The penalty ladder — and the SME twist",
    conceptMd:
      "Penalties scale with the sin, each cap being **the higher of** a fixed sum or a share of global annual turnover: **€35M or 7%** for prohibited practices; **€15M or 3%** for most other violations (high-risk duties, transparency, and GPAI-provider obligations); **€7.5M or 1%** for supplying **incorrect, incomplete, or misleading information** to authorities. The proportionality twist: **SMEs and start-ups pay up to the LOWER of the two amounts** in each tier, not the higher. Exam questions love placing an information-to-authorities violation among prohibited practices to see if you know it belongs to the bottom rung.",
    exampleMd:
      "Kolibri (35 employees) and OmniCorp (€80B turnover) each deploy the same banned system. Both sit in the top tier, but Kolibri's exposure is capped at the **lower** of €35M or 7% of its modest turnover, while OmniCorp faces the **higher** — 7% of €80B, dwarfing the fixed €35M. Meanwhile OmniCorp's misleading answers to the market-surveillance authority add a separate charge from the **€7.5M/1%** tier.",
    questionIds: ["q-ii-c-7", "n-ii-c-4"],
    sort: 7,
  },
  {
    id: "t-ii-c-8",
    competencyId: "ii-c",
    title: "The timeline, as amended by the 2026 Digital Omnibus",
    conceptMd:
      "Learn the phased timeline **as it stands after the Digital Omnibus on AI** (in force 27 July 2026). Unchanged milestones: the Act entered into force **1 August 2024**; **prohibitions and AI literacy** applied from **2 February 2025**; **GPAI rules, governance, and penalties** from **2 August 2025**; **Article 50 transparency** from **2 August 2026**. What the Omnibus deferred: high-risk obligations for **stand-alone Annex III systems** moved from 2 August 2026 to **2 December 2027**, and **Annex I** (AI embedded in regulated products) moved from 2 August 2027 to **2 August 2028**. Pre-existing GPAI models still have until 2 August 2027 to comply. Deferred is not repealed — and GDPR, nondiscrimination, and consumer law never paused.",
    exampleMd:
      "In October 2026, Credix Bank's governance head Petra maps the pilot of a credit-scoring AI: the Annex III conformity deadline is now **December 2027** thanks to the Omnibus, but she refuses to treat the pilot as lawless — **GDPR Article 22, discrimination law, and Article 50** all apply today, so she builds conformity-grade controls now and treats the deferral as runway, not a holiday.",
    questionIds: ["z-ii-c-1", "z-ii-c-2"],
    sort: 8,
  },
  {
    id: "t-ii-c-9",
    competencyId: "ii-c",
    title: "FRIA: the deployer's fundamental-rights assessment",
    conceptMd:
      "The **Fundamental Rights Impact Assessment (FRIA, Article 27)** examines how deploying a high-risk system could affect people's fundamental rights in the specific context of use. It is a **deployer** duty — never the provider's — and it binds two groups: **public bodies and providers of public services**, and **private deployers of credit-scoring and life/health-insurance** high-risk systems. Keep the assessments straight: the **conformity assessment** belongs to the provider, the **DPIA** to the GDPR controller when personal-data risk is high, and the **FRIA** to these specific deployers; a DPIA and a conformity assessment share the same skeleton of risk assessment plus mitigation plan.",
    exampleMd:
      "The city of Aveiro rolls out a benefits-eligibility AI, and Credix Bank deploys credit scoring — both must run a **FRIA** before use, examining impacts on applicants' rights. Aiona Ltd, which built the scoring engine, runs the **conformity assessment** instead, and Shoply's product recommender — not high-risk at all — triggers neither.",
    questionIds: ["n-ii-c-5"],
    sort: 9,
  },
  {
    id: "t-ii-c-10",
    competencyId: "ii-c",
    title: "Who enforces the AI Act",
    conceptMd:
      "Four institutions, four verbs. The **EU AI Office** (inside the European Commission) **supervises GPAI models** and drafts the **Codes of Practice**. **National market-surveillance authorities** **enforce** the Act in each Member State — and every state designates a **point of contact where citizens lodge complaints**. **Notified bodies** are independent organizations that **perform third-party conformity assessments** of high-risk systems. The **AI Board** **coordinates** the Member States for consistent application, flanked by a Scientific Panel and an Advisory Forum. Exam questions swap these roles and count on the names sounding alike.",
    exampleMd:
      "Three tickets land in one week: frontier lab Aurine AI seeks GPAI guidance — that conversation is with the **AI Office**; a Lisbon citizen complains about a biased benefits system — she writes to Portugal's **market-surveillance contact point**; MedScan needs its scanner AI certified — it books a **notified body**. Nobody calls the **AI Board**, which is busy coordinating the other twenty-seven capitals.",
    questionIds: ["n-ii-c-6"],
    sort: 10,
  },
  {
    id: "t-ii-c-11",
    competencyId: "ii-c",
    title: "South Korea's AI Basic Act: high-impact, lighter touch",
    conceptMd:
      "South Korea's **AI Basic Act** (the Framework Act on the Development of AI and Establishment of Trust) took effect **22 January 2026** — the world's **second** comprehensive AI law, run by **MSIT** with an **innovation-first, lighter-touch** philosophy. Its key term is **'high-impact AI'** (never 'high-risk'): AI significantly affecting human life, physical safety, or fundamental rights in critical sectors such as healthcare, energy, hiring, finance and loans, and education. Operators must **self-assess in advance** whether their AI is high-impact, provide a **'meaningful explanation'** of outcomes, run a user-protection plan, and keep **human oversight** — but there is **no mandatory third-party conformity assessment**, penalties top out near **₩30 million** (with possible imprisonment), foreign operators above a threshold need a **domestic representative**, and generative-AI content must be labeled. MSIT is observing a roughly one-year enforcement grace through 2026.",
    exampleMd:
      "Seoul fintech Haneul Pay is about to launch a loan-evaluation AI. Its first legal step is the statutory **self-assessment**: lending is a critical sector, so the system is **high-impact AI** — triggering the explanation duty, a user-protection plan, and human oversight. Its US partner, above the user threshold, appoints a **Korean domestic representative**; no notified body or CE mark ever enters the picture.",
    questionIds: ["q-ii-c-5", "x-ii-c-9"],
    sort: 11,
  },
  {
    id: "t-ii-c-12",
    competencyId: "ii-c",
    title: "The US patchwork: Take It Down + state laws",
    conceptMd:
      "The US still has **no comprehensive federal AI law** — federal power flows through sectoral statutes, FTC enforcement, and shifting executive orders (Biden's EO 14110 was rescinded in January 2025; the current EO 14179 posture is pro-innovation and deregulatory). The headline federal statute is the **Take It Down Act**: it criminalizes publishing **non-consensual intimate imagery, explicitly including AI deepfakes**, and requires covered platforms to remove flagged content within **48 hours** — **FTC-enforced**, with platform enforcement live since 19 May 2026. The states fill the gap: **Colorado repealed its AI Act and replaced it with SB 26-189** (automated decision-making technology that 'materially influences' consequential decisions; consumer disclosures, adverse-outcome explanations, correction rights, human review; **Attorney General-only enforcement**; effective **1 January 2027**) — contrast **Texas TRAIGA**, which is **intent-based** (effective 1 January 2026). Round out the map with **Illinois** (BIPA biometric consent; an HRA amendment on AI employment discrimination), **NYC Local Law 144** (bias audits of automated hiring tools), and **California** (training-data transparency and AI-provenance laws).",
    exampleMd:
      "Nimbus Social's counsel Dana handles a brutal quarter: a deepfake NCII report starts the **48-hour Take It Down clock**; the New York office schedules the **Local Law 144 bias audit** for its hiring screener; and for the same screening tool she builds one program covering **Texas TRAIGA** (document intent and testing) and **Colorado SB 26-189** (disclosures, adverse-outcome explanations, human review) — impact-based and intent-based regimes, one governance layer.",
    questionIds: ["q-ii-c-6", "z-ii-c-5"],
    sort: 12,
  },

  // ───────────── II.D — Standards, frameworks, principles ─────────────
  {
    id: "t-ii-d-1",
    competencyId: "ii-d",
    title: "NIST AI RMF: GOVERN, MAP, MEASURE, MANAGE",
    conceptMd:
      "The **NIST AI Risk Management Framework** is a **voluntary** US framework organized into four functions. **GOVERN** cultivates the risk-management culture — policies, roles, accountability — and runs continuously underneath the other three. **MAP** establishes context and **identifies** the risks tied to it. **MEASURE** takes the identified risks and **assesses, analyzes, and tracks** them with metrics. **MANAGE** then **prioritizes and acts** on them — mitigation, response, resourcing. The classic trap is MEASURE vs MANAGE: quantifying and tracking a risk is MEASURE; deciding what to do about it is MANAGE.",
    exampleMd:
      "Ferro Bank's fraud-model team has already documented false-positive spikes, analyzed the root cause, and tracked the error metrics — MEASURE work. This morning they are choosing between retraining the model and applying interim threshold controls; the moment they weigh options and act, they are in **MANAGE**. The escalation policy that told them who decides was **GOVERN** doing its quiet, continuous job.",
    questionIds: ["q-ii-d-1", "x-ii-d-2"],
    sort: 1,
  },
  {
    id: "t-ii-d-2",
    competencyId: "ii-d",
    title: "The seven trustworthy-AI characteristics",
    conceptMd:
      "NIST names seven characteristics of trustworthy AI: **valid and reliable** (accurate, consistent performance); **safe** (does not endanger life, health, property, or environment); **secure and resilient** (withstands attacks and recovers from incidents); **explainable and interpretable** (how a decision was made can be understood); **privacy-enhanced** (protects individuals' data and identity); **fair with harmful bias managed**; and **accountable and transparent**. Note NIST's own distinction: **transparency answers 'what happened'; explainability answers 'how the decision was made'** — related but never synonyms. Distractors like 'profit-maximizing' are not on the list.",
    exampleMd:
      "Sana Health hardens its diagnostic AI against adversarial pixel attacks and builds automatic failover — that targets **secure and resilient**. The parallel effort making the tool's outputs safe around patients is **safe**, and the dashboard clinicians use to see why a scan was flagged serves **explainable and interpretable**. Three near-neighbor characteristics, three different workstreams.",
    questionIds: ["q-ii-d-3", "n-ii-d-1"],
    sort: 2,
  },
  {
    id: "t-ii-d-3",
    competencyId: "ii-d",
    title: "NIST ARIA and the Generative AI Profile",
    conceptMd:
      "Two NIST offshoots extend the RMF. **ARIA** — **Assessing Risks and Impacts of AI** — is an evaluation program whose central component is the **AI Risk Assessment Framework** (not an ethics guideline, not a certification scheme, not binding law). The **Generative AI Profile (AI 600-1)** layers the risks peculiar to generative systems — confabulation, harmful content generation, information-integrity threats — onto the base framework so organizations can apply the RMF's four functions to GenAI specifically.",
    exampleMd:
      "Orbit Labs adopts the NIST RMF for its new text-generation product. Risk lead Camille pulls the **Generative AI Profile** to enumerate GenAI-specific risks like confabulated citations, and follows **ARIA**'s risk-assessment approach for evaluating the model's real-world impacts — voluntary tools both, chosen because they slot straight into the RMF the company already runs.",
    questionIds: ["x-ii-d-6"],
    sort: 3,
  },
  {
    id: "t-ii-d-4",
    competencyId: "ii-d",
    title: "OECD AI Principles — and the 'least relevant' pattern",
    conceptMd:
      "The **OECD AI Principles** (updated 2024) are five values-based commitments: (1) **inclusive growth, sustainable development and well-being**; (2) **human-centered values and fairness** — embedding human rights, democracy, and the rule of law; (3) **transparency and explainability**; (4) **robustness, security and safety**; (5) **accountability**. The OECD also authored the **definition of an AI system that the EU AI Act adopted**. Exam pattern: a scenario raises specific concerns (say, a vendor from a human-rights-violating state) and asks which principle is **least relevant** — eliminate the principles that map to stated facts and pick the one aimed at a different problem, typically inclusive growth/well-being in security-flavored scenarios.",
    exampleMd:
      "Procurement officer Idris is vetting an AI vendor headquartered in a state notorious for rights abuses and offensive cyber operations. His live concerns track **human-centered values**, **robustness and security**, and **transparency**; the principle about **inclusive growth and well-being**, aimed at broad societal prosperity, is the odd one out — and exactly the answer a 'least relevant' question wants.",
    questionIds: ["n-ii-d-2"],
    sort: 4,
  },
  {
    id: "t-ii-d-5",
    competencyId: "ii-d",
    title: "The ISO AI trio: 22989, 42001, 42005",
    conceptMd:
      "Three ISO/IEC standards anchor the BoK. **ISO/IEC 22989** defines AI **concepts and terminology** — the shared vocabulary. **ISO/IEC 42001** specifies an **AI management system (AIMS)**: a certifiable, organization-wide way to govern AI, earning it the nickname 'the ISO 27001 for AI' — as a management-system standard it **can be certified by a third party**. **ISO/IEC 42005** guides **AI system impact assessments**. Certifiability is the tested edge: an auditor can certify your 42001 conformance, while frameworks like the NIST RMF and principles like the OECD's are guidance you follow, not certificates you earn.",
    exampleMd:
      "Meridian Analytics' board wants an externally validated AI governance posture plus a rigorous assessment method. CISO Tara pairs **ISO/IEC 42001** — the certifiable management-system standard her auditors can attest — with **ISO/IEC 42005** for the impact assessments feeding it, and hands new hires **22989** so everyone means the same thing by 'AI system.'",
    questionIds: ["q-ii-d-4", "z-ii-d-1"],
    sort: 5,
  },
  {
    id: "t-ii-d-6",
    competencyId: "ii-d",
    title: "Voluntary vs mandatory; principles vs frameworks",
    conceptMd:
      "Two distinctions organize this whole competency. First, **voluntary vs mandatory**: the NIST AI RMF, OECD Principles, ISO standards, the EU Ethics Guidelines, Singapore's Model Framework, UNESCO's Recommendation, and the White House Blueprint for an AI Bill of Rights are all **voluntary guidance**; the **EU AI Act is binding law with penalties** — the lone mandatory instrument in the usual lineup. Second, **principles vs frameworks**: principles state the values ('be fair, be transparent' — the why and what), while **frameworks operationalize principles** into repeatable processes, roles, and controls (the how). Never treat the two relationships as interchangeable in either direction.",
    exampleMd:
      "Nordwind Robotics' new counsel, Elif, sorts the compliance shelf: the OECD Principles and NIST RMF guide the program but carry no fines — she may adapt them freely. The **EU AI Act** is different: its conformity deadlines and penalty tiers are law. She then maps each OECD principle to the NIST functions that implement it, because **frameworks are how principles become practice**.",
    questionIds: ["q-ii-d-2", "x-ii-d-5"],
    sort: 6,
  },
  {
    id: "t-ii-d-7",
    competencyId: "ii-d",
    title: "Asilomar principles: human control, failure transparency, personal privacy",
    conceptMd:
      "The **Asilomar AI Principles** (2017) span research issues, **ethics and values**, and longer-term questions. The ethics bucket supplies the exam's working set: **human control** — humans choose whether and how to delegate decisions to AI; **failure transparency** — when an AI system causes harm or refuses someone, it must be possible to find out why; **judicial transparency** — AI in judicial decision-making must be explainable to a competent authority; **personal privacy** — people control data about themselves given AI's power to analyze it; and **shared benefit** — AI should benefit and empower broadly. Scenario questions describe a misbehaving system and ask which principles are implicated; map each fact to its principle instead of grabbing one.",
    exampleMd:
      "Brightlend's loan AI harvests applicants' financial data without disclosure, refuses Amara's application with no explanation, and offers no human override. Auditor Kofi files it as a triple violation: no opt-out or override subverts **human control**, the unexplained refusal violates **failure transparency**, and the covert data use tramples **personal privacy** — three Asilomar principles, one badly governed lender.",
    questionIds: ["n-ii-d-3"],
    sort: 7,
  },
];
