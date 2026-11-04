import type { Topic } from "@/lib/types";

// CIPM Domain I — Privacy Program: Developing a Framework (BoK v4.2.0).
// Original content; topic cards wired to questionsD1 (two practice items each).
export const topicsD1: Topic[] = [
  // ─── I.A — Program scope & privacy strategy ───
  {
    id: "cm-i-a-1",
    competencyId: "i-a",
    title: "Scope starts with the data: sources, types and uses",
    conceptMd:
      "A privacy program's **scope** is set by the personal information the organization actually handles, so scoping starts with the data, not the org chart. **Sources** include information people provide **directly** (forms, accounts, applications), information **observed** as they interact (device data, location, call recordings), information the organization **derives or infers** (scores, segments, predictions) and information **obtained from third parties** (data brokers, partners, public records) — and each source raises its own notice and provenance questions. **Types** run from ordinary contact details to **sensitive** categories such as health, biometric, financial, precise location or children's data, which attract stricter rules, and the people involved include **employees, job applicants and contractors**, not just customers. **Uses** — the purposes the data serves, including secondary uses beyond the original one — decide which obligations apply and where risk concentrates. Only once sources, types and uses are mapped can the program say which laws apply, whose rights are engaged and where to focus first.",
    exampleMd:
      "Harbor & Pine, a regional grocery chain, assumed its program covered 'the loyalty database.' Scoping found much more: purchase histories (provided directly), in-store Wi-Fi location pings (observed), a 'likely new parent' segment built by the analytics team (inferred), a household-income file bought from a data broker (third-party), and payroll and background-check records for 4,000 staff. The inferred segment and the broker file raised the hardest questions — neither appeared in the privacy notice — and both went to the top of the work plan.",
    questionIds: ["cmq-i-a-1", "cmq-i-a-2"],
    sort: 1,
  },
  {
    id: "cm-i-a-2",
    competencyId: "i-a",
    title: "Strategy that fits: business model, risk appetite and governance model",
    conceptMd:
      "There is no off-the-shelf privacy strategy: it has to fit the **business model** (selling to consumers or to businesses, deciding how data is used as a **controller** or acting on clients' instructions as a **processor or service provider**, monetizing data or simply using it to deliver a service), the **operating environment** (industry, regulators, countries, customer expectations, culture and threats) and the organization's **risk appetite** — the amount of risk it will accept in pursuit of its objectives, which **senior leadership sets with board oversight** and the privacy office translates into priorities and tolerances. The same facts decide the **governance model**. A **centralized** model concentrates privacy decisions in one office and suits organizations with uniform operations or a single regulatory regime. A **local (decentralized)** model gives authority to business units or countries and suits highly autonomous units that share little data — at the cost of consistency and a single view of risk. A **hybrid** model — central policy, standards and oversight, with local implementation — is the usual fit for organizations that need both consistency and local adaptation, such as most multinationals.",
    exampleMd:
      "Ledgerly, an online bank in one country with one product line and one primary regulator, runs a centralized program: a single privacy office approves every new use of customer data, and consistency is the point. Corvane Group, an industrial manufacturer with plants and sales offices in 19 countries, chose a hybrid model: a group privacy office sets the global standard and reports to the board, while country privacy leads adapt notices, works council consultations and local filings — one rulebook could not fit 19 legal systems on its own, and 19 separate rulebooks would give the board no single picture of risk.",
    questionIds: ["cmq-i-a-3", "cmq-i-a-4"],
    sort: 2,
  },
  {
    id: "cm-i-a-3",
    competencyId: "i-a",
    title: "The privacy team and the partners it works through",
    conceptMd:
      "A privacy team's structure should match the governance model and the organization's size, and no team runs a program alone. An **executive sponsor** gives the program authority, budget and visible backing; a **privacy steering committee** of senior cross-functional leaders sets priorities, approves policies and resolves conflicts; and a **privacy champions network** — trained staff embedded in business units — acts as the program's local eyes, ears and first point of contact. Where one is required, the **data protection officer (DPO)** monitors compliance and advises independently: reporting to the highest management level, taking no instructions on how to do the job, and holding no role that decides why or how personal data is processed. Specialist partners each own a slice: **legal** (law and contracts), **information security** (safeguards and incident detection), **HR** (workforce data and discipline), **marketing** (consent and campaigns), **procurement** (the intake gate for every new vendor) and **internal audit** (independent assurance that controls actually work).",
    exampleMd:
      "Brightwater Health's privacy office has four people for 9,000 staff, and it works because of its partners. The COO is the executive sponsor and chairs the quarterly steering committee; 60 trained champions flag new projects in their departments; procurement will not issue a purchase order for any vendor that touches patient data until the privacy questionnaire is complete; and internal audit tests a sample of those vendor files every year — independently of the team that approved them.",
    questionIds: ["cmq-i-a-5", "cmq-i-a-6"],
    sort: 3,
  },

  // ─── I.B — Vision & mission ───
  {
    id: "cm-i-b-1",
    competencyId: "i-b",
    title: "Vision and mission: the destination and the job",
    conceptMd:
      "A program's **vision** describes the destination: a short, aspirational picture of how the organization wants to treat personal information, written to inspire and to last for years. Its **mission** describes the job: what the program does, for whom and how — concrete enough that a manager can test a decision against it. Both work when they are **short and plain**, **aligned with the organization's own mission, values and strategy**, drafted with input from the stakeholders who will live by them, **visibly endorsed by leadership**, and connected to program objectives and metrics that carry the detail the statements leave out. Statements that read like legal text, list every law in scope or contradict how the business actually behaves get ignored — and an external one that overpromises becomes a liability.",
    exampleMd:
      "Lumen Rail's privacy office wrote: 'Passengers trust Lumen with their journeys and their data.' That is a vision — it names a destination. The mission followed: 'We help every Lumen team use personal information lawfully and respectfully by setting clear standards, reviewing new uses before launch and measuring how well we keep our commitments.' When a product team proposed sharing station-level journey data with an advertising partner, the steering committee tested the idea against both statements first, and the proposal came back redesigned before anyone debated the details.",
    questionIds: ["cmq-i-b-1", "cmq-i-b-2"],
    sort: 1,
  },
  {
    id: "cm-i-b-2",
    competencyId: "i-b",
    title: "Making the program known — inside and outside",
    conceptMd:
      "A program people do not know about cannot work, so **awareness** is built deliberately in two directions. **Internally**, people need to know the program exists, why it matters, what it expects of them and whom to call — through leadership messages, the intranet, onboarding, team meetings, the champions network and recurring moments such as Data Privacy Day; because attention fades, the effort must be **ongoing**, not a one-off launch. **Externally**, customers, regulators, business partners and investors see the program through privacy notices, trust or transparency pages, customer communications, contract commitments and industry engagement. Every external statement is a **commitment**: claims that go beyond actual practice can be treated as deceptive — in the US, the FTC pursues broken privacy promises under Section 5 of the FTC Act — so external messages must be checked against what the organization really does before they go out.",
    exampleMd:
      "When Orchid Telecom launched its program, the CEO opened the all-hands meeting with a two-minute privacy message, the intranet gained a 'Privacy at Orchid' hub with named contacts, and champions took a ten-minute slot in team meetings every quarter. Externally, Orchid rebuilt its trust page — but only after the privacy office checked every claim against the data inventory and struck the line 'we never share your data with third parties,' which was untrue for its billing and fraud-prevention vendors.",
    questionIds: ["cmq-i-b-3", "cmq-i-b-4"],
    sort: 2,
  },
  {
    id: "cm-i-b-3",
    competencyId: "i-b",
    title: "The right policy for each role, in words everyone shares",
    conceptMd:
      "People can only follow policies they can find, so a program gives employees and contractors **role-based access**: each policy, standard and procedure is mapped to the roles it applies to and surfaced where those people work, while sensitive playbooks (such as a detailed incident-response runbook) can be limited to the teams that use them as long as everyone gets the short version they need. A **single authoritative repository** with **version control** keeps one current version of each document, moves superseded ones to an archive kept for audit, and lets the program send **targeted notice of updates** — what changed, why, by when and what to do — to the affected roles, tracking their acknowledgment. Alongside access, the program needs a **shared privacy vocabulary**: a glossary that fixes what terms such as personal information, sensitive data, **incident** and **breach**, **anonymized** and **pseudonymized** mean internally, and maps them to each law's definitions, so that policies, training, tickets and metrics all mean the same thing.",
    exampleMd:
      "At Fenwick Mutual, claims handlers logged every misdirected email as a 'breach,' so the quarterly board report showed 300 breaches — alarming directors and creating records that implied notification duties nobody had assessed. The privacy office published a glossary separating 'event,' 'incident' and 'breach' (the last reserved for a determination made by privacy and legal), built the terms into the ticket categories, and sent a two-line summary to the claims teams only. The next report showed 290 incidents and 4 confirmed breaches — numbers the board could finally read.",
    questionIds: ["cmq-i-b-5", "cmq-i-b-6"],
    sort: 3,
  },

  // ─── I.C — In-scope laws & standards ───
  {
    id: "cm-i-c-1",
    competencyId: "i-c",
    title: "Regulatory models, codes of practice and certification schemes",
    conceptMd:
      "Privacy is regulated in four broad ways. A **comprehensive** model applies one general law across most sectors under a data protection authority (the GDPR, Brazil's LGPD), while a **sectoral** model regulates particular industries or data types instead — at US federal level, HIPAA for health care, GLBA for financial institutions, COPPA for children's online data. In a **co-regulatory** model, industry writes enforceable codes that a government regulator approves and oversees (Australia's registered privacy codes, the GDPR's approved codes of conduct); in a **self-regulatory** model, industry writes and polices its own codes — advertising opt-out programs, or the card brands' PCI DSS standard enforced through contracts — although a US company that publicly promises to follow a code can face FTC action if it does not. Certification schemes sit alongside the models. The **EU-US Data Privacy Framework** runs on **self-certification** to the US Department of Commerce, enforced by the FTC or the Department of Transportation, and is open only to organizations under their jurisdiction. The **APEC Cross-Border Privacy Rules (CBPR)** system — opened to jurisdictions beyond APEC by the **Global CBPR Forum** (founded 2022), whose own Global CBPR (for controllers) and Global PRP (for processors) certifications launched in 2025 — instead requires certification by a recognized **Accountability Agent**, and no CBPR certificate is a transfer mechanism under the GDPR.",
    exampleMd:
      "Wattle & Pine Finance, a consumer lender, meets all four models. In Australia it follows the registered credit reporting code — written by industry, approved and enforced by the regulator (co-regulatory); its card payments follow PCI DSS because its acquiring bank's contract requires it (self-regulatory); its EU branch answers to the GDPR (comprehensive); and its US arm maps which federal sector laws apply to lending, starting with GLBA (sectoral). When its US technology subsidiary began receiving staff data from the EU branch, it self-certified to the Data Privacy Framework — the subsidiary's CBPR certification, earned for Asia-Pacific clients, did nothing for transfers out of Europe.",
    questionIds: ["cmq-i-c-1", "cmq-i-c-2"],
    sort: 1,
  },
  {
    id: "cm-i-c-2",
    competencyId: "i-c",
    title: "Who enforces — and what non-compliance really costs",
    conceptMd:
      "Each regulator's reach is set by statute, so the first question after a failure is who can act. **EU supervisory authorities** are independent regulators with investigative and corrective powers — orders, processing bans, suspension of data flows to third countries, and fines of up to €20 million or 4% of worldwide annual turnover, whichever is higher — coordinated through a **lead authority** when a company has its main establishment in the EU. In the US, the **FTC** polices unfair or deceptive practices under Section 5 of the FTC Act (broken privacy promises included) and enforces rules such as COPPA, and its settlements typically become consent orders lasting 20 years; **HHS OCR** enforces HIPAA, but only against covered entities and their business associates; **state attorneys general** enforce state privacy, breach-notification and consumer-protection laws and can bring HIPAA actions too; and the **California Privacy Protection Agency** (now operating as CalPrivacy) writes CCPA regulations and brings administrative enforcement alongside the California Attorney General. **Canada's Privacy Commissioner (OPC)** investigates complaints under PIPEDA and issues findings and recommendations, but cannot itself fine or issue binding orders — enforceable orders come from the Federal Court. The cost of non-compliance runs well beyond fines — years of mandated assessments, orders that halt processing, litigation, lost customers and lost trust — and for **individuals** it can mean financial loss, discrimination, distress or physical danger, which is why harm to people, not only to the organization, drives a program's priorities.",
    exampleMd:
      "Two failures, two regulators. When Rivermark Clinics — a HIPAA covered entity — lost an unencrypted laptop holding patient records, HHS OCR opened an investigation, and the state attorney general, who can also enforce HIPAA, opened one of her own. When PulseLoop, a consumer fitness app outside HIPAA, shared users' heart-rate data with advertisers despite promising not to, it was the FTC that acted, and the settlement came with a 20-year order requiring a privacy program and independent assessments. In both cases the investigation was only the start: remediation, legal fees and lost customers followed.",
    questionIds: ["cmq-i-c-3", "cmq-i-c-4"],
    sort: 2,
  },
  {
    id: "cm-i-c-3",
    competencyId: "i-c",
    title: "Territorial scope and running one program across many laws",
    conceptMd:
      "Which laws apply depends on **where the organization is established, where the individuals are and what it does with their data** — not on where its servers sit. The GDPR shows both kinds of trigger: it applies to processing in the context of an **EU establishment**, wherever the processing happens, and to organizations outside the EU that **offer goods or services to people in the EU or monitor their behavior there**; those outsiders must normally appoint an **EU representative**, which does not give them the one-stop-shop that a main EU establishment brings. Many other laws reach across borders on similar logic, and US state privacy laws apply to businesses that deal with their residents and meet each law's applicability criteria. To run one program across them, organizations usually set a **global baseline** of principles and controls pitched at the strictest common requirements, plus **jurisdiction-specific addenda** for rules that add to or conflict with it — data localization, works council consultation, local registrations or breach timelines — because applying one country's law everywhere fails wherever requirements differ in kind rather than in strictness.",
    exampleMd:
      "Aurelia Learning, an online course provider based in Toronto with servers in Montreal, sells to students across North America and Europe. Its euro pricing and German- and French-language pages bring it under the GDPR even though it has no office in the EU, so it has appointed an EU representative in Dublin. Its program runs on one global privacy standard with addenda: a GDPR addendum for EU students, a Quebec addendum for that province's stricter rules, and a short note for the one country whose law requires student records to be stored locally.",
    questionIds: ["cmq-i-c-5", "cmq-i-c-6"],
    sort: 3,
  },
  {
    id: "cm-i-c-4",
    competencyId: "i-c",
    title: "Privacy risks of AI in the business",
    conceptMd:
      "AI raises privacy risks at every stage, and the program has to recognize them before it can manage them. **Training data** brings familiar questions in a new form: was the data collected for a purpose compatible with training, was it scraped or bought, is more used than needed, and what were people told? **Inference** creates new personal information — a model can deduce health, sexual orientation or financial distress from innocuous inputs — while **re-identification** runs the other way: models can memorize and leak training records, and attacks such as membership inference reveal whether a person's data was in the training set, so 'de-identified' inputs may not stay that way. **Automated decisions** about credit, jobs or insurance bring fairness, transparency and contestability duties; under the GDPR, people may not be subjected to solely automated decisions with legal or similarly significant effects except under narrow conditions, with safeguards such as human intervention. And **staff using third-party AI tools** can paste customer or employee data into services that retain it or train on it — so the program needs an inventory of AI use, impact assessments before deployment, vendor terms that limit retention and training, and clear rules on which tools may be used with what data.",
    exampleMd:
      "At Nordlys Insurance, the privacy review of an underwriting pilot found the model was effectively inferring pregnancy from purchase-category data — a sensitive inference nobody had approved. The same month, the privacy office found claims handlers pasting accident reports into a free chatbot whose terms allowed training on inputs. Nordlys answered both the same way: an inventory of AI uses, an impact assessment before any model touches customer data, an approved enterprise assistant whose contract bars training and limits retention, and a rule that personal data goes into no other AI tool.",
    questionIds: ["cmq-i-c-7", "cmq-i-c-8"],
    sort: 4,
  },
];
