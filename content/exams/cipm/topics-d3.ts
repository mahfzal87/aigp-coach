import type { Topic } from "@/lib/types";

// CIPM Domain III — Privacy Program Operational Life Cycle: Assessing Data.
// Authored against CIPM BoK v4.2.0. Original content; topic cards wired to questionsD3.
export const topicsD3: Topic[] = [
  // ─── III.A — Data inventories & gap analysis ───
  {
    id: "cm-iii-a-1",
    competencyId: "iii-a",
    title: "Inventories, flow maps and the data life cycle",
    conceptMd:
      "A **data inventory** is the catalog of the personal data an organization holds: for each system or process, the data categories and data subjects, the purpose, the owner, the storage location and the retention period. A **data flow map** adds movement — how data travels between systems, teams, vendors and countries — while a **life-cycle map** follows a data set from **collection** through use, storage and sharing to **retention and destruction**. **System integrations** deserve entries of their own, because every interface that copies data creates a new place the data lives and a new place a deletion must reach. Under the GDPR, the Article 30 **record of processing activities** is the legal minimum of this documentation, not the whole of it. Ownership is split: the **privacy office** sets the method, taxonomy and review cycle, while **business process and system owners** keep their own entries current whenever their processing changes.",
    exampleMd:
      "Tidewater Freight, a Rotterdam logistics firm, keeps its inventory in a shared register. When the customs team adopts a new broker portal, the team's process owner logs the system, the shipper data it holds and its two-year retention period; the flow map gains an arrow to a customs broker in Singapore; and the nightly integration that pushes manifests from the portal into the warehouse system gets its own line — so the next deletion request knows there are now three places to look.",
    questionIds: ["cmq-iii-a-1", "cmq-iii-a-2"],
    sort: 1,
  },
  {
    id: "cm-iii-a-2",
    competencyId: "iii-a",
    title: "Measuring policy compliance",
    conceptMd:
      "Measuring compliance means testing whether practice matches two sets of requirements: **internal** ones the organization sets for itself (policies, standards, procedures) and **external** ones imposed from outside (laws and regulations, **contracts** with customers and vendors, and the standards or certification schemes it has committed to). An internal policy binds the organization even where it is **stricter than the law**, so a breach of policy is a finding in its own right, to be remediated or resolved through an approved **exception** or a policy change. Methods range from **self-assessments and attestations** (broad and cheap, but self-reported) through **control testing** of samples, logs and records (evidence-based) to **audits** by internal or external parties. Good measurement ties each requirement to an owner, a test and evidence: a signed questionnaire is a claim, while a sampled record is proof.",
    exampleMd:
      "Orchard & Vale, an Irish homeware retailer, asks each store manager to attest every quarter that CCTV footage is overwritten after 30 days, as its policy requires. When the privacy team pulls the recorder settings from a sample of ten stores, four are set to 90 days — and all four managers had attested to 30. The finding goes on the remediation log with the store operations director as owner, and the attestation form now asks for a screenshot of the setting.",
    questionIds: ["cmq-iii-a-3", "cmq-iii-a-4"],
    sort: 2,
  },
  {
    id: "cm-iii-a-3",
    competencyId: "iii-a",
    title: "Gap analysis: baseline, target state, roadmap",
    conceptMd:
      "A **gap analysis** measures the distance between where the program is and where it needs to be. The **target state** comes from the **applicable laws** plus the **accepted standards** the organization adopts as its benchmark — for example, ISO/IEC 27701 controls, or a NIST Privacy Framework **Target Profile** set against a **Current Profile** — and the **baseline** (current state) comes from the inventory, control evidence and interviews. Comparing the two yields a list of gaps, which are **ranked by risk** to individuals and to the organization and then turned into a **remediation roadmap** with owners, dates and resources. Gaps the organization decides not to close yet need a recorded **risk acceptance** from an executive with authority over the processes involved. A gap analysis is a planning tool: unlike an **audit** it does not issue an independent opinion on compliance, and unlike a **PIA** it looks at the whole program rather than one project.",
    exampleMd:
      "Brightwell Energy, an Australian utility, prepares for amendments to its privacy law. Its privacy lead sets the target from the amended law plus the standard the board has chosen, takes the baseline from the inventory and recent control tests, and finds 31 gaps. Ranked by risk, the top five go into the first quarter of the roadmap with named owners; two low-risk gaps are deferred with a risk acceptance signed by the chief operating officer, who owns the processes concerned.",
    questionIds: ["cmq-iii-a-5", "cmq-iii-a-6"],
    sort: 3,
  },

  // ─── III.B — Processors & vendors ───
  {
    id: "cm-iii-b-1",
    competencyId: "iii-b",
    title: "Outsourcing risk: contract terms and transfer rules",
    conceptMd:
      "Outsourcing moves the processing, not the accountability: the controller remains answerable for what its **processors** do with personal data, and the contract is its main control. Under GDPR **Article 28**, that contract must bind the processor to act only on **documented instructions**, keep its people under **confidentiality**, apply appropriate **security**, engage **sub-processors** only with the controller's prior specific or general written authorization (with notice of changes and a chance to object), assist with rights requests, security, breach notification and DPIAs, **delete or return** the data at the end, and allow **audits and inspections**. A processor must tell the controller about a personal data breach **without undue delay**; the **72-hour** clock for notifying the supervisory authority runs against the controller. Processing outside the EEA also needs a **transfer** basis — an **adequacy** decision, appropriate safeguards such as **standard contractual clauses** (SCCs) or binding corporate rules, or a narrow derogation — and, since the CJEU's *Schrems II* judgment, a **transfer impact assessment** of whether the destination's law and practice let those safeguards work.",
    exampleMd:
      "Vireo Telehealth, a Dutch virtual-care provider, hires a transcription vendor with servers in Ireland and a support desk in a country without an EU adequacy decision. The contract carries the Article 28 terms, a 24-hour breach-notice duty to Vireo and a general authorization for sub-processors with 30 days' notice of any change. Because support engineers can reach patient files remotely, Vireo also signs the relevant module of the SCCs and documents a transfer impact assessment before go-live.",
    questionIds: ["cmq-iii-b-1", "cmq-iii-b-2"],
    sort: 1,
  },
  {
    id: "cm-iii-b-2",
    competencyId: "iii-b",
    title: "Assessing vendors at the right level, across the life cycle",
    conceptMd:
      "Vendor assessment is a team effort, and each function examines a different layer. **Procurement** runs the process: it makes privacy and security due diligence a gate before signature and keeps the vendor record. **Information security** evaluates technical controls through questionnaires, penetration-test results and independent reports such as a **SOC 2 Type II** (controls tested over a period) or an ISO/IEC 27001 certificate whose scope covers the service; **physical security** inspects sites when the risk warrants it; and **internal audit** gives independent assurance that the vendor-management program itself works. Regulators set the bar: a **data protection authority** expects controllers to use only vendors offering sufficient guarantees — and to be able to prove they checked. The **vendor life cycle** runs from risk-tiered **due diligence** before signing, through contracting and onboarding, to **ongoing monitoring** proportionate to risk, and ends with **offboarding**: return or deletion of the data, written confirmation, and revoked access.",
    exampleMd:
      "Fernhill University in the UK tiers its 400 suppliers by the data they touch. A cloud student-records vendor lands in the top tier: procurement holds the contract until information security has reviewed the vendor's SOC 2 Type II report and penetration-test summary and the privacy team has approved the processing terms, and reassessment is booked annually. When an older exam-proctoring contract ends, offboarding requires a deletion certificate and removal of the vendor's single sign-on access within a week.",
    questionIds: ["cmq-iii-b-3", "cmq-iii-b-4"],
    sort: 2,
  },

  // ─── III.C — Physical & environmental controls ───
  {
    id: "cm-iii-c-1",
    competencyId: "iii-c",
    title: "Physical safeguards: sites, paper, media and devices",
    conceptMd:
      "Physical and environmental controls protect personal data where it physically exists. **Data centers** face power loss, fire, flood, cooling failure and intrusion, answered by redundant utilities, suppression and monitoring, and badge-and-escort access; **offices** need **clean desk and clear screen** rules, **visitor** sign-in and escorts, locked storage and secure printing. Paper and media at the end of retention need controlled **destruction**: NIST SP 800-88 Rev. 2 (September 2025, superseding Rev. 1) defines three sanitization methods — **clear** (logical overwrite or reset, against simple recovery through the normal interface), **purge** (recovery infeasible even with state-of-the-art laboratory techniques, media potentially reusable — for example, cryptographic erase) and **destroy** (recovery infeasible and media unusable; the only method for paper). The choice turns on the data's **confidentiality level** and whether the media will be **reused or leave organizational control**, and the result is **verified, validated** and recorded on a **certificate of sanitization**. **Devices** need full-disk encryption, screen locks and remote wipe, because a lost laptop is a physical event with a data consequence.",
    exampleMd:
      "When Glenmoor Pharmacy, a Scottish chain, closes its old head office, the privacy lead runs the move as a physical-security project. Paper files past retention are checked against legal holds and go to a contracted shredder that returns a certificate of destruction; files still in retention travel in sealed, tracked crates. The old office PCs, which held moderate-sensitivity data, will be resold, so their drives are purged and each one is listed on a certificate of sanitization. At the new office, visitors sign in and are escorted, and staff get lockable pedestals to make the clean desk rule workable.",
    questionIds: ["cmq-iii-c-1", "cmq-iii-c-2"],
    sort: 1,
  },

  // ─── III.D — Technical controls ───
  {
    id: "cm-iii-d-1",
    competencyId: "iii-d",
    title: "Digital processing risk and shared responsibility",
    conceptMd:
      "Every layer of digital processing carries operational risk: **servers** that miss patches, **storage** left unencrypted or open to the internet, flat **networks** without segmentation, and **non-production environments** loaded with real personal data under weaker controls. In the **cloud**, security is split under the **shared responsibility model**: the provider secures the facilities, hardware and virtualization layer, and the customer's share grows as it moves from **SaaS** to **PaaS** to **IaaS** — in IaaS, the customer patches the guest operating systems and everything above them. In every model the customer keeps responsibility for its **data**, its **identities and access**, and its own **configuration** choices, and as controller it stays accountable for the processing. A provider's certifications cover the provider's side of the line, not the customer's settings — which is why so many cloud exposures trace back to customer misconfiguration rather than provider failure.",
    exampleMd:
      "Marigold Pay, a Malaysian payments company, moves its card-dispute system to an IaaS platform. The provider's ISO/IEC 27001 certificate covers its data centers and hypervisor; Marigold's own team must patch the virtual machines, manage administrator accounts, encrypt the database and configure storage. Six weeks in, a posture-monitoring tool flags a storage bucket a developer had opened to the public for testing — a gap on the customer's side of the line that no provider audit would ever have caught.",
    questionIds: ["cmq-iii-d-1", "cmq-iii-d-2"],
    sort: 1,
  },
  {
    id: "cm-iii-d-2",
    competencyId: "iii-d",
    title: "Setting limits on use and retention",
    conceptMd:
      "Limits on use and retention count only if systems enforce them. **Use limits** start with purpose: access is granted by role and need, scoped to the purpose the data was collected for, time-bound where possible and **logged** so out-of-purpose use can be detected — **encryption** keeps outsiders out but does nothing to stop an authorized insider using data for the wrong purpose. **Retention limits** come from a **retention schedule** that sets a period for each record type, driven by legal requirements and business need, and are enforced through automated deletion or anonymization rules, archives with tighter access, and periodic review. **Legal holds** suspend deletion only for the data and custodians within their scope, and only until they are released. **Backups** age out on their rotation cycle; where an erasure cannot reach a backup at once, the copy is kept **beyond use** — never restored into live systems without re-applying the deletion.",
    exampleMd:
      "Ashby Mobile, a Kenyan telecom operator, finds four years of call-center recordings despite a 90-day policy. The fix is technical: a deletion rule in the recording platform purges files at day 90, a legal-hold flag exempts only recordings tied to open disputes, access to the archive is limited to the quality team and logged, and a monthly report shows how many recordings were deleted and how many sit under hold — evidence that the limit works, not just that it is written down.",
    questionIds: ["cmq-iii-d-3", "cmq-iii-d-4"],
    sort: 2,
  },
  {
    id: "cm-iii-d-3",
    competencyId: "iii-d",
    title: "Where data lives: discovery, residency and localization",
    conceptMd:
      "A program cannot protect data it cannot find. **Determining where data lives** means discovering every copy — primary systems, replicas and disaster-recovery sites, backups, logs, analytics sandboxes, endpoints and vendor environments — and every place it can be **accessed from**, because remote access from another country can be a cross-border transfer even when the data is stored at home. Three terms are easily blurred: **data residency** is where data is physically stored, usually a business or contractual choice; **data localization** is a **legal requirement** that certain data be stored, and sometimes processed, inside a country's borders; and **data sovereignty** is the principle that data is subject to the laws of the place where it is located. Technical controls make location decisions stick: region pinning, rules on where replicas and backups may go, and location-aware access controls. Each location finding feeds the data flow map and decides which transfer mechanisms and localization rules apply.",
    exampleMd:
      "Ridgeway Insurance, an insurer operating across the EU, keeps policyholder data only in its Frankfurt cloud region — but its outsourced help desk in Pune can open policy records remotely, a transfer it covers with SCCs and a documented assessment. When Ridgeway enters a market whose law requires insurance records to be stored locally, it pins that market's data to an in-country region, keeps its replicas inside the border, and records both decisions on the flow map.",
    questionIds: ["cmq-iii-d-5", "cmq-iii-d-6"],
    sort: 3,
  },

  // ─── III.E — Mergers, acquisitions & divestitures ───
  {
    id: "cm-iii-e-1",
    competencyId: "iii-e",
    title: "Privacy due diligence before close",
    conceptMd:
      "In a merger or acquisition, personal data is both an asset and a liability, and **due diligence before close** is the buyer's chance to price the risk, protect against it or walk away. The core checks: an **inventory of the data** being acquired (categories, volumes, sensitivity, locations); the **notices and consents** it was collected under, because those promises travel with the data and limit what the buyer may do with it; **open breaches, regulatory investigations, enforcement and litigation**; **vendor and customer contracts**, including limits on assignment, change of control and disclosure; the **transfer mechanisms** behind cross-border flows; and the maturity of the target's privacy and security program. Findings shape the deal through price, warranties and indemnities, conditions to closing, and the integration plan. The diligence itself must respect privacy: share aggregated or de-identified data first, disclose identifiable data only when necessary and under confidentiality terms, and keep competitively sensitive data behind a **clean team**.",
    exampleMd:
      "When Lindale Home Services, a Canadian utility-services company, considers buying a smaller retailer of home solar systems, its diligence team asks for the privacy notices in force at each point of collection, not just today's. They find that 40% of the customer list came from a 2019 promotion whose notice promised 'no sharing with any other company.' The deal goes ahead, but the integration plan keeps those records out of cross-selling until fresh consent is collected — and the price reflects the smaller usable list.",
    questionIds: ["cmq-iii-e-1", "cmq-iii-e-2"],
    sort: 1,
  },
  {
    id: "cm-iii-e-2",
    competencyId: "iii-e",
    title: "Integration, separation and inherited obligations",
    conceptMd:
      "How a deal is structured decides who holds the data afterwards. In a **share (stock) purchase** the target company continues as the same legal entity, so it remains the controller and its obligations carry on under new ownership; in an **asset purchase** the data moves to the buyer, which becomes a **new controller** with its own transparency and lawful-basis duties. Either way, the buyer inherits **contractual and data-sharing obligations** — processing agreements, restrictions in customer contracts, vendor terms that may need consent to assign — and binding corporate rules or certifications do not automatically extend to a newly acquired entity. **Integration** aligns risks and controls: merge the inventories, compare policies and controls and adopt the stronger standard, reconcile notices before combining datasets, and bring incident response and vendor oversight under one program. **Divestitures** run in reverse: separate the data that goes with the business from the data that stays, delete or segregate what the seller no longer needs, revoke access, and put processing terms around any **transitional services agreement (TSA)** under which the seller keeps running systems for the buyer.",
    exampleMd:
      "When Kilnworth Insurance, a Welsh insurer, sells its pet-insurance unit, the buyer takes the policyholder records, but the unit's claims keep running on Kilnworth's platform for nine months under a TSA. Kilnworth's privacy team signs processing terms making Kilnworth the buyer's processor for those claims, restricts the unit's records to the TSA staff, sets a migration-and-deletion date, and removes the transferred customers from its own marketing lists on day one.",
    questionIds: ["cmq-iii-e-3", "cmq-iii-e-4"],
    sort: 2,
  },
];
