import type { Topic } from "@/lib/types";

// CIPP/E Domain 5 topics — Compliance with European Data Protection Law and Regulation.
// Authored against BoK v1.3.3 (V.A employment, V.B surveillance, V.C direct marketing, V.D internet technology).
export const topicsD5: Topic[] = [
  // ─── V.A — Employment relationships ───
  {
    id: "ce-v-a-1",
    competencyId: "v-a",
    title: "Employee data: picking a lawful basis that survives",
    conceptMd:
      "Because an employee can rarely refuse the boss without fearing consequences, **consent** is almost never freely given in the workplace and regulators treat it as a last resort. Routine HR processing rests instead on **contract necessity** (paying salary, administering benefits), **legal obligation** (tax and social-security reporting) or a carefully balanced **legitimate interests** assessment. **Article 88 GDPR** lets member states lay down more specific national rules for the employment context, which is why practice differs country to country. Personnel files also concentrate sensitive material — health notes, disciplinary records — so storage limits and tight access controls matter as much as the basis itself.",
    exampleMd:
      "Viennese retailer Maravel wants employees to \"consent\" to payroll processing inside their employment contracts. Its DPO strikes the clause: salary processing is **necessary for the employment contract**, tax withholding is a **legal obligation**, and dressing either up as consent only manufactures a right to refuse that the company could never honor. For the genuinely optional wellness-app pilot, though, real opt-in consent works — nobody suffers for declining.",
    questionIds: ["ceq-v-a-1"],
    sort: 1,
  },
  {
    id: "ce-v-a-2",
    competencyId: "v-a",
    title: "Watching the workforce: monitoring, DLP and works councils",
    conceptMd:
      "Workplace monitoring must be **proportionate** — the least intrusive tool that achieves a defined purpose — and **transparent**, meaning staff learn what is monitored and why before it starts. **Covert monitoring** is defensible only in narrow, suspicion-based investigations of serious wrongdoing, limited in time and scope — never as a general preventive habit. In several member states, Germany above all, the **works council** must be involved before monitoring or **data-loss-prevention (DLP)** tooling goes live, a product of the **Article 88** national-rules layer.",
    exampleMd:
      "Hamburg engineering firm Steinbach plans a DLP tool that blocks and logs outbound emails carrying project files. The privacy team scopes it to flag defined file types rather than read every message, publishes a monitoring notice, and negotiates a works agreement with the works council before switch-on. When a manager asks to secretly log one suspect's keystrokes \"just to be sure,\" counsel refuses: with no concrete suspicion of serious wrongdoing, covert surveillance is off the table.",
    questionIds: ["ceq-v-a-2", "ceq-v-a-3"],
    sort: 2,
  },
  {
    id: "ce-v-a-3",
    competencyId: "v-a",
    title: "BYOD programs and whistleblowing channels",
    conceptMd:
      "**Bring-your-own-device (BYOD)** programs save hardware costs but blur the boundary between corporate and private life; the accepted fix is **containerization**, which walls off work data so the employer can wipe its container without touching family photos — a full-device wipe of a personal phone is the classic overreach. **Whistleblowing systems** required by the **EU Whistleblower Directive** must guarantee the reporter **confidentiality** — identity disclosed only to those authorized to handle the case — while full **anonymity** is a stronger, distinct feature that national implementations treat differently. Reports also contain personal data about the people accused, so access must stay tightly restricted.",
    exampleMd:
      "When Lyon logistics firm Verdaine adopts BYOD, it installs a managed container on each phone; after a device is stolen, IT wipes only the container and the employee's personal photos survive. Its new ethics hotline promises reporters their identity stays **confidential** — known to the case team alone — while the Spanish subsidiary, following its local rules, additionally accepts fully **anonymous** reports.",
    questionIds: ["ceq-v-a-4", "ceq-v-a-5"],
    sort: 3,
  },
  // ─── V.B — Surveillance activities ───
  {
    id: "ce-v-b-1",
    competencyId: "v-b",
    title: "State surveillance: the LED, interception and data retention",
    conceptMd:
      "When **police and criminal-justice authorities** process personal data for law-enforcement purposes, the **Law Enforcement Directive (LED)** governs — not the GDPR — though both regimes demand lawfulness and proportionality. Any state surveillance measure must also satisfy **necessity and proportionality** under **Article 8 ECHR** and the EU Charter. **Interception of communications** is constrained by the ePrivacy confidentiality rules, subject to national-security carve-outs that must themselves be lawful and proportionate — and the **CJEU has rejected general and indiscriminate data retention**, leaving room only for targeted, time-limited schemes tied to serious threats.",
    exampleMd:
      "A member state drafts a law making every mobile operator keep all subscribers' traffic and location data for two years, \"in case\" investigators ever need it. Counsel warns that the scheme copies exactly what the CJEU has struck down: retention untargeted by person, time or place. A narrower duty — retention tied to defined serious-crime needs, high-risk places and limited periods — stands a far better chance.",
    questionIds: ["ceq-v-b-1"],
    sort: 1,
  },
  {
    id: "ce-v-b-2",
    competencyId: "v-b",
    title: "Cameras and biometrics: CCTV, Ryneš and facial recognition",
    conceptMd:
      "**CCTV** demands transparency (visible **signage**), a defined purpose and short, justified **retention** periods. The **household exemption** covers purely personal filming — but the **Ryneš** logic holds that a home camera systematically capturing **public space** falls outside it, so data protection law applies. **Facial recognition** data becomes **special-category biometric data** whenever it is processed to **uniquely identify** a person, demanding an Article 9 condition on top of a lawful basis, and EDPB guidance presses for strict limits on its use in public places. **Geolocation** tracking follows the same proportionality logic: track what the purpose needs, and nothing more.",
    exampleMd:
      "After break-ins, homeowner Petr mounts a camera that films his door — and the pavement plus his neighbor's gate. When a passer-by complains, Petr claims the household exemption; because the lens sweeps public space, the exemption fails and he must justify, signpost and limit the recording. The supermarket next door learns the same lesson at scale when it proposes matching shoppers' faces against a shoplifter watchlist: that is unique identification — special-category processing and a far heavier lift.",
    questionIds: ["ceq-v-b-2", "ceq-v-b-3"],
    sort: 2,
  },
  // ─── V.C — Direct marketing ───
  {
    id: "ce-v-c-1",
    competencyId: "v-c",
    title: "Electronic marketing: prior opt-in and the soft opt-in",
    conceptMd:
      "Under the **ePrivacy Directive** (2002/58/EC as amended — the proposed ePrivacy Regulation was withdrawn in 2025 without ever taking effect), **email and SMS marketing require prior opt-in consent**. The single carve-out is the **soft opt-in**: a business may email its **own existing customers** about its **own similar products or services**, provided the contact details were collected **in the context of a sale** with an opt-out offered **at collection and in every message**. **Postal mail and live phone calls** are treated more gently — often lawful under **legitimate interests** with an opt-out and respect for national preference registers — and **B2B** email practice varies by member state rather than following one EU rule.",
    exampleMd:
      "Outdoor retailer Fjellkart emails past boot buyers about its new hiking-sock line: existing customers, similar products, unsubscribe in every footer — a clean soft opt-in. Its growth team then buys a \"verified prospects\" list and drafts the identical campaign. Counsel blocks it: these people never bought anything from Fjellkart, so the soft opt-in cannot apply, and each send needs prior consent the vendor's list cannot prove.",
    questionIds: ["ceq-v-c-1", "ceq-v-c-2"],
    sort: 1,
  },
  {
    id: "ce-v-c-2",
    competencyId: "v-c",
    title: "The absolute objection and behavioral advertising",
    conceptMd:
      "**Article 21(2)** gives every data subject the right to object to processing for **direct marketing**, including related profiling — and unlike the general objection right, it is **absolute**: no balancing test, no reasons demanded, no fee, and the marketing must simply stop. **Behavioral advertising** layers two regimes: placing or reading tracking **cookies requires prior ePrivacy consent**, and the profiling that follows needs its own **GDPR lawful basis**. Consent extracted through **dark patterns** is invalid, and **\"consent or pay\"** models face intense regulatory scrutiny over whether such consent is freely given.",
    exampleMd:
      "A member replies \"stop emailing me\" to Nordvik Fitness. The marketing lead wants to argue the gym's legitimate interest in member engagement — but there is nothing to argue: the Article 21(2) objection is absolute, so Nordvik suppresses the address immediately and for free. Meanwhile the web team's plan to fire ad-tracking pixels on page load, before any banner choice, fails at the earlier gate: ePrivacy consent must come first.",
    questionIds: ["ceq-v-c-3"],
    sort: 2,
  },
  // ─── V.D — Internet technology and communications ───
  {
    id: "ce-v-d-1",
    competencyId: "v-d",
    title: "Cloud computing: who is controller, who is processor",
    conceptMd:
      "In a typical cloud arrangement the **customer determines purposes and means**, making it the **controller**, while the **provider processes on documented instructions** as the **processor** under an **Article 28** contract covering security, confidentiality, audits, breach notice and end-of-contract deletion or return. The provider may not engage **sub-processors** without authorization, and the customer must map where data actually flows — hosting outside the EEA triggers the full **cross-border transfer analysis**. A provider that starts using customer data **for its own purposes**, such as improving its own products, becomes a **controller** for that processing no matter what the contract calls it.",
    exampleMd:
      "Dutch insurer Waalstad moves claims files to a SaaS platform. Procurement verifies the Article 28 terms, the sub-processor list and approval mechanism, and the storage region. A year later the vendor's release notes reveal it has been mining customer tickets to train its own support bot — processing for the vendor's own purpose, making it a controller for that use and putting it in breach of its processor-only promises.",
    questionIds: ["ceq-v-d-1"],
    sort: 1,
  },
  {
    id: "ce-v-d-2",
    competencyId: "v-d",
    title: "Cookies, Planet49 and social-media entanglements",
    conceptMd:
      "Non-essential cookies — analytics, advertising, social plugins — require **prior consent**, while **strictly necessary** cookies (a shopping cart, a security token) are exempt; \"useful for the business\" never equals strictly necessary. The **Planet49** logic settled that a **pre-ticked box is not consent** — an active, unambiguous act is required — and **cookie walls** that block all access until the visitor \"agrees\" leave no free choice, while the EDPB condemns **dark patterns** that make refusing harder than accepting. On social media, **joint controllership** can arise where a business and a platform jointly determine a phase of processing — the fan-page and Fashion ID line — though each party is responsible only for the phases it actually co-determines.",
    exampleMd:
      "Fashion retailer Mireille's relaunched site loads with the analytics tag already firing and a banner whose checkbox comes pre-ticked. The DPO rebuilds it: nothing but the session-cart cookie loads before the banner, the boxes start empty, and \"Reject all\" sits beside \"Accept all\" with equal weight. She also flags the embedded Like-button: by placing it, Mireille co-determines the collection and transmission of visitor data to the platform, so a joint-controller arrangement is needed for that phase — though not for what the platform later does alone.",
    questionIds: ["ceq-v-d-2", "ceq-v-d-3"],
    sort: 2,
  },
  {
    id: "ce-v-d-3",
    competencyId: "v-d",
    title: "AI and machine learning under the GDPR",
    conceptMd:
      "The GDPR applies to AI whenever **personal data** appears in **training data, prompts or outputs** — there is no machine-learning exemption, and converting records into model weights does not launder the processing that ingested them. Builders must manage the tension between **data minimisation** and model **accuracy** through reasoned, field-by-field choices, honor data-subject rights that reach the training set, and respect **Article 22** limits on solely automated decisions with significant effects. The **EU AI Act** adds product-safety-style obligations for certain systems, but it **operates alongside the GDPR, not instead of it** — compliance with one is never automatic compliance with the other.",
    exampleMd:
      "Madrid fintech Solvara fine-tunes a credit-scoring model on years of applicant files and plans to ship once its AI Act paperwork is done. Its DPO interrupts: the training files are personal data, so Solvara needs a lawful basis for the training itself, must answer access and erasure requests that reach the dataset, and — because the model will decline applicants automatically — must build Article 22 safeguards. The AI Act conformity file answers none of those questions.",
    questionIds: ["ceq-v-d-4"],
    sort: 3,
  },
];
