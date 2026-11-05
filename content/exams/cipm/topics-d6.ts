import type { Topic } from "@/lib/types";

// CIPM Domain VI — Responding to Requests and Incidents (BoK v4.2.0).
// Original content; topic cards wired to questionsD6. Clocks and thresholds
// checked against primary sources as of November 2026.
export const topicsD6: Topic[] = [
  // ─── VI.A — Data subject requests & rights ───
  {
    id: "cm-vi-a-1",
    competencyId: "vi-a",
    title: "Notices that make rights usable",
    conceptMd:
      "A **privacy notice** is the outward-facing statement written for the people whose data is processed; a **privacy policy** is the internal rulebook that tells staff how to handle it, so rights information belongs in the notice (California's CCPA calls its public document a 'privacy policy', but it plays the notice role). A usable notice says **which rights apply**, **how to exercise them**, **what happens next** (identity checks, response times) and **how to complain** to the regulator. Some rights carry presentation rules: where processing rests on consent, the notice must state the **right to withdraw** it, and the GDPR **right to object to direct marketing** must be shown **clearly and separately** from other information, at the latest at the first communication. **Layered** and **just-in-time** notices keep the essentials short where data is collected.",
    exampleMd:
      "Lindqvist Optics, a Swedish eyewear webshop that sells across the EU, used to end its notice with one line: 'You may have rights under applicable law.' Customers could not tell which rights they had or where to send a request, so requests arrived by chat, social media and handwritten letter, and two sat unanswered for six weeks. The rewrite names each right in plain words, gives one web form and one email address, says how identity is checked and that replies come within one month, and links to the Swedish regulator, IMY, for complaints. The right to object to marketing now sits in its own box at the top of every promotional email instead of in paragraph nine.",
    questionIds: ["cmq-vi-a-1", "cmq-vi-a-2"],
    sort: 1,
  },
  {
    id: "cm-vi-a-2",
    competencyId: "vi-a",
    title: "Running the rights procedures",
    conceptMd:
      "Every rights request follows one spine: **intake** through any channel, a **log entry** that starts the clock on receipt, **identity verification proportionate to the risk** (reuse an existing login before asking for documents; under the GDPR the clock can pause while you wait for identity details you asked for promptly, while California's does not pause for verification), fulfilment and a **documented response**. **Consent withdrawal** must be as easy as giving consent. **Rectification** means correcting the record and telling recipients; if the person disputes accuracy, they can have the data **restricted** while you check. A direct-marketing **objection** is absolute, honored through a **suppression list**. An **access request** gets a copy with other people's data **redacted**, and anything withheld is explained with the route to complain; **complaints** go to someone who did not handle the request.",
    exampleMd:
      "At Tessaro Mobility, an e-scooter operator in Lisbon, a rider tells customer support in a chat that her date of birth is wrong and that she wants no more promotional messages. Support logs both requests that day instead of replying 'noted'. The privacy team corrects the date in the account system and in the feed sent to the company's insurer, adds her to the marketing suppression list rather than deleting her record (a deleted record would let the next CRM import re-add her), and replies within nine days, confirming both actions and naming the Portuguese regulator, the CNPD, as her route if she is unhappy.",
    questionIds: ["cmq-vi-a-3", "cmq-vi-a-4"],
    sort: 2,
  },
  {
    id: "cm-vi-a-3",
    competencyId: "vi-a",
    title: "One request, several laws",
    conceptMd:
      "Rights laws share the idea and differ on the mechanics. The **GDPR** allows **one month**, extendable by **two further months** for complex or numerous requests if the person is told within the first month. California's **CCPA** rules require **confirmation of receipt within 10 business days** and a **response within 45 calendar days of receipt, however long verification takes**, extendable once by 45 days with notice; **opt-outs of sale or sharing** need no verification and must be honored within **15 business days**. **Virginia** and most newer US state laws keep the 45 + 45 rhythm but add a mandatory **appeal**: a written answer within 60 days in Virginia and, if the refusal stands, a route to the **Attorney General**. When several laws reach one request, meet **each law's specific steps** and plan to the **earliest clock**.",
    exampleMd:
      "On the same morning, Pellbury Outfitters, a Denver retailer that ships nationwide, receives a deletion request from a Virginia customer and an access request from a Californian. Both are logged with 45-day deadlines, and the Californian also gets a receipt confirmation within 10 business days. Pellbury deletes most of the Virginian's data but keeps the order records tax law requires, explains why, and includes its appeal link; when she appeals, a senior reviewer who did not handle the request answers within 60 days and adds the Attorney General's complaint page. Its Toronto and São Paulo subsidiaries use the same request log with their own clocks: 30 days under Canada's PIPEDA, where a missed deadline counts as a refusal, and 15 days for a full access response under Brazil's LGPD.",
    questionIds: ["cmq-vi-a-5", "cmq-vi-a-6"],
    sort: 3,
  },

  // ─── VI.B — Incident handling & response ───
  {
    id: "cm-vi-b-1",
    competencyId: "vi-b",
    title: "From alert to remediation: handling the incident",
    conceptMd:
      "A **security incident** is any event that threatens the confidentiality, integrity or availability of systems or data; a **breach** is the legally defined subset that can trigger notification. Under the GDPR a **personal data breach** includes **loss of availability**, so a ransomware lockout counts even if nothing leaves the network; under **HIPAA**, an impermissible use or disclosure of health information is **presumed** a breach unless a documented **four-factor risk assessment** shows a low probability of compromise. **Triage** comes first; then **containment** with **evidence preserved**, **eradication** of the attacker's foothold, **recovery** from trusted sources and **remediation** of the weakness. NIST SP 800-61 **Rev. 2** (2012) taught these as four phases; **Rev. 3** (April 2025) maps incident response onto the six **CSF 2.0 Functions**, with Detect, Respond and Recover as the response itself.",
    exampleMd:
      "At 06:40 a call-center agent at Lumenvale Health, a hospital network in Oregon, reports that a spreadsheet of 2,300 patients' appointment details went to the wrong outside email address. Triage confirms protected health information is involved, so the incident lead opens a presumed-breach file rather than an IT ticket. Containment is a phone call: the recipient, a neighboring clinic, confirms in writing that it deleted the file unopened, a fact the privacy officer records in the four-factor risk assessment. Remediation follows regardless: external-recipient warnings and an end to address auto-complete on call-center email.",
    questionIds: ["cmq-vi-b-1", "cmq-vi-b-2"],
    sort: 1,
  },
  {
    id: "cm-vi-b-2",
    competencyId: "vi-b",
    title: "Notification clocks across jurisdictions",
    conceptMd:
      "Each regime starts its clock at a different moment, so the plan records the **trigger** as well as the **deadline**. Under the GDPR as in force in 2026, the controller notifies the **supervisory authority** without undue delay and where feasible **within 72 hours of becoming aware**, meaning reasonable certainty that personal data was compromised, not knowledge of the full scope; details may follow **in phases**, and a breach unlikely to result in a risk need not be notified. (An EU 'Digital Omnibus' proposal would change this, but it is not law.) **HIPAA** requires individual notice **within 60 calendar days of discovery**, media notice when **more than 500 residents of a state** are affected, and HHS notice **at the same time** for breaches of **500 or more** people; smaller breaches go in a log reported after year end.",
    exampleMd:
      "When attackers stole booking records at Wayfarer Collective, a US-listed travel company with its EU headquarters in Dublin, the incident lead drew one timeline with four clocks: Ireland's Data Protection Commission, as lead authority, within 72 hours of the company becoming aware; affected Florida customers within 30 days of the breach being determined, since US state laws follow the customer's residence; Canadian customers 'as soon as feasible' once PIPEDA's real-risk-of-significant-harm test was met; and the SEC under Form 8-K Item 1.05 within four business days of the board's materiality determination, not four days from discovery. Each clock had a named owner, and the earliest one set the pace for building the shared fact base.",
    questionIds: ["cmq-vi-b-3", "cmq-vi-b-4"],
    sort: 2,
  },
  {
    id: "cm-vi-b-3",
    competencyId: "vi-b",
    title: "Business stakeholders and the incident register",
    conceptMd:
      "Regulators and individuals are only part of the audience. The **cyber insurer** often makes prompt notice and its **consent before any vendor is hired** conditions of cover; **law enforcement** can ask for notices to be held back, which US laws allow for the period the agency specifies, often only on a written request; business customers' **contracts** carry their own notice clocks; and **media** statements must match the official filings. Underneath sits the **incident register**: one entry per incident with the dates of detection and awareness, the facts, the data and people affected, the risk assessment, each notification decision **including the reasoning for not notifying**, and the remedial action. The GDPR requires every personal data breach to be documented, notified or not, so the regulator can check those calls.",
    exampleMd:
      "Months after a quiet incident (an engineer's laptop stolen from a car, its disk encrypted and the key held separately), the UK regulator asks Kestrelmoor Logistics for its breach records. The register entry shows when the theft was reported, the encryption status, the decision that the breach was unlikely to result in a risk to anyone, who signed it off and why, and the remediation, a confirmed remote wipe. The inquiry closes within a week; a company that had kept records only of notified breaches would have had nothing to show. Kestrelmoor's Toronto branch keeps the same entries, because Canada's PIPEDA requires a record of every breach of security safeguards for 24 months.",
    questionIds: ["cmq-vi-b-5", "cmq-vi-b-6"],
    sort: 3,
  },

  // ─── VI.C — Improving the response plan ───
  {
    id: "cm-vi-c-1",
    competencyId: "vi-c",
    title: "Post-incident reviews that change something",
    conceptMd:
      "After an incident, the team runs a **post-incident review** while memories are fresh, and runs it **blamelessly**: the aim is to understand how the system allowed the failure, not to find a scapegoat. A good review rebuilds the **timeline** against the plan, then asks what the **root cause** was (not just the trigger), what **worked** and what **did not**. The output is a **corrective action plan** in which every fix has a named **owner**, a **deadline** and a completion check, tracked to closure and reported to governance; otherwise lessons are noted, not learned. Testing the plan again makes sense once the fixes are in place and written into it. NIST SP 800-61 Rev. 3 adds that improvement is **continuous**: lessons should often be shared as soon as they are identified, not held until recovery ends.",
    exampleMd:
      "After a misconfigured cloud storage bucket exposed 40,000 loyalty-card records at Corriston Pharmacy, a Danish pharmacy chain, the review found that the trigger (a public-access setting) was not the root cause: the deployment pipeline had no check for public buckets, and nobody owned cloud-configuration reviews. It also found what worked (the regulator was notified within 50 hours) and what did not (the call center learned of the breach from a news site). Each finding became a tracked action with an owner and a date: a pipeline guardrail (platform lead, 30 days), a named owner for configuration reviews (CISO, 14 days) and a call-center briefing step in the plan (privacy office, before the next tabletop).",
    questionIds: ["cmq-vi-c-1", "cmq-vi-c-2"],
    sort: 1,
  },
  {
    id: "cm-vi-c-2",
    competencyId: "vi-c",
    title: "Lowering the odds and the damage",
    conceptMd:
      "Improvement changes the conditions that made a breach possible or costly. Some changes cut **likelihood** (multi-factor authentication, patching, phishing training); others cut **impact**: **data minimization** and on-time deletion (data you no longer hold cannot be stolen), **encryption**, segmentation and tested backups. **Insurance** is different again: it **transfers** the cost but does not reduce the harm to the people whose data was exposed. The plan itself must be **tested**: a **tabletop exercise** walks the response team through a realistic scenario and its decision points without touching live systems, which makes it the proportionate first test after major changes; live exercises can follow. Between tests, keep **contacts** and **vendor obligations** current, with fixed breach-notice deadlines that flow down to sub-processors.",
    exampleMd:
      "Ashcombe University's yearly tabletop imagines ransomware at the vendor that hosts its student records. Twenty minutes in, the exercise stalls: the contract promises breach notice only 'within a reasonable time', the vendor's security contact on file left last spring, and nobody knows whether the cyber insurer must approve the forensic firm. The after-action list writes itself: negotiate a 24-hour notice clause at renewal, verify every contact quarterly, and add the insurer's hotline and panel firms to the plan. Next year's tabletop will check that each fix held.",
    questionIds: ["cmq-vi-c-3", "cmq-vi-c-4"],
    sort: 2,
  },
];
