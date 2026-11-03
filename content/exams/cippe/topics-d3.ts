import type { Topic } from "@/lib/types";

// CIPP/E Domain III — European Data Processing.
// Authored against BoK v1.3.3. Original content; topic cards wired to questionsD3.
export const topicsD3: Topic[] = [
  // ─── III.A — Data processing principles ───
  {
    id: "ce-iii-a-1",
    competencyId: "iii-a",
    title: "Lawfulness, fairness and purpose limitation",
    conceptMd:
      "Article 5(1)(a) packs three separate duties into one line: processing must be **lawful** (resting on a valid legal basis), **fair** (no deception, manipulation or unjustified detriment) and **transparent** — satisfying one never satisfies the others. **Purpose limitation** then requires personal data to be collected for **specified, explicit and legitimate purposes** and not further processed in a way **incompatible** with them. Whether a new purpose is compatible is assessed against the Article 6(4) factors: the **link** between the purposes, the **context** of collection, the **nature** of the data, the possible **consequences** for data subjects, and the existence of **safeguards** such as encryption or pseudonymisation. Further processing for **archiving in the public interest, scientific or historical research, or statistical purposes** is presumed compatible, provided Article 89 safeguards are in place.",
    exampleMd:
      "A grocery chain collects basket data to run its loyalty scheme. Reusing it to publish **aggregate regional demand statistics** rides the statistical-purposes presumption, with safeguards in place; reusing the same baskets to set **individual prices per shopper** is a different purpose that must pass the compatibility factors on its own — and a manipulative interface nudging shoppers into accepting it would breach **fairness** even where a lawful basis existed.",
    questionIds: ["ceq-iii-a-1"],
    sort: 1,
  },
  {
    id: "ce-iii-a-2",
    competencyId: "iii-a",
    title: "Minimisation, accuracy, storage limitation and security",
    conceptMd:
      "**Data minimisation** (proportionality) limits processing to what is **adequate, relevant and necessary** for the purpose — usefulness is not the test, necessity is. **Accuracy** requires data to be accurate and, where necessary, **kept up to date**, with **every reasonable step** taken to rectify or erase inaccurate data without delay, always judged **against the purposes** of the processing. **Storage limitation** permits keeping data in identifiable form **no longer than necessary**, with longer retention reserved for archiving, research and statistical purposes under safeguards — truly **anonymised** data leaves the GDPR entirely, while encrypted data does not. **Integrity and confidentiality** adds appropriate security against unauthorised processing, loss and damage, but security never substitutes for the other principles.",
    exampleMd:
      "A lender's file still flags a customer as **in default** months after she repaid, and the flag feeds live credit decisions: as a record of history it is true, but measured against its current purpose it is inaccurate and must be corrected. The same lender's plan to keep every closed-account file forever **because the archive is encrypted** fails storage limitation — encryption protects personal data, it does not stop the data being personal.",
    questionIds: ["ceq-iii-a-2", "ceq-iii-a-3"],
    sort: 2,
  },

  // ─── III.B — Lawful bases ───
  {
    id: "ce-iii-b-1",
    competencyId: "iii-b",
    title: "The six lawful bases of Article 6",
    conceptMd:
      "Every processing operation needs one of the **six Article 6 bases**: **consent**, **contractual necessity**, **legal obligation**, **vital interests**, **public task** or **legitimate interests** — there is no seventh, and no hierarchy among them. **Contractual necessity** covers only what is strictly necessary to perform **this contract** with the data subject (or pre-contractual steps taken **at the data subject's request**), never nice-to-have extras written into the terms. **Legal obligation** means an obligation under **Union or Member State law** — a foreign statute or court order does not by itself qualify. **Vital interests** is the life-or-death basis, typically engaged when the person **cannot consent**, and it protects the data subject **or another natural person**.",
    exampleMd:
      "A streaming service processes card details to bill subscribers — contractual necessity holds, because without billing there is no service. The same service's personalised recommendations are an enhancement the subscription can live without, so they need a different basis such as consent or legitimate interests, however prominently the feature is written into the terms.",
    questionIds: ["ceq-iii-b-1", "ceq-iii-b-2"],
    sort: 1,
  },
  {
    id: "ce-iii-b-2",
    competencyId: "iii-b",
    title: "Legitimate interests and the three-step test",
    conceptMd:
      "**Legitimate interests** is the most flexible basis and the most heavily policed. EDPB **Guidelines 1/2024** structure it as three sequential steps: first, identify an interest that is **lawful, clearly articulated, and real and present** — not speculative (purely commercial interests can qualify); second, establish **necessity** — the processing must be the **least intrusive means** of achieving the interest; third, run the **balancing test** against the data subjects' interests, rights and freedoms, including their **reasonable expectations**, with mitigating safeguards able to tip a close balance. Most engineered exam scenarios fail at **necessity**, because a less intrusive route to the same goal exists.",
    exampleMd:
      "A retail group wants device-level Wi-Fi tracking of every shopper to optimise store layouts. Its commercial interest is lawful, real and present — step one passes — but anonymous aggregate footfall counting would deliver the same layout insight, so tracking individuals fails **necessity** and the analysis never even reaches balancing.",
    questionIds: ["ceq-iii-b-3"],
    sort: 2,
  },
  {
    id: "ce-iii-b-3",
    competencyId: "iii-b",
    title: "Special categories: the Article 9 second lock",
    conceptMd:
      "**Special categories** — racial or ethnic origin, political opinions, religious or philosophical beliefs, **trade-union membership**, **genetic data**, **biometric data for unique identification**, **health**, and sex life or **sexual orientation** — are prohibited to process unless the controller holds **both** an Article 6 basis **and** an **Article 9(2) condition**: explicit consent, employment and social-protection law, vital interests when the person is **incapable of consenting**, data **manifestly made public** by the data subject, legal claims, substantial public interest, health care, public health, or research. Legitimate interests appears nowhere in Article 9(2), so an LI assessment alone can never clear special-category processing. **Criminal-conviction data** is not an Article 9 category — it has its own regime in **Article 10**.",
    exampleMd:
      "An employer builds an absence dashboard from sickness certificates and points to a thorough legitimate-interests assessment. The Article 6 work may be sound, but sickness data is **health data**: without an Article 9(2) condition — here the **employment-law condition** grounded in Union or Member State law — the dashboard stays unlawful.",
    questionIds: ["ceq-iii-b-4", "ceq-iii-b-5"],
    sort: 3,
  },

  // ─── III.C — Information provision ───
  {
    id: "ce-iii-c-1",
    competencyId: "iii-c",
    title: "The transparency principle",
    conceptMd:
      "Article 12 sets the quality bar for everything a controller tells data subjects: information must be **concise, transparent, intelligible and easily accessible**, in **clear and plain language** — particularly where children are the audience — and provided **free of charge**, in writing or by electronic means, with **oral** provision available on request once identity is verified. Transparency is the gateway principle: people can only exercise rights against processing they actually know about and understand.",
    exampleMd:
      "A telecom's privacy notice is a 48-page PDF of statutory cross-references reachable only after logging in. Even if every statement in it is correct and complete, it fails Article 12 twice over: dense legalese defeats **intelligibility**, and burying the document defeats **easy access** — completeness cures neither.",
    questionIds: ["ceq-iii-c-1"],
    sort: 1,
  },
  {
    id: "ce-iii-c-2",
    competencyId: "iii-c",
    title: "Article 13 versus Article 14",
    conceptMd:
      "Which notice article applies turns on **where the data came from**. Data collected **from the data subject** trigger **Article 13**, and the information is due **at the time of collection** — Article 13's only escape is that the person **already has** the information. Data **not obtained from the data subject** trigger **Article 14**: inform within a **reasonable period, at the latest one month**, pulled earlier to the moment of **first communication** with the person or **first disclosure to another recipient**, whichever applicable cap bites first. Article 14 alone adds the **source** of the data to the notice, and alone offers the **disproportionate-effort** exception (especially for archiving, research and statistics), which demands a documented assessment, safeguards and **publicly available** information in place of individual notice. Under both articles, a **new purpose** requires information **prior to** that further processing.",
    exampleMd:
      "A utility buys a prospect list from a broker on 2 March, plans its first mailshot for late April, and will licence the list to a partner on 20 March. Article 14 governs — the data never came from the prospects — and the notice is due by **20 March**: first disclosure to another recipient beats the one-month ceiling, and at-collection timing was never the rule here.",
    questionIds: ["ceq-iii-c-2", "ceq-iii-c-3"],
    sort: 2,
  },
  {
    id: "ce-iii-c-3",
    competencyId: "iii-c",
    title: "Notice content and layered design",
    conceptMd:
      "A compliant notice names the **controller and its contact details** (plus the **DPO** where one exists), the **purposes and the legal basis** of each processing, the **legitimate interests pursued** where that is the basis, the **recipients or categories of recipients**, any **third-country transfers and their safeguards**, the **retention period or the criteria** for setting it, the catalogue of **data-subject rights** (including withdrawal of consent and complaint to a supervisory authority), the existence of **automated decision-making** with **meaningful information about the logic involved** and its significance and consequences, and — in Article 14 cases — the **source** of the data. **Layered notices** manage this volume: a first layer that itself carries the essentials (identity, purposes, the most impactful processing, rights) with a clear path to the full detail — never a bare link that defers everything to layer two.",
    exampleMd:
      "A parking app shows a short in-app panel at sign-up — who the controller is, what the location data is for, the fact of cross-border transfers, and a rights summary — with one tap through to the complete policy. The same content hidden behind a footer link labelled 'Privacy' would not be a first layer at all; it would be a doorway.",
    questionIds: ["ceq-iii-c-4", "ceq-iii-c-5"],
    sort: 3,
  },

  // ─── III.D — International data transfers ───
  {
    id: "ce-iii-d-1",
    competencyId: "iii-d",
    title: "Why transfers are restricted — and the Chapter V ladder",
    conceptMd:
      "Chapter V exists so that GDPR protection **travels with the data**: once personal data leaves the EEA, EU rights would be worthless if the importer's jurisdiction could strip them away. The compliance ladder runs in strict order: first confirm the flow **is a restricted transfer** at all (intra-EEA flows are not; **remote access from a third country is**), then look for an **Article 45 adequacy decision**, then build **Article 46 appropriate safeguards** such as SCCs or BCRs, and only as a **last resort** reach for the **Article 49 derogations**. Each rung is checked only if the one above fails.",
    exampleMd:
      "Counsel asked to paper a new flow to a Nairobi vendor starts by confirming data actually leaves the EEA, then checks whether any adequacy decision covers the destination — not by drafting SCCs. SCCs drafted for a transfer that adequacy already covers are wasted work; a derogation invoked where SCCs were available is a compliance failure.",
    questionIds: ["ceq-iii-d-1", "ceq-iii-d-2"],
    sort: 1,
  },
  {
    id: "ce-iii-d-2",
    competencyId: "iii-d",
    title: "Adequacy and the EU-US Data Privacy Framework",
    conceptMd:
      "An **Article 45 adequacy decision** is the Commission's finding that a third country, territory or sector offers protection **essentially equivalent** to the EU's — transfers then proceed **without any further authorisation or safeguard**. The **EU-US Data Privacy Framework** (2023) is a partial adequacy: it covers only US importers that **self-certify** under the framework, so the exporter's homework is verifying the importer's **certification and its scope** (HR data is a separate election). The General Court **upheld the DPF in Latombe (September 2025)**, but adequacy decisions are living instruments — monitored, periodically reviewed and, as Safe Harbor and Privacy Shield proved, mortal.",
    exampleMd:
      "A Munich exporter finds its US SaaS vendor on the DPF list with HR data within scope: the transfer rides adequacy, and signing SCCs on top adds nothing legally required. Its second vendor never certified — for that one, the analysis drops down the ladder to Article 46 safeguards.",
    questionIds: ["ceq-iii-d-3"],
    sort: 2,
  },
  {
    id: "ce-iii-d-3",
    competencyId: "iii-d",
    title: "Article 46 safeguards: SCCs, BCRs and more",
    conceptMd:
      "**Article 46** holds the toolkit for destinations without adequacy. The **2021 SCCs** are a **modular** set — controller and processor roles in both directions, an optional **docking clause**, annexes to complete: parties select modules and permitted options and may embed the clauses in a wider contract or add terms that do not contradict them, but may **not amend the standard text** — free editing produces **ad hoc clauses**, which need supervisory-authority authorisation under Article 46(3). **Binding Corporate Rules** are SA-approved rules for transfers **within a corporate group**; an external vendor cannot simply contract into another group's BCRs. **Approved codes of conduct and certification mechanisms**, each paired with **binding and enforceable importer commitments**, complete the list.",
    exampleMd:
      "A group with approved BCRs moves HR data from its Lisbon subsidiary to its Nairobi subsidiary under them — but its disclosure of customer data to an unaffiliated Kenyan agency falls outside the BCRs entirely, so counsel executes SCCs with the agency: pick the right module, complete the annexes, and leave the clause text untouched.",
    questionIds: ["ceq-iii-d-4", "ceq-iii-d-6"],
    sort: 3,
  },
  {
    id: "ce-iii-d-4",
    competencyId: "iii-d",
    title: "Schrems case law and transfer impact assessments",
    conceptMd:
      "**Schrems I (2015)** invalidated **Safe Harbor**; **Schrems II (2020)** invalidated **Privacy Shield** while **upholding SCCs** — on condition that exporters verify, **case by case**, that the clauses can actually be honoured in the destination. That verification is the **transfer impact assessment**: examine the third country's **law and practice** (surveillance powers, authority access, redress) as they bear on this transfer, adopt **supplementary measures** where the clauses alone fall short — technical measures such as **strong encryption with keys held in the EEA** do the heaviest lifting — and **suspend** the transfer where effectiveness cannot be ensured. The EDPB roadmap orders the work: **know your transfers → identify the tool → assess → supplement → re-evaluate**.",
    exampleMd:
      "An exporter's TIA finds the destination compels providers to give authorities direct access to data in transit. Importer promises cannot fix a statute, so the exporter encrypts end to end and keeps the keys in the EEA — the access power survives on paper but captures only ciphertext. If no such measure worked, the lawful options would be suspension or no transfer.",
    questionIds: ["ceq-iii-d-5"],
    sort: 4,
  },
  {
    id: "ce-iii-d-5",
    competencyId: "iii-d",
    title: "Article 49 derogations: the last resort",
    conceptMd:
      "**Article 49** derogations legitimise **occasional, exceptional** transfers when no adequacy decision or Article 46 safeguard is available — the ladder's **last resort**, interpreted restrictively. The set: **explicit consent** given after information on the **specific risks** of a transfer without adequacy or safeguards; **necessity for a contract** with, or concluded in the interest of, the data subject — judged per contract and only for **non-repetitive** flows; an **important public interest recognised in Union or Member State law** (a third country's own designation never suffices); **legal claims**; **vital interests** where the person is **incapable** of consenting; and reads from **public registers**. A standing data pipeline resting on a derogation is the classic wrong answer.",
    exampleMd:
      "A travel platform sending one customer's booking details to the Jordanian hotel she chose can rely on contract necessity — occasional, and genuinely required for her contract. The same platform's **weekly automated payroll feed** to a Manila centre is systematic and repetitive: it belongs on SCCs, and a stack of employee consent forms (withdrawable at any time, and fragile given the power imbalance) cannot carry it.",
    questionIds: ["ceq-iii-d-7"],
    sort: 5,
  },
];
