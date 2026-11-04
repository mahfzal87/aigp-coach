import type { Topic } from "@/lib/types";

// CIPM Domain V — Privacy Program Operational Life Cycle: Sustaining Program Performance.
// Authored against BoK v4.2.0. Original content; topic cards wired to questionsD5.
export const topicsD5: Topic[] = [
  // ─── V.A — Performance metrics ───
  {
    id: "cm-v-a-1",
    competencyId: "v-a",
    title: "Match the metric to the question and the audience",
    conceptMd:
      "A metric earns its place by answering a question someone actually needs answered, so start from the **objective**. **Trending** metrics track one measure across consecutive periods to show direction, and they only work if the definition stays fixed; **return on investment (ROI)** metrics set what the program costs against what it returns, usually as effort saved and losses avoided rather than revenue; **business resiliency** metrics show whether the organization keeps meeting its privacy obligations when systems, vendors or people fail; and **program maturity** metrics rate each program area on a scale such as **ad hoc, repeatable, defined, managed, optimized** to show how embedded it is and how far it sits from a target. Then fit the metric to its **audience**: a board needs a few outcome and risk measures with trend and context, an operations lead needs granular figures to act on this week, and an auditor or regulator needs evidence that obligations were met. Every metric also needs a named **owner**, a fixed formula and data source, and a reporting frequency, or nobody will trust the number.",
    exampleMd:
      "At **Halden Mutual**, a Norwegian insurer, the privacy office kept sending the board the 30-row spreadsheet it used internally, and directors stopped reading it. The CPO rebuilt the pack around the board's questions: a four-quarter trend of rights requests answered on time, a maturity rating per program area against the target the risk committee had agreed, and the cost of handling one request before and after the new case-management tool. The 30 rows did not disappear; they moved to the weekly operations dashboard, where team leads use them to clear the queue.",
    questionIds: ["cmq-v-a-1", "cmq-v-a-2"],
    sort: 1,
  },
  {
    id: "cm-v-a-2",
    competencyId: "v-a",
    title: "Link the numbers to goals, and read them honestly",
    conceptMd:
      "Program data becomes a useful metric when it is tied to a **goal** or a **compliance measure**: the share of in-scope projects with a PIA finished **before launch**, rights requests answered within the legal deadline (one month under the GDPR and 45 days under the CCPA, each extendable), complaint volumes and their causes, breach counts and **time to contain**, and training completion. **Leading indicators** move before outcomes do and give early warning, such as screenings done at the design stage or vendors assessed before they receive any data; **lagging indicators** record outcomes after the fact, such as breaches, time to contain, complaints and missed deadlines. A program needs both, but only leading indicators let you act before harm occurs. Watch for metrics that mislead: counts with no denominator, activity presented as effect (training completed is not behavior changed), a figure that moved because the way it is collected changed, and targets that invite gaming, such as closing rights requests quickly by rejecting them.",
    exampleMd:
      "**Corvallis Robotics** reported that its PIAs had tripled, from 14 to 42 in a year. A new privacy analyst asked a different question: of the 120 projects that went live, how many had a PIA finished before launch? The answer was 11, fewer than one in ten; most of the 42 had been written after go-live to satisfy an audit request. The count measured paperwork, while the coverage ratio measured the goal.",
    questionIds: ["cmq-v-a-3", "cmq-v-a-4"],
    sort: 2,
  },

  // ─── V.B — Auditing the program ───
  {
    id: "cm-v-b-1",
    competencyId: "v-b",
    title: "Choose the form of monitoring, then the kind of audit",
    conceptMd:
      "The goal decides the form of monitoring. **Control self-assessments** let process owners check their own controls cheaply and often; **control testing** checks whether a specific control is well designed and actually operates; **continuous monitoring** uses automated checks, such as access-log alerts, where the risk demands near-real-time assurance; and an **audit** is a planned, evidence-based examination against defined criteria by someone independent of the work. Audits are classed by the auditor's relationship to the organization being audited: a **first-party audit** is the organization examining itself, usually through internal audit; a **second-party audit** is performed by a party with a stake in the organization, most often a customer examining its supplier or processor under a contractual audit right, whether with its own staff or through an auditor it hires; and a **third-party audit** is performed by a body independent of both, such as a certification body, an attestation firm or a regulator, even when the audited organization commissions it. **Vendor and subcontractor oversight** usually blends these: questionnaires, the vendor's independent reports (for example a **SOC 2 Type II** report or a certification), and a right to audit held in reserve for when the risk justifies it.",
    exampleMd:
      "**Brightwater Clinics**, a US outpatient group, uses all three in one year. Internal audit tests whether managers really review access to patient records each month (first-party). The privacy office, exercising the audit clause in its contract, sends an assessor to its medical-transcription vendor (second-party). And because hospital partners want assurance they can rely on without each auditing Brightwater themselves, it has an accredited certification body certify its privacy management system (third-party).",
    questionIds: ["cmq-v-b-1", "cmq-v-b-2"],
    sort: 1,
  },
  {
    id: "cm-v-b-2",
    competencyId: "v-b",
    title: "The audit life cycle, against a moving target",
    conceptMd:
      "A privacy audit moves through five phases. **Planning** fixes the objective, the scope and the **criteria** (the laws, policies and standards the audit tests against), usually chosen by risk; **preparation** notifies the business owners, requests documents and sample lists, and writes the test steps; **fieldwork** gathers evidence through interviews, observation, sampling and testing; **reporting** states rated findings, their root causes and the corrective actions management commits to, with owners and dates; and **follow-up** verifies that those actions were implemented and work before a finding is closed. The criteria age fastest: laws are amended, new ones take effect and standards publish new editions, so a **regulatory change monitoring** process should feed each audit cycle, mapping every new requirement to the control that meets it before planning starts. An audit that rigorously tests last year's requirements delivers confident but irrelevant assurance.",
    exampleMd:
      "**Lakemont Outfitters**, an online outdoor-gear retailer, learns that a US state where it has many customers has passed a consumer privacy law that takes effect next year and requires honoring browser opt-out signals. The compliance team maps the new duty to a control owned by the web team, and internal audit adds it to the criteria for the spring audit. Fieldwork finds the site ignores the signal; the report gives the web team a 60-day fix date, and follow-up testing in the summer confirms the signal now switches off targeted advertising before the finding is closed.",
    questionIds: ["cmq-v-b-3", "cmq-v-b-4"],
    sort: 2,
  },

  // ─── V.C — Continuous assessment ───
  {
    id: "cm-v-c-1",
    competencyId: "v-c",
    title: "Assess continuously: triggers, treatment and residual risk",
    conceptMd:
      "Risk assessment is not a launch-day event: systems, applications, processes and activities are assessed when they are designed and **reassessed whenever something changes the risk** (a new purpose, new data types, a new vendor or hosting location, new technology, an incident or a change in the law), with periodic reviews set by risk level as a backstop. Privacy risk is judged mainly by the **likelihood and severity of harm to individuals**, not only by the cost to the organization. Each risk is then treated: **mitigate** it with controls, **avoid** it by redesigning or dropping the activity, **transfer** part of it through contracts or insurance, or **accept** it. What remains after treatment is **residual risk**; accepting it is a decision for the accountable **business owner** of the activity (not the team that supplies the technology it runs on), within the organization's risk appetite and recorded in the risk register, while the privacy team and the DPO assess and advise rather than signing risk away on the business's behalf.",
    exampleMd:
      "**Pinecrest Logistics** assessed its driver-routing app at launch two years ago. When the product team proposes adding in-cab camera clips to detect driver fatigue, the change-request form flags 'new data type' and routes it to the privacy office, which reopens the assessment instead of waiting for the annual review. The redesigned feature keeps clips on the device unless a fatigue event fires, and the head of fleet operations, who owns the app, signs off the remaining risk in the register.",
    questionIds: ["cmq-v-c-1", "cmq-v-c-2"],
    sort: 1,
  },
  {
    id: "cm-v-c-2",
    competencyId: "v-c",
    title: "The assessment family: screen first, then go deep",
    conceptMd:
      "A **privacy threshold analysis (PTA)** is a short screening questionnaire, common in US federal agencies such as the Department of Homeland Security, that asks whether personal information is involved and whether a fuller assessment is needed. A **privacy impact assessment (PIA)** goes deep, analyzing how a system or project collects, uses, shares, retains and protects personal information, the risks to individuals and the controls that reduce them; it is good practice everywhere and required of US federal agencies by the E-Government Act of 2002 for new systems and collections of identifiable information. A **data protection impact assessment (DPIA)** is the GDPR's mandatory form: **Article 35** requires one before processing that is likely to result in **high risk**, such as profiling that drives significant decisions, large-scale processing of special-category data or large-scale systematic monitoring of publicly accessible areas, with the controller seeking the DPO's advice where one is designated; if a high risk remains after mitigation, **Article 36** requires **prior consultation** with the supervisory authority before processing starts. Two narrower assessments answer one question each: a **transfer impact assessment (TIA)** asks whether the destination country's law and practice would undermine a transfer tool such as standard contractual clauses, and a **legitimate interests assessment (LIA)** records the three-part test (legitimate purpose, necessity, balancing) behind reliance on legitimate interests. All of them are living documents, revisited when the processing or its risk changes.",
    exampleMd:
      "**Aurelia Talent**, a recruitment platform in Lisbon, runs every new feature through a ten-question PTA. A redesign of the job-search page that touches no new data clears the screen in minutes. A proposed score that profiles applicants to rank them for employers does not: it triggers a DPIA. Because the scoring engine's vendor supports it from a country without an EU adequacy decision under standard contractual clauses, a TIA joins the DPIA, and because the team wants to rely on legitimate interests for a related fraud check, the DPO asks for an LIA too: four assessments in all, routed from a single screen.",
    questionIds: ["cmq-v-c-3", "cmq-v-c-4"],
    sort: 2,
  },
  {
    id: "cm-v-c-3",
    competencyId: "v-c",
    title: "After the deal: integrate or separate without breaking promises",
    conceptMd:
      "Due diligence finds privacy risk before a deal closes; afterwards the work is to **mitigate that risk and keep stakeholders informed** while organizations are joined or split. In an acquisition or merger, inventory and map the acquired data, compare the **notices, consents and purposes** under which it was collected with what the new owner plans, and reassess combined systems with a PIA or DPIA where the risk warrants, because acquired data carries the **promises made at collection**: a materially different use of data already collected needs the individuals' agreement (or, under laws such as the GDPR, another valid legal basis) before it starts, and an updated notice alone does not provide one. Policies, retention schedules, vendor contracts and records of processing are then harmonized, and systems are connected only as fast as controls allow. In a **divestiture**, the seller separates the data that goes with the unit from the data that stays, transfers only what is in scope, revokes access, and puts any **transition services agreement (TSA)** under proper data processing terms. Communication runs both ways: internally to IT, security, HR, legal, employees and their representatives such as **works councils**, and externally to customers, vendors and, where a law requires it, regulators.",
    exampleMd:
      "When **Saltmarsh Telecom** in Ireland bought a smaller broadband provider, marketing wanted to email the acquired subscribers a TV-bundle offer in week one. The privacy manager first compared the target's notice and marketing consents with the plan and found the target had promised to use contact details only for service messages. The offer waited until subscribers had been told of the change and asked to opt in, and the target's billing system stayed separate until a DPIA cleared the migration.",
    questionIds: ["cmq-v-c-5", "cmq-v-c-6"],
    sort: 3,
  },
];
