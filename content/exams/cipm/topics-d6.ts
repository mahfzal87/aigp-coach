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
      "A **privacy notice** is the outward-facing statement written for the people whose data is processed; a **privacy policy** is the internal rulebook that tells staff how to handle that data. The two serve different audiences, and rights information belongs in the notice. A usable notice does more than list rights: it says **which rights apply**, **how to exercise them** (the real channels), **what happens next** (identity checks and response times) and **how to complain** (under the GDPR, to a supervisory authority). Some rights carry their own presentation rules: where processing rests on consent, the notice must state the **right to withdraw** it, and the GDPR **right to object to direct marketing** must be brought to people's attention **clearly and separately** from other information, at the latest at the first communication. **Layered** and **just-in-time** notices keep the essentials short at the point of collection with detail one click away, and California's CCPA (which calls its public document a 'privacy policy') requires that document to explain consumer rights and request methods and to be **updated at least once every 12 months**.",
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
      "Every rights request follows the same spine: **intake** through any channel (so front-line staff must recognize a request and route it), a **log entry** that starts the clock on the day of receipt, **identity verification proportionate to the risk** (reuse an existing login before asking for documents, and never collect more than you need), fulfilment, and a **documented response**. Each right then adds its own twist. **Consent withdrawal** must be as easy as giving consent and must reach every system and processor that relied on it, while processing done before the withdrawal stays lawful; **rectification** means correcting the record and telling the recipients who received it, and a person who disputes accuracy can ask for the data to be **restricted** while you check; an **objection to direct marketing** is absolute, so it is honored through a **suppression list** that keeps just enough data to make sure the person is never contacted again. An **access request** gets confirmation, a copy and the supplementary details, with other people's data **redacted** rather than used as a reason to refuse, and anything withheld must be explained along with the person's right to complain. **Complaints** need their own track (log, acknowledge, investigate, answer and look for patterns), and in the UK, since 19 June 2026, controllers must acknowledge a data protection complaint within 30 days.",
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
      "Rights laws share the idea and differ on the mechanics, so the procedure has to carry each law's rules. The **GDPR** allows **one month**, extendable by **two further months** for complex or numerous requests if the person is told within the first month. California's **CCPA** regulations require the business to **confirm receipt within 10 business days** and **respond within 45 calendar days of receipt, however long verification takes**, extendable once by 45 days with notice; an **opt-out of sale or sharing** needs **no verification** and must be honored within **15 business days**, and an **authorized agent** can act for a consumer once the business has signed permission (it may also ask the consumer to confirm directly, but may not insist on a power of attorney). **Virginia** and most newer US state laws keep the 45 + 45 rhythm but add a mandatory **appeal**: the company answers in writing (Virginia allows 60 days) and, if it still refuses, tells the consumer how to complain to the **Attorney General**. Canada's **PIPEDA** allows **30 days** plus one extension of up to 30, and a missed deadline counts as a **deemed refusal**; Brazil's **LGPD** expects a complete access response within **15 days**. When several laws reach one request, meet **each law's specific steps** and run the calendar to the **earliest applicable clock**, which is why many programs build one global process to the strictest common elements and add jurisdiction-specific steps on top.",
    exampleMd:
      "On the same morning, Harrowgate Outfitters, a Denver retailer that ships nationwide, receives a deletion request from a Virginia customer and an access request from a Californian. Both are logged with 45-day deadlines, and the Californian also gets a receipt confirmation within 10 business days because California's rules require one. Harrowgate deletes most of the Virginian's data but keeps her order records, which tax law requires it to hold, explains why, and includes its appeal link. When she appeals, a senior reviewer who did not handle the original request answers within 60 days and adds the Virginia Attorney General's complaint page.",
    questionIds: ["cmq-vi-a-5", "cmq-vi-a-6"],
    sort: 3,
  },

  // ─── VI.B — Incident handling & response ───
  {
    id: "cm-vi-b-1",
    competencyId: "vi-b",
    title: "From alert to remediation: handling the incident",
    conceptMd:
      "A **security incident** is any event that threatens the confidentiality, integrity or availability of systems or data; a **breach** is the legally defined subset that can trigger notification. Under the GDPR, a **personal data breach** is a security failure leading to the destruction, loss, alteration, unauthorized disclosure of, or access to personal data, so a ransomware lockout counts even when nothing leaves the building; under **HIPAA**, an impermissible use or disclosure of protected health information is **presumed** to be a breach unless a documented **four-factor risk assessment** shows a low probability of compromise. **Triage** comes first: what happened, is personal data involved, whose, how much, how sensitive, and where do the affected people live. **Containment** stops the damage (isolate hosts, revoke credentials, retrieve the misdirected file) while **preserving evidence**; **eradication** removes the cause, **recovery** restores service from trusted sources, and **remediation** fixes the weakness so it cannot recur. NIST's 2012 guide (**SP 800-61 Rev. 2**) taught four phases (preparation; detection and analysis; containment, eradication and recovery; post-incident activity), while **Rev. 3 (April 2025)** maps incident response onto the six **CSF 2.0 Functions**, with Detect, Respond and Recover as the response itself and lessons learned feeding continuous improvement.",
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
      "Each regime starts its clock at a different moment, so the plan must record the **trigger** as well as the **deadline**. The **GDPR** requires notice to the **supervisory authority** without undue delay and, where feasible, **within 72 hours of becoming aware** of a breach, unless it is unlikely to result in a risk, with details allowed **in phases**; individuals are told without undue delay when the risk is **high**, and a **processor** alerts its controller rather than the regulator (an EU 'Digital Omnibus' proposal would lengthen the clock and limit it to high-risk breaches, but it is not law: under the GDPR as in force in 2026, the 72 hours stand). **HIPAA** requires individual notice **without unreasonable delay and no later than 60 calendar days after discovery**, media notice when **more than 500 residents of a state** are affected, and notice to HHS at the same time for breaches of **500 or more** people (smaller breaches are logged and reported within 60 days after the end of the year). Every US state has a breach law, applied by the **residence of the affected person** rather than the company's location, with deadlines ranging from 'without unreasonable delay' to fixed limits such as **Florida's 30 days**. Listed companies file **SEC Form 8-K Item 1.05** within **four business days of determining** that an incident is **material** (a determination due without unreasonable delay after discovery); Canada's **PIPEDA** requires breaches that create a **real risk of significant harm** to be reported 'as soon as feasible'; and Brazil's ANPD expects notice within **three business days**.",
    exampleMd:
      "When attackers stole booking records at Wayfarer Collective, a US-listed travel company with its EU headquarters in Dublin, the incident lead drew one timeline with four clocks: Ireland's Data Protection Commission, as lead authority, within 72 hours of the company becoming aware; affected Florida customers within 30 days of the breach being determined; Canadian customers 'as soon as feasible' once the real-risk-of-significant-harm test was met; and the SEC within four business days of the board's materiality determination, not four days from discovery. Each clock had a named owner, and the earliest one set the pace for building the shared fact base.",
    questionIds: ["cmq-vi-b-3", "cmq-vi-b-4"],
    sort: 2,
  },
  {
    id: "cm-vi-b-3",
    competencyId: "vi-b",
    title: "Business stakeholders and the incident register",
    conceptMd:
      "Regulators and individuals are only part of the audience. The **cyber insurer** usually expects prompt notice as a **policy condition** and may require its approval, or the use of its **panel firms**, before forensic and legal costs are covered; **law enforcement** may ask for notices to individuals to be held back, which US state laws and HIPAA allow for a period tied to the agency's request (documented, and often in writing); **business partners and customers** are owed whatever their **contracts** promise, often on shorter clocks than the law; the **board** needs material facts and decisions in time to oversee them; and **media** statements must match what regulators and individuals are being told. Underneath sits the **incident register**: one entry per incident with dates of detection and awareness, facts, data and people affected, the risk assessment, every notification decision **including the reasoning for not notifying**, notices sent and remedial actions. Many laws require it: the GDPR requires every personal data breach to be documented, notified or not, so the regulator can verify the calls; PIPEDA requires a record of every breach of security safeguards for **24 months**; Brazil's ANPD requires incident records, including those not communicated, for at least **five years**; and HIPAA requires breaches of fewer than 500 people to be **logged** for the annual report to HHS.",
    exampleMd:
      "Months after a quiet incident (an engineer's laptop stolen from a car, its disk encrypted and the key held separately), the UK regulator asks Kestrelmoor Logistics for its breach records. The register entry shows when the theft was reported, the encryption status, the decision that the breach was unlikely to result in a risk to anyone, who signed it off and why, and the remediation, a confirmed remote wipe. The inquiry closes within a week; a company that had kept records only of notified breaches would have had nothing to show.",
    questionIds: ["cmq-vi-b-5", "cmq-vi-b-6"],
    sort: 3,
  },

  // ─── VI.C — Improving the response plan ───
  {
    id: "cm-vi-c-1",
    competencyId: "vi-c",
    title: "Post-incident reviews that change something",
    conceptMd:
      "After an incident, the team runs a **post-incident review** (also called a lessons-learned or after-action review) while memories are fresh, and runs it **blamelessly**: the aim is to understand how the system allowed the failure, not to find a scapegoat. A good review rebuilds the **timeline** against the plan, then asks what the **root cause** was (not just the trigger), what **worked**, what **did not**, and what must change. The output is a **corrective action plan** in which every fix has a named **owner**, a **deadline** and a check that it was done, tracked to closure and reported to governance; otherwise 'lessons learned' are just lessons noted. Measures such as time to detect, contain, escalate and notify show whether the plan's targets were met, and the findings flow back into the risk register, training, vendor contracts and the plan itself. NIST SP 800-61 Rev. 3 pushes the idea further: **improvement is continuous**, and lessons should often be shared as soon as they are identified rather than held until recovery ends.",
    exampleMd:
      "After a misconfigured cloud storage bucket exposed 40,000 loyalty-card records at Halvard Pharmacy, a Danish pharmacy chain, the review found that the trigger (a public-access setting) was not the root cause: the deployment pipeline had no check for public buckets, and nobody owned cloud-configuration reviews. It also found what worked (the regulator was notified within 50 hours) and what did not (the call center learned of the breach from a news site). Each finding became a tracked action with an owner and a date: a pipeline guardrail (platform lead, 30 days), a named owner for configuration reviews (CISO, 14 days) and a call-center briefing step in the plan (privacy office, before the next tabletop).",
    questionIds: ["cmq-vi-c-1", "cmq-vi-c-2"],
    sort: 1,
  },
  {
    id: "cm-vi-c-2",
    competencyId: "vi-c",
    title: "Lowering the odds and the damage",
    conceptMd:
      "Improvement means changing the conditions that made a breach possible or costly. Some changes cut **likelihood** (multi-factor authentication, prompt patching, access reviews, phishing training, tighter vendor due diligence) and others cut **impact**: **data minimization** and on-time deletion (data you no longer hold cannot be stolen), **encryption** (which under many breach laws turns an exposure into a non-notifiable event), segmentation and tested backups. Insurance is different again: it **transfers** the financial cost but does not reduce the harm to the people whose data was exposed. The plan itself must be **tested**: a **tabletop exercise** walks the response team through a realistic scenario and its decision points, exposing gaps in roles, escalation paths and clocks without touching live systems, and is commonly run at least yearly and after major changes. Between tests, keep the **contact list** current (regulators' reporting channels, the insurer's breach hotline, outside counsel, forensic and notification vendors, law enforcement) and keep **vendor obligations** current: contracts should set a specific breach-notice deadline, require cooperation and evidence, and name contacts who still work there.",
    exampleMd:
      "Ashcombe University's yearly tabletop imagines ransomware at the vendor that hosts its student records. Twenty minutes in, the exercise stalls: the contract promises breach notice only 'within a reasonable time', the vendor's security contact on file left last spring, and nobody knows whether the cyber insurer must approve the forensic firm. The after-action list writes itself: negotiate a 24-hour notice clause at renewal, verify every contact quarterly, and add the insurer's hotline and panel firms to the plan. Next year's tabletop will check that each fix held.",
    questionIds: ["cmq-vi-c-3", "cmq-vi-c-4"],
    sort: 2,
  },
];
