import type { Topic } from "@/lib/types";

// CIPP/E Domain I — Introduction to European Data Protection.
// Authored against BoK v1.3.3. Original content; topic cards wired to questionsD1.
export const topicsD1: Topic[] = [
  // ─── I.A — Origins and historical context ───
  {
    id: "ce-i-a-1",
    competencyId: "i-a",
    title: "Why Europe protects data: the human-rights roots",
    conceptMd:
      "European data protection did not begin as consumer or commercial regulation — it grew out of the **post-war human-rights settlement**. The **European Convention on Human Rights** (signed in 1950, a **Council of Europe** treaty) guarantees respect for **private and family life** in its Article 8, and that guarantee became the seed of data protection once computerized record-keeping spread through the 1960s and 70s — the German state of **Hesse** passed the first data protection law in 1970, and **Sweden** the first national one in 1973. The EU later went a step further: its **Charter of Fundamental Rights** (legally binding since the Treaty of Lisbon) treats respect for **private life (Article 7)** and **protection of personal data (Article 8)** as two **separate rights**, so in EU law data protection stands on its own feet.",
    exampleMd:
      "In 1970 the parliament of Hesse watched its own administration computerize citizen records and realized that files which once sat in scattered cabinets could now be merged and searched at will — so it passed the world's first data protection act. The worry driving that law was not poor customer service; it was the power imbalance between the record-keeper and the citizen — the same human-rights concern Article 8 ECHR had answered twenty years earlier.",
    questionIds: ["ceq-i-a-1", "ceq-i-a-2"],
    sort: 1,
  },
  {
    id: "ce-i-a-2",
    competencyId: "i-a",
    title: "From soft guidelines to binding treaties — and Brexit",
    conceptMd:
      "Two instruments from the early 1980s internationalized data protection. The **OECD Privacy Guidelines (1980)** distilled widely shared fair-information principles but are **non-binding** recommendations; **Convention 108 (1981)**, from the Council of Europe, is the **first legally binding international data protection treaty** and is **open to accession by states outside Europe**. Its modernization, **Convention 108+**, was adopted in 2018 but has **not yet entered into force**, so the original text remains operative. Inside the EU, the **Treaty of Lisbon (2009)** gave the **Charter of Fundamental Rights the same legal value as the EU treaties** and created a dedicated treaty basis for data protection legislation. **Brexit** then shrank the harmonized zone: the UK now applies its own **UK GDPR** alongside the Data Protection Act 2018, while remaining a Council of Europe member bound by the ECHR and Convention 108.",
    exampleMd:
      "Uruguay acceded to Convention 108 in 2013 — proof that a Council of Europe treaty can bind a South American state, something no EU regulation can do. Meanwhile a London retailer that once worked from the EU GDPR now follows the UK GDPR for its domestic processing: the texts began as mirror images, but the UK can amend its version on its own, which is exactly why the two regimes must now be tracked separately.",
    questionIds: ["ceq-i-a-3", "ceq-i-a-4"],
    sort: 2,
  },

  // ─── I.B — Institutions ───
  {
    id: "ce-i-b-1",
    competencyId: "i-b",
    title: "Two Europes, two courts",
    conceptMd:
      "Europe runs two separate legal systems that exam questions love to blur. The **Council of Europe** (founded 1949, based in Strasbourg) is an international organization with a far wider membership than the EU; it authored the **ECHR** and **Convention 108**, and its court is the **European Court of Human Rights**, which hears **individual applications against member states** for ECHR violations once **domestic remedies are exhausted**. The **European Union** (27 member states) makes EU law such as the GDPR; its court is the **Court of Justice of the European Union** in Luxembourg, which keeps EU law uniform — above all by answering **preliminary references** from national courts. Membership of one organization never implies membership of the other.",
    exampleMd:
      "When Max Schrems challenged EU–US data transfers, the dispute traveled the EU-law route to the **CJEU**, which struck down Safe Harbor in 2015 and Privacy Shield in 2020. When individuals complain that a state's secret surveillance violated their private life, they apply to the **European Court of Human Rights** in Strasbourg — a different court, enforcing a different instrument, for a different club of states.",
    questionIds: ["ceq-i-b-1", "ceq-i-b-2"],
    sort: 1,
  },
  {
    id: "ce-i-b-2",
    competencyId: "i-b",
    title: "Who does what in EU law-making",
    conceptMd:
      "Four EU bodies share the legislative stage, each with one signature function. The **European Commission** holds the near-exclusive right to **propose** legislation, polices compliance as **guardian of the treaties**, and adopts **adequacy decisions** for third countries. The **European Parliament** (directly elected) and the **Council of the European Union** (ministers of the member states) then negotiate and **co-adopt** the proposal. The **European Council** — heads of state or government — sets the Union's broad political direction but **does not legislate**, and despite its name it must never be confused with the Council of Europe.",
    exampleMd:
      "The GDPR followed exactly this path: the Commission put a draft regulation on the table in January 2012, the Parliament and the Council each built negotiating positions and hammered out the compromise, and the final text was adopted in 2016. No head-of-state summit voted it through — the European Council steers, it does not legislate.",
    questionIds: ["ceq-i-b-3"],
    sort: 2,
  },

  // ─── I.C — Legislative framework ───
  {
    id: "ce-i-c-1",
    competencyId: "i-c",
    title: "Convention 108 and its modernization",
    conceptMd:
      "**Convention 108** (Council of Europe, **1981**) is the **first legally binding international instrument** dedicated to data protection: parties must give effect in their national law to its principles for the automated processing of personal data. Unusually for its era, it is **open to accession by states that are not Council of Europe members**, which turned it into a worldwide reference point. An amending protocol — **Convention 108+** — was adopted in **2018** to modernize the treaty for the internet age, but it **has not yet entered into force**, so the original convention remains the operative text.",
    exampleMd:
      "A compliance analyst drafting a training slide writes that 'the GDPR was the world's first binding data protection law.' Her reviewer strikes the line: by the time the GDPR became applicable in 2018, Convention 108 had been binding its parties for nearly four decades — and states far beyond Europe had joined it.",
    questionIds: ["ceq-i-c-1"],
    sort: 1,
  },
  {
    id: "ce-i-c-2",
    competencyId: "i-c",
    title: "Directive 95/46/EC: harmonization with gaps",
    conceptMd:
      "The **Data Protection Directive 95/46/EC** (1995) was the EU's first general data protection law, with twin aims: protect individuals when their personal data is processed and secure the **free movement of personal data** between member states. But a **directive binds only as to the result to be achieved** — each member state had to **transpose** it through its own national legislation, and the latitude that form allows produced **divergent national regimes**: different procedures, registration duties and interpretations across one single market. That fragmentation, plus two decades of technological change, is why the EU replaced it: the GDPR **repealed the Directive with effect from 25 May 2018**.",
    exampleMd:
      "Around 2010, a hotel group with properties in five member states kept five different compliance binders: one authority demanded prior registration of processing operations, another did not; notification formats and security expectations shifted at every border. Every binder traced back to the same Directive — just filtered through five national parliaments.",
    questionIds: ["ceq-i-c-2", "ceq-i-c-3"],
    sort: 2,
  },
  {
    id: "ce-i-c-3",
    competencyId: "i-c",
    title: "The GDPR: one directly applicable rulebook",
    conceptMd:
      "The **GDPR** was **adopted in 2016** and became **applicable on 25 May 2018** after a two-year transition. As a **regulation** it is **binding in its entirety and directly applicable** in every member state — no national transposition required — which is precisely how it cures the Directive's fragmentation. Its objectives are twin: **protect natural persons** with regard to the processing of personal data, and **safeguard the free movement of personal data within the Union**. It also reaches further than its predecessor, catching organizations outside the EU that offer goods or services to, or monitor the behavior of, people in the Union.",
    exampleMd:
      "On 25 May 2018 the hotel group's five binders collapsed into one: the same regulation text, applying directly in every country where it operates. Meanwhile a US booking site with no European office discovered it was caught as well — it targets guests in the Union, and the GDPR's reach does not stop at the border.",
    questionIds: ["ceq-i-c-4", "ceq-i-c-5"],
    sort: 3,
  },
  {
    id: "ce-i-c-4",
    competencyId: "i-c",
    title: "ePrivacy and e-Commerce: the companion directives",
    conceptMd:
      "Two older directives still shape online life. The **ePrivacy Directive 2002/58/EC** (amended in **2009**) is the **lex specialis** for electronic communications: it protects the **confidentiality of communications**, regulates **traffic and location data**, sets the rules for **unsolicited direct marketing**, and requires **consent before storing or accessing information on a user's device** — the 'cookie rule'. The **e-Commerce Directive 2000/31/EC** frames **information society services**: a **country-of-origin** principle plus **conditional liability shields** for intermediaries acting as **mere conduit, cache or host**, with **no general obligation to monitor** content. Where ePrivacy sets a specific rule it takes precedence over the GDPR; the GDPR fills the gaps.",
    exampleMd:
      "One marketplace meets both directives in a single week: the growth team wants to text promotional offers to past buyers — ePrivacy's direct-marketing territory — while legal fields a complaint about a defamatory seller listing, where the e-Commerce Directive's hosting shield decides whether the platform is liable for content it neither wrote nor knew about.",
    questionIds: ["ceq-i-c-6", "ceq-i-c-7"],
    sort: 4,
  },
  {
    id: "ce-i-c-5",
    competencyId: "i-c",
    title: "NIS and NIS2: cybersecurity, not data protection",
    conceptMd:
      "The **NIS Directive (2016)** was the EU's **first horizontal cybersecurity law**, requiring operators of **essential services** and key digital providers to manage security risks and report significant incidents. Because it was a directive, national implementations diverged, and **NIS2** replaced it with a **much broader scope** — whole sectors of **essential and important entities** — plus stricter supervision, management accountability and tighter **incident-reporting** duties. Crucially, the NIS framework protects **network and information systems and the continuity of services**, not personal data as such: the GDPR's personal-data-breach notification is a separate duty with a separate trigger, and one incident can set off both.",
    exampleMd:
      "Ransomware freezes a water utility's control systems overnight. Even if forensics show no personal data was touched, the utility still owes incident reporting under its national NIS2-implementing law, because what that framework guards is the service and its systems. Only if the attackers also reached customer records would the GDPR's breach-notification clock start running too.",
    questionIds: ["ceq-i-c-8"],
    sort: 5,
  },
  {
    id: "ce-i-c-6",
    competencyId: "i-c",
    title: "The EU AI Act at a glance",
    conceptMd:
      "The **EU AI Act** is the first comprehensive, horizontal law regulating artificial intelligence. It is a **regulation** — directly applicable, phased in over time — built on a **risk-based pyramid**: certain practices are **prohibited** outright, **high-risk** systems carry the heaviest obligations, limited-risk systems owe **transparency**, and minimal-risk systems are left largely alone. It governs AI **systems and their uses whether or not personal data is involved**, and it **complements rather than replaces** the GDPR — an AI system processing personal data must satisfy both regimes at once.",
    exampleMd:
      "A recruiter deploys an AI tool that screens job applications. The AI Act cares about the system itself — employment-related AI sits in its high-risk tier — while the GDPR simultaneously governs the applicants' personal data the tool works through. Passing one regime earns no exemption from the other.",
    questionIds: ["ceq-i-c-9"],
    sort: 6,
  },
];
