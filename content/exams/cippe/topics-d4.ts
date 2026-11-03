import type { Topic } from "@/lib/types";

// CIPP/E Domain IV topics — European Data Protection: Scope & Accountability.
// Authored against BoK v1.3.3. Original content.
export const topicsD4: Topic[] = [
  // ─── IV.A — Territorial & material scope ───
  {
    id: "ce-iv-a-1",
    competencyId: "iv-a",
    title: "Territorial scope: establishment and targeting",
    conceptMd:
      "The GDPR reaches organizations through two separate doors. Under **Article 3(1)**, it applies to processing carried out **in the context of the activities of an EU establishment** — and it does not matter where the processing itself physically happens, which is the logic the CJEU set in Google Spain, where an EU ad-sales office pulled a foreign parent's search processing into scope. Under **Article 3(2)**, a business with **no EU establishment** is still caught when it **offers goods or services** to people in the EU — **irrespective of whether any payment is required** — or **monitors their behaviour** within the EU. A website being merely accessible from Europe is not targeting: look for evidence of intent such as EU languages, euro pricing, delivery to member states or EU-facing campaigns. Controllers caught only through Article 3(2) generally must also designate an **Article 27 representative** in the Union.",
    exampleMd:
      "Seabright Audio, a Singapore startup, gives away a free podcast app with German and Polish interface packs, a 'Listeners across the EU' launch campaign, and euro pricing on optional merchandise. It has no EU office and charges most users nothing — yet it is squarely within Article 3(2)(a), because offering a service to people in the Union counts even without payment. Its rival, whose English-only site merely happens to be reachable from Lisbon, is not targeting anyone and stays outside.",
    questionIds: ["ceq-iv-a-1", "ceq-iv-a-2"],
    sort: 1,
  },
  {
    id: "ce-iv-a-2",
    competencyId: "iv-a",
    title: "Material scope and the carve-outs",
    conceptMd:
      "The GDPR covers processing of personal data by **automated means** and manual data held in **structured filing systems** — but several activities sit outside it. The **purely personal or household exemption** shelters activity with no connection to a professional or commercial purpose, and it is read narrowly: a home camera that systematically films **public space**, or a blog published to the world, falls back into scope. Processing by **competent authorities for law-enforcement purposes** is governed by the **Law Enforcement Directive (LED)** as implemented nationally, not by the GDPR. Processing by **EU institutions and bodies** runs under their own separate regulation, supervised by the **EDPS**.",
    exampleMd:
      "Tomas keeps a spreadsheet of family birthdays (household — out of scope), while the regional police force he works for runs number-plate recognition to investigate car theft (LED, not GDPR). When the same municipality analyzes footfall data for city planning, that is ordinary GDPR processing — the regime follows the purpose and the capacity in which the body acts, not the logo on the building.",
    questionIds: ["ceq-iv-a-3"],
    sort: 2,
  },
  // ─── IV.B — Accountability ───
  {
    id: "ce-iv-b-1",
    competencyId: "iv-b",
    title: "Controller, processor, joint controller",
    conceptMd:
      "Roles follow **who determines the purposes and means** of processing — never what the contract calls a party. Two or more actors that **jointly determine** purposes and means are **joint controllers**, and Article 26 requires a transparent **arrangement** allocating their responsibilities, with its **essence made available to data subjects**. Crucially, that arrangement organizes the partners internally only: a data subject may exercise her rights **against each joint controller**, whatever the arrangement says. A **processor** acts on the controller's **documented instructions** — and one that starts processing for its own purposes is treated as a controller for that processing.",
    exampleMd:
      "Retailer Fennwick and adtech firm Bluerath together decide which loyalty-card attributes feed a shared scoring model and both use the profiles for their own campaigns — joint controllers, however the contract labels them. The courier that merely receives Fennwick's address list and delivers parcels as instructed is a processor. If that courier quietly reused the addresses to market its own services, it would become a controller for that reuse.",
    questionIds: ["ceq-iv-b-1"],
    sort: 1,
  },
  {
    id: "ce-iv-b-2",
    competencyId: "iv-b",
    title: "By design, by default, and the Article 30 records",
    conceptMd:
      "**Data protection by design** (Article 25(1)) builds safeguards into systems from the planning stage; **data protection by default** (Article 25(2)) is narrower and often mangled on the exam: **by default, only the personal data necessary for each specific purpose may be processed** — covering the **amount** collected, the **extent** of processing, the **storage period** and the **accessibility** of the data, including never making data accessible to an indefinite number of people without the individual's intervention. Separately, Article 30 requires controllers and processors to keep **records of processing activities**. The **under-250-employee relief** is famously leaky: it falls away where processing is likely to create risk, is **not occasional**, or touches **special categories** or criminal-offence data — so a small firm's routine HR and customer processing almost always stays recordable. Controllers must also **cooperate with the supervisory authority** on request.",
    exampleMd:
      "A 40-person boutique ships a social feature whose profiles are public by default and insists it is 'too small for GDPR paperwork.' Both instincts are wrong: profiles must default to the minimal, least-visible setting, and because payroll and the customer database are processed daily — not occasionally — and sickness absences are special-category data, the Article 30 records duty applies despite the headcount.",
    questionIds: ["ceq-iv-b-2", "ceq-iv-b-3"],
    sort: 2,
  },
  {
    id: "ce-iv-b-3",
    competencyId: "iv-b",
    title: "DPIAs and prior consultation",
    conceptMd:
      "A **data protection impact assessment** (Article 35) is required **before** processing that is **likely to result in a high risk** to individuals — with three flagship triggers: **systematic and extensive automated evaluation, including profiling, with legal or similarly significant effects**; **large-scale processing of special categories** or criminal-offence data; and **systematic monitoring of publicly accessible areas on a large scale**. Scale matters: a single practitioner's patient records are the standard example of special-category processing that is *not* large-scale. Supervisory authorities publish **blacklists** of operations requiring a DPIA, but those lists supplement the general test — absence from a list clears nothing. If, **after mitigation measures are designed, the residual risk remains high**, the controller must consult the SA under **Article 36 before processing begins** — consultation is the escalation valve, never step one.",
    exampleMd:
      "Credavia Bank plans fully automated credit scoring for every applicant — systematic, extensive profiling with significant effects, so a DPIA comes first even though no special categories are involved. The DPIA surfaces serious risks; the team designs mitigations, and only because a meaningful residual risk survives does it then book prior consultation with the SA before launch.",
    questionIds: ["ceq-iv-b-4", "ceq-iv-b-5"],
    sort: 3,
  },
  {
    id: "ce-iv-b-4",
    competencyId: "iv-b",
    title: "The data protection officer",
    conceptMd:
      "A **DPO is mandatory** in exactly three cases (Article 37): the organization is a **public authority or body**; its **core activities** require **regular and systematic monitoring of data subjects on a large scale**; or its core activities consist of **large-scale processing of special categories** or criminal-offence data. There is **no employee-count trigger** — the 250 figure belongs to the Article 30 records carve-out, and ancillary functions like a company's own payroll never count as core activities. The DPO must have **expert knowledge**, may be shared across a group or engaged **externally on a service contract**, and is protected by hard independence rules: **no instructions** on how to perform the tasks, **no dismissal or penalty** for performing them, **timely involvement** in all data protection matters, and a direct line to the **highest management level**. Management may ultimately decide against the DPO's advice — accountability stays with the controller — but it may never hold a DPO who also **determines purposes or means** of processing, which is a disqualifying conflict of interest.",
    exampleMd:
      "Tarnholt Media's ad network tracks reading behaviour across thousands of sites — core-activity, large-scale, regular and systematic monitoring, so a DPO is mandatory regardless of headcount. The board wants to appoint the head of IT 'because he knows every system'; he is barred, since he decides the means of the very processing he would police. When the eventual DPO flags a campaign as high-risk, marketing may escalate the disagreement to the board — but may not order the assessment withdrawn or threaten her contract.",
    questionIds: ["ceq-iv-b-6", "ceq-iv-b-7"],
    sort: 4,
  },
  // ─── IV.C — Supervision & enforcement structure ───
  {
    id: "ce-iv-c-1",
    competencyId: "iv-c",
    title: "Who supervises whom: SAs, the EDPB and the EDPS",
    conceptMd:
      "Each member state's **supervisory authority** acts with **complete independence** and holds the operational powers: **investigative** (audits, access to premises and data), **corrective** (warnings, reprimands, orders, processing bans, transfer suspensions and **fines**) and **authorization/advisory** powers. The **EDPB** — the heads of the SAs plus the EDPS — issues guidelines, runs the **consistency mechanism** and adopts **binding decisions to resolve disputes between authorities**; it is **not a first-line enforcer** and does not fine companies. The **EDPS** supervises the **EU institutions and bodies** under their own separate regulation. Keep the three in their lanes: companies answer to SAs, SAs answer to the consistency machinery, EU bodies answer to the EDPS.",
    exampleMd:
      "Three files land on a trainee's desk: a bakery chain's sloppy CCTV (the national SA investigates and, if needed, fines), a stand-off between the Spanish and Dutch SAs over a draft decision (the EDPB resolves it with a binding decision), and a complaint about an EU agency's staff-vetting database (the EDPS supervises). Sending any file to the wrong body is the classic exam error.",
    questionIds: ["ceq-iv-c-1", "ceq-iv-c-2"],
    sort: 1,
  },
  {
    id: "ce-iv-c-2",
    competencyId: "iv-c",
    title: "Lead authority and the one-stop-shop",
    conceptMd:
      "For **cross-border processing**, the SA of the controller's **main establishment** acts as **lead supervisory authority**, cooperating with the **concerned SAs** and giving the business a single interlocutor — the **one-stop-shop**. The lead is fixed by facts, not preference: under **EDPB Opinion 04/2024**, a place of central administration is a main establishment **only if it actually takes the decisions on the purposes and means** of the processing **and has the power to implement them** — and the burden of proving that sits with the controller. Where the real decisions are taken **outside the EU**, there is **no main establishment and no one-stop-shop**: every SA is competent for its own territory, and an Article 27 **representative never creates** an establishment. A **local-case exception** also lets an SA handle a matter that concerns only its own territory, informing the lead, which has a short window to take the case over.",
    exampleMd:
      "Norvane Travel's Rotterdam headquarters genuinely decides the purposes and means of its EU-wide booking platform, so the Dutch SA leads and the French SA joins as a concerned authority when a Paris customer complains. Contrast Westrahl Inc., whose Dublin office is labelled 'EU HQ' but merely does marketing while Denver decides everything: no main establishment, no one-stop-shop, and each SA may act on its own patch.",
    questionIds: ["ceq-iv-c-3"],
    sort: 2,
  },
  // ─── IV.D — Consequences ───
  {
    id: "ce-iv-d-1",
    competencyId: "iv-d",
    title: "The two fine tiers and the Article 83 factors",
    conceptMd:
      "Administrative fines come in **two tiers**, each capped at a fixed sum or a share of **total worldwide annual turnover — whichever is HIGHER**. Breaches of operational, controller-and-processor duties — think **by design and by default, records of processing, security, DPIAs, DPO obligations** — sit in the lower tier: up to **€10 million or 2%**. Breaches of the **basic principles, lawful basis and consent conditions, data subject rights, and international transfer rules** — and defiance of an SA order — sit in the upper tier: up to **€20 million or 4%**. The amount within the ceiling is calibrated by the **Article 83 factors**: nature, gravity and duration; **intentional or negligent** character; **mitigation** efforts; degree of responsibility; previous infringements; **cooperation** with the SA; the categories of data; and how the authority learned of the breach. For the **same or linked processing operations**, the total fine may not exceed the amount set for the **gravest** infringement — ceilings do not stack.",
    exampleMd:
      "Fiorvand Bank skipped a required DPIA (2% tier) and, on the same project, processed without any lawful basis (4% tier). On €10 billion of turnover its worst case is 4% — €400 million for the gravest infringement — not 2% plus 4%. Its early self-report and swift mitigation then push the actual figure down within that ceiling.",
    questionIds: ["ceq-iv-d-1", "ceq-iv-d-2"],
    sort: 1,
  },
  {
    id: "ce-iv-d-2",
    competencyId: "iv-d",
    title: "Corrective powers beyond fines",
    conceptMd:
      "Fines are one tool in a **graduated corrective toolkit** (Article 58(2)), not the whole arsenal and not a mandatory first or only step. An SA may issue a **warning** that intended processing is likely to infringe, a **reprimand** for an infringement that has occurred, **orders** to honour data subject requests or bring processing into compliance, an order to **communicate a breach** to those affected, a **temporary or definitive ban** on processing, **rectification or erasure orders**, withdrawal of a certification, and **suspension of data flows** to a third-country recipient. The choice is governed by **proportionality** — measures can be combined with a fine or imposed instead of one.",
    exampleMd:
      "A first-time, already-corrected transparency slip by a small tour operator draws a reprimand plus a compliance order and no fine. The same SA, facing a repeat offender still streaming customer data to an unvetted overseas recipient, bans the processing and suspends the flow — the toolkit scales to the harm.",
    questionIds: ["ceq-iv-d-3"],
    sort: 2,
  },
  {
    id: "ce-iv-d-3",
    competencyId: "iv-d",
    title: "Remedies: complaints, courts, compensation, collective action",
    conceptMd:
      "Individuals hold a layered remedy map. **Article 77**: lodge a **complaint with an SA** (home state, workplace state, or place of infringement). **Article 78**: a **judicial remedy against the SA itself** — including where it fails to handle a complaint or to report progress **within three months**. **Article 79**: court action directly **against the controller or processor**. **Article 82**: **compensation for material AND non-material damage** — distress counts — claimed before the **courts**, never awarded by an SA; a **processor is liable only** where it breached processor-specific obligations or acted outside or against lawful instructions, while parties that are each responsible face **joint and several liability** with a right of **recourse** between them. Under **Article 80**, a data subject may **mandate a qualifying not-for-profit** to act for her; mandate-free action by such bodies exists **only where a member state has provided for it**, and the EU's Collective Redress Directive adds representative actions by qualified entities for GDPR breaches.",
    exampleMd:
      "After a mailing exposes Henrik's therapy attendance, he complains to his SA (Article 77) and separately sues the insurer for his documented anxiety — non-material damage — before a court (Article 82). When the SA goes silent for four months, Article 78 opens a judicial route against the authority. A consumer foundation can take over the fight for him under a mandate — and can act without one only in member states that switched that option on.",
    questionIds: ["ceq-iv-d-4"],
    sort: 3,
  },
];
