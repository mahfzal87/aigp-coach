// CIPP/E reference library — glossary, facts, distinctions, timeline, penalties,
// instruments. Terse and scannable; current as of November 2026.

export const GLOSSARY_TAGS_CIPPE: string[] = ["Concepts & actors", "Rights", "Bases & principles", "Security & breach", "Transfers", "Supervision & fines", "ePrivacy & tech"];

export const GLOSSARY_CIPPE: { term: string; def: string; tag: string }[] = [
  // ── Concepts & actors ──
  { term: "Personal data", def: "Any information relating to an identified or identifiable natural person — names, IDs, location, online identifiers, plus opinions and inferences.", tag: "Concepts & actors" },
  { term: "Special categories", def: "The Art 9 list: racial/ethnic origin, political opinions, religion/philosophy, trade-union membership, genetic, biometric (for unique ID), health, sex life/orientation. Banned unless a condition unlocks it.", tag: "Concepts & actors" },
  { term: "Biometric data", def: "Data from specific technical processing of physical or behavioural traits (face, fingerprint). Special-category only when used to uniquely identify someone.", tag: "Concepts & actors" },
  { term: "Data subject", def: "The identified or identifiable living person the data is about.", tag: "Concepts & actors" },
  { term: "Controller", def: "Decides the purposes and means of processing, alone or jointly. The accountability anchor.", tag: "Concepts & actors" },
  { term: "Processor", def: "Processes personal data on the controller's documented instructions — with its own duties (security, records, breach notice to the controller).", tag: "Concepts & actors" },
  { term: "Joint controllers", def: "Two or more controllers jointly determining purposes and means — need a transparent Art 26 arrangement, its essence available to subjects.", tag: "Concepts & actors" },
  { term: "Sub-processor", def: "A processor's processor. Needs the controller's prior written authorisation; the same contractual duties flow down the chain (Opinion 22/2024).", tag: "Concepts & actors" },
  { term: "Recipient", def: "Anyone data is disclosed to. A 'third party' is narrower — it excludes the subject, controller, processor and their authorised staff.", tag: "Concepts & actors" },
  { term: "Processing", def: "Anything done to personal data, from collection through storage, use and disclosure to erasure. Almost nothing escapes the verb.", tag: "Concepts & actors" },
  { term: "Pseudonymisation", def: "Replacing identifiers so data cannot be attributed without a separately held key. Still personal data — and a named security measure.", tag: "Concepts & actors" },
  { term: "Anonymisation", def: "Stripping identifiability so re-identification is no longer reasonably likely by anyone. Takes data outside the GDPR — a high bar.", tag: "Concepts & actors" },
  { term: "Profiling", def: "Automated processing evaluating personal aspects — performance, economic situation, health, behaviour, location. Feeds Arts 21 and 22.", tag: "Concepts & actors" },
  { term: "Household exemption", def: "Purely personal or household processing is out of scope — lost once the activity reaches the public (CCTV filming the street: Ryneš).", tag: "Concepts & actors" },
  { term: "Main establishment", def: "The place of central administration where purposes and means are actually decided, with power to implement (Opinion 04/2024). The one-stop-shop anchor.", tag: "Concepts & actors" },
  { term: "Representative (Art 27)", def: "EU-based contact point mandatory for most non-EU controllers/processors caught by Art 3(2) targeting. Not a DPO.", tag: "Concepts & actors" },
  { term: "Data protection officer (DPO)", def: "Independent internal advisor-monitor. Mandatory for public authorities and for large-scale monitoring or special-category core activities.", tag: "Concepts & actors" },

  // ── Rights ──
  { term: "Right of access (Art 15)", def: "A copy of your data plus the metadata: purposes, categories, recipients, retention, source, transfer safeguards, automated-decision logic.", tag: "Rights" },
  { term: "Right to rectification (Art 16)", def: "Have inaccurate data corrected and incomplete data completed, without undue delay.", tag: "Rights" },
  { term: "Right to erasure (Art 17)", def: "Deletion on six grounds (purpose spent, consent withdrawn, successful objection, unlawful processing…). Defeated by expression, legal duties, research, legal claims.", tag: "Rights" },
  { term: "Right to restriction (Art 18)", def: "Store but freeze — while accuracy is contested, an objection is pending, or the subject prefers restriction to erasure.", tag: "Rights" },
  { term: "Right to data portability (Art 20)", def: "Data you provided, in structured, commonly used, machine-readable form — consent or contract bases, automated processing only.", tag: "Rights" },
  { term: "Right to object (Art 21)", def: "Stop legitimate-interests or public-task processing unless compelling grounds prevail. For direct marketing the objection is absolute.", tag: "Rights" },
  { term: "Automated decisions (Art 22)", def: "No decision based solely on automated processing with legal or similarly significant effects — unless contract, law, or explicit consent, with human-intervention safeguards.", tag: "Rights" },
  { term: "Right to be informed (Arts 13–14)", def: "Privacy-notice duties. Art 13: at collection from the subject. Art 14: data from elsewhere — within one month at the latest, plus the source.", tag: "Rights" },
  { term: "Withdrawal of consent (Art 7(3))", def: "Any time, no reason, as easy as giving it — and the subject must know this before consenting. No retroactive effect.", tag: "Rights" },
  { term: "Google Spain (2014)", def: "CJEU: search engines are controllers and must delist results on request, balancing the public's interest in the information. The delisting landmark.", tag: "Rights" },
  { term: "SCHUFA (2023)", def: "CJEU: a credit score can itself be an Art 22 automated decision when third parties draw strongly on it. Rubber-stamping does not escape Art 22.", tag: "Rights" },
  { term: "Restrictions on rights (Art 23)", def: "Member-state law may restrict rights — only via necessary, proportionate measures for listed aims (security, crime, others' rights).", tag: "Rights" },

  // ── Bases & principles ──
  { term: "Lawfulness, fairness & transparency", def: "The first principle: a valid basis, no deception, and clear information about what happens to the data.", tag: "Bases & principles" },
  { term: "Purpose limitation", def: "Collect for specified, explicit, legitimate purposes; further use must pass the Art 6(4) compatibility test.", tag: "Bases & principles" },
  { term: "Data minimisation", def: "Adequate, relevant, limited to what the purpose needs. 'Nice to have' is the enemy.", tag: "Bases & principles" },
  { term: "Accuracy", def: "Keep data accurate and up to date; erase or rectify the inaccurate without delay.", tag: "Bases & principles" },
  { term: "Storage limitation", def: "Keep identifiable data no longer than the purpose requires — retention schedules, not drawers.", tag: "Bases & principles" },
  { term: "Integrity & confidentiality", def: "The security principle: protect against unauthorised processing, loss, destruction, damage.", tag: "Bases & principles" },
  { term: "Accountability", def: "Comply AND demonstrate compliance — records, policies, DPIAs, training. The GDPR's defining addition (Art 5(2)).", tag: "Bases & principles" },
  { term: "Consent", def: "Freely given, specific, informed, unambiguous — a statement or clear affirmative action. Provable, and as easy to withdraw as to give.", tag: "Bases & principles" },
  { term: "Explicit consent", def: "The upgraded consent for special categories (Art 9), automated decisions (Art 22) and transfer derogations (Art 49) — a clear, express statement.", tag: "Bases & principles" },
  { term: "Contractual necessity", def: "Processing genuinely needed to perform the subject's contract or pre-contract steps they requested. Read narrowly — ads are not 'necessary'.", tag: "Bases & principles" },
  { term: "Legal obligation", def: "An EU or member-state law compels the processing (tax, social security). Not available for foreign-law demands alone.", tag: "Bases & principles" },
  { term: "Vital interests", def: "Life-or-death protection of the subject or another person — typically when consent is impossible.", tag: "Bases & principles" },
  { term: "Public task", def: "Official authority or a task in the public interest, laid down by law. The public sector's workhorse — which cannot use legitimate interests instead.", tag: "Bases & principles" },
  { term: "Legitimate interests", def: "The controller's or a third party's interests, passed through the three-step purpose / necessity / balancing test (EDPB Guidelines 1/2024). Document it as an LIA.", tag: "Bases & principles" },

  // ── Security & breach ──
  { term: "Personal data breach", def: "A breach of security leading to accidental or unlawful destruction, loss, alteration, unauthorised disclosure or access. Confidentiality, integrity or availability.", tag: "Security & breach" },
  { term: "Breach notification (Art 33)", def: "Controller → SA, without undue delay and where feasible within 72h of awareness — unless unlikely to result in a risk. Document every breach regardless.", tag: "Security & breach" },
  { term: "Breach communication (Art 34)", def: "Controller → subjects, only on likely HIGH risk, without undue delay. Escapes: strong protection (encryption), later measures, disproportionate effort → public notice.", tag: "Security & breach" },
  { term: "Security of processing (Art 32)", def: "Measures appropriate to the risk — pseudonymisation, encryption, CIA plus resilience, timely restoration, regular testing.", tag: "Security & breach" },
  { term: "Technical & organisational measures", def: "The TOMs: access controls, encryption and backups on the technical side; policies, training and audits on the organisational side.", tag: "Security & breach" },
  { term: "Data protection by design & by default (Art 25)", def: "Build safeguards in at planning time; by default process only what each purpose needs — amount, extent, storage, accessibility.", tag: "Security & breach" },
  { term: "DPIA (Art 35)", def: "Pre-processing assessment for likely-high-risk processing. Automatic triggers: big profiling with significant effects, large-scale special data, large-scale public monitoring.", tag: "Security & breach" },
  { term: "Prior consultation (Art 36)", def: "When a DPIA leaves residual high risk unmitigated, ask the SA before starting. Written advice within 8 weeks (+6).", tag: "Security & breach" },
  { term: "Records of processing (Art 30)", def: "Controller and processor each keep their own register, available to the SA. The sub-250-employee exemption dies on non-occasional, risky or special-category processing.", tag: "Security & breach" },
  { term: "Processing agreement (Art 28)", def: "The mandatory controller-processor contract: instructions, confidentiality, security, sub-processor authorisation, assistance, delete-or-return, audits.", tag: "Security & breach" },
  { term: "NIS2 Directive", def: "EU cybersecurity law for essential and important entities — incident reporting with its own clocks. Protects services and networks; the GDPR protects personal data.", tag: "Security & breach" },

  // ── Transfers ──
  { term: "Third country", def: "Any country outside the EU/EEA. Sending personal data there — including remote access from there — is a Chapter V transfer.", tag: "Transfers" },
  { term: "Adequacy decision (Art 45)", def: "Commission finding of essentially equivalent protection; data then flows as if domestic. Reviewed at least every four years; repealable.", tag: "Transfers" },
  { term: "EU-US Data Privacy Framework", def: "US adequacy limited to organisations certified with the Department of Commerce (since 10 July 2023). Upheld by the General Court in Latombe (2025).", tag: "Transfers" },
  { term: "Standard Contractual Clauses", def: "The Commission's 2021 modular transfer contract — four controller/processor modules plus a docking clause. Core text untouchable; TIA required.", tag: "Transfers" },
  { term: "Binding Corporate Rules", def: "Binding internal rules for intra-group transfers, approved by the lead SA after an EDPB opinion. Slow to build, durable at scale.", tag: "Transfers" },
  { term: "Derogations (Art 49)", def: "Situation-specific excuses — explicit consent (risk-informed), contract, legal claims, vital interests, public interest. Occasional and necessary only; last resort.", tag: "Transfers" },
  { term: "Transfer impact assessment", def: "The post-Schrems II homework: assess destination law and practice before relying on Art 46 tools, and document the conclusion.", tag: "Transfers" },
  { term: "Supplementary measures", def: "Add-ons when destination law undermines safeguards: strong encryption with EEA-held keys, contractual commitments, organisational controls (Recommendations 01/2020).", tag: "Transfers" },
  { term: "Schrems I (2015)", def: "CJEU invalidated Safe Harbor — US surveillance failed the 'essentially equivalent' bar it coined.", tag: "Transfers" },
  { term: "Schrems II (2020)", def: "CJEU invalidated Privacy Shield and conditioned SCCs on case-by-case assessment plus supplementary measures where needed.", tag: "Transfers" },
  { term: "Latombe (2025)", def: "General Court dismissed the annulment challenge to the DPF adequacy decision (September 2025) — the framework stands.", tag: "Transfers" },
  { term: "Onward transfer", def: "The importer passing data further along. Chapter V protection must follow the data — the level of protection cannot be undermined downstream.", tag: "Transfers" },

  // ── Supervision & fines ──
  { term: "Supervisory authority", def: "Independent national regulator with investigative, corrective and advisory powers — from warnings to processing bans and fines.", tag: "Supervision & fines" },
  { term: "EDPB", def: "The board of all national SAs plus the EDPS. Guidelines, consistency opinions, and binding Art 65 dispute decisions. Not itself an SA.", tag: "Supervision & fines" },
  { term: "EDPS", def: "The supervisory authority for EU institutions and bodies (Regulation 2018/1725). Sits on the EDPB and provides its secretariat. Never regulates companies.", tag: "Supervision & fines" },
  { term: "Lead supervisory authority", def: "The SA of the main establishment, steering cross-border cases under the one-stop-shop. Requires real EU decision-making (Opinion 04/2024).", tag: "Supervision & fines" },
  { term: "One-stop-shop", def: "Cross-border processing handled by one lead SA cooperating with concerned SAs (Art 60). No EU establishment → no OSS: every SA is competent.", tag: "Supervision & fines" },
  { term: "Consistency mechanism", def: "How SAs stay aligned: EDPB opinions on draft measures (Art 64), binding dispute resolution (Art 65), urgency procedure (Art 66).", tag: "Supervision & fines" },
  { term: "Binding dispute resolution (Art 65)", def: "The EDPB settles deadlocks between lead and concerned SAs with a decision that binds them. The consistency mechanism's teeth.", tag: "Supervision & fines" },
  { term: "Corrective powers (Art 58)", def: "The SA toolkit: warnings, reprimands, compliance orders, processing restrictions or bans, erasure orders, flow suspensions, fines.", tag: "Supervision & fines" },
  { term: "Administrative fines (Art 83)", def: "Two tiers — €10M/2% for controller/processor duties; €20M/4% for principles, bases, rights and transfers. Always whichever is HIGHER.", tag: "Supervision & fines" },
  { term: "Right to lodge a complaint (Art 77)", def: "Free complaint to an SA in the member state of residence, work, or infringement. The SA must report progress within three months.", tag: "Supervision & fines" },
  { term: "Right to compensation (Art 82)", def: "Court-awarded damages for material AND non-material harm (distress counts). Controller liable in full; processor only for its own failures.", tag: "Supervision & fines" },
  { term: "Representative actions (Art 80)", def: "Not-for-profit bodies may exercise rights for subjects — with a mandate, or without one where member-state law allows.", tag: "Supervision & fines" },

  // ── ePrivacy & tech ──
  { term: "ePrivacy Directive (2002/58/EC)", def: "The confidentiality-of-communications law, amended 2009 — cookies, e-marketing, traffic and location data. Applied through national laws; lex specialis to the GDPR.", tag: "ePrivacy & tech" },
  { term: "ePrivacy Regulation (withdrawn)", def: "The 2017 proposal meant to replace the Directive — withdrawn by the Commission in 2025. It never applied; the Directive governs.", tag: "ePrivacy & tech" },
  { term: "Cookie consent rule (Art 5(3))", def: "Consent before storing or accessing information on terminal equipment — personal data or not. Cookies, SDKs, pixels, fingerprinting alike.", tag: "ePrivacy & tech" },
  { term: "Strictly necessary exemption", def: "No consent needed for cookies essential to the service the USER explicitly requested — carts, login sessions, security. Analytics and ads never qualify.", tag: "ePrivacy & tech" },
  { term: "Soft opt-in", def: "Email marketing without fresh consent: details collected in a sale + your own similar products + free opt-out at collection and in every message. All three or nothing.", tag: "ePrivacy & tech" },
  { term: "Direct marketing", def: "Any advertising aimed at individuals. Channel rules come from ePrivacy; the data processing needs a GDPR basis; the Art 21(2) objection is absolute.", tag: "ePrivacy & tech" },
  { term: "Dark patterns", def: "Interface designs that steer users into unintended choices — nagging, obstruction, pre-selection. EDPB guidance treats them as consent and fairness failures.", tag: "ePrivacy & tech" },
  { term: "Planet49 (2019)", def: "CJEU: pre-ticked boxes are not consent, and Art 5(3) protects the device regardless of whether the stored data is personal.", tag: "ePrivacy & tech" },
  { term: "Cookie wall", def: "Access conditioned on accepting tracking. Clashes with freely-given consent — a take-it-or-leave-it choice is rarely a choice.", tag: "ePrivacy & tech" },
  { term: "Traffic data", def: "Metadata about a communication's conveyance or billing. Erase or anonymise when no longer needed; value-added uses need consent.", tag: "ePrivacy & tech" },
  { term: "Location data", def: "Where the device is. Beyond traffic purposes: anonymised, or processed with consent for value-added services.", tag: "ePrivacy & tech" },
  { term: "Online behavioural advertising", def: "Ads targeted from tracked behaviour. The tracking layer needs ePrivacy consent; the profiling needs a GDPR basis and transparency — and marketing objections always win.", tag: "ePrivacy & tech" },
];

export const FACT_TAGS_CIPPE: string[] = ["GDPR core", "Rights", "Transfers", "Enforcement", "ePrivacy & tech"];

export const FACTS_CIPPE: { n: number; fact: string; tag: string }[] = [
  { n: 1, fact: "GDPR adopted 27 April 2016, applies 25 May 2018. A REGULATION — directly applicable, no national transposition (DPD 95/46 repealed).", tag: "GDPR core" },
  { n: 2, fact: "Breach chain: processor → controller without undue delay · controller → SA where feasible ≤72h of AWARENESS · subjects only on likely HIGH risk, without undue delay.", tag: "GDPR core" },
  { n: 3, fact: "Rights clock: ONE month, extendable by TWO further months for complexity/volume — tell the subject within the first month, with reasons.", tag: "Rights" },
  { n: 4, fact: "Rights are free of charge. A fee or refusal only for manifestly unfounded or excessive (esp. repetitive) requests — and the controller bears the proof.", tag: "Rights" },
  { n: 5, fact: "Child consent for online services: 16 by default — member states may lower it, but never below 13 (Art 8).", tag: "GDPR core" },
  { n: 6, fact: "Fines: €20M/4% (principles, bases, rights, transfers) vs €10M/2% (controller/processor duties). Always WHICHEVER IS HIGHER of the sum and the percentage.", tag: "Enforcement" },
  { n: 7, fact: "Art 30 records: the under-250-employee exemption is lost if processing is non-occasional, likely risky, or touches special/criminal data — so it rarely applies.", tag: "GDPR core" },
  { n: 8, fact: "Portability needs ALL of: data the subject provided · consent or contract basis · automated means. Format: structured, commonly used, machine-readable.", tag: "Rights" },
  { n: 9, fact: "Art 21(2): the direct-marketing objection is ABSOLUTE — no balancing, includes the profiling behind it, and it is free.", tag: "Rights" },
  { n: 10, fact: "Art 22 solely automated decisions with legal/similarly significant effects: allowed only for contract necessity, authorising law, or EXPLICIT consent — with human-intervention safeguards.", tag: "Rights" },
  { n: 11, fact: "DPIA before likely-HIGH-risk processing; if residual risk stays high → Art 36 prior consultation. SA written advice within 8 weeks (+6 for complexity).", tag: "GDPR core" },
  { n: 12, fact: "DPO mandatory in three cases: public authority · core activities = large-scale regular & systematic monitoring · core activities = large-scale special/criminal data.", tag: "GDPR core" },
  { n: 13, fact: "Transfer ladder: Art 45 adequacy → Art 46 safeguards (SCCs, BCRs, codes, certification) → Art 49 derogations, read restrictively and last.", tag: "Transfers" },
  { n: 14, fact: "Schrems I (2015) killed Safe Harbor; Schrems II (2020) killed Privacy Shield but saved SCCs — subject to a TIA and supplementary measures.", tag: "Transfers" },
  { n: 15, fact: "EU-US DPF: adequacy since 10 July 2023, certified importers only. Latombe (General Court, Sept 2025) dismissed the challenge — the DPF stands.", tag: "Transfers" },
  { n: 16, fact: "The 2021 SCCs come in four modules (C2C, C2P, P2P, P2C) plus a docking clause — pick the module matching the relationship, never edit the core clauses.", tag: "Transfers" },
  { n: 17, fact: "ePrivacy: the REGULATION proposal was withdrawn in 2025 — the 2002/58 DIRECTIVE (as amended 2009) still governs, applied via national laws with GDPR-grade consent.", tag: "ePrivacy & tech" },
  { n: 18, fact: "Cookies need prior consent unless for transmission or STRICTLY NECESSARY for the user-requested service. Analytics and advertising are never strictly necessary.", tag: "ePrivacy & tech" },
  { n: 19, fact: "Soft opt-in needs all three: details collected in a sale · your OWN similar products · free opt-out at collection AND in every message.", tag: "ePrivacy & tech" },
  { n: 20, fact: "Convention 108 (1981): first binding international DP treaty, CoE, open worldwide. The modernising 108+ protocol (2018) is NOT yet in force.", tag: "GDPR core" },
  { n: 21, fact: "One-stop-shop: lead SA = main establishment where purposes & means are decided in the EU (Opinion 04/2024). No EU establishment → no OSS, every SA competent.", tag: "Enforcement" },
  { n: 22, fact: "Art 82 compensation covers material AND non-material damage; SA complaints (Art 77) are free; NGOs can represent subjects (Art 80).", tag: "Enforcement" },
  { n: 23, fact: "Special categories need TWO locks: an Art 6 basis PLUS an Art 9(2) condition. Criminal-offence data sits separately under Art 10.", tag: "GDPR core" },
  { n: 24, fact: "The household exemption covers purely personal use only — a home camera filming the street drops it (Ryneš), and the GDPR applies in full.", tag: "GDPR core" },
];

export const DISTINCTIONS_CIPPE: { a: string; b: string; diff: string }[] = [
  { a: "Regulation", b: "Directive", diff: "Directly applicable one text everywhere vs. needs national transposition — GDPR is the first, DPD/LED/ePrivacy are the second." },
  { a: "Privacy (Charter Art 7)", b: "Data protection (Charter Art 8)", diff: "Respect for private life vs. a free-standing right with its own ingredients: fairness, purposes, access, independent supervision." },
  { a: "Council of Europe", b: "European Union", diff: "46-state human-rights body (ECHR, Convention 108, ECtHR) vs. 27-state legal order (Charter, GDPR, CJEU)." },
  { a: "European Council", b: "Council of the EU", diff: "EU leaders setting direction at summits vs. ministers negotiating and adopting legislation — neither is the Council of Europe." },
  { a: "Personal data", b: "Special categories", diff: "Any identifiable-person information vs. the Art 9 list needing an extra unlocking condition on top of Art 6." },
  { a: "Transparency (Arts 13–14)", b: "Access (Art 15)", diff: "Information PUSHED to subjects up front vs. a copy PULLED by the subject on request." },
  { a: "Erasure", b: "Restriction", diff: "Delete the data vs. store-but-freeze it while accuracy or an objection is resolved." },
  { a: "Objection (Art 21)", b: "Withdrawal of consent", diff: "Attacks legitimate-interests/public-task processing vs. ends consent-based processing — match the lever to the basis." },
  { a: "Main establishment", b: "Art 27 representative", diff: "The EU decision-making seat that anchors one-stop-shop vs. a mere contact point for a controller with no EU establishment." },
  { a: "Adequacy", b: "SCCs", diff: "The Commission clears the whole destination once vs. the exporter builds contract-level safeguards itself — plus a TIA after Schrems II." },
  { a: "Personal data breach", b: "Security incident", diff: "Personal data actually compromised vs. any security event — only the first triggers Arts 33–34." },
  { a: "DPD 95/46", b: "GDPR", diff: "Directive with diverging national versions and weak fines vs. directly applicable regulation with accountability and 4% penalties." },
  { a: "GDPR", b: "LED (2016/680)", diff: "General processing vs. police and criminal justice — same vocabulary, but LED rights can be restricted and it needs transposition." },
  { a: "Profiling", b: "Automated decision-making", diff: "Evaluating personal aspects by machine vs. DECIDING by machine — Art 22 bites only when a solely automated decision has serious effects." },
];

export const TIMELINE_CIPPE: { date: string; label: string; status: "done" | "active" | "deferred" }[] = [
  { date: "1950", label: "ECHR signed — Art 8 protects private and family life, home, correspondence", status: "done" },
  { date: "1981", label: "Convention 108 — first binding international data-protection treaty (CoE)", status: "done" },
  { date: "1995", label: "Data Protection Directive 95/46/EC — first EU-wide framework", status: "done" },
  { date: "2000", label: "EU Charter of Fundamental Rights proclaimed at Nice (Arts 7 & 8)", status: "done" },
  { date: "2002", label: "ePrivacy Directive 2002/58/EC — communications, cookies (consent added 2009)", status: "done" },
  { date: "2009", label: "Treaty of Lisbon — the Charter becomes legally binding; Art 16 TFEU", status: "done" },
  { date: "27 Apr 2016", label: "GDPR adopted (with the Law Enforcement Directive)", status: "done" },
  { date: "25 May 2018", label: "GDPR applies across the EU/EEA — directly, in every member state", status: "done" },
  { date: "16 Jul 2020", label: "Schrems II — Privacy Shield invalidated; SCCs survive with TIAs", status: "done" },
  { date: "10 Jul 2023", label: "EU-US Data Privacy Framework adequacy decision for certified importers", status: "done" },
  { date: "2025", label: "DPF upheld at first instance (Latombe, General Court) · ePrivacy Regulation proposal withdrawn — the Directive governs", status: "active" },
];

export const PENALTY_LADDER_CIPPE: { tier: string; amount: string; pct: string; what: string; width: number }[] = [
  { tier: "Higher tier", amount: "€20M", pct: "4%", what: "Principles & lawful bases (consent included), data subject rights, transfers, defying an SA order", width: 100 },
  { tier: "Standard tier", amount: "€10M", pct: "2%", what: "Controller/processor duties: security, records, breach notification, DPIA, DPO, child-consent conditions", width: 50 },
  { tier: "Beyond fines", amount: "Uncapped", pct: "—", what: "Art 58 corrective powers (warning → processing ban → flow suspension) + Art 82 damages, material and non-material", width: 25 },
];

export const INSTRUMENTS_CIPPE: { id: string; name: string; kind: string; jurisdiction: string; status: string; sections: { heading: string; bullets: string[] }[] }[] = [
  {
    id: "gdpr",
    name: "General Data Protection Regulation (2016/679)",
    kind: "Law",
    jurisdiction: "European Union / EEA",
    status: "Binding and directly applicable since 25 May 2018 (adopted 27 April 2016; repealed Directive 95/46/EC).",
    sections: [
      { heading: "Scope & key concepts", bullets: [
        "Material scope: automated processing plus manual data in structured filing systems — household, police (LED) and EU-institution processing carved out",
        "Territorial scope: EU establishment (Art 3(1)) or targeting — offering goods/services to, or monitoring, people in the EU (Art 3(2))",
        "Personal data read broadly: identifiable = can be singled out; pseudonymised data stays in scope, truly anonymous data leaves",
        "Special categories (Art 9) and criminal-offence data (Art 10) need extra conditions on top of a lawful basis",
      ]},
      { heading: "Principles & lawful bases", bullets: [
        "Seven principles: lawfulness/fairness/transparency · purpose limitation · minimisation · accuracy · storage limitation · integrity & confidentiality · accountability",
        "Six Art 6 bases with no hierarchy; consent must be freely given, specific, informed, unambiguous — child ISS consent at 16, lowerable to 13",
        "Legitimate interests runs the three-step purpose / necessity / balancing test (EDPB Guidelines 1/2024)",
        "Special categories need an Art 6 basis PLUS an Art 9(2) condition — two locks",
      ]},
      { heading: "Data subject rights", bullets: [
        "Information, access, rectification, erasure, restriction, portability, objection, automated-decision protections (Arts 12–22)",
        "One month to respond, extendable by two further months for complexity or volume; free unless manifestly unfounded or excessive",
        "The direct-marketing objection is absolute (Art 21(2)); Art 22 gates: contract, authorising law, explicit consent",
        "Member states may restrict rights only by necessary, proportionate law for listed aims (Art 23)",
      ]},
      { heading: "Accountability & security", bullets: [
        "Demonstrate compliance: records (Art 30), data protection by design & default (Art 25), processor contracts (Art 28), DPIAs (Art 35), DPOs (Art 37)",
        "Art 32 risk-appropriate security — pseudonymisation, encryption, resilience, regular testing",
        "Breach: SA within 72h of awareness where feasible; subjects without undue delay on likely HIGH risk; document everything internally",
        "Residual high risk after a DPIA → prior consultation with the SA (Art 36)",
      ]},
      { heading: "Transfers & enforcement", bullets: [
        "Chapter V ladder: adequacy (Art 45) → appropriate safeguards (Art 46: SCCs, BCRs) → derogations (Art 49, last resort)",
        "Independent SAs with investigative and corrective powers; EDPB consistency; one-stop-shop anchored on the main establishment",
        "Fines: whichever is higher of €10M/2% or €20M/4% depending on the tier; Art 82 compensation includes non-material damage",
      ]},
    ],
  },
  {
    id: "eprivacy-directive",
    name: "ePrivacy Directive (2002/58/EC, as amended 2009)",
    kind: "Law",
    jurisdiction: "European Union — via national implementing laws",
    status: "In force through national laws. The replacement ePrivacy Regulation (proposed 2017) was withdrawn by the Commission in 2025 — the Directive governs.",
    sections: [
      { heading: "Role", bullets: [
        "Lex specialis to the GDPR for electronic communications — its specific rules apply first",
        "Protects the confidentiality of communications and the user's terminal equipment",
        "Consent standard borrowed from the GDPR by reference",
        "The device rule applies whether or not the stored information is personal data",
      ]},
      { heading: "Cookies & devices (Art 5(3))", bullets: [
        "Prior consent before storing or accessing information on a device — cookies, SDKs, pixels, fingerprinting",
        "Exemptions: carrying out the transmission, or strictly necessary for the service the user explicitly requested",
        "Analytics, advertising and social plugins are not strictly necessary — consent territory",
        "Planet49: pre-ticked boxes invalid; the rule protects the device regardless of data type",
      ]},
      { heading: "Direct marketing (Art 13)", bullets: [
        "Email, SMS, fax and automated calls need prior opt-in consent",
        "Soft opt-in: details collected in a sale + own similar products + free opt-out at collection and in every message",
        "Sender identity never disguised; valid opt-out address always provided",
        "Live human calls: member-state choice between opt-in and opt-out with do-not-call registers",
      ]},
      { heading: "Communications data", bullets: [
        "Confidentiality: no listening, tapping, storage or surveillance without consent or legal authority",
        "Traffic data erased or anonymised once not needed for transmission or billing; value-added services need consent",
        "Location data beyond traffic: anonymous or consented",
        "Calling-line identification blocking and directory choices for subscribers",
      ]},
    ],
  },
  {
    id: "convention-108",
    name: "Convention 108 (1981) & 108+ (2018 protocol)",
    kind: "Treaty",
    jurisdiction: "Council of Europe — open to any state worldwide",
    status: "Convention 108 in force since 1985. The modernising 108+ protocol is NOT yet in force — still awaiting ratifications.",
    sections: [
      { heading: "What it is", bullets: [
        "The first binding international data-protection treaty — a Council of Europe instrument, not EU law",
        "Open to accession by non-European states, giving it global reach",
        "Shaped the DPD and the GDPR; party status is a plus-factor in EU adequacy assessments",
      ]},
      { heading: "Core commitments", bullets: [
        "Fair and lawful processing, purpose limitation, data quality",
        "Special safeguards for sensitive data",
        "Security measures and rights of access and rectification",
        "Free flow of data between parties as the default",
      ]},
      { heading: "108+ modernisation", bullets: [
        "Breach notification, accountability and proportionality added",
        "Stronger, more independent supervisory authorities",
        "Transparency duties aligned with GDPR vocabulary",
        "Exam angle: never treat 108+ as in force — it is not",
      ]},
    ],
  },
  {
    id: "echr-charter",
    name: "ECHR Article 8 & EU Charter Articles 7–8",
    kind: "Rights instrument",
    jurisdiction: "Council of Europe (ECHR) / European Union (Charter)",
    status: "ECHR in force since 1953; the Charter was proclaimed in 2000 and became legally binding with Lisbon on 1 December 2009.",
    sections: [
      { heading: "ECHR Article 8", bullets: [
        "Respect for private and family life, home and correspondence",
        "A QUALIFIED right: interference needs a legal basis, a legitimate aim, and necessity in a democratic society",
        "Enforced by the ECtHR in Strasbourg — individuals against states",
        "Workplace canon: Bărbulescu (monitoring factors), López Ribalda (covert CCTV limits)",
      ]},
      { heading: "Charter Articles 7–8", bullets: [
        "Art 7 mirrors private life; Art 8 makes data protection a DISTINCT fundamental right",
        "Art 8 ingredients: fair processing for specified purposes, consent or legitimate basis, access and rectification, independent supervision",
        "Applied by the CJEU in Luxembourg — binding on EU institutions and on member states applying EU law",
      ]},
      { heading: "Legal plumbing", bullets: [
        "Art 16 TFEU gives the EU competence to legislate on data protection — the GDPR's treaty basis",
        "The Schrems line measures third countries against this rights layer ('essential equivalence')",
        "Two systems, two courts: don't let a question swap Strasbourg for Luxembourg",
      ]},
    ],
  },
  {
    id: "dpd-9546",
    name: "Data Protection Directive (95/46/EC)",
    kind: "Law (historical)",
    jurisdiction: "European Union",
    status: "Repealed — replaced by the GDPR on 25 May 2018. Historical context only.",
    sections: [
      { heading: "Role", bullets: [
        "The first EU-wide data-protection framework (1995)",
        "Built on Convention 108 and the OECD Privacy Guidelines",
        "Framed data protection around the internal market as much as rights",
      ]},
      { heading: "Key features", bullets: [
        "A directive — transposed into diverging national laws",
        "Established controller/processor roles, special categories, transfer restrictions and national DPAs",
        "Created the Article 29 Working Party — the EDPB's predecessor",
      ]},
      { heading: "Why it was replaced", bullets: [
        "Fragmentation across member states and weak enforcement",
        "Pre-smartphone vintage — no breach notification, no portability, trivial fines",
        "The GDPR added direct applicability, accountability, extraterritorial reach and serious penalties",
      ]},
    ],
  },
  {
    id: "led",
    name: "Law Enforcement Directive (EU) 2016/680",
    kind: "Law",
    jurisdiction: "European Union — transposed nationally",
    status: "In force; adopted alongside the GDPR on 27 April 2016, transposition due 6 May 2018. The GDPR's police-and-criminal-justice sibling.",
    sections: [
      { heading: "Scope", bullets: [
        "Processing by competent authorities to prevent, investigate, detect or prosecute crime, or execute penalties — including threats to public security",
        "This processing is carved OUT of the GDPR",
        "Generally public authorities — private bodies only when entrusted with such public powers",
      ]},
      { heading: "How it differs from the GDPR", bullets: [
        "A directive: member states transpose it, so national detail varies",
        "Data subject rights can be RESTRICTED, e.g. to protect an ongoing investigation",
        "Requires distinguishing categories of subjects (suspects, victims, witnesses) and facts from assessments",
        "Logging duties for core operations",
      ]},
      { heading: "Shared DNA & exam angle", bullets: [
        "Same actors and vocabulary: controllers, processors, DPOs, DPIAs, breach notification, transfer logic adapted to policing",
        "An employer handing CCTV to the police acts under the GDPR; the police then process under the LED",
        "Never answer a police-processing question with GDPR mechanics alone",
      ]},
    ],
  },
  {
    id: "eu-us-dpf",
    name: "EU-US Data Privacy Framework",
    kind: "Adequacy framework",
    jurisdiction: "EU → United States (certified organisations only)",
    status: "Adequacy decision of 10 July 2023 in force. The General Court dismissed the Latombe challenge in September 2025 — the DPF stands.",
    sections: [
      { heading: "What it is", bullets: [
        "An Art 45 adequacy decision limited to US organisations self-certified with the Department of Commerce",
        "The successor to Safe Harbor and Privacy Shield",
        "Transfers to certified importers flow without SCCs or a TIA",
      ]},
      { heading: "How certification works", bullets: [
        "Organisations publicly commit to the DPF principles — purpose limitation, data integrity, onward-transfer accountability",
        "Annual re-certification on the public Commerce list",
        "Enforced by the FTC (and DoT for carriers) — check the live list before relying on it",
      ]},
      { heading: "US-side safeguards", bullets: [
        "Executive Order 14086: necessity and proportionality limits on signals intelligence",
        "Two-layer redress for EU individuals, ending at the Data Protection Review Court",
        "Built specifically to answer the Schrems II findings",
      ]},
      { heading: "Schrems history", bullets: [
        "Safe Harbor invalidated 2015 (Schrems I)",
        "Privacy Shield invalidated 2020 (Schrems II)",
        "DPF challenged and upheld at first instance in 2025 (Latombe)",
      ]},
      { heading: "Using it", bullets: [
        "Uncertified importers still need Art 46 tools plus a transfer impact assessment",
        "Onward transfers from a certified importer must keep the protection intact",
        "Adequacy is reviewable and repealable — monitor, don't assume permanence",
      ]},
    ],
  },
];
