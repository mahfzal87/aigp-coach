import type { Topic } from "@/lib/types";

// CIPM Domain II — Privacy Program: Establishing Program Governance.
// Authored against CIPM BoK v4.2.0. Original content; topic cards wired to questionsD2.
export const topicsD2: Topic[] = [
  // ─── II.A — Policies & processes ───
  {
    id: "cm-ii-a-1",
    competencyId: "ii-a",
    title: "A structure sized to the organization",
    conceptMd:
      "A privacy program needs an **organizational model** that fits the organization's size, complexity and risk: who leads privacy, who does the work, and **where the function reports**. The reporting line decides two things at once: **independence** (can the privacy lead raise an unwelcome risk without being overruled by the function that created it?) and **influence** (does the lead reach the executives who fund and decide?). A small business can name one accountable manager with part-time duties, buy in outside expertise and set a clear escalation route to the owner; a large multinational usually needs a **chief privacy officer**, regional or business-unit leads, a cross-functional **privacy steering committee** and a network of privacy champions. At any size, responsibilities and decision rights are **written down** in a program charter and role descriptions, so accountability survives turnover and reorganizations.",
    exampleMd:
      "Larkspur Dental, a 30-person clinic group, names its operations manager as privacy lead with four hours a week, keeps outside counsel on call and writes into its charter that unresolved privacy risks go straight to the managing partner. Halvorsen Freight, with 9,000 staff in 14 countries, has a CPO who reports to the general counsel with a standing slot at the board's audit committee, three regional privacy leads and a quarterly steering committee of operations, IT, HR and security heads. Neither structure would suit the other company, and both can show exactly who decides what.",
    questionIds: ["cmq-ii-a-1", "cmq-ii-a-2"],
    sort: 1,
  },
  {
    id: "cm-ii-a-2",
    competencyId: "ii-a",
    title: "Policy, standard, procedure, guideline",
    conceptMd:
      "A program's written rules form a **hierarchy**. A **policy** states management's mandatory intent and principles in durable terms and is approved at a senior level; a **standard** sets specific, mandatory requirements that make the policy measurable, such as a retention period or a required encryption method; a **procedure** gives the mandatory step-by-step method for a task; and a **guideline** offers recommended practice that people may adapt. Policies have to be **fitted to the data actually processed** (its categories, sensitivity, purposes and the jurisdictions involved) and to both **legal requirements** and **ethical limits**: some uses are lawful yet still out of bounds because people would not expect them or they would erode trust, so a policy may be stricter than the law. Keep the internal **privacy policy**, which tells staff what to do, separate from the external **privacy notice**, which tells individuals what the organization does with their data.",
    exampleMd:
      "Corvid Outdoor's customer-data policy says data is used only for purposes customers would reasonably expect, and never to infer sensitive traits without opt-in consent. A standard lists the sensitive traits and the required consent wording, a procedure walks marketers through the review before any new audience segment launches, and a guideline suggests ways to design shorter sign-up forms. When analysts propose a segment that predicts customers' health conditions from their purchases, the policy's ethical-limits clause stops it, even though the plan had already cleared legal review.",
    questionIds: ["cmq-ii-a-3", "cmq-ii-a-4"],
    sort: 2,
  },
  {
    id: "cm-ii-a-3",
    competencyId: "ii-a",
    title: "Collection points, rights requests and complaints",
    conceptMd:
      "Every place personal data enters the organization is a **collection point**: web and app forms, call centers, store counters, connected devices, and data received from brokers or partners. Each one is designed for **transparency**, with notice given **at or before collection** (layered and just-in-time notices help), and for **data quality**, because accuracy is cheapest to secure at capture: ask only for the fields the purpose needs, validate formats and mark optional fields clearly. Data obtained **indirectly** still triggers notice, including where it came from; under the GDPR, people must be told within a reasonable period and at the latest within one month, or at the first contact if the data is used to reach them. The same design thinking covers the channels people use to come back: a **rights request procedure** (log each request on receipt through whatever channel it arrives, verify identity in proportion to the request, search, respond within the legal clock, keep records) and a **complaint procedure** (log, triage, find the root cause, respond, escalate, and tell people how to take the matter to the regulator). Both need a named owner, and both feed the program's metrics.",
    exampleMd:
      "Marisol Telecom reviews its 23 collection points and finds that the in-store SIM registration tablet asks for date of birth 'for marketing' with no notice on screen. It puts a short notice on the tablet before the form, drops the marketing field from the required set and adds address validation to stop the typos that were sending bills to the wrong homes. The same review gives the online privacy request form a ticket number, an identity check scaled to what is requested, and a 21-day internal target that leaves room inside the one-month legal limit.",
    questionIds: ["cmq-ii-a-5", "cmq-ii-a-6"],
    sort: 3,
  },
  {
    id: "cm-ii-a-4",
    competencyId: "ii-a",
    title: "The breach plan and the retention schedule",
    conceptMd:
      "A **data breach management plan** is written before it is needed. It names the incident response team and its decision-makers, defines how incidents are classified and escalated, and assigns who assesses notification duties in each jurisdiction and contract, such as the GDPR's 72 hours to the supervisory authority or HIPAA's outer limit of 60 days for notifying individuals. Because those clocks run from awareness rather than from the end of the investigation, the plan lets notices go out in phases and requires **every breach to be recorded**, whether or not it is notified; it also holds templates, vendor contacts and a schedule of **tabletop exercises** and **post-incident reviews**. Its companion is the **retention and disposal policy**: a **retention schedule** lists each record category with its period, the legal or business reason and the **trigger event** that starts the clock. A **legal hold** suspends scheduled disposal only for the records relevant to actual or reasonably anticipated litigation, investigations or audits, until legal releases it, and **secure disposal** removes every copy, including backups, archives and vendor-held copies, by a method suited to the medium and with evidence that it happened. Data the organization no longer holds cannot be breached, which is why the two belong together.",
    exampleMd:
      "When a laptop holding 4,000 payroll records is stolen from a Brightwater Logistics manager's car, the plan's triage sheet tells the on-call lead to confirm whether the disk was encrypted, bring in HR and legal within the hour, and log the moment the company became aware, which starts the 72-hour clock for the regulator decision. The post-incident review finds that half the records belonged to people who left more than six years earlier, past the period in Brightwater's retention schedule, because disposal had never run on that spreadsheet export. The fix goes into the retention procedure, not only the laptop policy.",
    questionIds: ["cmq-ii-a-7", "cmq-ii-a-8"],
    sort: 4,
  },

  // ─── II.B — Roles & responsibilities ───
  {
    id: "cm-ii-b-1",
    competencyId: "ii-b",
    title: "Who owns what: accountability, the DPO and data sharing",
    conceptMd:
      "The privacy team rarely owns the data or the systems. It sets requirements, advises, monitors and escalates, while **business owners** stay accountable for how their processes use personal data. A **RACI** chart (Responsible, Accountable, Consulted, Informed) makes this explicit, with exactly **one Accountable** role per task. Where a **data protection officer** is appointed under the GDPR, the role must be **independent**: no instructions on how to carry out DPO tasks, no dismissal or penalty for doing them, a direct line to the highest management level, and no other duties that would have the DPO deciding the purposes and means of processing. **Privacy champions** in business units extend the team's reach without taking over anyone's accountability. **Sharing and disclosure** need an owner too: a defined process, usually run by privacy and legal together with the data owner, approves internal reuse beyond the original purpose and external disclosures to vendors, partners, regulators and law enforcement, and records each decision.",
    exampleMd:
      "At Pellucid Insurance, the claims director is Accountable for the claims system's data, IT is Responsible for its access controls and the privacy office is Consulted on changes. When the fraud team asks to reuse claims data to train a detection model with an outside firm, the request goes through the data sharing review: the claims director and the privacy office test it against the original purpose, legal checks the contract, and the decision is logged. When a police officer phones a claims handler asking for a claimant's address, the handler takes the details and passes the request to legal under the disclosure procedure instead of answering on the spot.",
    questionIds: ["cmq-ii-b-1", "cmq-ii-b-2"],
    sort: 1,
  },
  {
    id: "cm-ii-b-2",
    competencyId: "ii-b",
    title: "Breach response roles by function",
    conceptMd:
      "Breach response works only when each function knows its part before the incident. **Detection** can come from the security operations team, IT, any employee or a vendor, so everyone needs a simple way to **report** suspicions fast and a duty to do so. **IT and security** contain the incident, investigate and preserve evidence; **legal** (often with outside counsel) assesses notification duties and liability; **privacy** assesses the risk to individuals and coordinates notices; **communications** owns media and public statements; **HR** acts when employees are affected or involved; **customer service** prepares for calls; and **senior leadership** makes the high-severity decisions. Accountability also runs outward: a **processor** must alert its controller (under the GDPR, without undue delay), the **controller** decides on and makes notifications to **regulators** and individuals, and the **board** or another oversight body is briefed in proportion to severity. A single **incident lead** coordinates the whole response so no function acts alone.",
    exampleMd:
      "When Tamsin Health's billing vendor finds that a misconfigured database exposed patient statements, its contract requires it to tell Tamsin within 24 hours; it does not write to patients on its own. Tamsin's incident lead convenes security to confirm what was exposed, privacy and legal to make the HIPAA notification decision, communications to draft patient letters and a media statement, and customer service to staff a call line. The chief executive approves the final notice, and the audit committee chair is briefed the same day.",
    questionIds: ["cmq-ii-b-3", "cmq-ii-b-4"],
    sort: 2,
  },

  // ─── II.C — Metrics for oversight ───
  {
    id: "cm-ii-c-1",
    competencyId: "ii-c",
    title: "Metrics built for an audience",
    conceptMd:
      "An oversight metric exists to support a **decision by a named audience**, so it is designed backwards from that audience: the board needs a handful of trended risk indicators tied to program objectives, the privacy committee needs operational measures it can act on, and process owners need detail for their own areas. Each metric is documented with its **purpose** (the question it answers), its **value** (the decision or action it informs), its **owner** (who collects it and answers for it), its **data source**, its **frequency**, the **reporting channel** and the **threshold** that triggers escalation between reports. Activity counts such as notices published or courses delivered are easy to collect, but oversight needs measures that show whether controls work and whether risk is moving: high-risk projects assessed before launch, rights requests closed on time, findings past due. A metric with no owner and no decision attached is noise that hides the signal.",
    exampleMd:
      "Quillfeather Bank's privacy office sent the board 40 numbers each quarter and never got a question back. It rebuilt the pack: directors now see four indicators (high-risk projects assessed before launch, rights requests closed on time, audit findings past due, and notifiable incidents), each with a target, a trend line and a named executive owner. The detailed counts moved to the monthly committee pack, where the process owners who can act on them actually read them.",
    questionIds: ["cmq-ii-c-1", "cmq-ii-c-2"],
    sort: 1,
  },
  {
    id: "cm-ii-c-2",
    competencyId: "ii-c",
    title: "Audits that test controls, and tracking legal change",
    conceptMd:
      "An **audit** gives independent, evidence-based assurance that privacy controls are well designed and working as intended; its purposes include verifying compliance with laws, policies and contracts, finding gaps before a regulator does, and giving leadership and customers grounds for confidence. Audits are typed by who performs them: **first-party** (the organization audits itself, usually through internal audit), **second-party** (a party with a stake in the relationship audits the other, typically a customer auditing its supplier under contract) and **third-party** (an independent external body, such as a certification body auditing against ISO/IEC 27001). Each follows a life cycle: **plan** the scope and criteria based on risk, **prepare** documents, interviews and samples, carry out **fieldwork** to gather evidence, **report** findings with owners and deadlines, and **follow up** until remediation is verified. Alongside audits, the program runs continuous **monitoring of legal and regulatory change** in every jurisdiction where it operates: named owners watch new laws, regulator guidance and enforcement actions, assess whether each one applies, route required changes into policies, controls and training, and log each item to closure.",
    exampleMd:
      "Varga Pharma's internal audit team plans a risk-based audit of clinical-trial consent records, samples 60 participant files, finds eight missing re-consent after a protocol change, and rates the finding high with the trials director as owner and a 90-day deadline. The same month a hospital customer uses its contract right to audit how Varga handles the data it supplies, and the privacy team's regulatory tracker flags a new state health-data law that will require separate consent for a planned patient app. The tracker entry names product counsel as owner and stays open until the app's consent flow is changed.",
    questionIds: ["cmq-ii-c-3", "cmq-ii-c-4"],
    sort: 2,
  },

  // ─── II.D — Training & awareness ───
  {
    id: "cm-ii-d-1",
    competencyId: "ii-d",
    title: "Training versus awareness, targeted by audience",
    conceptMd:
      "**Training** builds the specific knowledge and skills people need to do their jobs in line with policy, such as how a call-center agent verifies a caller or how an engineer completes a privacy review, and it is usually **role-based, mandatory and tracked**. **Awareness** keeps privacy visible to everyone through lighter, recurring touches (intranet stories, posters, short videos, Data Privacy Day events on 28 January, reminders after incidents) and shapes culture rather than teaching procedure. Targeting matters: all staff need a baseline; high-risk functions such as HR, customer service, marketing, engineering and data science need deeper role training; **managers** need to know how to approve access, spot and escalate issues and model the behavior they expect; and **contractors and temporary staff** must be trained **before they receive access** to personal data, with the obligation written into their contracts. Training lands at the moments that matter: onboarding, before access, on a change of role and at regular refreshers.",
    exampleMd:
      "Saltmarsh Retail runs a 20-minute annual privacy module for all 12,000 staff, but its store managers also complete a scenario session on handling police requests and CCTV footage, and contact-center agents practice caller verification before taking live calls. Seasonal temps sign a confidentiality clause and complete a short module before they receive system logins. Between sessions, the privacy team posts a monthly 'privacy minute' on the intranet built from a real, anonymized near-miss.",
    questionIds: ["cmq-ii-d-1", "cmq-ii-d-2"],
    sort: 1,
  },
  {
    id: "cm-ii-d-2",
    competencyId: "ii-d",
    title: "Keeping training current and proving it worked",
    conceptMd:
      "Training decays unless it is **maintained**: content is reviewed on a schedule and also on **triggers** such as a new law or regulator guidance, a new system or product, a policy change, an audit finding or the lessons of an incident, and the response is aimed at the people and tasks the trigger affects, often combining updated content with prompts at the point of risk and follow-through by managers. Effectiveness should be measured at more than one level, and the **Kirkpatrick model** is a common lens: **reaction** (did people find it relevant?), **learning** (can they show the knowledge, for example in a test?), **behavior** (do they act differently on the job?) and **results** (did incidents or risk go down?). **Completion rates** prove that people sat the course; they say nothing about whether anyone's behavior changed. Strong programs pair completion data with behavioral evidence, such as phishing-simulation click rates, misdirected-email incidents, the quality of privacy reviews and how quickly staff report suspected incidents, and feed what they learn into the next version of the content.",
    exampleMd:
      "Brindle Mutual's claims team kept emailing medical reports to the wrong recipients despite 100% training completion. The privacy team rebuilt the module around the actual errors, added a recipient-check exercise and began tracking misdirected emails per 1,000 claims; six months later the rate had halved, a results-level measure the board found far more persuasive than the completion figure it used to see. The module is now also flagged for review whenever the claims system changes.",
    questionIds: ["cmq-ii-d-3", "cmq-ii-d-4"],
    sort: 2,
  },
];
