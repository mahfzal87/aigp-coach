import type { Competency, Domain } from "@/lib/types";

// Source: IAPP CIPM Body of Knowledge and Exam Blueprint v4.2.0 (approved
// 16 January 2025, effective 1 September 2025, supersedes v4.1.0). Domain and
// competency min/max question counts are the official blueprint numbers.
// Names are shortened for the interface; descriptions are our own summaries
// of each competency's performance indicators.

export const domainsCipm: Domain[] = [
  {
    id: "domain-i",
    code: "I",
    name: "Developing a Framework",
    summary:
      "Privacy Program: Developing a Framework — the groundwork for a privacy program: its scope and strategy, the governance model that fits the organization, how its vision and mission are communicated, and which laws, regulations and standards it must answer to.",
    minQ: 14,
    maxQ: 18,
    sort: 1,
  },
  {
    id: "domain-ii",
    code: "II",
    name: "Establishing Program Governance",
    summary:
      "Privacy Program: Establishing Program Governance — how privacy requirements run through the whole life cycle: the policies and procedures, who owns what, the metrics leadership oversees, and the training that keeps people compliant.",
    minQ: 12,
    maxQ: 16,
    sort: 2,
  },
  {
    id: "domain-iii",
    code: "III",
    name: "Assessing Data",
    summary:
      "Privacy Program Operational Life Cycle: Assessing Data — finding and reducing privacy risk in systems, processes and products: data inventories and maps, vendor assessments, physical and technical controls, and the data that changes hands in mergers, acquisitions and divestitures.",
    minQ: 12,
    maxQ: 16,
    sort: 3,
  },
  {
    id: "domain-iv",
    code: "IV",
    name: "Protecting Personal Data",
    summary:
      "Privacy Program Operational Life Cycle: Protecting Personal Data — keeping data safe while it is used: information security practice, Privacy by Design built into systems and business processes, and data-use guidelines backed by controls that are actually enforced.",
    minQ: 9,
    maxQ: 13,
    sort: 4,
  },
  {
    id: "domain-v",
    code: "V",
    name: "Sustaining Program Performance",
    summary:
      "Privacy Program Operational Life Cycle: Sustaining Program Performance — keeping the program effective and repeatable through the right metrics, privacy audits and a cycle of continuous assessment.",
    minQ: 7,
    maxQ: 9,
    sort: 5,
  },
  {
    id: "domain-vi",
    code: "VI",
    name: "Responding to Requests and Incidents",
    summary:
      "Privacy Program Operational Life Cycle: Responding to Requests and Incidents — honoring data subject requests and privacy rights, handling incidents under the applicable laws, and improving the response plan after every event.",
    minQ: 10,
    maxQ: 14,
    sort: 6,
  },
];

export const competenciesCipm: Competency[] = [
  // ── Domain I ──
  {
    id: "i-a",
    domainId: "domain-i",
    code: "I.A",
    name: "Program scope & privacy strategy",
    description:
      "Set the program's scope and strategy: where personal information comes from and how it is used, the business model, operating environment and risk appetite, the governance model (centralized, local or hybrid), the structure of the privacy team, and the stakeholders and internal partners it relies on.",
    minQ: 4,
    maxQ: 6,
    sort: 1,
  },
  {
    id: "i-b",
    domainId: "domain-i",
    code: "I.B",
    name: "Vision & mission",
    description:
      "Communicate the program's vision and mission: build awareness of the privacy program inside and outside the organization, make sure employees can reach the policies and procedures that apply to their role, and create a shared understanding of privacy terms.",
    minQ: 4,
    maxQ: 6,
    sort: 2,
  },
  {
    id: "i-c",
    domainId: "domain-i",
    code: "I.C",
    name: "In-scope laws & standards",
    description:
      "Identify the laws, regulations and standards in scope: territorial, sectoral and industry rules, codes of practice and self-certification schemes; what non-compliance costs the organization and individuals; the reach of oversight agencies; operating across borders with differing laws; and the privacy risks of using AI in the business.",
    minQ: 5,
    maxQ: 7,
    sort: 3,
  },
  // ── Domain II ──
  {
    id: "ii-a",
    domainId: "domain-ii",
    code: "II.A",
    name: "Policies & processes",
    description:
      "Create the policies and processes for every stage of the privacy life cycle: an organizational model and reporting structure sized to the organization, policies fitted to the data processed and its legal and ethical limits, collection points that meet transparency and data-quality needs, a breach management plan, complaint and data subject rights procedures, and retention and disposal rules.",
    minQ: 6,
    maxQ: 8,
    sort: 1,
  },
  {
    id: "ii-b",
    domainId: "domain-ii",
    code: "II.B",
    name: "Roles & responsibilities",
    description:
      "Clarify who does what: the privacy team and its stakeholders, who manages sharing and disclosure of data internally and externally, and who is accountable for each part of breach response across functions and partners (detection teams, IT, HR, vendors, regulators, oversight).",
    minQ: 1,
    maxQ: 3,
    sort: 2,
  },
  {
    id: "ii-c",
    domainId: "domain-ii",
    code: "II.C",
    name: "Metrics for oversight",
    description:
      "Define privacy metrics for oversight and governance: metrics built for a named audience with a clear purpose, value and reporting process; the purposes, types and life cycle of audits that test controls; and monitoring that tracks legal change across jurisdictions.",
    minQ: 2,
    maxQ: 4,
    sort: 3,
  },
  {
    id: "ii-d",
    domainId: "domain-ii",
    code: "II.D",
    name: "Training & awareness",
    description:
      "Establish training and awareness: targeted programs for employees, managers and contractors, and awareness activities at every stage of the privacy life cycle.",
    minQ: 1,
    maxQ: 3,
    sort: 4,
  },
  // ── Domain III ──
  {
    id: "iii-a",
    domainId: "domain-iii",
    code: "III.A",
    name: "Data inventories & gap analysis",
    description:
      "Document data governance: inventories, data flow and life-cycle maps and system integrations; measuring policy compliance against internal and external requirements; and gap analysis against applicable laws and accepted standards.",
    minQ: 3,
    maxQ: 5,
    sort: 1,
  },
  {
    id: "iii-b",
    domainId: "domain-iii",
    code: "III.B",
    name: "Processors & vendors",
    description:
      "Evaluate processors and third-party vendors: the risks of outsourcing personal data processing, including contract terms and international transfer rules, and running assessments at the right functional level (procurement, internal audit, information security, physical security, the data protection authority).",
    minQ: 1,
    maxQ: 3,
    sort: 2,
  },
  {
    id: "iii-c",
    domainId: "domain-iii",
    code: "III.C",
    name: "Physical & environmental controls",
    description:
      "Evaluate physical and environmental controls: the operational risks of sites such as data centers and offices, and physical safeguards such as document retention and destruction, media sanitization and disposal, and device security.",
    minQ: 0,
    maxQ: 2,
    sort: 3,
  },
  {
    id: "iii-d",
    domainId: "domain-iii",
    code: "III.D",
    name: "Technical controls",
    description:
      "Evaluate technical controls: the operational risks of digital processing (servers, storage, infrastructure, cloud), limits on use and retention of personal data, and where data lives, including cross-border flows.",
    minQ: 3,
    maxQ: 5,
    sort: 4,
  },
  {
    id: "iii-e",
    domainId: "domain-iii",
    code: "III.E",
    name: "Mergers, acquisitions & divestitures",
    description:
      "Evaluate the risks of data shared in mergers, acquisitions and divestitures: due diligence, contractual and data-sharing obligations under laws and standards, and aligning risks and controls across the combined or separated organizations.",
    minQ: 2,
    maxQ: 4,
    sort: 5,
  },
  // ── Domain IV ──
  {
    id: "iv-a",
    domainId: "domain-iv",
    code: "IV.A",
    name: "Information security practices",
    description:
      "Apply information security practices and policies: classify data (public, confidential, restricted), know what each control can and cannot do, identify risks and apply access controls, and combine technical, administrative and organizational measures to reduce risk.",
    minQ: 4,
    maxQ: 6,
    sort: 1,
  },
  {
    id: "iv-b",
    domainId: "domain-iv",
    code: "IV.B",
    name: "Privacy by Design",
    description:
      "Integrate the main principles of Privacy by Design: build privacy into the system development life cycle and into business processes, and understand the purposes behind the principles.",
    minQ: 1,
    maxQ: 3,
    sort: 2,
  },
  {
    id: "iv-c",
    domainId: "domain-iv",
    code: "IV.C",
    name: "Data-use guidelines & enforced controls",
    description:
      "Apply guidelines for data use and make sure controls are enforced: secondary uses follow the rules, safeguards such as policies, procedures and vendor contracts are applied, access controls and classifications are effective, and privacy technologists are engaged for obfuscation, minimization, security and other privacy-enhancing technologies.",
    minQ: 3,
    maxQ: 5,
    sort: 3,
  },
  // ── Domain V ──
  {
    id: "v-a",
    domainId: "domain-v",
    code: "V.A",
    name: "Performance metrics",
    description:
      "Use metrics to measure program performance: choose metrics for each objective (trending, return on investment, business resiliency) and link the data collected to program goals and compliance measures such as PIAs performed, rights-request response rates, complaint volumes and breach metrics.",
    minQ: 1,
    maxQ: 3,
    sort: 1,
  },
  {
    id: "v-b",
    domainId: "domain-v",
    code: "V.B",
    name: "Auditing the program",
    description:
      "Audit the privacy program: pick the form of monitoring that fits the goal (audits, controls, subcontractors) and audit policies, controls and standards against industry standards and regulatory or legislative change.",
    minQ: 1,
    maxQ: 3,
    sort: 2,
  },
  {
    id: "v-c",
    domainId: "domain-v",
    code: "V.C",
    name: "Continuous assessment",
    description:
      "Manage continuous assessment: risk-assess systems, applications, processes and activities; know the purpose and life cycle of each assessment type (PIA, DPIA, TIA, LIA, PTA); and carry out risk mitigation and stakeholder communication after mergers, acquisitions and divestitures.",
    minQ: 3,
    maxQ: 5,
    sort: 3,
  },
  // ── Domain VI ──
  {
    id: "vi-a",
    domainId: "domain-vi",
    code: "VI.A",
    name: "Data subject requests & rights",
    description:
      "Respond to data subject requests and privacy rights: notices and policies that state rights plainly, procedures for consent withdrawal, rectification, objections, access and complaints, and compliance with the rights laws of each jurisdiction.",
    minQ: 5,
    maxQ: 7,
    sort: 1,
  },
  {
    id: "vi-b",
    domainId: "domain-vi",
    code: "VI.B",
    name: "Incident handling & response",
    description:
      "Follow incident handling and response procedures: assessment, containment and remediation; communicating with stakeholders as jurisdictional, global and business requirements demand; and keeping an incident register with its records.",
    minQ: 3,
    maxQ: 5,
    sort: 2,
  },
  {
    id: "vi-c",
    domainId: "domain-vi",
    code: "VI.C",
    name: "Improving the response plan",
    description:
      "Evaluate and modify the incident response plan: post-incident reviews that improve the plan, and changes that lower the likelihood or impact of future breaches.",
    minQ: 1,
    maxQ: 3,
    sort: 3,
  },
];
