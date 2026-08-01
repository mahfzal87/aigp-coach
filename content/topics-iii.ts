import type { Question, Topic } from "@/lib/types";

function o(label: string, text: string, isCorrect = false, sort = 0) {
  return { label, text, isCorrect, sort };
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW QUESTIONS authored for the Domain III topic sequence.
// Existing inventory questions (q-iii-*, x-iii-*, z-iii-*) are referenced by id
// from the topics below and are NOT redefined here.
// ─────────────────────────────────────────────────────────────────────────────

export const questionsTopicsIII: Question[] = [
  // ───────────── iii-a ─────────────
  {
    id: "n-iii-a-1",
    competencyId: "iii-a",
    type: "best", // "best" | "not" | "ordering" | "role" | "distinction" | "recall"
    difficulty: 3,
    stem: "Meridian Insurance is four weeks from starting development of an AI claims-triage system. The CTO wants to postpone the impact assessment until the system is live, arguing that assessing a finished product is more accurate than assessing a design, and suggests the eventual write-up focus on the project's revenue case since a DPIA is already scheduled anyway. Which response BEST states the purpose and timing of the AI impact assessment?",
    isMultiselect: false,
    options: [
      o("A", "Postpone it until after deployment, since only live production behavior can reveal the genuine risks worth documenting", false, 0),
      o("B", "Run it whenever convenient, because its main function is recording the marketing budget and projected revenue for the board", false, 1),
      o("C", "Perform or review it before the system is built and deployed, because its purpose is to locate the areas of greatest risk so mitigation resources go where they matter most", true, 2),
      o("D", "Skip it, because a completed DPIA makes the AI impact assessment the same exercise under a different name", false, 3),
    ],
    correctExplanation: "An impact assessment is performed or reviewed BEFORE building and deploying; its purpose is to find the areas of greatest risk so mitigation effort is targeted where it matters. Its documentation captures stakeholder inputs and concerns, training-algorithm details, and user demographics — not marketing budgets.",
    whyWrong: {
      A: "Wrong life-cycle stage — pushing a by-design activity to after deployment defeats its purpose: risks must be found before they ship.",
      B: "Wrong content and wrong economics — the documentation covers stakeholder concerns, algorithm details, and user demographics, not budgets or revenue cases.",
      D: "Synonym-bait — a DPIA covers privacy; an AI impact assessment also covers fairness, safety, robustness, and societal impacts. They overlap but are not identical.",
    },
    strategyNote: "Timing trap: by-design activities done 'after deployment' are wrong. Also distrust revenue/budget framing (wrong-economics) and 'X equals Y' claims about two distinct assessments (synonym-bait).",
    trapType: "premature",
    bokRef: "Domain III, Competency A",
    source: "authored",
  },
  {
    id: "n-iii-a-2",
    competencyId: "iii-a",
    type: "best",
    difficulty: 3,
    stem: "Northgate Hospital is designing an AI system that suggests triage priorities in its emergency department. The clinical safety board asks how human oversight will work once the system is live. The project lead replies that oversight can be sorted out after launch, and a data scientist argues clinicians should be removed from the loop entirely because the model outperforms them on benchmarks. Which approach BEST reflects human oversight by design?",
    isMultiselect: false,
    options: [
      o("A", "Remove clinicians from the loop entirely, since a model that beats human benchmarks no longer requires supervision", false, 0),
      o("B", "Specify, during design, the operational controls clinicians can use to intervene, the metrics and thresholds humans will evaluate, and the channels for stakeholder feedback", true, 1),
      o("C", "Launch first, then design the oversight process around whatever incidents occur in the first year", false, 2),
      o("D", "Limit oversight to the annual internal audit, which already checks every hospital system for compliance", false, 3),
    ],
    correctExplanation: "Human oversight by design means the supervision machinery — operational controls, metric and threshold evaluation, and stakeholder feedback channels — is specified during the design phase, so humans can steer and intervene from day one.",
    whyWrong: {
      A: "Absolute abdication — benchmark performance never removes the need for human oversight, least of all in a consequential clinical setting.",
      C: "Wrong life-cycle stage — bolting oversight on after incidents occur is the opposite of oversight by design.",
      D: "Too narrow — an annual compliance audit is one periodic check; it is not designed-in operational controls, thresholds, and feedback.",
    },
    strategyNote: "'By design' in the stem points to the option that builds controls in during design. Distrust 'remove humans entirely' (absolute) and 'after launch' (timing trap).",
    trapType: "absolute",
    bokRef: "Domain III, Competency A",
    source: "authored",
  },
  {
    id: "n-iii-a-3",
    competencyId: "iii-a",
    type: "best",
    difficulty: 3,
    stem: "Verity Bank's prototype lending model shows bias risks against several demographic groups, and leadership debates the most effective design-stage safeguard. The CDO proposes collecting a dozen additional data fields on every applicant; the CTO wants to license a fairness toolkit whose vendor promises it will eliminate all bias; the COO suggests waiting for post-launch monitoring data before spending anything. Which option is BEST?",
    isMultiselect: false,
    options: [
      o("A", "Collect the additional data fields, since a richer picture of each applicant mechanically removes bias", false, 0),
      o("B", "License the vendor toolkit and rely on it to eliminate all bias before launch", false, 1),
      o("C", "Wait for post-deployment monitoring to reveal real disparities before investing in bias work", false, 2),
      o("D", "Assemble a demographically and professionally diverse design team, so differing perspectives surface biased assumptions before they are built in", true, 3),
    ],
    correctExplanation: "A demographically varied, diverse design team is the exam's preferred bias reducer at the design stage: people with different backgrounds catch biased assumptions and blind spots that homogeneous teams — and extra data fields — miss.",
    whyWrong: {
      A: "Too narrow — more data fields do not fix biased framing or blind spots; the diverse-team answer beats the more-data answer on this exam.",
      B: "'Eliminate all bias' is premature precision, and relying entirely on one tool is abdication — no toolkit guarantees zero bias.",
      C: "Wrong timing — bias controls belong in design; waiting for live disparities means shipping the harm first.",
    },
    strategyNote: "IAPP rewards the diverse, cross-functional-team answer over technical-sounding fixes. Distrust 'eliminate all bias' (absolute) and wait-and-see timing (premature).",
    trapType: "too-narrow",
    bokRef: "Domain III, Competency A",
    source: "authored",
  },
  {
    id: "n-iii-a-4",
    competencyId: "iii-a",
    type: "best",
    difficulty: 3,
    stem: "Halcyon Systems runs two AI products — a text-based support chatbot and an image-based factory defect detector — and both show recurring errors. A new VP of engineering proposes one company-standard error-response procedure for all AI systems, and suggests excluding records of prior incidents from the analysis so the team can focus on the future. Which approach to mitigating the errors is BEST?",
    isMultiselect: false,
    options: [
      o("A", "Tailor each mitigation to the system at hand, because the appropriate fix depends on the specific use case and the type of data involved", true, 0),
      o("B", "Adopt the single standard procedure, since identical handling of every error guarantees consistency and fairness", false, 1),
      o("C", "Exclude the prior-incident records as proposed, keeping the analysis strictly forward-looking", false, 2),
      o("D", "Defer any mitigation until the errors measurably reduce revenue, then fix the cheapest system first", false, 3),
    ],
    correctExplanation: "There is no one-size-fits-all error response: the right mitigation depends on the use case and the data type. A text chatbot and an image-based detector need different fixes, and prior incidents are evidence to study, never records to exclude.",
    whyWrong: {
      B: "'Guarantees' is an absolute — and uniform handling ignores that use case and data type drive the correct fix.",
      C: "Excluding prior incidents throws away exactly the evidence that error analysis needs.",
      D: "Wrong economics — errors are triaged by risk and impact, not by revenue effect or cheapness of the fix.",
    },
    strategyNote: "Error-mitigation questions key on 'depends on the use case and data type.' Distrust uniform procedures ('guarantees' = absolute) and 'exclude prior incidents.'",
    trapType: "absolute",
    bokRef: "Domain III, Competency A",
    source: "authored",
  },

  // ───────────── iii-b ─────────────
  {
    id: "n-iii-b-1",
    competencyId: "iii-b",
    type: "best",
    difficulty: 3,
    stem: "Brightline's AI tutor serves two million students. Before a major release, the QA lead proposes validating it through a satisfaction survey sent to a sample of teachers plus self-checks by each feature's developers. A governance reviewer objects that this plan cannot cover the user base. Which testing approach BEST addresses the reviewer's concern?",
    isMultiselect: false,
    options: [
      o("A", "The teacher survey alone, since front-line educators observe the model's behavior with real students every day", false, 0),
      o("B", "A one-time benchmark against a published leaderboard, which permanently establishes coverage for future releases", false, 1),
      o("C", "Automated testing across the system, because it is the only approach that achieves coverage of the full user base and the corner cases that surveys and self-checks miss", true, 2),
      o("D", "Trusting the model's own performance metrics without human interpretation, since automated numbers are free of human bias", false, 3),
    ],
    correctExplanation: "Automated testing is the only way to reach the entire user base — surveys and manual self-checks always miss segments and corner cases. A comprehensive evaluation then adds human interpretation of the outputs and a review of secondary or unintended outputs, guarding against automation bias.",
    whyWrong: {
      A: "Too narrow — a sampled survey observes a slice of users and misses corner cases by construction.",
      B: "'Permanently' is an absolute, and one narrow benchmark cannot represent a two-million-student user base or future behavior.",
      D: "Automation bias — evaluation needs human interpretation and attention to secondary outputs, not blind trust in the machine's own metrics.",
    },
    strategyNote: "Coverage questions key on 'full user base' → automated testing. Distrust single-source validation (too-narrow), machine-only evaluation (automation bias), and 'permanently' (absolute).",
    trapType: "too-narrow",
    bokRef: "Domain III, Competency B",
    source: "authored",
  },
  {
    id: "n-iii-b-2",
    competencyId: "iii-b",
    type: "distinction",
    difficulty: 3,
    stem: "Cordova Retail trains a demand-forecasting model for pet products. Review surfaces two facts: the training window included the months after a blockbuster film about huskies, when husky-product purchases spiked far above normal, and the training records were drawn only from loyalty-club members. The model now persistently over-orders husky merchandise. The over-ordering caused by the film-driven spike is BEST classified as:",
    isMultiselect: false,
    options: [
      o("A", "Sampling bias", false, 0),
      o("B", "Temporal bias", false, 1),
      o("C", "Computational (statistical) bias", true, 2),
      o("D", "Projection bias", false, 3),
    ],
    correctExplanation: "Skew introduced into the data by an external factor — the classic example is purchase data distorted by a movie release — is computational/statistical bias. The loyalty-club-only sample is a separate risk in the same stem: sampling bias.",
    whyWrong: {
      A: "Sampling bias is about who is selected into the sample (the loyalty-club-only issue), not about an external event distorting the recorded values.",
      B: "Synonym-bait — the spike happened at a point in time, but temporal bias means data unbalanced across time periods or eras (like pre-mobile-era training data). The discriminator here is the external skewing factor.",
      D: "Projection bias is assuming other people share your own preferences; nothing in the scenario projects the team's preferences onto customers.",
    },
    strategyNote: "Bias questions hinge on the CAUSE: who is in the sample (sampling) vs unbalanced across eras (temporal) vs skew from an external factor (computational). The film is the external factor.",
    trapType: "synonym-bait",
    bokRef: "Domain III, Competency B",
    source: "authored",
  },
  {
    id: "n-iii-b-3",
    competencyId: "iii-b",
    type: "distinction",
    difficulty: 3,
    stem: "Aegis Cyber has two data problems. Its intrusion-detection model performs poorly on a newly emerging attack pattern because real examples are too scarce to learn from. Separately, its analytics team must publish aggregate customer statistics without exposing any individual customer. Which pairing of techniques correctly matches the two needs?",
    isMultiselect: false,
    options: [
      o("A", "Differential privacy for the rare attack pattern and synthetic data for the statistics, since the two techniques are interchangeable", false, 0),
      o("B", "Synthetic data to generate new examples of the rare attack pattern, and differential privacy to add statistical noise that protects individuals while preserving trends", true, 1),
      o("C", "Anonymization for both needs, because removing identifiers from real data also creates the new training examples the model lacks", false, 2),
      o("D", "Federated learning for both needs, because keeping data at its source automatically solves both scarcity and disclosure", false, 3),
    ],
    correctExplanation: "Synthetic data generates NEW artificial data — its exam-tested purpose is increasing model accuracy and covering rare cases such as a new threat pattern. Differential privacy adds noise so individuals are protected while overall trends survive.",
    whyWrong: {
      A: "The techniques are not interchangeable: noise does not create the missing examples, and generated data is not a noise-based disclosure protection.",
      C: "Anonymization removes identifiers from existing real data; it generates nothing new, and the data itself still moves.",
      D: "Federated learning trains at the data source — it addresses pooling and movement of sensitive data, not example scarcity or the safe publication of statistics.",
    },
    strategyNote: "Map each technique to its one job: synthetic = create new data for accuracy and rare cases; differential privacy = add noise; federated learning = train in place; anonymization = strip identifiers. 'Interchangeable' is the synonym-bait tell.",
    trapType: "synonym-bait",
    bokRef: "Domain III, Competency B",
    source: "authored",
  },

  // ───────────── iii-c ─────────────
  {
    id: "n-iii-c-1",
    competencyId: "iii-c",
    type: "distinction",
    difficulty: 3,
    stem: "Atlas Lending's credit model has been live for two years. Analysts report two developments: (1) applications now include far more gig-economy income profiles than the training data ever contained, and accuracy is slipping as the input environment changes; and (2) after a severe recession, the relationship between income stability and default has itself changed — the same inputs no longer predict the same outcomes. Which classification of the two developments is correct?",
    isMultiselect: false,
    options: [
      o("A", "(1) is concept drift and (2) is model drift", false, 0),
      o("B", "(1) is model drift — performance degrading as the data and environment change — and (2) is concept drift — the modeled relationship itself has shifted; both call for continuous monitoring and retraining", true, 1),
      o("C", "Both are concept drift, because every post-deployment change is by definition a change in concept", false, 2),
      o("D", "Neither is drift, because the model passed validation before deployment, which rules out future degradation", false, 3),
    ],
    correctExplanation: "Model drift is degradation of performance caused by changes in the data or environment around the model (the new gig-economy input mix). Concept drift means the underlying relationship being modeled has shifted (the recession changed what income stability implies about default). Both are addressed through continuous monitoring and retraining.",
    whyWrong: {
      A: "Swapped definitions — the classic synonym-bait. Data/environment change = model drift; relationship change = concept drift.",
      C: "'Every change is by definition' is an absolute, and it erases the exact distinction being tested.",
      D: "Pre-deployment validation cannot rule out future drift — that is precisely why continuous monitoring exists.",
    },
    strategyNote: "When two near-neighbor terms both appear, the question IS the distinction. Anchor: the data or environment moved = model drift; the meaning of the pattern moved = concept drift.",
    trapType: "synonym-bait",
    bokRef: "Domain III, Competency C",
    source: "authored",
  },
  {
    id: "n-iii-c-2",
    competencyId: "iii-c",
    type: "best",
    difficulty: 3,
    stem: "Solace Health's sepsis-prediction model passed every pre-release validation test with strong scores. The program manager proposes cancelling the planned post-deployment testing phase, arguing that a model that passed validation does not need testing again and that the budget is better spent elsewhere. The governance team's BEST response is to:",
    isMultiselect: false,
    options: [
      o("A", "Agree and cancel it, since passing pre-release validation guarantees the same accuracy in production", false, 0),
      o("B", "Replace it with a clinician-satisfaction survey, which captures the judgment of the users who matter most", false, 1),
      o("C", "Postpone any production testing until the first patient-safety incident proves it necessary", false, 2),
      o("D", "Keep inference testing as a distinct post-deployment stage, because the model's accuracy must be verified on real-world production data — skipping it is a governance failure", true, 3),
    ],
    correctExplanation: "Post-deployment inference testing is a required, separate stage: it tests the model's real-world, production accuracy, which curated validation sets cannot guarantee. Skipping it is a governance failure.",
    whyWrong: {
      A: "'Guarantees' is the absolute tell — lab validation never assures live performance on real production data.",
      B: "Too narrow — surveys sample opinions; they cannot measure production accuracy across the full patient population.",
      C: "Waiting for an incident inverts governance: inference testing exists to catch degradation before harm occurs.",
    },
    strategyNote: "Lifecycle-aware answers win — testing does not end at deployment. Distrust 'guarantees' (absolute), single-source surveys (too-narrow), and wait-for-an-incident timing.",
    trapType: "absolute",
    bokRef: "Domain III, Competency C",
    source: "authored",
  },
  {
    id: "n-iii-c-3",
    competencyId: "iii-c",
    type: "best",
    difficulty: 3,
    stem: "Halvard Logistics' route-optimization AI strands dozens of delivery trucks during a regional road closure it could not handle. The engineering lead wants to quietly patch the routing rule and close the ticket; the general counsel wants to assign fault to the data vendor before any analysis; the CFO asks whether the cheapest option is simply accepting occasional strandings. Which next step BEST reflects sound AI incident management?",
    isMultiselect: false,
    options: [
      o("A", "Patch the routing rule and close the ticket, since restoring service ends the incident", false, 0),
      o("B", "Assign fault to the data vendor now, because fixing contractual responsibility resolves the incident", false, 1),
      o("C", "Document the incident and convene a cross-functional team to trace the root cause — such as brittleness, poor-quality data, insufficient testing, or drift — before deciding corrective action", true, 2),
      o("D", "Accept occasional strandings as a cost of doing business, since remediation may cost more than the lost deliveries", false, 3),
    ],
    correctExplanation: "Incident management means documenting the incident and collaborating cross-functionally to find the root cause — common causes are brittleness, lack of robustness, poor-quality data, insufficient testing, and model or data drift. Corrective action follows the analysis, not the other way round.",
    whyWrong: {
      A: "Too narrow — patching the symptom without root-cause analysis leaves the underlying brittleness in place for the next closure.",
      B: "Premature — blame assigned before analysis is not a root cause; the cross-functional investigation comes first.",
      D: "Wrong economics — accepting recurring harm because remediation costs money is the cost-first trap the exam punishes.",
    },
    strategyNote: "Incident stems reward document-first plus cross-functional root-cause analysis. Distrust quick patches (too-narrow), pre-analysis blame (premature), and cost-based acceptance (wrong-economics).",
    trapType: "too-narrow",
    bokRef: "Domain III, Competency C",
    source: "authored",
  },
  {
    id: "n-iii-c-4",
    competencyId: "iii-c",
    type: "best",
    difficulty: 3,
    stem: "Lumen Marts, a US grocery chain, quietly deploys in-store facial recognition to flag suspected shoplifters — no signage, no mention in its privacy policy, no public documentation. Marketing argues that disclosure would tip off thieves and dilute the deterrent value the chain paid for. Which statement BEST captures the governance position?",
    isMultiselect: false,
    options: [
      o("A", "No disclosure is needed, because loss-prevention interests always override transparency obligations", false, 0),
      o("B", "Operating the system without public disclosure risks FTC Act Section 5 enforcement and privacy-law violations — transparency disclosures are obligations, not optional branding choices", true, 1),
      o("C", "Disclosure is only required if the system proves inaccurate, since a well-tuned model harms no one", false, 2),
      o("D", "Skip the disclosure, because signage would reduce the system's deterrent effect and undermine the return on investment", false, 3),
    ],
    correctExplanation: "Failing to disclose an AI practice such as in-store facial recognition exposes the organization to FTC Act Section 5 enforcement and privacy-law violations. Transparency disclosures — technical documentation, instructions for use to deployers, post-market monitoring plans — are governance obligations.",
    whyWrong: {
      A: "'Always override' is an absolute — no business interest suspends transparency obligations.",
      C: "Accuracy does not cure secrecy — the violation is the undisclosed practice itself, not merely bad output.",
      D: "Wrong economics — preserving ROI and deterrence is exactly the profit-over-compliance reasoning the exam punishes.",
    },
    strategyNote: "When a scenario hides an AI practice from the public, think FTC Section 5 plus privacy laws. Distrust 'always,' accuracy-cures-all reasoning, and ROI-first justifications.",
    trapType: "wrong-economics",
    bokRef: "Domain III, Competency C",
    source: "authored",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TOPIC SEQUENCE — Domain III (Govern AI Development)
// ─────────────────────────────────────────────────────────────────────────────

export const topicsIII: Topic[] = [
  // ───────────── iii-a: Govern design & build ─────────────
  {
    id: "t-iii-a-1",
    competencyId: "iii-a",
    title: "Plan in the Right Order: Business Problem First",
    conceptMd:
      "When planning an AI project, governance expects a strict sequence: first determine the **business problem**, then define the specific **use case(s)**, then identify the **applicable laws**, then identify the **use-case gaps and risks**, and only last identify the **data needed**. The logic is that data and technology choices can only be judged against a clearly understood problem, legal context, and risk picture. On the exam, any ordering that puts data or model selection first is wrong.",
    exampleMd:
      "Zenith Logistics wants 'some AI for the warehouse.' Its governance lead, Dana, refuses to let engineers start collecting sensor data. She first pins down the business problem (mis-routed parcels), defines the use case (a parcel-routing recommender), maps the applicable laws (worker-monitoring and privacy rules), lists the gaps and risks (union concerns, camera blind spots) — and only then approves a data inventory.",
    questionIds: ["q-iii-a-1"],
    sort: 1,
  },
  {
    id: "t-iii-a-2",
    competencyId: "iii-a",
    title: "Impact Assessments: Why and When",
    conceptMd:
      "An **impact assessment** is performed or reviewed **before** an AI system is built or deployed — never bolted on afterwards. Its purpose is to locate the areas of **greatest risk**, so that mitigation effort and resources are directed where they matter most. The documentation should capture **stakeholder inputs and concerns**, details of the **training algorithm**, and **user demographics** (gathered at planning time to catch bias early) — not commercial items like marketing budgets. A privacy-focused **DPIA** overlaps with an AI impact assessment but does not replace it, because the AI assessment also covers fairness, safety, robustness, and societal impacts.",
    exampleMd:
      "At Meridian Insurance, governance lead Priya blocks a claims-triage build from starting until the impact assessment is done. The CTO protests that a DPIA already exists, so Priya extends it into a full AI impact assessment, adding stakeholder concerns from claims adjusters and the demographics of affected policyholders. The assessment shows the greatest risk sits in denial recommendations for elderly claimants — which is exactly where the mitigation budget then goes.",
    questionIds: ["z-iii-a-2", "n-iii-a-1"],
    sort: 2,
  },
  {
    id: "t-iii-a-3",
    competencyId: "iii-a",
    title: "The Risk Toolkit: Matrices, Hierarchies, and Pilots",
    conceptMd:
      "Design-stage risk management uses a standard toolkit. A **harms matrix** scores each potential harm by its **probability** and **severity**, so risks can be quantified and weighed against the organization's **risk tolerance**. Around it sit the **risk-mitigation hierarchy** (ranking the responses), **stakeholder mapping** (who is affected and must be consulted), **use-case evaluation**, **benchmarking** against references, and **pre-deployment pilots and testing**. Quantifying risks exists to enable one thing — selecting the appropriate controls and responses — and it never makes an organization immune to risk.",
    exampleMd:
      "Before launching a tenant-screening model, Hartwell Properties scores every harm in a probability-and-severity matrix; wrongful denials land high on both axes. The team maps stakeholders (applicants, housing regulators, leasing agents), benchmarks the model against the current manual process, and runs a three-month pilot in two cities — using the matrix scores to decide which controls get funded first.",
    questionIds: ["x-iii-a-2", "x-iii-a-3"],
    sort: 3,
  },
  {
    id: "t-iii-a-4",
    competencyId: "iii-a",
    title: "Human Oversight by Design",
    conceptMd:
      "**Human oversight by design** means the mechanisms that let people supervise and intervene in an AI system are built in during the design phase, not added after launch. Concretely, that means designing **operational controls** (ways for humans to steer or stop the system), defining the **metrics and thresholds** humans will evaluate, and creating channels for **stakeholder feedback**. The exam's wrong answers either hand every decision to the algorithm or postpone oversight until after deployment.",
    exampleMd:
      "While designing its emergency-department triage assistant, Northgate Hospital gives charge nurses an override control on every recommendation, defines an alert threshold (any week where nurse overrides exceed 15% triggers a review), and adds an in-app feedback button for clinicians — all specified in the design documents before a single patient is triaged.",
    questionIds: ["n-iii-a-2"],
    sort: 4,
  },
  {
    id: "t-iii-a-5",
    competencyId: "iii-a",
    title: "Ethics by Design Across the Lifecycle",
    conceptMd:
      "**Ethics by design** means ethical considerations are integrated from the earliest lifecycle phase — **plan and design** — rather than reviewed at deployment or after an incident. Governance integrated this early should be **pro-innovation**, industry- and technology-agnostic, **outcome-focused**, and built on consensus among the people planning and designing the system. It also means confronting value trade-offs during the build — for example, weighing a small accuracy gain against the loss of **explainability** in a regulated context — instead of letting a single metric decide.",
    exampleMd:
      "At Verity Bank, an ethics review is part of the very first design workshop for a lending model, not a launch-gate formality. Mid-build, when data scientists propose swapping the transparent scoring model for a deep-learning model with 2% higher accuracy, the same early-governance process weighs that gain against the bank's duty to give applicants explainable adverse-action reasons — and documents the decision either way.",
    questionIds: ["x-iii-a-1", "z-iii-a-1"],
    sort: 5,
  },
  {
    id: "t-iii-a-6",
    competencyId: "iii-a",
    title: "Diverse Teams Reduce Bias",
    conceptMd:
      "One of the most effective structural safeguards against AI bias is a **demographically and professionally diverse design team**. People with different backgrounds notice biased assumptions, blind spots, and harmful framings that a homogeneous team would build in without realizing. On the exam, this human answer beats technical-sounding alternatives such as collecting more data fields or buying a fairness toolkit — diversity of perspective is treated as the stronger bias control at the design stage.",
    exampleMd:
      "Corvus Games staffs the design team for its player-matchmaking AI with engineers, a sociologist, an accessibility specialist, and community moderators from four regions. In the first design review, the moderators flag that the proposed 'toxicity' labels would mis-punish dialects common on non-US servers — a problem the original all-engineer team had never spotted.",
    questionIds: ["n-iii-a-3"],
    sort: 6,
  },
  {
    id: "t-iii-a-7",
    competencyId: "iii-a",
    title: "Document the Build; Fit the Fix to the System",
    conceptMd:
      "Documenting decisions throughout the build is how an organization **establishes compliance** and manages risk — an undocumented design choice cannot be defended later. And when systems produce errors, there is **no one-size-fits-all response**: the right mitigation depends on the specific **use case** and the **type of data** involved. Prior incidents are evidence to study, never records to exclude, and treating every error identically is an exam-flagged mistake.",
    exampleMd:
      "Halcyon Systems runs two AI products: a text-based support chatbot and an image-based factory defect detector. When both start misfiring, the team documents each investigation separately and designs different fixes — transcript curation and guardrails for the chatbot, new camera-angle training images for the detector — because a shared 'standard patch' would fit neither the use cases nor the data types.",
    questionIds: ["n-iii-a-4"],
    sort: 7,
  },

  // ───────────── iii-b: Govern data in training & testing ─────────────
  {
    id: "t-iii-b-1",
    competencyId: "iii-b",
    title: "Lawful Rights to the Data",
    conceptMd:
      "Before any data is used for training, data governance requires the organization to **assess and document its lawful rights** to collect and use that data. Possessing the data is not the same as having the right to train on it — consent terms, contracts, and privacy laws determine what is permitted. This check, together with scrubbing or limiting the personal data involved, is the training-data duty most specific to responsible AI development.",
    exampleMd:
      "Before fine-tuning a support model on customer chat transcripts, Ardent Software's counsel verifies that the terms of service actually permit that use, documents the lawful basis, and has engineers strip customer names and account numbers from the transcripts — all before a single training run happens.",
    questionIds: ["z-iii-b-1"],
    sort: 1,
  },
  {
    id: "t-iii-b-2",
    competencyId: "iii-b",
    title: "Is the Data Fit for Purpose?",
    conceptMd:
      "Alongside lawful rights, data governance assesses the data's **quality**, **quantity**, **integrity**, and whether it is **fit for purpose** — good governance never simply assumes a dataset is usable. Big-data work is often described through its 'V' characteristics: **volume** is the sheer amount of data, **velocity** is the speed at which it arrives, **variety** is the mix of formats and sources (text, images, spreadsheets), and **veracity** is its trustworthiness. Naming which 'V' is causing a problem helps the team pick the right remedy.",
    exampleMd:
      "Quill Analytics inherits a client's 'training goldmine': PDFs, call recordings, spreadsheets, and scraped forum posts. Lead engineer Tomas names the core challenge as variety — wildly inconsistent formats and sources — and schedules integration and quality checks before anyone estimates model performance, rather than assuming the pile is usable as-is.",
    questionIds: ["x-iii-b-2"],
    sort: 2,
  },
  {
    id: "t-iii-b-3",
    competencyId: "iii-b",
    title: "Data Lineage and Provenance",
    conceptMd:
      "**Data lineage and provenance** means tracking data from its original **source through every transformation** until it reaches the model. It is *the* recognized method for ensuring training data is **accurate, representative, and unbiased**, because every step that could corrupt or skew the data stays visible and checkable. The classic wrong answer is to assume purchased or inherited data is accurate — governance never assumes.",
    exampleMd:
      "Ostrander Health buys a hospital-readmissions dataset from a vendor. Instead of trusting the sales sheet, the data team reconstructs the lineage: which hospitals contributed records, how missing values were filled, and which patient groups were filtered out along the way. The trace reveals that rural clinics were dropped during a 'cleanup' step — a representativeness gap no headline accuracy metric would have flagged.",
    questionIds: ["q-iii-b-1"],
    sort: 3,
  },
  {
    id: "t-iii-b-4",
    competencyId: "iii-b",
    title: "Train/Test Separation and Overfitting",
    conceptMd:
      "Training data and test data must be kept **separate**. If a model is evaluated on the same data it learned from, it can look brilliant while it has merely **memorized** its training examples — a failure called **overfitting**, whose signature is excellent performance on training data but poor performance on new, held-out data. Both sets must also be built from the **same features**, so the test genuinely measures the model that training produced.",
    exampleMd:
      "Bevel Motors' warranty-claims model scores 99% during development, then collapses in its first live month. Review shows the 'held-out' test file had accidentally been mixed into the training data, so the model had memorized the answers. Re-evaluated on a properly separated test set built from the same features, its true accuracy is 71%.",
    questionIds: ["z-iii-b-2"],
    sort: 4,
  },
  {
    id: "t-iii-b-5",
    competencyId: "iii-b",
    title: "Testing the Model: Types and Coverage",
    conceptMd:
      "A full test program spans **unit**, **integration**, and **validation** testing, plus **performance**, **security**, **bias**, and **interpretability** testing — including adversarial exercises that probe how the system handles hostile inputs. **Automated testing** is the only approach that achieves coverage of the **entire user base**; surveys and manual self-checks always miss segments and corner cases. A genuinely **comprehensive evaluation** combines the model's outputs with **human interpretation** and a review of secondary or unintended outputs, which guards against **automation bias** (over-trusting the machine's own numbers) and against relying on one narrow benchmark. When bias testing finds a disparity, the response is to diagnose the source, remediate, re-test, and document — before release.",
    exampleMd:
      "Brightline's tutoring model serves two million students. Instead of relying on a teacher survey, the QA team runs automated test suites across every grade level and dialect group, fires adversarial prompts at the chat interface, and runs a bias test comparing outcomes across demographics. When the bias test shows weaker performance for students using screen readers, the team diagnoses the cause, fixes it, re-tests, and documents the whole process before shipping.",
    questionIds: ["z-iii-b-3", "n-iii-b-1"],
    sort: 5,
  },
  {
    id: "t-iii-b-6",
    competencyId: "iii-b",
    title: "The Five Bias Types",
    conceptMd:
      "The exam tests five bias types by their **causes**. **Sampling bias** comes from a non-representative **sample selection** — for example, training a hiring model only on current employees. **Temporal bias** arises when data is unbalanced **over time**, such as training on pre-mobile-era records. **Computational (statistical) bias** is skew introduced by non-representative data or an **external factor** — the classic example is purchase data distorted by a movie release. **Confirmation bias** is seeking out data that confirms an existing belief, and **projection bias** is assuming that other people share your own preferences.",
    exampleMd:
      "Cordova Retail's demand model carries two distinct problems at once. It was trained only on loyalty-club members — sampling bias, because the sample does not represent all shoppers — and its training window covered the months after a blockbuster husky film inflated husky-product sales — computational bias, because an external event skewed the data itself.",
    questionIds: ["q-iii-b-2", "n-iii-b-2"],
    sort: 6,
  },
  {
    id: "t-iii-b-7",
    competencyId: "iii-b",
    title: "Privacy-Preserving Techniques: Which Does What",
    conceptMd:
      "Four techniques get deliberately confused on the exam. **Differential privacy** adds statistical **noise** to data or outputs, protecting individuals while preserving overall trends. **Federated learning** trains the model **at the data source**, so raw data never moves — the fit whenever sensitive records cannot be pooled. **Synthetic data** generates entirely **new artificial data**, and its exam-tested purpose is to **increase model accuracy** and cover rare cases (like a new threat pattern) — it is not primarily a privacy or minimization tool. **Anonymization** removes identifiers from real data, but the data itself still moves.",
    exampleMd:
      "Three hospitals want one shared diagnostic model without pooling patient records, so they use federated learning — each hospital trains locally and only model updates travel. Their research arm separately publishes admission statistics protected by differential-privacy noise, and the security team, short on examples of a rare new attack pattern, generates synthetic cases to boost the detector's accuracy.",
    questionIds: ["q-iii-b-3", "n-iii-b-3"],
    sort: 7,
  },
  {
    id: "t-iii-b-8",
    competencyId: "iii-b",
    title: "Cross-Border Data: Check the Law Before Processing",
    conceptMd:
      "When training data crosses borders — for example, EU customer data drawn from France and Germany — the team must review **where the data originates**, **where it will be transferred**, and **which laws control** that movement **before any processing begins**. This review comes before cleaning, before feature work, before everything, because the controlling law may forbid the data movement entirely. Starting the technical work first is the exam's favorite trap here.",
    exampleMd:
      "Volta Bank's Madrid team receives customer files from the French and German branches for a credit model. Engineer Lena wants to start deduplicating immediately, but the privacy officer halts all work until counsel confirms where each dataset originated, where it will flow, and whether the controlling data-protection laws permit the plan — only then does any processing start.",
    questionIds: ["x-iii-b-4"],
    sort: 8,
  },
  {
    id: "t-iii-b-9",
    competencyId: "iii-b",
    title: "Data Poisoning",
    conceptMd:
      "**Data poisoning** is an attack in which a malicious actor **inserts corrupted or manipulated data into the training set**, so the model learns wrong patterns and its future predictions degrade. It differs from attacks on a finished model: **evasion** crafts malicious inputs at inference time, **membership inference** tries to reveal whether a record was in the training data, and **model extraction** tries to steal the model itself. Because poisoning strikes the training pipeline, the defenses live in data governance — lineage tracking, integrity checks, and controlling who can write to training sets.",
    exampleMd:
      "A disgruntled contractor at Talos Security quietly adds mislabeled malware samples to the training queue, teaching the detection model that one malware family is safe. Months later the model waves that family through. Forensics traces the corrupted records through the data-lineage log back to the contractor's batch uploads — a textbook data-poisoning incident caught by provenance controls.",
    questionIds: ["x-iii-b-1"],
    sort: 9,
  },

  // ───────────── iii-c: Govern release, monitoring & maintenance ─────────────
  {
    id: "t-iii-c-1",
    competencyId: "iii-c",
    title: "The Readiness Assessment",
    conceptMd:
      "A **readiness assessment** sits **after** planning, design, and development are complete and **before** deployment. Its job is to determine whether the technology is actually **ready to deploy**, and it includes creating the **model card** and confirming that **conformity** requirements are met. It is a distinct, required stage — going live without it is a governance failure, no matter how smoothly development went.",
    exampleMd:
      "Juniper Freight finishes building its customs-classification model in March but does not ship it. In April, a readiness review checks the conformity requirements, verifies the documentation, and finalizes the model card; only when the review board signs off in May does deployment begin.",
    questionIds: ["q-iii-c-3"],
    sort: 1,
  },
  {
    id: "t-iii-c-2",
    competencyId: "iii-c",
    title: "The Model Card",
    conceptMd:
      "A **model card** is a short summary document describing a model's **purpose**, **performance**, **limitations**, **intended use**, and key development details, published for transparency. It is not the input data, not the test labels, and not the source code. Its exam-tested superpower: the model card is the best-practice artifact for **forecasting and limiting secondary or unintended uses**, because it states plainly what the model is — and is not — for.",
    exampleMd:
      "Orchid Labs releases a speech-to-text model with a card stating its purpose (medical dictation), its measured performance by accent group, a known limitation (unreliable on children's voices), and its intended use (clinician dictation only). When a customer later proposes wiring it into an emergency hotline, the card's intended-use section is what governance points to in refusing.",
    questionIds: ["x-iii-c-2"],
    sort: 2,
  },
  {
    id: "t-iii-c-3",
    competencyId: "iii-c",
    title: "Model Card vs. AI System Inventory",
    conceptMd:
      "These two artifacts are deliberate exam bait for each other. The **model card** is a *summary* of one model's behavior, purpose, and intended use. The **AI system inventory** is far broader: an organized **database of artifacts** — system documentation, **incident-response plans**, **data dictionaries**, **links to source code**, and **contacts for the AI actors** involved — maintained so the organization can perform maintenance and respond to incidents. When a scenario needs the full repository, especially during an incident, the answer is the inventory, not the card.",
    exampleMd:
      "When Ferrous Bank's fraud model misfires at 2 a.m., the on-call engineer does not reach for the model card — she opens the AI system inventory, which holds the incident-response plan, the data dictionary explaining each input field, the link to the model's source code, and the phone number of the responsible engineer. The model card, by contrast, is the short document the bank publishes so others understand the model's purpose and limits.",
    questionIds: ["q-iii-c-1"],
    sort: 3,
  },
  {
    id: "t-iii-c-4",
    competencyId: "iii-c",
    title: "Continuous Monitoring and Drift",
    conceptMd:
      "After deployment, AI systems need **continuous monitoring** under real-world conditions plus a **regular schedule** for maintenance, updates, and **retraining**. The enemy is drift: **model drift** is the degradation of performance as the **data or environment changes** around the model, while **concept drift** means the underlying **relationship being modeled has itself shifted** — the same inputs no longer mean the same outcomes. Both are answered with monitoring and retraining, not one-time fixes. Relatedly, **continuous improvement** aims to adapt the system to evolving data and reduce bias and errors — not to reach 'perfect accuracy' and not primarily to cut costs.",
    exampleMd:
      "Caldera Credit Union's loan model degrades in two different ways. Gig-economy income profiles flood in that its training data never contained — model drift from a changed data environment — and after a recession, the very relationship between income stability and default shifts — concept drift. The monitoring dashboard catches both, triggering the scheduled retraining pipeline.",
    questionIds: ["x-iii-c-1", "n-iii-c-1"],
    sort: 4,
  },
  {
    id: "t-iii-c-5",
    competencyId: "iii-c",
    title: "Inference Testing in Production",
    conceptMd:
      "Passing pre-release validation is not the end of testing. **Inference testing** is a required, **separate post-deployment stage** that measures the model's accuracy on **real-world production data** — the traffic it actually receives, not the curated test set it was built against. Skipping production inference testing is treated as a governance failure on the exam, because lab performance never guarantees live performance.",
    exampleMd:
      "Solace Health's sepsis-prediction model aced every validation benchmark, but the governance board still requires a production inference-testing phase: for its first 90 days live, the model's predictions on real patient data are scored against actual outcomes. Live accuracy lands six points below the lab number for one ward's patient mix — a gap only production testing could reveal.",
    questionIds: ["n-iii-c-2"],
    sort: 5,
  },
  {
    id: "t-iii-c-6",
    competencyId: "iii-c",
    title: "Audit, Red Team, Threat Model, or Pen Test?",
    conceptMd:
      "Four periodic assessments get deliberately confused. An **audit** checks the system or program for **consistency and compliance** with policies and law — nobody attacks anything. **Red teaming** is an **active adversarial attack simulation** in which specialists genuinely try to manipulate or break the system. **Threat modeling** maps out the possible threats on paper without executing any attack, and **security (penetration) testing** probes technical defenses in a less adversarial, more structured way than red teaming. Match the verb in the scenario — checking, attacking, mapping, probing — to the right term.",
    exampleMd:
      "In one quarter at Vega Air: an independent team reviews the AI program against policy and law without touching the system (an audit); security specialists actively try to trick the booking chatbot into leaking passenger data (red teaming); architects whiteboard everything that could go wrong with the new API (threat modeling); and a contractor runs structured penetration probes against the endpoints (security testing).",
    questionIds: ["q-iii-c-2", "z-iii-c-3"],
    sort: 6,
  },
  {
    id: "t-iii-c-7",
    competencyId: "iii-c",
    title: "Incident Management and Root Causes",
    conceptMd:
      "When a deployed AI system fails, the organization must **document the incident** and **collaborate cross-functionally** to find the **root cause** — not patch the symptom or assign blame first. The common root causes worth memorizing are **brittleness**, **lack of robustness**, **poor-quality data**, **insufficient testing**, and **model or data drift**. Containment, documentation, root-cause analysis, and hardened testing form the standard response pattern.",
    exampleMd:
      "When Halvard Logistics' route-optimization AI strands trucks during a regional road closure, the response team contains the damage by reverting to manual dispatch, documents the incident, and pulls engineering, data, legal, and operations into one root-cause review. The review finds the model was brittle to road-network changes and had never been tested against closures — so both the fix and a new closure test enter the release checklist.",
    questionIds: ["z-iii-c-1", "n-iii-c-3"],
    sort: 7,
  },
  {
    id: "t-iii-c-8",
    competencyId: "iii-c",
    title: "Public Disclosures and Corrective Action",
    conceptMd:
      "Transparency after release is a legal-exposure issue, not a courtesy. Providers make **public disclosures** including technical documentation, **instructions for use** given to deployers (so they can operate the system correctly), and **post-market monitoring plans**. Deploying an undisclosed system — the exam's example is in-store facial recognition with no notice — risks **FTC Act Section 5** enforcement and privacy-law violations. When monitoring or disclosures reveal problems, the organization follows up with documented **corrective actions** rather than quietly continuing to operate.",
    exampleMd:
      "Lumen Marts quietly installs facial recognition at store entrances with no signage and no privacy-policy mention, and a journalist's report triggers an FTC Section 5 inquiry into the undisclosed practice. Crescent Grocers, by contrast, published its technical documentation, gave its franchise deployers instructions for use, posted clear in-store notices, and keeps a post-market monitoring plan — so when its system misidentifies a customer, the documented corrective action (a threshold change plus staff retraining) is already part of the plan.",
    questionIds: ["z-iii-c-2", "n-iii-c-4"],
    sort: 8,
  },
];
