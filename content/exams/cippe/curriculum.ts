import type { Competency, Domain } from "@/lib/types";

// Source: IAPP CIPP/E Body of Knowledge and Exam Blueprint v1.3.3
// (effective 1 September 2025). Domain and competency min/max question
// counts are the official blueprint numbers.

export const domainsCippe: Domain[] = [
  {
    id: "domain-i",
    code: "I",
    name: "Introduction to European Data Protection",
    summary:
      "The historical context for modern European privacy law and the GDPR — human rights laws, early data protection laws, the European regulatory structure and institutions, and the principles and goals of significant European data protection legislation.",
    minQ: 7,
    maxQ: 13,
    sort: 1,
  },
  {
    id: "domain-ii",
    code: "II",
    name: "European Data Protection Law and Regulation",
    summary:
      "Key data protection concepts and the requirements for maintaining security of personal data — plus the principles of European data protection laws and complying with the rights of data subjects.",
    minQ: 18,
    maxQ: 28,
    sort: 2,
  },
  {
    id: "domain-iii",
    code: "III",
    name: "European Data Processing",
    summary:
      "Key GDPR-based data processing concepts and lawful processing criteria — the principles of international data transfers and the legitimate mechanisms they require, grounded in current regulation and CJEU case law.",
    minQ: 13,
    maxQ: 21,
    sort: 3,
  },
  {
    id: "domain-iv",
    code: "IV",
    name: "European Data Protection: Scope & Accountability",
    summary:
      "Rules of supervision and enforcement — the obligations of controllers and processors, the legal consequences for GDPR violations, and how to implement the measures needed to assess and mitigate privacy risks.",
    minQ: 8,
    maxQ: 18,
    sort: 4,
  },
  {
    id: "domain-v",
    code: "V",
    name: "Compliance with European Data Protection Law and Regulation",
    summary:
      "Compliance issues involving personal data in employment, surveillance, direct marketing and internet technology — the unique data protection challenges posed by each.",
    minQ: 8,
    maxQ: 16,
    sort: 5,
  },
];

export const competenciesCippe: Competency[] = [
  // ── Domain I ──
  {
    id: "i-a",
    domainId: "domain-i",
    code: "I.A",
    name: "Origins & historical context",
    description:
      "Understand the origins and historical context of European data protection laws — the rationale for data protection, human rights laws and early instruments (OECD Guidelines, Treaty of Lisbon, Convention 108/108+), and how the harmonized European approach developed (including Brexit).",
    minQ: 1,
    maxQ: 3,
    sort: 1,
  },
  {
    id: "i-b",
    domainId: "domain-i",
    code: "I.B",
    name: "EU institutions",
    description:
      "Understand the roles and functions of significant European institutions — the Council of Europe, the European Court of Human Rights, the European Parliament, the European Commission, the European Council and the Court of Justice of the European Union.",
    minQ: 1,
    maxQ: 2,
    sort: 2,
  },
  {
    id: "i-c",
    domainId: "domain-i",
    code: "I.C",
    name: "Legislative framework",
    description:
      "Understand the legislative framework underpinning European data protection — the CoE Convention of 1981, the Data Protection Directive (95/46/EC), the ePrivacy Directive (2002/58/EC as amended), the e-Commerce Directive (2000/31/EC), and the main principles and goals of the GDPR, the NIS/NIS2 Directives and the EU AI Act.",
    minQ: 5,
    maxQ: 8,
    sort: 3,
  },

  // ── Domain II ──
  {
    id: "ii-a",
    domainId: "domain-ii",
    code: "II.A",
    name: "Basic GDPR concepts",
    description:
      "Understand basic GDPR data protection concepts — personal data, sensitive and special categories, pseudonymous vs. anonymous data, the key principles of lawful processing, controller and processor (including EDPB Opinion 22/2024 on processors and sub-processors), and the data subject.",
    minQ: 3,
    maxQ: 5,
    sort: 4,
  },
  {
    id: "ii-b",
    domainId: "domain-ii",
    code: "II.B",
    name: "Security of personal data",
    description:
      "Understand the requirements involved in maintaining the security of personal data — appropriate technical and organizational measures, breach notification requirements and EDPB guidance, effective and responsible vendor management, and the principles of sharing personal data with third parties.",
    minQ: 7,
    maxQ: 11,
    sort: 5,
  },
  {
    id: "ii-c",
    domainId: "domain-ii",
    code: "II.C",
    name: "Data subjects' rights",
    description:
      "Understand data subjects' rights — access, rectification, erasure / right to be forgotten, restriction and objection, consent and its withdrawal, rights related to automated decision-making including profiling, data portability, and the permitted restrictions on these rights.",
    minQ: 8,
    maxQ: 12,
    sort: 6,
  },

  // ── Domain III ──
  {
    id: "iii-a",
    domainId: "domain-iii",
    code: "III.A",
    name: "Processing principles",
    description:
      "Understand the principles of European data processing — fairness and lawfulness, purpose limitation, proportionality, accuracy, storage limitation (retention), and integrity and confidentiality.",
    minQ: 2,
    maxQ: 4,
    sort: 7,
  },
  {
    id: "iii-b",
    domainId: "domain-iii",
    code: "III.B",
    name: "Lawful processing bases",
    description:
      "Know what constitutes a lawful processing basis — consent, contractual necessity, legal obligation, vital interests, public interest and legitimate interest (including EDPB Guidelines 1/2024 on Article 6(1)(f)), plus the processing of special categories of personal data.",
    minQ: 3,
    maxQ: 5,
    sort: 8,
  },
  {
    id: "iii-c",
    domainId: "domain-iii",
    code: "III.C",
    name: "Information provision",
    description:
      "Understand information provision obligations — the transparency principle, the key components of privacy notices, and the purpose of layered privacy notices.",
    minQ: 4,
    maxQ: 6,
    sort: 9,
  },
  {
    id: "iii-d",
    domainId: "domain-iii",
    code: "III.D",
    name: "International data transfers",
    description:
      "Understand the principles of, and the risks involved in, international data transfers — the rationale for prohibiting transfers, adequate jurisdictions, Safe Harbor and Privacy Shield history (the Schrems decisions) and the EU-US Data Privacy Framework, Standard Contractual Clauses and Binding Corporate Rules, codes of conduct and certifications, derogations, and transfer impact assessments.",
    minQ: 4,
    maxQ: 6,
    sort: 10,
  },

  // ── Domain IV ──
  {
    id: "iv-a",
    domainId: "domain-iv",
    code: "IV.A",
    name: "Territorial & material scope",
    description:
      "Understand issues related to the territorial and material scope of the GDPR — establishment and non-establishment in the EU (including EDPB Opinion 04/2024 on main establishment), the scope of processing and the exemptions the GDPR allows.",
    minQ: 2,
    maxQ: 4,
    sort: 11,
  },
  {
    id: "iv-b",
    domainId: "domain-iv",
    code: "IV.B",
    name: "Accountability requirements",
    description:
      "Understand the accountability requirements under the GDPR — obligations of controllers, joint controllers and processors, data protection by design and by default, documentation and cooperation with regulators, data protection impact assessments and their criteria, mandatory data protection officers, and the role of auditing in privacy programs.",
    minQ: 4,
    maxQ: 8,
    sort: 12,
  },
  {
    id: "iv-c",
    domainId: "domain-iv",
    code: "IV.C",
    name: "Supervision & enforcement",
    description:
      "Understand the European data protection supervision and enforcement structure — the roles and powers of the EDPB and the EDPS, other supervisory authorities, and the concept of lead supervisory authority.",
    minQ: 1,
    maxQ: 3,
    sort: 13,
  },
  {
    id: "iv-d",
    domainId: "domain-iv",
    code: "IV.D",
    name: "Consequences of violations",
    description:
      "Understand the consequences for GDPR violations — the procedures and fines that may be imposed, the conditions for class actions, and the types and amounts of compensation available to data subjects.",
    minQ: 1,
    maxQ: 3,
    sort: 14,
  },

  // ── Domain V ──
  {
    id: "v-a",
    domainId: "domain-v",
    code: "V.A",
    name: "Employment relationships",
    description:
      "Understand how to comply with European data protection law in the workplace — the legal basis for processing employee data, personnel records, workplace monitoring and data loss prevention, bring-your-own-device programs, and EU works councils and whistleblowing systems.",
    minQ: 3,
    maxQ: 5,
    sort: 15,
  },
  {
    id: "v-b",
    domainId: "domain-v",
    code: "V.B",
    name: "Surveillance activities",
    description:
      "Understand compliance related to surveillance — surveillance by public authorities, laws on the interception of communications, and technologies such as CCTV, geolocation and biometric/facial recognition, including EDPB guidance.",
    minQ: 1,
    maxQ: 3,
    sort: 16,
  },
  {
    id: "v-c",
    domainId: "domain-v",
    code: "V.C",
    name: "Direct marketing",
    description:
      "Understand compliance related to direct marketing — the requirements for processing personal data for marketing activities and the issues raised by online behavioral targeting, including EDPB guidance.",
    minQ: 2,
    maxQ: 4,
    sort: 17,
  },
  {
    id: "v-d",
    domainId: "domain-v",
    code: "V.D",
    name: "Internet technology & communications",
    description:
      "Understand compliance related to internet technology and communications — cloud computing, web cookies, social media platforms (including dark patterns), search engine marketing, and the compliance and ethical issues raised by artificial intelligence and machine learning.",
    minQ: 2,
    maxQ: 4,
    sort: 18,
  },
];
