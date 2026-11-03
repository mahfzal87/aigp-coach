import type { Topic } from "@/lib/types";

// CIPP/E Domain II topics — authored against BoK v1.3.3 (II.A basic concepts,
// II.B security of personal data, II.C data subjects' rights). 100% original text.
export const topicsD2: Topic[] = [
  // ─── II.A — Basic GDPR concepts ───
  {
    id: "ce-ii-a-1",
    competencyId: "ii-a",
    title: "Personal data and the data subject",
    conceptMd:
      "**Personal data** is any information relating to an identified or **identifiable** natural person — the **data subject** — and identifiability is judged broadly: no name is needed, because identifiers like customer numbers, location data, cookie IDs and device identifiers can **single out** one person. The data subject is always a living natural person; companies as such sit outside the GDPR. Every processing operation must also respect the core principles — lawfulness, fairness and transparency, **purpose limitation**, **data minimisation**, accuracy, storage limitation, integrity and confidentiality — plus **accountability**: the controller must comply AND be able to demonstrate compliance.",
    exampleMd:
      "An ad-tech platform insists it holds \"no personal data\" because its systems store only mobile advertising IDs and precise location pings, never names. Each ID singles out one phone — and so one person — whose movements can be followed for months, so the records are personal data and the GDPR applies in full. When the same firm later reuses delivery addresses collected for shipping to build political-interest profiles, the problem is not minimisation but purpose limitation: a new, incompatible use of lawfully collected data.",
    questionIds: ["ceq-ii-a-6", "ceq-ii-a-5"],
    sort: 1,
  },
  {
    id: "ce-ii-a-2",
    competencyId: "ii-a",
    title: "Special categories of data",
    conceptMd:
      "**Article 9** lists the **special categories**: data revealing racial or ethnic origin, political opinions, religious or philosophical beliefs, or **trade union membership**, plus **genetic data**, **biometric data** processed to uniquely identify a person, **health data**, and data concerning sex life or sexual orientation. Processing them is prohibited unless a specific condition — such as **explicit consent** — applies on top of an ordinary lawful basis. Data about **criminal convictions and offences** is tightly controlled too, but under its own separate regime, not the Article 9 list. Watch for mundane inputs that merely **reveal** a special category: they trigger Article 9 all the same.",
    exampleMd:
      "A supermarket loyalty programme tags shoppers who regularly buy halal products and prayer mats as a \"faith-affinity\" marketing segment. Nobody ever declared a religion, but the segment is data revealing religious beliefs, so the chain needs an Article 9 condition before building it — ordinary grocery receipts just became special-category data.",
    questionIds: ["ceq-ii-a-2"],
    sort: 2,
  },
  {
    id: "ce-ii-a-3",
    competencyId: "ii-a",
    title: "Pseudonymous vs anonymous",
    conceptMd:
      "**Pseudonymization** replaces direct identifiers with codes or tokens while some means of linking back — a key, a lookup table, or the original source data — still exists. Pseudonymized data **is personal data**: the GDPR applies in full, and the technique counts only as a risk-reducing **security measure**. Data is **anonymous** — and outside the GDPR — only when no party can re-identify anyone using **means reasonably likely to be used**. Who holds the key is irrelevant; what matters is whether re-identification or singling out remains reasonably possible at all.",
    exampleMd:
      "A hospital research unit swaps patient names for codes and locks the code key in a separate, access-controlled vault. The researchers themselves cannot re-identify anyone, but the key exists, so the dataset is pseudonymized personal data and every GDPR duty still attaches. Had the unit instead published only aggregate statistics from which no individual could be singled out by any reasonably likely means, that output would be anonymous.",
    questionIds: ["ceq-ii-a-1"],
    sort: 3,
  },
  {
    id: "ce-ii-a-4",
    competencyId: "ii-a",
    title: "Controllers, processors and the chain",
    conceptMd:
      "The **controller** determines the **purposes and means** of processing; the **processor** processes personal data on the controller's documented instructions. Roles follow the facts, not the contract label — a vendor that starts using the data for its **own purposes** becomes a controller for that use. Under **EDPB Opinion 22/2024**, the controller must be able to **identify every processor and sub-processor in the chain** and verify that sufficient guarantees flow all the way down it; it may build on information its direct processor supplies, but the **responsibility stays with the controller** however long the chain grows.",
    exampleMd:
      "A Dutch retailer runs its help desk on a SaaS platform whose contract names the vendor a processor. The vendor quietly mines every client's tickets to train its own sales-forecasting product — for that self-serving use it has become a controller, whatever the contract says. Meanwhile the retailer must still be able to name the hosting, logging and analytics sub-processors stacked beneath the platform, and to show it verified guarantees down that chain rather than just trusting the first link.",
    questionIds: ["ceq-ii-a-3", "ceq-ii-a-4"],
    sort: 4,
  },

  // ─── II.B — Security of personal data ───
  {
    id: "ce-ii-b-1",
    competencyId: "ii-b",
    title: "Security of processing: appropriate measures",
    conceptMd:
      "Article 32 demands technical and organisational measures **appropriate to the risk** — not maximum security everywhere. Appropriateness weighs the **state of the art**, the **costs of implementation**, the nature, scope, context and purposes of processing, and the **likelihood and severity** of risk to individuals. The article names candidate measures rather than a fixed checklist: **pseudonymization and encryption**; ensuring **confidentiality, integrity, availability and resilience** of systems; the ability to **restore availability and access** in a timely manner after an incident; and a process for **regularly testing, assessing and evaluating** the measures' effectiveness.",
    exampleMd:
      "A nine-person telehealth start-up argues it is too small for \"bank-grade\" security. Size shapes the cost factor, but its core data — patient consultations — drives the risk high, so encryption, tested restore procedures and strict access controls are appropriate for that system. For its separate newsletter list of first names and email addresses, far lighter measures genuinely suffice: same company, two risk levels, two security postures.",
    questionIds: ["ceq-ii-b-1", "ceq-ii-b-2"],
    sort: 1,
  },
  {
    id: "ce-ii-b-2",
    competencyId: "ii-b",
    title: "Notifying the supervisory authority",
    conceptMd:
      "A **personal data breach** is a breach of security leading to the destruction, **loss**, alteration, unauthorised disclosure of, or access to personal data — losing access counts even when nothing leaks. The controller notifies the **supervisory authority** **without undue delay and, where feasible, within 72 hours** of becoming aware, **unless** the breach is **unlikely to result in a risk** to individuals; a later notification must give **reasons for the delay**, and details may follow **in phases**. A **processor** that detects a breach informs the **controller** without undue delay — it never files with the authority itself. And every breach, notified or not, must be **documented** (facts, effects, remedial action) so the authority can verify the judgment calls.",
    exampleMd:
      "Ransomware locks a payroll bureau's systems on a Friday night; nothing is exfiltrated, but employee data is unreachable for days — still a breach. The bureau, a processor, alerts its client companies that night. Each client controller assesses the risk, notifies its authority within 72 hours of learning of the incident with what it knows so far, supplements the filing as forensics progress, and records the whole episode in its breach register.",
    questionIds: ["ceq-ii-b-3", "ceq-ii-b-4"],
    sort: 2,
  },
  {
    id: "ce-ii-b-3",
    competencyId: "ii-b",
    title: "Telling the people affected",
    conceptMd:
      "Affected individuals are told **without undue delay** only when the breach is likely to result in a **high risk** to their rights and freedoms — a stricter trigger than the authority's, and one with **no 72-hour clock** attached. The message must use **clear and plain language** and describe the likely consequences and the measures taken or proposed. Communication is not required where protections such as **effective encryption** rendered the data unintelligible, where subsequent measures removed the high risk, or where direct contact would take **disproportionate effort** — then a **public communication** must inform people equally effectively. The supervisory authority can compel communication if it disagrees with the controller's assessment.",
    exampleMd:
      "A courier bag stolen from a contractor holds two backup drives: one encrypted under a current-generation algorithm with keys stored elsewhere, one unencrypted with customers' bank details. For the encrypted drive, no customer communication is needed. For the unencrypted drive the risk is high, so the firm emails every reachable customer promptly — and publishes a prominent notice to cover the records whose contact details were corrupted.",
    questionIds: ["ceq-ii-b-6", "ceq-ii-b-9"],
    sort: 3,
  },
  {
    id: "ce-ii-b-4",
    competencyId: "ii-b",
    title: "The processor contract",
    conceptMd:
      "A controller may engage only processors offering **sufficient guarantees** — judged before the engagement on expert knowledge, reliability, resources and security posture, with certifications and codes of conduct serving as **supporting evidence, not conclusive proof**. **Article 28** then requires a binding contract recording the subject matter, duration, nature and purpose of processing and the data and subjects concerned, and obliging the processor to: process only on **documented instructions**, bind authorised persons to **confidentiality**, secure the processing, follow the **sub-processor authorization** rules, **assist the controller** with data subject rights and with security and breach duties, **delete or return** the data at the end, and make available information and allow **audits**. Commercial extras such as indemnities are negotiable; the listed contents are not optional.",
    exampleMd:
      "A French e-commerce firm shortlists two email-delivery vendors. One sends a certification badge and a one-page order form. The other evidences its security programme, staff vetting and sub-processor register, and signs a contract containing every required clause — instructions, confidentiality, assistance, end-of-contract deletion, audit rights. Only the second gives the firm both sufficient guarantees and a compliant contract; the badge alone gave neither.",
    questionIds: ["ceq-ii-b-7"],
    sort: 4,
  },
  {
    id: "ce-ii-b-5",
    competencyId: "ii-b",
    title: "Sub-processors and the processor's duties",
    conceptMd:
      "A processor may engage a **sub-processor** only with the controller's **prior written authorization** — **specific** (each engagement approved individually) or **general**, in which case the processor must still **inform the controller of intended additions or replacements** and give it a real chance to **object**. The **same data protection obligations** must flow down into the sub-processor's contract, and the initial processor remains **fully liable to the controller** when a sub-processor fails to perform. Alongside the chain rules sit the processor's own statutory duties, including notifying the controller of any breach **without undue delay**.",
    exampleMd:
      "Operating under a general authorization, a hosting processor writes to its clients: \"We intend to replace our backup sub-processor in 30 days — object by the 20th.\" One client objects and agrees an alternative arrangement. Months later the new sub-processor misconfigures a storage bucket; the initial processor answers to the controller for the failure in full — it cannot deflect liability down the chain it chose to build.",
    questionIds: ["ceq-ii-b-8", "ceq-ii-b-5"],
    sort: 5,
  },
  {
    id: "ce-ii-b-6",
    competencyId: "ii-b",
    title: "Sharing with third parties",
    conceptMd:
      "Disclosing personal data to another organisation is itself a **processing operation** that needs its own **lawful basis** — lawful collection yesterday does not authorise a new disclosure today. Classify the recipient first: a **processor** acts on your instructions under an Article 28 contract, while a recipient that uses the data for **its own purposes** is a separate **controller**, whatever label the paperwork uses. Controller-to-controller sharing must also honour **transparency** — recipients and purposes visible in privacy notices — and **purpose limitation**, with the shared set trimmed to what the purpose needs.",
    exampleMd:
      "A broadband provider uses a courier network to deliver routers under an Article 28 contract — processor territory. It separately sells its subscriber list to an insurance firm that will run its own campaigns with it: that recipient decides its own purposes, so it is a controller, and the sale needs its own lawful basis and must have been visible in the provider's privacy notice. Calling the insurer a \"processor\" in the sale agreement changes none of this.",
    questionIds: ["ceq-ii-b-10"],
    sort: 6,
  },

  // ─── II.C — Data subjects' rights ───
  {
    id: "ce-ii-c-1",
    competencyId: "ii-c",
    title: "The right of access",
    conceptMd:
      "A data subject may obtain **confirmation** that processing is happening, a **copy** of their personal data, and supplementary information such as purposes, recipients and retention periods. The controller responds **within one month**, extendable by **two further months** for complex or numerous requests if the person is told within the first month; the **first copy is free**. Where the controller has **reasonable doubts** about who is asking, it may request additional identity verification, and the copy must **not adversely affect the rights of others** — which supports targeted redaction, never blanket refusal. **Manifestly unfounded or excessive** requests may be charged or refused, with the burden of demonstrating that squarely on the controller.",
    exampleMd:
      "A former employee requests every email that mentions her. HR verifies her identity, invokes the extension for the 40,000-message trawl and tells her so within the first month, then delivers her personal data with colleagues' private details redacted — rather than refusing outright because third parties appear in the threads. When she sends the same request again a week later, and again the week after, the firm may refuse the repeats as manifestly excessive, explaining why and pointing her to the supervisory authority and the courts.",
    questionIds: ["ceq-ii-c-1", "ceq-ii-c-2"],
    sort: 1,
  },
  {
    id: "ce-ii-c-2",
    competencyId: "ii-c",
    title: "Rectification and erasure",
    conceptMd:
      "**Rectification** lets a person have inaccurate data corrected and incomplete data completed. **Erasure** applies on listed grounds — data **no longer necessary**, consent withdrawn with no other basis, a successful objection, unlawful processing, a legal obligation to erase, or data collected from a child for online services — but yields to exceptions including **freedom of expression and information**, compliance with a **legal obligation**, public health, **archiving and research**, and **legal claims**. In **Google Spain**, the CJEU held that a search engine is a **controller** which must, on request, **delist** results returned against a person's name where the information is inadequate, irrelevant or excessive — while the source page may lawfully remain online, and the delisting obligation under EU law is **EU-scope**, not worldwide.",
    exampleMd:
      "A rehabilitated man asks a newspaper and a search engine to remove a decade-old court report. The newspaper may keep its lawful archive — freedom of expression and information — yet the search engine must stop returning that article against searches for his name on its EU versions. Same article, two different outcomes, by design.",
    questionIds: ["ceq-ii-c-4", "ceq-ii-c-5"],
    sort: 2,
  },
  {
    id: "ce-ii-c-3",
    competencyId: "ii-c",
    title: "Restriction and objection",
    conceptMd:
      "**Restriction** freezes data instead of destroying it: the controller may **store** the data but not otherwise process it except with consent, for **legal claims**, to protect another person, or for important public interest — the natural state while accuracy or an objection is being verified. **Objection** comes in two strengths. For **direct marketing** it is **absolute**: processing for that purpose stops, no balancing test, and the stop covers **profiling to the extent it relates to the marketing**. For other processing based on legitimate interests or a public task, the controller may continue only by demonstrating **compelling legitimate grounds** that override the person's interests, rights and freedoms — or for legal claims.",
    exampleMd:
      "A subscriber clicks \"stop marketing me\" and separately disputes the accuracy of her credit-risk profile. The marketing — including the propensity scores feeding it — must simply stop; there is nothing to weigh. The risk profile follows a different track: processing is restricted while the firm verifies the data, and may resume against her objection only if the firm demonstrates compelling grounds that override her position.",
    questionIds: ["ceq-ii-c-6"],
    sort: 3,
  },
  {
    id: "ce-ii-c-4",
    competencyId: "ii-c",
    title: "Consent and withdrawal",
    conceptMd:
      "Valid consent is **freely given, specific, informed and unambiguous**, expressed through a clear affirmative act. It is presumed **not freely given** where a service is made **conditional** on consent to processing the service does not actually need, or where a clear **power imbalance** exists — the employment relationship being the classic case. The person may withdraw **at any time**, withdrawal must be **as easy as giving consent was**, and it operates **prospectively**: processing performed before withdrawal remains lawful. Design the exit before relying on the entrance.",
    exampleMd:
      "A flashlight app refuses to run unless the user consents to sharing location history with advertising partners. That consent is presumed not free — the sharing is unnecessary for a flashlight. A user who consented anyway and withdraws a year later stops all future sharing with one tap, exactly as easily as she opted in; the year of processing already performed, however, does not become retroactively unlawful.",
    questionIds: ["ceq-ii-c-7"],
    sort: 4,
  },
  {
    id: "ce-ii-c-5",
    competencyId: "ii-c",
    title: "Automated decisions: Article 22",
    conceptMd:
      "Article 22 gives people the right **not to be subject to** a decision based **solely on automated processing** that produces **legal effects** or **similarly significantly affects** them. Exactly three exceptions exist: necessity for **entering into or performing a contract**, authorization by **Union or member state law**, and the person's **explicit consent** — ordinary consent and legitimate interests are not on the list. Even inside an exception, the controller must safeguard at minimum the right to obtain **human intervention**, to **express one's point of view** and to **contest** the decision. And the human involvement that takes a decision outside Article 22 must be **meaningful**: someone with the authority, competence and information to actually change the outcome, not a click-through confirmer.",
    exampleMd:
      "A lender's engine declines applications instantly, and a staffer \"confirms\" 300 declines a day with no access to the file and no power to deviate — still a solely automated decision with significant effect. Run under the contract-necessity exception it can be lawful, but each declined applicant must be able to reach a reviewer who can genuinely reopen the case, put her side of the story, and challenge the result.",
    questionIds: ["ceq-ii-c-8", "ceq-ii-c-9"],
    sort: 5,
  },
  {
    id: "ce-ii-c-6",
    competencyId: "ii-c",
    title: "Portability and the limits on rights",
    conceptMd:
      "**Portability** has three gates: the processing rests on **consent or contract**, it is carried out by **automated means**, and the data was **provided by** the data subject — which covers both what they volunteered and what was **observed** from their use, but not what the controller **derived or inferred**, such as scores. Qualifying data goes out in a **structured, commonly used and machine-readable** format, with direct controller-to-controller transmission **where technically feasible**; porting does not itself trigger erasure or stop the original processing. Separately, **Article 23** lets **Union or member state law** — never a controller's own judgment — restrict the data subject rights for objectives like national security, defence, public security and the prevention of crime, provided each restriction respects the **essence** of the rights and is **necessary and proportionate**.",
    exampleMd:
      "A fitness-app subscriber ports her typed profile and her raw workout logs to a rival service in a machine-readable export — but not the \"fitness age\" the app computed about her, which she can still read through an access request. Later, her bank withholds certain information when she exercises her rights, citing a national anti-money-laundering statute: a legislated Article 23 restriction, not a policy the bank invented for itself.",
    questionIds: ["ceq-ii-c-3", "ceq-ii-c-10"],
    sort: 6,
  },
];
