import type { Topic } from "@/lib/types";

// CIPM Domain IV — Privacy Program Operational Life Cycle: Protecting Personal Data.
// Authored against BoK v4.2.0. Original content; topic cards wired to questionsD4.
export const topicsD4: Topic[] = [
  // ─── IV.A — Information security practices ───
  {
    id: "cm-iv-a-1",
    competencyId: "iv-a",
    title: "Data classification: levels, owners and handling rules",
    conceptMd:
      "A **data classification scheme** sorts information into a few levels according to the **harm its unauthorized disclosure, alteration or loss would cause**, and attaches **handling rules** to each level: who may access it, whether it must be encrypted, where it may be stored or sent, how long it is kept and how it is destroyed. A common four-tier ladder runs **public** (approved for release), **internal** (routine business information), **confidential** (damaging if disclosed, shared only with those who need it) and **restricted** (the most sensitive, such as health records, government identifiers or payment card numbers, under the tightest controls); labels vary between organizations, but every scheme needs clear definitions and examples so that people apply it the same way. The **data owner**, the business leader accountable for the information, assigns the classification; the **data custodian** (usually IT) implements the controls that level requires; and the privacy team makes sure the criteria weigh **harm to the individuals described**, not only the organization's commercial loss. A label is not permanent: **joining or enriching datasets** can create sensitivity that none of the sources had, so classification must be revisited whenever data is combined, repurposed or moved.",
    exampleMd:
      "At Velloway Mutual, a regional insurer, the claims director owns the claims database and classifies it **restricted** because it holds medical details; IT then enforces the restricted rules (encryption at rest, access only for named claims roles, no export to personal devices). An analyst later joins the 'internal' appointment log (customer ID, desk, time) to the 'confidential' customer list, and the result names the customers who visit the disability-claims desk. Neither source revealed health information about a named person, but the join does, so the privacy lead flags it and the claims director, as owner, classifies the joined table restricted rather than letting it inherit 'confidential'.",
    questionIds: ["cmq-iv-a-1", "cmq-iv-a-2"],
    sort: 1,
  },
  {
    id: "cm-iv-a-2",
    competencyId: "iv-a",
    title: "What controls can and cannot do, and where privacy and security part ways",
    conceptMd:
      "Controls are sorted two ways. By **function**: **preventive** controls stop an event from happening (access restrictions, encryption, blocking rules), **detective** controls reveal an event during or after it (logging, alerts, audits, access reviews), and **corrective** controls limit the damage and restore normal operation (restoring from backup, revoking compromised credentials, patching, the incident response plan); ISO/IEC 27002:2022 tags each of its controls with one or more of these types, but it tags whole controls (its 5.18 Access rights control is tagged preventive), so classify an activity by what it does in the scenario: a periodic review that finds access already granted works as a detective check. By **type**: **administrative** (policies, procedures, training, background checks), **technical** or logical (authentication, encryption, firewalls, data loss prevention) and **physical** (locks, badges, guards, shredders). Each has limits: a policy works only if people follow it, a technical control can be misconfigured or misused by an authorized insider, and a detective control tells you something went wrong without stopping it, which is why no single control is enough. **Privacy and security overlap** in protecting personal data against unauthorized access, alteration and loss, but they **diverge** elsewhere: data can be perfectly secured and still be collected without notice or used for a purpose people never expected, and security tools such as employee monitoring or long log retention can themselves create privacy risk.",
    exampleMd:
      "At Tessaro Clinics, an outpatient chain, encryption on staff laptops is a technical preventive control, the alert that fires when one account opens 400 patient charts in an hour is a technical detective control, and the playbook that suspends the account and notifies affected patients is corrective. The same month, the CISO proposes recording every keystroke on reception desktops to catch snooping. The privacy officer agrees the goal protects patients but points out that the tool would itself collect far more staff data than the risk requires, and asks for narrower options, starting with the chart-access alert already in place, before anything is deployed.",
    questionIds: ["cmq-iv-a-3", "cmq-iv-a-4"],
    sort: 2,
  },
  {
    id: "cm-iv-a-3",
    competencyId: "iv-a",
    title: "Access control and layered measures",
    conceptMd:
      "Access control is where much privacy risk is won or lost. **Least privilege** gives each user or system only the permissions the job needs (read rather than edit, one region rather than all), while **need to know** limits access to the specific information a task requires, even among people who hold the same role. **Role-based access control (RBAC)** attaches permissions to roles rather than to individuals, which keeps access consistent and reviewable, and **segregation of duties** splits sensitive processes so that no one person can complete them alone, such as requesting and approving a bulk export. **Multi-factor authentication (MFA)** requires factors from at least two different categories (something you know, something you have, something you are), so a password plus a security question is still single-factor. People change jobs, so **periodic access reviews** by managers or data owners and a **joiner-mover-leaver** process are needed to catch **privilege creep**; and because every control can fail, risk is reduced by **layering technical, administrative and organizational measures** chosen for the specific risks identified (the GDPR's Article 32 frames this as appropriate technical and organizational measures matched to the risk), never by trusting one control alone.",
    exampleMd:
      "At Coralline Telecom in Australia, call-center agents hold a 'tier-1 support' role that can view, but not export, the account of the customer on the line. Exports need a second person's approval, and remote logins need a password plus an authenticator app. When internal audit sampled staff who had moved from billing to marketing, it found three who still held billing access eight months later: the role design was sound, but the mover step had failed. Coralline added quarterly recertification by department heads and automatic removal of the old role at every transfer.",
    questionIds: ["cmq-iv-a-5", "cmq-iv-a-6"],
    sort: 3,
  },

  // ─── IV.B — Privacy by Design ───
  {
    id: "cm-iv-b-1",
    competencyId: "iv-b",
    title: "The seven foundational principles and the purpose behind each",
    conceptMd:
      "**Privacy by Design (PbD)** was developed by **Ann Cavoukian**, the former Information and Privacy Commissioner of Ontario, and in **2010** the International Conference of Data Protection and Privacy Commissioners (now the Global Privacy Assembly) adopted a resolution recognizing it as an essential component of fundamental privacy protection. Its **seven foundational principles** each answer a particular failure: (1) **proactive not reactive; preventative not remedial**, anticipating and preventing privacy harms rather than cleaning up after them; (2) **privacy as the default setting**, so that people are protected automatically without having to do anything; (3) **privacy embedded into design**, making privacy part of the architecture and core functionality rather than a bolt-on; (4) **full functionality, positive-sum not zero-sum**, rejecting false trade-offs such as 'privacy versus security' and delivering both; (5) **end-to-end security, full lifecycle protection**, securing data from collection through to secure destruction; (6) **visibility and transparency**, so that practices can be verified by users and independent reviewers against what was promised; and (7) **respect for user privacy**, keeping the individual's interests central through strong defaults, clear notice and user-friendly choices. Read each principle as a purpose, not a slogan: exam scenarios describe a design choice or a failure and ask which purpose it serves or defeats.",
    exampleMd:
      "Pinemoor Learning, a Canadian education-technology startup, designs a homework app for children. Student profiles are private unless a parent changes them (default), age-based data limits are built into the database schema rather than patched in later (embedded), and every account is deleted a year after a school's license ends (lifecycle). When sales argues that schools want teacher analytics 'at the expense of privacy', the product lead ships class-level dashboards that give teachers what they need without exposing any child's browsing history: positive-sum, not a trade-off.",
    questionIds: ["cmq-iv-b-1", "cmq-iv-b-2"],
    sort: 1,
  },
  {
    id: "cm-iv-b-2",
    competencyId: "iv-b",
    title: "PbD in the development life cycle, in business processes and in Article 25",
    conceptMd:
      "PbD only becomes real when it is wired into how systems and processes are built. In the **system development life cycle (SDLC)**, privacy enters at **initiation and requirements**, where a **privacy threshold assessment** decides whether a full PIA or DPIA is needed and privacy requirements (minimization, retention, consent capture, access) are written alongside functional ones; it continues through **design reviews** of architecture and data flows, is verified in **testing** (with synthetic or masked data instead of live personal data, checking that defaults, deletion jobs and access rules really work), and is enforced at a **release gate** that holds launch until privacy sign-off. Agile teams express the same checkpoints as privacy acceptance criteria and a definition of done, and **business processes** need the same treatment, because many privacy failures involve no new software at all: a marketing campaign, an HR onboarding form, a procurement decision. **GDPR Article 25** is the legal expression: as the text stands in 2026, the **controller** must implement appropriate technical and organizational measures that put the data protection principles into effect, **both when it determines the means of processing and during the processing itself** (by design), and must ensure that **by default** only the personal data necessary for each specific purpose is processed, a duty covering the **amount collected, the extent of processing, the storage period and accessibility**, so that data is not made accessible to an indefinite number of people without the individual's intervention. (The Council's October 2026 Digital Omnibus mandate would extend Article 25 to processors for their own obligations; it is still being negotiated with Parliament and would not change the controller's accountability.)",
    exampleMd:
      "Fallowmere Energy, a Danish utility rolling out smart meters, runs a threshold assessment when the project is approved; it flags half-hourly readings as revealing household routines, so a DPIA is scheduled and 'store daily totals unless the customer opts in to half-hourly data' becomes a written requirement. The design review checks data flows against it, testers use synthetic readings, and the release gate holds launch until the privacy office signs off. Two years later, when better aggregation techniques become available, Fallowmere revisits its measures, because Article 25 applies during the processing too, not only at design time.",
    questionIds: ["cmq-iv-b-3", "cmq-iv-b-4"],
    sort: 2,
  },

  // ─── IV.C — Data-use guidelines & enforced controls ───
  {
    id: "cm-iv-c-1",
    competencyId: "iv-c",
    title: "Secondary use: purpose compatibility, consent scope and notice",
    conceptMd:
      "A **secondary use** is any use of personal data for a purpose other than the one it was collected for, and data-use guidelines exist so that each one is checked before it starts rather than discovered afterwards. **Purpose compatibility** comes first: under the GDPR's purpose-limitation principle a new purpose must not be incompatible with the original, judged by the **Article 6(4)** factors (the link between the purposes, the context of collection and people's reasonable expectations, the nature of the data, the possible consequences, and safeguards such as encryption or pseudonymization), while further processing for archiving in the public interest, scientific or historical research or statistics is not treated as incompatible when proper safeguards apply. **Consent scope** is the second test, because consent covers only the purposes people actually agreed to, so a new purpose needs fresh consent or another lawful basis that genuinely fits. **Notice** is the third: even a compatible new purpose must be explained to individuals **before** the further processing begins (GDPR Articles 13(3) and 14(4)), much as the US FTC expects affirmative express consent before a company uses data it already holds in a materially different way than it promised at collection. A privacy manager verifies that the guidelines are followed by running a **data-use review** at intake, then checking afterwards, through audits, access logs and data-sharing records, that approved uses stayed inside their limits.",
    exampleMd:
      "Marigold Appliances recorded support calls 'to resolve issues and train our agents'. Its sales team now wants to mine the recordings for upsell scores. The data-use review asks how closely selling links to support (weakly), whether callers would expect it (unlikely, given the notice), how sensitive the recordings are (voices plus account details) and what could follow (pressure sales). It finds the use incompatible, so sales would need a fresh lawful basis, realistically opt-in consent, and an updated notice before any recording is touched.",
    questionIds: ["cmq-iv-c-1", "cmq-iv-c-2"],
    sort: 1,
  },
  {
    id: "cm-iv-c-2",
    competencyId: "iv-c",
    title: "Verifying that safeguards work in practice",
    conceptMd:
      "Policies, procedures and contracts describe safeguards; only evidence shows that they operate. Auditors separate **design effectiveness** (would this control, as written, address the risk?) from **operating effectiveness** (did it actually work, consistently, over a period?), and a privacy manager verifying safeguards needs the second, which inside the organization means **testing samples against records**: leavers whose accounts were disabled on time, deletion jobs that really ran, data-use approvals that match what was actually shared. For vendors, a signed data processing agreement proves only that the promises exist, so verification comes from **independent assurance** read carefully, such as a **SOC 2 Type II** report, which tests controls over a period of months, rather than a **Type I**, which assesses their design as of a single date, or an ISO/IEC 27001 certificate **checked against its scope**, plus **audit rights** that are actually used and evidence at key moments, such as a **certificate of deletion** when a contract ends. Access controls and classification labels need the same scrutiny: a discovery scan that finds customer files on a share labeled 'public', or an access review in which every entitlement is approved with one click, shows a control that exists on paper but is not effective.",
    exampleMd:
      "Briarwood Research, a market-research firm, requires its transcription vendor to delete focus-group audio within 30 days. Rather than taking the clause on trust, the privacy office asks for the vendor's SOC 2 Type II report, confirms that its period and scope cover the transcription platform, and samples ten completed jobs to check that the logs show deletion within 30 days. Two of the ten had been kept for 90 days in a backup tier the contract never mentioned, a finding that no amount of reading the contract would have produced.",
    questionIds: ["cmq-iv-c-3", "cmq-iv-c-4"],
    sort: 2,
  },
  {
    id: "cm-iv-c-3",
    competencyId: "iv-c",
    title: "Privacy-enhancing technologies: what each does and does not achieve",
    conceptMd:
      "Privacy technologists bring the toolkit; the privacy manager's job is to state the problem precisely (who must not learn what, from which data), to know what each tool can and cannot promise, and to start with plain **minimization**: fewer fields, generalized values such as age bands, deletion on schedule. **Pseudonymization** replaces identifiers with codes and keeps the means of re-identification separately; it reduces risk, but for an organization holding the key the data **remains personal data**, whereas **anonymized** data, from which no one can reasonably re-identify anyone by singling out, linkage or inference, falls outside laws such as the GDPR, a bar that removing names rarely clears. **Tokenization** swaps a sensitive value such as a card number for a surrogate (in the classic vault-based design, one with no mathematical link to the original), keeping the original in a secured vault; **masking** hides all or part of a value, either in a copy (static, for test data) or on screen at query time (dynamic, leaving the stored data intact); and **aggregation** releases group statistics instead of records, though small groups and repeated releases can still expose individuals. **Differential privacy** adds calibrated noise so that any one person's presence barely changes a result, governed by a privacy-loss parameter (**epsilon**: smaller means stronger privacy and less accuracy) and a budget that every query spends; **encryption** protects data at rest and in transit but normally must be decrypted for use; **homomorphic encryption** lets a party compute on data it cannot read; and **secure multi-party computation (SMPC)** lets several parties compute a joint result without revealing their inputs to one another. PETs count as one factor in a compatibility assessment (GDPR Article 6(4)(e)), not a substitute for it: strong safeguards can tip a borderline further use toward compatibility but cannot rescue one that the other factors rule out, and each PET trades some utility, cost or complexity for the protection it buys.",
    exampleMd:
      "Cobalt Ridge Transit plans a self-service dashboard that lets anyone count riders by stop, hour and fare type. Its privacy engineer warns that suppressing small cells will not be enough, because a user who asks enough overlapping questions can subtract one answer from another and isolate a single rider; she proposes differential privacy, with a privacy budget that caps the total privacy loss across every question the dashboard answers. Separately, Cobalt Ridge and four other transit agencies want an average-salary benchmark for their drivers without any agency revealing its own payroll, which is a job for secure multi-party computation.",
    questionIds: ["cmq-iv-c-5", "cmq-iv-c-6"],
    sort: 3,
  },
];
