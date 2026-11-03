import type { LawUpdate } from "@/lib/types";

// CIPP/E law-updates feed (bundled). Dated, BoK-relevant developments only.

export const updatesCippe: LawUpdate[] = [
  {
    id: "ce-u-dpf-latombe",
    title: "General Court upholds the EU-US Data Privacy Framework",
    bodyMd:
      "In *Latombe v Commission* (T-553/23), the EU General Court dismissed the challenge to the EU-US Data Privacy Framework adequacy decision, leaving the DPF standing as a valid transfer mechanism. Exam relevance: adequacy under Art. 45 currently covers certified US importers — but remember the Schrems history, and that an appeal to the CJEU remains possible.",
    jurisdiction: "EU",
    publishedDate: "2025-09-03",
    bokRelevant: true,
    severity: "important",
    status: "published",
  },
  {
    id: "ce-u-eprivacy-withdrawn",
    title: "Commission withdraws the ePrivacy Regulation proposal",
    bodyMd:
      "The European Commission's 2025 work programme formally withdrew the long-stalled ePrivacy Regulation proposal. The **ePrivacy Directive (2002/58/EC, as amended 2009)** therefore remains the governing instrument for cookies, electronic marketing and confidentiality of communications — still implemented through national laws (e.g. PECR in the UK). If an exam option treats the ePrivacy *Regulation* as in force, it is wrong.",
    jurisdiction: "EU",
    publishedDate: "2025-02-11",
    bokRelevant: true,
    severity: "critical",
    status: "published",
  },
  {
    id: "ce-u-edpb-li",
    title: "EDPB Guidelines 1/2024 on legitimate interests (Art. 6(1)(f))",
    bodyMd:
      "The EDPB adopted Guidelines 1/2024 on processing based on legitimate interests. Codifies the **three-step test**: (1) identify a lawful, real and present legitimate interest; (2) necessity — no less intrusive alternative; (3) balancing against the data subject's interests, rights and freedoms, including their reasonable expectations. Named in BoK §III.B.",
    jurisdiction: "EU",
    publishedDate: "2024-10-08",
    bokRelevant: true,
    severity: "important",
    status: "published",
  },
  {
    id: "ce-u-edpb-processors",
    title: "EDPB Opinion 22/2024 on processors and sub-processors",
    bodyMd:
      "Opinion 22/2024 clarifies controller obligations when relying on processors and chains of sub-processors: controllers must be able to identify **every** sub-processor in the chain, verify sufficient guarantees down the chain, and remain accountable for Art. 28 compliance regardless of chain depth. Named in BoK §II.A.",
    jurisdiction: "EU",
    publishedDate: "2024-10-07",
    bokRelevant: true,
    severity: "important",
    status: "published",
  },
  {
    id: "ce-u-edpb-main-establishment",
    title: "EDPB Opinion 04/2024 on 'main establishment'",
    bodyMd:
      "Opinion 04/2024 tightens when a controller has a 'main establishment' under Art. 4(16)(a): the establishment must actually take the **decisions** on purposes and means of processing and have the power to implement them — otherwise the one-stop-shop (lead supervisory authority) mechanism does not apply and each concerned SA is competent. Named in BoK §IV.A.",
    jurisdiction: "EU",
    publishedDate: "2024-02-13",
    bokRelevant: true,
    severity: "info",
    status: "published",
  },
];
