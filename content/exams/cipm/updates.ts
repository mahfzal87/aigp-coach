import type { LawUpdate } from "@/lib/types";

// CIPM updates feed (bundled). Dated, BoK-relevant developments for privacy
// program managers only — each checked against its primary source.

export const updatesCipm: LawUpdate[] = [
  {
    id: "cm-u-omnibus-breach",
    title: "EU Council backs a 96-hour, high-risk-only breach notice — 72 hours still applies",
    bodyMd:
      "On **21 October 2026** EU ambassadors agreed the Council's negotiating mandate on the **Digital Omnibus**, keeping the Commission's November 2025 plan for GDPR Art. 33 — notify the supervisory authority only when a breach is **likely to result in a high risk**, within **96 hours** of awareness where feasible — but replacing its **single EU entry point, run by ENISA**, with a **national entry point in each Member State** shared with other incident-reporting regimes. Every breach would still have to be documented internally. This is **not law**: talks with the European Parliament start only once it adopts its own position. Exam angle (§VI.B): answer with the GDPR as it stands — **72 hours** to the supervisory authority unless the breach is unlikely to result in a risk.",
    sourceUrl: "https://www.consilium.europa.eu/en/press/press-releases/2026/10/21/digital-rulebook-council-agrees-position-to-simplify-data-protection-privacy-and-cyber-reporting-rules/",
    jurisdiction: "European Union",
    publishedDate: "2026-10-21",
    bokRelevant: true,
    severity: "important",
    status: "published",
  },
  {
    id: "cm-u-uk-complaints",
    title: "UK: every controller now needs a data protection complaints process",
    bodyMd:
      "From **19 June 2026**, under the **Data (Use and Access) Act 2025**, UK controllers must give people a clear route to **complain about how their personal data is used** (the Act's own example is a complaint form that can be completed electronically and by other means), **acknowledge each complaint within 30 days**, investigate without undue delay while keeping the complainant informed, and tell them the outcome. Exam angle (§II.A, §VI.A): complaint handling is now a legal duty in the UK, not just good practice — run it through the same intake, logging and metrics as rights requests, with its own clock.",
    sourceUrl: "https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2026/05/one-month-to-go-what-businesses-need-to-know-to-meet-new-data-law/",
    jurisdiction: "United Kingdom",
    publishedDate: "2026-06-19",
    bokRelevant: true,
    severity: "important",
    status: "published",
  },
  {
    id: "cm-u-global-cbpr",
    title: "Global CBPR and PRP certifications are live — tougher requirements from April 2027",
    bodyMd:
      "The **Global CBPR Forum** launched its **Global CBPR** (controllers) and **Global PRP** (processors) certification systems in **June 2025** with about 100 certified companies, running alongside the APEC system, and members including Japan, Singapore and the DIFC recognize Global CBPR as a mechanism for cross-border transfers. On **23 March 2026** the Forum published updated Global CBPR program requirements, **in force 1 April 2027**: they grow from 50 to 57 and add accountability for **sensitive and children's data**, **risk assessment and mitigation** procedures and **breach notification** processes. Exam angle (§I.C): certification runs through recognized **accountability agents**, not the privacy enforcement authorities — and it does not by itself satisfy GDPR transfer rules.",
    sourceUrl: "https://www.globalcbpr.org/wp-content/uploads/GlobalCBPRForum-Annual-Report-2025-2026.pdf",
    jurisdiction: "International",
    publishedDate: "2026-03-23",
    bokRelevant: true,
    severity: "info",
    status: "published",
  },
  {
    id: "cm-u-ccpa-regs-2026",
    title: "California's risk-assessment, cybersecurity-audit and ADMT rules take effect",
    bodyMd:
      "CCPA regulations approved in September 2025 took effect on **1 January 2026**. Businesses whose processing presents significant risk to consumers' privacy must **conduct risk assessments from now on** and submit an **attestation and summary by 1 April 2028**. Businesses using **automated decisionmaking technology** for significant decisions must comply from **1 January 2027**. **Cybersecurity audit** certifications phase in by revenue: **1 April 2028** (over $100M), **1 April 2029** ($50M–$100M) and **1 April 2030** (under $50M). Exam angle (§V.B–§V.C): US law is moving from notice and opt-out toward documented assessments and independent audits — the same accountability muscles a GDPR program already uses.",
    sourceUrl: "https://cppa.ca.gov/announcements/2025/20250923.html",
    jurisdiction: "United States — California",
    publishedDate: "2026-01-01",
    bokRelevant: true,
    severity: "important",
    status: "published",
  },
  {
    id: "cm-u-iso-27701-2025",
    title: "ISO/IEC 27701:2025 — privacy management goes standalone",
    bodyMd:
      "ISO and IEC published the second edition of **ISO/IEC 27701**, replacing the 2019 edition. The 2019 standard was an **extension** of ISO/IEC 27001 and 27002 — you needed an information security management system underneath. The 2025 edition is a **standalone privacy information management system (PIMS)** standard on the harmonized ISO management-system structure, for both **PII controllers and processors**, so it can be certified without ISO/IEC 27001 and integrated with 27001 or 42001. Transition timing for 2019 certificates is set by accreditation and certification bodies. Exam angle (§I.C, §V.B): 27001, 27701 and 42001 are certifiable; 27002, 29100 and 29134 are guidance.",
    sourceUrl: "https://www.iso.org/standard/27701",
    jurisdiction: "International",
    publishedDate: "2025-10-14",
    bokRelevant: true,
    severity: "important",
    status: "published",
  },
  {
    id: "cm-u-sp800-61r3",
    title: "NIST SP 800-61 Rev. 3 recasts incident response around CSF 2.0",
    bodyMd:
      "NIST finalized **SP 800-61 Revision 3**, *Incident Response Recommendations and Considerations for Cybersecurity Risk Management: A CSF 2.0 Community Profile*, superseding Rev. 2 (2012). Rev. 2's four-phase cycle — Preparation; Detection & Analysis; Containment, Eradication & Recovery; Post-Incident Activity — gives way to the **six CSF 2.0 functions**: Govern, Identify and Protect are the preparation; **Detect, Respond and Recover** are the response itself; and lessons learned feed the Identify function's **Improvement** category continuously, not only after an incident closes. Exam angle (§VI.B–§VI.C): say which version you are citing — Rev. 2's phases still fill older materials, and NIST lets organizations use whichever life-cycle model suits them.",
    sourceUrl: "https://csrc.nist.gov/pubs/sp/800/61/r3/final",
    jurisdiction: "United States (federal)",
    publishedDate: "2025-04-03",
    bokRelevant: true,
    severity: "important",
    status: "published",
  },
];
