import type { Domain, Competency } from "@/lib/types";

// Source: IAPP AIGP Body of Knowledge v2.1 (effective 2 Feb 2026).

export const domains: Domain[] = [
  {
    id: "domain-i",
    code: "I",
    name: "Foundations of AI Governance",
    summary:
      "What AI governance is — common principles and pillars to build an AI governance program, regardless of industry, sector or size.",
    minQ: 16,
    maxQ: 20,
    sort: 1,
  },
  {
    id: "domain-ii",
    code: "II",
    name: "Laws, Standards & Frameworks",
    summary:
      "How existing laws and AI-specific laws, standards and frameworks apply to AI (EU AI Act, South Korean AI Basic Law, US federal & state laws, NIST, OECD, ISO).",
    minQ: 19,
    maxQ: 23,
    sort: 2,
  },
  {
    id: "domain-iii",
    code: "III",
    name: "Govern AI Development",
    summary:
      "Responsibilities for designing, building, training, testing and maintaining AI models and systems.",
    minQ: 21,
    maxQ: 25,
    sort: 3,
  },
  {
    id: "domain-iv",
    code: "IV",
    name: "Govern AI Deployment & Use",
    summary:
      "Selecting an AI model, then deploying and using it responsibly through ongoing monitoring, maintenance and other key obligations.",
    minQ: 21,
    maxQ: 25,
    sort: 4,
  },
];

export const competencies: Competency[] = [
  // Domain I
  {
    id: "i-a",
    domainId: "domain-i",
    code: "I.A",
    name: "What AI is & why it needs governance",
    description:
      "Definitions/types of AI; risks & harms (individual/group/org/societal); unique characteristics needing governance; responsible-AI principles.",
    minQ: 4,
    maxQ: 6,
    sort: 1,
  },
  {
    id: "i-b",
    domainId: "domain-i",
    code: "I.B",
    name: "Organizational expectations",
    description:
      "Roles & responsibilities, cross-functional collaboration, training & awareness, governance approaches by org type, building the governance structure.",
    minQ: 5,
    maxQ: 7,
    sort: 2,
  },
  {
    id: "i-c",
    domainId: "domain-i",
    code: "I.C",
    name: "Policies across the AI life cycle",
    description:
      "Oversight/accountability policies across the life cycle; updating existing policies for AI; third-party risk management.",
    minQ: 6,
    maxQ: 8,
    sort: 3,
  },
  // Domain II
  {
    id: "ii-a",
    domainId: "domain-ii",
    code: "II.A",
    name: "Existing data privacy laws applied to AI",
    description:
      "Transparency, lawful basis, purpose limitation, data minimization, privacy by design, controller obligations, automated decision-making, sensitive data.",
    minQ: 4,
    maxQ: 6,
    sort: 1,
  },
  {
    id: "ii-b",
    domainId: "domain-ii",
    code: "II.B",
    name: "Other existing laws applied to AI",
    description:
      "IP/copyright, nondiscrimination (employment/credit/housing/insurance), consumer protection, product liability.",
    minQ: 4,
    maxQ: 6,
    sort: 2,
  },
  {
    id: "ii-c",
    domainId: "domain-ii",
    code: "II.C",
    name: "AI-specific laws",
    description:
      "Risk classification, requirements, human oversight/transparency, GPAI, enforcement & penalties, org-context roles — EU AI Act, South Korean AI Basic Law, US federal/state. (v2.1 growth area.)",
    minQ: 6,
    maxQ: 8,
    sort: 3,
  },
  {
    id: "ii-d",
    domainId: "domain-ii",
    code: "II.D",
    name: "Industry standards & tools",
    description: "OECD principles, NIST AI RMF & Playbook, ISO 22989/42001/42005.",
    minQ: 3,
    maxQ: 5,
    sort: 4,
  },
  // Domain III
  {
    id: "iii-a",
    domainId: "domain-iii",
    code: "III.A",
    name: "Design & build the AI system",
    description:
      "Business context/use case, impact assessment, design/build policies & ethics, risk identification & management, documentation.",
    minQ: 6,
    maxQ: 8,
    sort: 1,
  },
  {
    id: "iii-b",
    domainId: "domain-iii",
    code: "III.B",
    name: "Data in training & testing",
    description:
      "Data governance, lineage & provenance, training/testing (bias, robustness, interpretability), managing issues, documentation.",
    minQ: 6,
    maxQ: 8,
    sort: 2,
  },
  {
    id: "iii-c",
    domainId: "domain-iii",
    code: "III.C",
    name: "Release, monitoring & maintenance",
    description:
      "Readiness/model card/conformity, continuous monitoring & retraining, periodic assessments (audits, red teaming), incidents, public disclosures.",
    minQ: 8,
    maxQ: 10,
    sort: 3,
  },
  // Domain IV
  {
    id: "iv-a",
    domainId: "domain-iv",
    code: "IV.A",
    name: "Evaluate the deploy decision",
    description:
      "Use-case context, model types (classic/generative, proprietary/open-source, language/multimodal), deployment options (cloud/edge, fine-tuning, RAG, agentic).",
    minQ: 6,
    maxQ: 8,
    sort: 1,
  },
  {
    id: "iv-b",
    domainId: "domain-iv",
    code: "IV.B",
    name: "Assess the AI system",
    description:
      "Impact assessment on the selected system, vendor/licensing terms & risks, risks of deploying your own proprietary model.",
    minQ: 5,
    maxQ: 7,
    sort: 2,
  },
  {
    id: "iv-c",
    domainId: "domain-iv",
    code: "IV.C",
    name: "Govern deployment & use",
    description:
      "Apply policies (data governance, risk/issue management, user training), monitoring & maintenance, periodic assessments, forecast secondary uses, external comms, deactivation/localization.",
    minQ: 9,
    maxQ: 11,
    sort: 3,
  },
];
