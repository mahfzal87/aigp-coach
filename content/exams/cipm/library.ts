// CIPM reference library — glossary, facts, distinctions, timeline, penalties,
// instruments. Terse and scannable; current as of November 2026.

export const GLOSSARY_TAGS_CIPM: string[] = ["Program & governance", "Frameworks & standards", "Laws & regulators", "Assessments & mapping", "Security & PETs", "Vendors & M&A", "Metrics & audits", "Requests & incidents"];

export const GLOSSARY_CIPM: { term: string; def: string; tag: string }[] = [
  // ── Program & governance ──
  { term: "Privacy program", def: "The people, policies, processes and tools an organization uses to handle personal data responsibly — and to prove that it does.", tag: "Program & governance" },
  { term: "Privacy operational life cycle", def: "Assess, Protect, Sustain, Respond: the four-phase loop a privacy program runs continuously. CIPM Domains III–VI follow it in order.", tag: "Program & governance" },
  { term: "Risk appetite", def: "How much privacy risk leadership will accept in pursuit of its goals. It sets the program's ambition, tolerances and escalation points.", tag: "Program & governance" },
  { term: "Centralized governance", def: "One privacy office sets policy and makes the decisions for the whole organization. Consistent and clear, but can sit far from local realities.", tag: "Program & governance" },
  { term: "Local (decentralized) governance", def: "Business units or countries make their own privacy decisions. Close to the work, but standards and results vary.", tag: "Program & governance" },
  { term: "Hybrid governance", def: "A central office sets policy and standards; local teams implement and adapt them. The usual fit for multinationals.", tag: "Program & governance" },
  { term: "Chief privacy officer (CPO)", def: "The executive who leads the privacy program and its strategy. May or may not also hold a legally defined DPO role.", tag: "Program & governance" },
  { term: "Data protection officer (DPO)", def: "A legally defined, independent role (GDPR Arts 37–39) that informs, advises and monitors compliance and is the supervisory authority's contact point.", tag: "Program & governance" },
  { term: "Privacy champion", def: "An employee in a business unit who promotes privacy and routes issues to the privacy office. Extends the team's reach; carries no legal duties.", tag: "Program & governance" },
  { term: "RACI matrix", def: "Maps each task to who is Responsible, Accountable, Consulted and Informed — with exactly one Accountable owner per task.", tag: "Program & governance" },
  { term: "Privacy policy (internal)", def: "The rules employees and contractors must follow when handling personal data. Not the same as the public-facing privacy notice.", tag: "Program & governance" },
  { term: "Retention schedule", def: "Lists each record type with its retention period, the legal or business reason, the owner and the disposal method.", tag: "Program & governance" },
  { term: "Legal hold", def: "An instruction to preserve records relevant to litigation or an investigation. Overrides the retention schedule until it is released.", tag: "Program & governance" },

  // ── Frameworks & standards ──
  { term: "FIPPs", def: "Fair Information Practice Principles, first set out in the 1973 US HEW report. The family of principles behind most privacy laws and frameworks.", tag: "Frameworks & standards" },
  { term: "OECD Privacy Guidelines", def: "Adopted 1980, revised 2013. Eight non-binding principles from collection limitation to accountability; the revision added privacy management programs and breach notification.", tag: "Frameworks & standards" },
  { term: "APEC Privacy Framework", def: "Endorsed 2004, updated 2015. Nine principles for APEC economies, led by preventing harm — the basis for the CBPR system.", tag: "Frameworks & standards" },
  { term: "Cross-Border Privacy Rules (CBPR)", def: "Certification of a controller's privacy program by an approved accountability agent. Since June 2025 also offered as Global CBPR by the Global CBPR Forum, alongside the APEC system.", tag: "Frameworks & standards" },
  { term: "Privacy Recognition for Processors (PRP)", def: "The CBPR companion for processors: certifies that a processor can follow controller instructions and protect the data.", tag: "Frameworks & standards" },
  { term: "GAPP", def: "Generally Accepted Privacy Principles (AICPA/CICA, final version 2009): ten principles, from Management to Monitoring and enforcement, each with measurable criteria. Reissued by the AICPA in 2020 as the Privacy Management Framework.", tag: "Frameworks & standards" },
  { term: "Privacy Maturity Model", def: "AICPA/CICA (2011): rates each GAPP criterion as Ad hoc, Repeatable, Defined, Managed or Optimized.", tag: "Frameworks & standards" },
  { term: "Privacy by Design", def: "Ann Cavoukian's seven foundational principles for building privacy in from the start. Adopted internationally in 2010; codified in GDPR Art 25.", tag: "Frameworks & standards" },
  { term: "NIST Privacy Framework", def: "Voluntary US framework (1.0, January 2020) with five functions: Identify-P, Govern-P, Control-P, Communicate-P, Protect-P. Version 1.1 is still a draft.", tag: "Frameworks & standards" },
  { term: "NIST Cybersecurity Framework 2.0", def: "Released 26 February 2024: six functions — Govern, Identify, Protect, Detect, Respond, Recover — for organizations of every size and sector.", tag: "Frameworks & standards" },
  { term: "ISO/IEC 27001", def: "Certifiable requirements for an information security management system (ISMS). The 2022 edition's Annex A lists 93 controls in four themes.", tag: "Frameworks & standards" },
  { term: "ISO/IEC 27701", def: "The privacy information management system (PIMS) standard. Since the 2025 edition it stands alone — certifiable without ISO/IEC 27001.", tag: "Frameworks & standards" },
  { term: "ISO/IEC 29100", def: "ISO's privacy framework: shared terms, the actors (PII principal, controller, processor, third party) and eleven privacy principles.", tag: "Frameworks & standards" },

  // ── Laws & regulators ──
  { term: "FTC Act Section 5", def: "Bans unfair or deceptive acts or practices in commerce — the FTC's main privacy tool. Breaking your own privacy promises is deception.", tag: "Laws & regulators" },
  { term: "Consent order", def: "A regulator settlement that imposes obligations — FTC privacy orders typically run 20 years, often with a privacy program and independent assessments.", tag: "Laws & regulators" },
  { term: "HIPAA", def: "US health privacy law for covered entities and their business associates: the Privacy, Security and Breach Notification Rules for PHI.", tag: "Laws & regulators" },
  { term: "Business associate agreement", def: "The HIPAA contract a covered entity must sign before a vendor creates, receives, keeps or transmits PHI on its behalf.", tag: "Laws & regulators" },
  { term: "GLBA", def: "Gramm-Leach-Bliley Act: privacy notices, opt-outs and safeguards for financial institutions' nonpublic personal information.", tag: "Laws & regulators" },
  { term: "COPPA", def: "US law for online services directed to children under 13, or that know they collect from them: verifiable parental consent comes first.", tag: "Laws & regulators" },
  { term: "FERPA", def: "Protects education records at schools receiving US federal education funds. Rights pass from parents to the student at 18 or on entering college.", tag: "Laws & regulators" },
  { term: "CCPA / CPRA", def: "California's consumer privacy law (in effect 2020), expanded by the CPRA (operative 2023): know, delete, correct, opt out of sale or sharing, limit sensitive data.", tag: "Laws & regulators" },
  { term: "CalPrivacy", def: "The public-facing name of the California Privacy Protection Agency — the dedicated CCPA regulator, alongside the state Attorney General.", tag: "Laws & regulators" },
  { term: "Comprehensive state privacy law", def: "A state consumer privacy law covering most personal data across sectors. More than 20 states now have one, most on the Virginia model.", tag: "Laws & regulators" },
  { term: "Supervisory authority", def: "An independent public regulator that enforces the GDPR in an EU/EEA member state — it receives breach notices and complaints and can fine.", tag: "Laws & regulators" },

  // ── Assessments & mapping ──
  { term: "Data inventory", def: "A catalog of the personal data an organization holds: data elements, systems, owners, purposes, legal basis, retention and location.", tag: "Assessments & mapping" },
  { term: "Data map", def: "A picture of how personal data flows between systems, vendors and countries across its life cycle. Built from the inventory.", tag: "Assessments & mapping" },
  { term: "Records of processing (Art 30)", def: "The GDPR's mandatory register of processing activities — purposes, categories, recipients, transfers, retention and security measures.", tag: "Assessments & mapping" },
  { term: "Gap analysis", def: "Comparing current practice with what laws, policies or a chosen framework require, producing a risk-ranked remediation plan.", tag: "Assessments & mapping" },
  { term: "Privacy threshold analysis (PTA)", def: "A short screening questionnaire that decides whether a project needs a full privacy impact assessment.", tag: "Assessments & mapping" },
  { term: "Privacy impact assessment (PIA)", def: "A structured review of a project or system's privacy risks and the controls that reduce them — done early, updated on change.", tag: "Assessments & mapping" },
  { term: "Data protection impact assessment (DPIA)", def: "The GDPR's mandatory PIA (Art 35) for processing likely to result in a high risk to individuals' rights and freedoms.", tag: "Assessments & mapping" },
  { term: "Prior consultation", def: "GDPR Art 36: consulting the supervisory authority before processing when a DPIA leaves high risk unmitigated.", tag: "Assessments & mapping" },
  { term: "Transfer impact assessment (TIA)", def: "The post-Schrems II check of whether the destination country's law and practice undermine the transfer tool being relied on.", tag: "Assessments & mapping" },
  { term: "Legitimate interests assessment (LIA)", def: "The documented purpose, necessity and balancing test before relying on legitimate interests as a lawful basis.", tag: "Assessments & mapping" },
  { term: "Data protection assessment", def: "US state-law term for a documented risk-benefit review before targeted advertising, selling data, risky profiling or processing sensitive data.", tag: "Assessments & mapping" },

  // ── Security & PETs ──
  { term: "Data classification", def: "Labeling data by sensitivity — for example public, internal, confidential, restricted — so each level gets matching handling rules.", tag: "Security & PETs" },
  { term: "Least privilege", def: "Each user or system gets only the access its role requires, for only as long as required — checked in regular access reviews.", tag: "Security & PETs" },
  { term: "Separation of duties", def: "Splitting a sensitive process between people so no single person can complete — or conceal — it alone.", tag: "Security & PETs" },
  { term: "Administrative, technical & physical controls", def: "Policies and training; technology such as encryption and access control; locks, badges and secure facilities. Strong programs layer all three.", tag: "Security & PETs" },
  { term: "Encryption", def: "Transforming data with an algorithm and key so only key holders can read it. Protects data at rest and in transit.", tag: "Security & PETs" },
  { term: "Tokenization", def: "Replacing a sensitive value with a random token while the original sits in a secured vault. Common for payment card numbers.", tag: "Security & PETs" },
  { term: "Data masking", def: "Hiding part or all of a value — showing only the last four digits, say — for display, testing or support.", tag: "Security & PETs" },
  { term: "Pseudonymization", def: "Replacing identifiers so data can't be attributed to a person without separately held information. Still personal data for whoever holds the means to re-identify (EDPS v SRB, 2025).", tag: "Security & PETs" },
  { term: "Anonymization", def: "Processing data so individuals can no longer reasonably be identified by anyone. Truly anonymous data falls outside privacy law.", tag: "Security & PETs" },
  { term: "Differential privacy", def: "Adding calibrated statistical noise so query results reveal almost nothing about any single individual.", tag: "Security & PETs" },
  { term: "Homomorphic encryption", def: "Encryption that allows computation on data while it stays encrypted; the decrypted result is still correct.", tag: "Security & PETs" },
  { term: "Secure multi-party computation", def: "Several parties jointly compute a result over their combined data without any of them seeing the others' inputs.", tag: "Security & PETs" },
  { term: "Media sanitization", def: "Making data on storage media unrecoverable — clear, purge or destroy, matched to sensitivity (NIST SP 800-88 Rev. 2, 2025).", tag: "Security & PETs" },

  // ── Vendors & M&A ──
  { term: "Processor / service provider", def: "A vendor processing personal data on a customer's behalf and instructions. The CCPA calls it a 'service provider' or 'contractor'.", tag: "Vendors & M&A" },
  { term: "Sub-processor", def: "A processor's own vendor — a fourth party to the controller. Needs prior approval, with the same obligations flowed down.", tag: "Vendors & M&A" },
  { term: "Vendor due diligence", def: "Pre-contract review of a vendor's privacy and security posture — questionnaires, certifications, SOC reports, audits — scaled to risk.", tag: "Vendors & M&A" },
  { term: "Data processing agreement (DPA)", def: "The contract that sets a processor's privacy duties: instructions, security, sub-processors, breach notice, audits, return or deletion.", tag: "Vendors & M&A" },
  { term: "Standard Contractual Clauses (SCCs)", def: "The European Commission's 2021 transfer clauses in four modules, used together with a transfer impact assessment.", tag: "Vendors & M&A" },
  { term: "Binding Corporate Rules (BCRs)", def: "Supervisory-authority-approved internal rules that allow intra-group transfers out of the EEA. Slow to approve, durable at scale.", tag: "Vendors & M&A" },
  { term: "EU-US Data Privacy Framework", def: "EU adequacy (July 2023) for US organizations certified with the Department of Commerce. Upheld by the EU General Court in 2025 — appeal pending at the CJEU (C-703/25 P).", tag: "Vendors & M&A" },
  { term: "International Data Transfer Agreement (IDTA)", def: "The UK's transfer contract, in force since March 2022; the alternative is the UK Addendum to the EU SCCs.", tag: "Vendors & M&A" },
  { term: "Data localization", def: "A legal requirement to store or process certain data inside a country — it can rule out a vendor's hosting region.", tag: "Vendors & M&A" },
  { term: "Transition service agreement (TSA)", def: "In a divestiture, the seller keeps providing services — often including data access — to the sold unit for a set period.", tag: "Vendors & M&A" },

  // ── Metrics & audits ──
  { term: "Privacy metric", def: "A measure with a defined audience, purpose, owner, data source and cadence — tied to a program goal.", tag: "Metrics & audits" },
  { term: "Key performance indicator (KPI)", def: "Tracks performance against a goal — for example, the share of rights requests closed within the legal deadline.", tag: "Metrics & audits" },
  { term: "Key risk indicator (KRI)", def: "An early warning that risk is rising — for example, a growing backlog of overdue vendor assessments.", tag: "Metrics & audits" },
  { term: "Trend analysis", def: "Reading a metric over time rather than as a snapshot; the direction tells leadership more than any single value.", tag: "Metrics & audits" },
  { term: "First-party audit", def: "The organization audits itself, through internal audit or a self-assessment.", tag: "Metrics & audits" },
  { term: "Second-party audit", def: "A customer or partner audits its supplier, usually under contractual audit rights.", tag: "Metrics & audits" },
  { term: "Third-party audit", def: "An independent outside body audits — certification audits, SOC reports or regulator-ordered assessments.", tag: "Metrics & audits" },
  { term: "SOC 2 report", def: "A CPA firm's report on controls against the AICPA Trust Services Criteria. Type I: design at a point in time. Type II: operating effectiveness over a period.", tag: "Metrics & audits" },
  { term: "Three Lines Model", def: "The IIA's 2020 model: management owns risk (first line), risk and compliance functions oversee (second), internal audit assures independently (third).", tag: "Metrics & audits" },
  { term: "Continuous monitoring", def: "Ongoing, often automated tracking of controls, metrics and legal change in the gaps between audits.", tag: "Metrics & audits" },

  // ── Requests & incidents ──
  { term: "Data subject access request (DSAR)", def: "An individual's request to access their personal data — loosely, any rights request (access, deletion, correction, portability).", tag: "Requests & incidents" },
  { term: "Identity verification", def: "Confirming a requester is who they claim to be, in proportion to the data's sensitivity — without collecting more than needed.", tag: "Requests & incidents" },
  { term: "Manifestly unfounded or excessive", def: "Art 12(5): the general ground to charge a reasonable fee for, or refuse to act on, a request; the controller must show it. Separate from right-specific exceptions (e.g., Art 17(3)) and the further-copies fee (Art 15(3)).", tag: "Requests & incidents" },
  { term: "Opt-out preference signal", def: "A browser or device signal, such as Global Privacy Control, telling sites to stop selling or sharing data. California requires honoring it.", tag: "Requests & incidents" },
  { term: "Suppression list", def: "A minimal record of people who opted out, kept so marketing doesn't resume after their data is deleted or re-imported.", tag: "Requests & incidents" },
  { term: "Security incident", def: "Any event threatening the confidentiality, integrity or availability of systems or data — personal data involved or not.", tag: "Requests & incidents" },
  { term: "Personal data breach", def: "A security incident that leads to personal data being destroyed, lost, altered, disclosed or accessed without authorization.", tag: "Requests & incidents" },
  { term: "Incident response plan", def: "The documented roles, escalation thresholds, procedures, contacts and templates for handling incidents — tested before it's needed.", tag: "Requests & incidents" },
  { term: "Incident register", def: "The log of every incident and breach — facts, decisions, timings and reasoning, including those not notified.", tag: "Requests & incidents" },
  { term: "Tabletop exercise", def: "A discussion-based rehearsal of the response plan against a realistic scenario, before a real incident tests it.", tag: "Requests & incidents" },
  { term: "Post-incident review", def: "A blameless, documented look back at what happened and why; its findings become tracked fixes to controls and the plan.", tag: "Requests & incidents" },
  { term: "Materiality determination", def: "The SEC trigger: a public company files Form 8-K Item 1.05 within four business days of deciding a cyber incident is material.", tag: "Requests & incidents" },
];

export const FACT_TAGS_CIPM: string[] = ["Program", "Frameworks", "Assess", "Sustain", "Respond", "Laws & clocks"];

export const FACTS_CIPM: { n: number; fact: string; tag: string }[] = [
  { n: 1, fact: "The privacy operational life cycle runs ASSESS → PROTECT → SUSTAIN → RESPOND, then back to Assess. CIPM Domains III–VI follow that order.", tag: "Program" },
  { n: 2, fact: "Governance models: centralized (one office decides) · local/decentralized (units decide) · hybrid (the center sets policy, local teams implement).", tag: "Program" },
  { n: 3, fact: "Policy hierarchy: policy (what and why) → standards (mandatory specifics) → procedures (steps) → guidelines (recommended practice).", tag: "Program" },
  { n: 4, fact: "Principle counts: OECD 8 · APEC 9 · GAPP 10 · ISO/IEC 29100 11 · Privacy by Design 7. Swapped counts are classic distractors.", tag: "Frameworks" },
  { n: 5, fact: "OECD Guidelines: 1980, revised 2013. The eight principles survived; the revision added privacy management programs, breach notification and stronger enforcement authorities.", tag: "Frameworks" },
  { n: 6, fact: "NIST Privacy Framework 1.0 (January 2020): Identify-P, Govern-P, Control-P, Communicate-P, Protect-P. Tiers: Partial, Risk Informed, Repeatable, Adaptive. Version 1.1 is still a draft.", tag: "Frameworks" },
  { n: 7, fact: "NIST CSF 2.0 (26 February 2024): GOVERN (new), Identify, Protect, Detect, Respond, Recover — and a scope widened to every organization.", tag: "Frameworks" },
  { n: 8, fact: "Certifiable: ISO/IEC 27001, 27701 (standalone since October 2025) and 42001. Not certifiable: 27002, 29100, 29134 — or any NIST framework.", tag: "Frameworks" },
  { n: 9, fact: "Privacy Maturity Model (AICPA/CICA, 2011): 1 Ad hoc · 2 Repeatable · 3 Defined · 4 Managed · 5 Optimized — rated per GAPP criterion.", tag: "Frameworks" },
  { n: 10, fact: "Sequence: inventory → data map → gap analysis → remediation. You can't measure gaps in processing you haven't mapped.", tag: "Assess" },
  { n: 11, fact: "PTA screens → PIA assesses → DPIA when the GDPR's 'likely high risk' bar is met → Art 36 prior consultation if high risk remains.", tag: "Assess" },
  { n: 12, fact: "DPIA screening: the EDPB's nine criteria — two or more usually means a DPIA. Minimum content: description, necessity and proportionality, risks, measures.", tag: "Assess" },
  { n: 13, fact: "TIA = is the transfer tool effective in the destination country? LIA = purpose, necessity and balancing before relying on legitimate interests.", tag: "Assess" },
  { n: 14, fact: "Vendors: diligence BEFORE the contract, the right terms in it, monitoring throughout, return or deletion at exit. Accountability never moves to the vendor.", tag: "Assess" },
  { n: 15, fact: "Audits: first-party = self · second-party = a customer audits its supplier · third-party = an independent body (certification, SOC reports).", tag: "Sustain" },
  { n: 16, fact: "SOC 2 Type I = control design at a point in time; Type II = design AND operating effectiveness over a review period.", tag: "Sustain" },
  { n: 17, fact: "Every metric needs an audience, purpose, owner, source and cadence. KPI = performance against a goal; KRI = early warning of rising risk.", tag: "Sustain" },
  { n: 18, fact: "NIST SP 800-61 Rev. 2: Preparation · Detection & Analysis · Containment, Eradication & Recovery · Post-Incident Activity. Rev. 3 (April 2025) replaced them with the CSF 2.0 functions.", tag: "Respond" },
  { n: 19, fact: "Every breach is an incident; not every incident is a breach. Only personal data breaches start PRIVACY-law clocks (GDPR, HIPAA, state laws); cyber regimes such as NIS2, DORA and SEC Item 1.05 can apply with no personal data.", tag: "Respond" },
  { n: 20, fact: "Rights clocks: GDPR 1 month (+2) · CCPA 45 days (+45), receipt confirmed in 10 business days · HIPAA 30 (+30) · PIPEDA 30 (+30) · FERPA 45.", tag: "Laws & clocks" },
  { n: 21, fact: "Breach clocks: GDPR SA 72h from awareness · NIS2 24h / 72h / 1 month · HIPAA without unreasonable delay, ≤60 days · SEC 8-K 4 business days after materiality · GLBA FTC 30 days (500+).", tag: "Laws & clocks" },
  { n: 22, fact: "GDPR fines: up to €20M or 4% (principles, rights, transfers) and €10M or 2% (records, security, breach notice, DPIA, DPO) — whichever is HIGHER.", tag: "Laws & clocks" },
  { n: 23, fact: "CCPA (2025 CPI figures): revenue threshold $26,625,000; fines $2,663 per violation, $7,988 if intentional or involving minors; breach damages $107–$799 per consumer.", tag: "Laws & clocks" },
  { n: 24, fact: "California since 1 Jan 2026: risk assessments (attest by 1 Apr 2028) · ADMT duties from 1 Jan 2027 · cybersecurity audit certifications due 2028–2030 by revenue.", tag: "Laws & clocks" },
];

export const DISTINCTIONS_CIPM: { a: string; b: string; diff: string }[] = [
  { a: "Policy", b: "Procedure", diff: "What must happen and why — approved by leadership, rarely changed — vs. the step-by-step how, owned by the function and updated as tools change." },
  { a: "Privacy by Design", b: "Privacy by Default", diff: "Building protections into the architecture from the start vs. shipping with the most protective settings already on — no action needed from the user." },
  { a: "Comprehensive law", b: "Sectoral law", diff: "One law covering most personal data across the economy (GDPR, state consumer privacy laws) vs. rules for one industry or data type (HIPAA, GLBA, FERPA)." },
  { a: "Deceptive practice", b: "Unfair practice", diff: "FTC Section 5: a material misleading statement or omission vs. substantial injury consumers can't avoid and that isn't outweighed by benefits — no false statement needed." },
  { a: "ISO/IEC 27001", b: "ISO/IEC 27002", diff: "Certifiable ISMS requirements vs. implementation guidance for the controls — you certify to 27001, you consult 27002." },
  { a: "NIST Privacy Framework", b: "NIST CSF 2.0", diff: "Privacy risk from data processing (five -P functions) vs. cybersecurity risk from loss of confidentiality, integrity or availability (six functions, Govern included) — they overlap at security-related privacy events." },
  { a: "CBPR", b: "PRP", diff: "Certification of a controller's privacy program vs. certification of a processor serving controllers — both granted by accountability agents." },
  { a: "SOC 2 Type I", b: "SOC 2 Type II", diff: "Controls suitably designed at a point in time vs. designed AND operating effectively over a period — vendor diligence wants Type II." },
  { a: "Leading indicator", b: "Lagging indicator", diff: "Predicts where risk or performance is heading (overdue training, assessment backlog) vs. records what already happened (breaches, complaints, fines)." },
  { a: "Retention schedule", b: "Legal hold", diff: "The routine rule for how long each record type is kept vs. a litigation-driven freeze that suspends disposal until it is released." },
  { a: "Primary use", b: "Secondary use", diff: "The purpose disclosed at collection vs. a later, new purpose — which needs a compatibility check, fresh notice or consent before data is repurposed." },
  { a: "Due diligence", b: "Integration", diff: "Pre-deal: uncover the target's data, promises and liabilities vs. post-deal: harmonize policies, notices, consents, systems and retention." },
  { a: "Rights request", b: "Complaint", diff: "Exercising a right (access, deletion, correction) vs. alleging mishandling — different procedures and clocks, both logged and trended." },
  { a: "Tabletop exercise", b: "Post-incident review", diff: "Rehearsing the plan on a hypothetical before an incident vs. learning from a real one after it — both should change the plan." },
];

export const TIMELINE_CIPM: { date: string; label: string; status: "done" | "active" | "deferred" }[] = [
  { date: "1973", label: "US HEW report 'Records, Computers and the Rights of Citizens' sets out the Fair Information Practice Principles", status: "done" },
  { date: "1980", label: "OECD Privacy Guidelines — eight principles, still the global reference point", status: "done" },
  { date: "1996", label: "HIPAA enacted — Privacy and Security Rules follow; the HITECH Act adds breach notification in 2009", status: "done" },
  { date: "2004", label: "APEC Privacy Framework endorsed (updated 2015); the CBPR system follows in 2011", status: "done" },
  { date: "2009", label: "Final version of GAPP issued by the AICPA and CICA (reissued as the AICPA Privacy Management Framework in 2020); the Privacy Maturity Model follows in 2011", status: "done" },
  { date: "2010", label: "Privacy by Design adopted by the international data protection commissioners' conference", status: "done" },
  { date: "2013", label: "OECD Guidelines revised — privacy management programs and breach notification added", status: "done" },
  { date: "25 May 2018", label: "GDPR applies — accountability, DPIAs, DPOs and the 72-hour breach notice", status: "done" },
  { date: "Jan 2020", label: "CCPA takes effect (1 Jan) · NIST Privacy Framework 1.0 published (16 Jan)", status: "done" },
  { date: "26 Feb 2024", label: "NIST CSF 2.0 adds the Govern function and widens its scope to every organization", status: "done" },
  { date: "2025", label: "NIST SP 800-61 Rev. 3 (Apr) · Global CBPR certifications live (Jun) · CIPM BoK v4.2.0 effective (1 Sept) · ISO/IEC 27701 goes standalone (Oct)", status: "active" },
  { date: "1 Jan 2026", label: "California risk-assessment, cybersecurity-audit and ADMT rules take effect — ADMT duties from 2027, audit certifications 2028–2030", status: "active" },
];

export const PENALTY_LADDER_CIPM: { tier: string; amount: string; pct: string; what: string; width: number }[] = [
  { tier: "GDPR higher tier", amount: "€20M", pct: "4%", what: "GDPR: principles and lawful bases, data subject rights, transfers, defying an SA order", width: 100 },
  { tier: "GDPR standard tier", amount: "€10M", pct: "2%", what: "GDPR program duties: records, security, breach notification, DPIAs, DPOs, processor terms", width: 50 },
  { tier: "FTC civil penalty", amount: "$53,088", pct: "—", what: "FTC: per violation of a consent order or a rule such as COPPA — every violation counts", width: 30 },
  { tier: "CCPA administrative fine", amount: "$7,988", pct: "—", what: "CCPA: per intentional violation, or one involving a known minor under 16 ($2,663 otherwise)", width: 20 },
  { tier: "CCPA breach damages", amount: "$107–$799", pct: "—", what: "CCPA private action after a data breach: per consumer, per incident — or actual damages if greater", width: 12 },
];

export const INSTRUMENTS_CIPM: { id: string; name: string; kind: string; jurisdiction: string; status: string; sections: { heading: string; bullets: string[] }[] }[] = [
  {
    id: "nist-pf",
    name: "NIST Privacy Framework",
    kind: "Framework",
    jurisdiction: "United States — voluntary, used worldwide",
    status: "Version 1.0 (16 January 2020) is current. A 1.1 update realigned with CSF 2.0 was released as a public draft in April 2025 and has not been finalized.",
    sections: [
      { heading: "What it is", bullets: [
        "A voluntary, risk-based tool for managing privacy risk that arises from data processing — law- and sector-neutral",
        "Built to sit alongside the Cybersecurity Framework; the two share one structure",
        "Three parts: the Core, Profiles and Implementation Tiers",
      ]},
      { heading: "The Core: five functions", bullets: [
        "Identify-P — inventory and mapping, business context, risk assessment, data processing ecosystem risk",
        "Govern-P — policies, roles, risk strategy, awareness and training, monitoring and review",
        "Control-P — data processing management, including disassociated processing",
        "Communicate-P — transparency and dialogue with individuals and partners about processing and its risks",
        "Protect-P — data processing safeguards against security-related privacy events; the CSF's Detect, Respond and Recover may cover the rest",
      ]},
      { heading: "Profiles & Tiers", bullets: [
        "Current Profile = outcomes achieved today; Target Profile = outcomes needed — the gap becomes the roadmap",
        "Tiers: Partial, Risk Informed, Repeatable, Adaptive — how rigorous and integrated the risk practice is",
        "Tiers are not a certification and not a pass mark",
      ]},
      { heading: "Exam angle", bullets: [
        "Privacy risk = likelihood that a data action causes problems for individuals × the impact of those problems",
        "Processing risk → Privacy Framework; loss of confidentiality, integrity or availability → CSF; a personal data breach sits in both",
        "Nobody is 'certified to NIST' — it is a self-assessment and communication tool",
      ]},
    ],
  },
  {
    id: "nist-csf",
    name: "NIST Cybersecurity Framework 2.0",
    kind: "Framework",
    jurisdiction: "United States — voluntary, used worldwide",
    status: "Released 26 February 2024 — the first major revision since version 1.0 (2014).",
    sections: [
      { heading: "What changed in 2.0", bullets: [
        "Scope widened from critical infrastructure to organizations of every size and sector",
        "Govern added as a sixth function, drawn at the center of the wheel",
        "Cybersecurity supply chain risk management moved into Govern",
      ]},
      { heading: "Six functions", bullets: [
        "Govern — strategy, expectations, policy, roles and oversight",
        "Identify — assets, risks and continuous improvement",
        "Protect — safeguards such as access control, awareness training and data security",
        "Detect — finding and analyzing possible attacks and compromises",
        "Respond — acting on a detected incident",
        "Recover — restoring affected assets and operations",
      ]},
      { heading: "Tools", bullets: [
        "Organizational Profiles (current vs target) and Community Profiles for shared sector needs",
        "Tiers: Partial, Risk Informed, Repeatable, Adaptive",
        "Informative references, quick-start guides and implementation examples kept online",
      ]},
      { heading: "Program links", bullets: [
        "NIST SP 800-61 Rev. 3 (April 2025) maps incident response onto these six functions",
        "Pairs with the Privacy Framework for personal-data risk; Protect-P is the hinge between them",
      ]},
    ],
  },
  {
    id: "iso-27001-27002",
    name: "ISO/IEC 27001 & 27002 (2022)",
    kind: "Standard",
    jurisdiction: "International (ISO/IEC)",
    status: "2022 editions current; Amendment 1 (2024) added climate-change considerations to 27001. Certificates to the 2013 edition had to transition by 31 October 2025.",
    sections: [
      { heading: "27001 — the ISMS", bullets: [
        "Requirements for establishing, running and continually improving an information security management system",
        "Certifiable by accredited bodies: stage 1 and stage 2 audits, annual surveillance, recertification every three years",
        "Clauses 4–10 follow the harmonized structure: context, leadership, planning, support, operation, performance evaluation, improvement",
      ]},
      { heading: "Annex A & 27002", bullets: [
        "Annex A lists 93 controls in four themes: organizational (37), people (8), physical (14), technological (34)",
        "27002 gives the implementation guidance for each control — guidance only, never a certification target",
        "A Statement of Applicability records which controls apply, which are excluded, and why",
      ]},
      { heading: "Privacy links", bullets: [
        "ISO/IEC 27701 builds privacy management on the same management-system structure",
        "ISO/IEC 27018 adds controls for public cloud providers processing PII",
        "Security certification never proves privacy compliance on its own — it says nothing about purpose, notice or rights",
      ]},
    ],
  },
  {
    id: "iso-27701",
    name: "ISO/IEC 27701:2025 — Privacy information management systems",
    kind: "Standard",
    jurisdiction: "International (ISO/IEC)",
    status: "Second edition published October 2025 as a standalone, certifiable standard. The 2019 edition — an extension of ISO/IEC 27001 and 27002 — is withdrawn.",
    sections: [
      { heading: "What it is", bullets: [
        "Requirements and guidance for a privacy information management system (PIMS)",
        "For PII controllers and PII processors of any size or sector",
        "Built on the harmonized ISO management-system structure, so it integrates with 27001 and 42001",
      ]},
      { heading: "What changed in 2025", bullets: [
        "Standalone — certification no longer requires an ISO/IEC 27001 ISMS underneath",
        "Control sets for controllers and processors carried forward and updated",
        "Transition rules for 2019 certificates are set by accreditation and certification bodies",
      ]},
      { heading: "Using it", bullets: [
        "Certification evidences accountability under laws such as the GDPR — it is not a legal safe harbor",
        "Pairs with ISO/IEC 29100 (principles), 29134 (PIA guidance) and 27018 (cloud processors)",
      ]},
    ],
  },
  {
    id: "oecd-guidelines",
    name: "OECD Privacy Guidelines",
    kind: "Principles",
    jurisdiction: "OECD member countries — non-binding recommendation",
    status: "Adopted 1980; revised 2013 with the eight principles unchanged. Still the reference point for privacy laws worldwide.",
    sections: [
      { heading: "The eight principles", bullets: [
        "Collection limitation · Data quality · Purpose specification · Use limitation",
        "Security safeguards · Openness · Individual participation · Accountability",
      ]},
      { heading: "The 2013 revision", bullets: [
        "Privacy management programs as the practical form of accountability",
        "Breach notification to authorities, and to individuals likely to be affected",
        "National privacy strategies and privacy enforcement authorities with real powers",
        "Cross-border flows: restrictions proportionate to the risk; the controller stays accountable wherever the data goes",
      ]},
      { heading: "Exam angle", bullets: [
        "Eight principles — not seven, not nine",
        "Purpose specification = state the purposes up front; use limitation = no other use without consent or legal authority",
        "Non-binding — yet the ancestor of the GDPR's principles and of the APEC framework",
      ]},
    ],
  },
  {
    id: "apec-cbpr",
    name: "APEC Privacy Framework & Cross-Border Privacy Rules",
    kind: "Framework",
    jurisdiction: "Asia-Pacific (APEC) — and beyond, through the Global CBPR Forum",
    status: "Framework endorsed 2004, updated 2015. Global CBPR and PRP certifications launched in June 2025, alongside the APEC system; updated program requirements take effect 1 April 2027.",
    sections: [
      { heading: "Nine principles", bullets: [
        "Preventing harm · Notice · Collection limitation · Uses of personal information · Choice",
        "Integrity of personal information · Security safeguards · Access and correction · Accountability",
        "Preventing harm comes first — the principle with no OECD equivalent",
      ]},
      { heading: "CBPR & PRP", bullets: [
        "CBPR certifies a controller's privacy program against APEC-based program requirements",
        "PRP certifies that a processor can follow controller instructions and protect the data",
        "Certification comes from an approved accountability agent and is renewed annually",
        "Backed by cooperation among member economies' privacy enforcement authorities",
      ]},
      { heading: "Global CBPR Forum", bullets: [
        "Declared in 2022 to open the system to economies beyond APEC",
        "Global CBPR and PRP certifications live since June 2025; APEC certifications continue alongside them",
        "From 1 April 2027 the requirements grow from 50 to 57, adding risk assessment, breach processes, and sensitive and children's data",
      ]},
      { heading: "Limits", bullets: [
        "A framework for economies' laws, not binding law in itself",
        "CBPR certification does not satisfy GDPR transfer rules on its own",
      ]},
    ],
  },
  {
    id: "gapp-pmm",
    name: "GAPP & the Privacy Maturity Model",
    kind: "Framework",
    jurisdiction: "AICPA (US) & CICA (Canada, now CPA Canada)",
    status: "GAPP's final version dates from 2009 and the Privacy Maturity Model from 2011; the AICPA reissued GAPP in 2020 as the Privacy Management Framework (nine components). CIPM materials still teach GAPP's ten principles and the PMM.",
    sections: [
      { heading: "GAPP's ten principles", bullets: [
        "Management · Notice · Choice and consent · Collection · Use, retention and disposal",
        "Access · Disclosure to third parties · Security for privacy · Quality · Monitoring and enforcement",
        "Each principle broken into measurable criteria that can be audited or self-assessed",
      ]},
      { heading: "Five maturity levels", bullets: [
        "1 Ad hoc · 2 Repeatable · 3 Defined · 4 Managed · 5 Optimized",
        "Rate each criterion separately — a program can be Managed on notice and Ad hoc on vendor oversight",
        "Aim for the level the risk justifies — Optimized everywhere is rarely worth the cost",
      ]},
      { heading: "Using it", bullets: [
        "Baseline today's maturity, set targets, and track progress year over year",
        "Report maturity to leadership as a trend, not a one-off score",
      ]},
    ],
  },
  {
    id: "privacy-by-design",
    name: "Privacy by Design",
    kind: "Principles",
    jurisdiction: "International (origin: Ontario, Canada)",
    status: "Developed by Ann Cavoukian; adopted by the international data protection commissioners' conference in 2010. Made law by GDPR Art 25 (by design and by default); turned into requirements for consumer products by ISO 31700-1:2023.",
    sections: [
      { heading: "Seven foundational principles", bullets: [
        "Proactive not reactive; preventative not remedial",
        "Privacy as the default setting",
        "Privacy embedded into design",
        "Full functionality — positive-sum, not zero-sum",
        "End-to-end security — full life-cycle protection",
        "Visibility and transparency — keep it open",
        "Respect for user privacy — keep it user-centric",
      ]},
      { heading: "In the SDLC", bullets: [
        "Privacy requirements written at the requirements stage",
        "Privacy threat modeling and a PIA at design",
        "Privacy test cases and a release gate before launch",
        "Retirement plans that dispose of the data, not just the servers",
      ]},
      { heading: "Exam angle", bullets: [
        "Positive-sum: reject false trade-offs between privacy and functionality",
        "Default means protection with no action needed from the individual",
        "A review the week before launch is remediation, not design",
      ]},
    ],
  },
];
