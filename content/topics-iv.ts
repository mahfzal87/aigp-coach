import type { Question, Topic } from "@/lib/types";

function o(label: string, text: string, isCorrect = false, sort = 0) {
  return { label, text, isCorrect, sort };
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW QUESTIONS authored for the Domain IV topic sequence (ids n-iv-*)
// Existing inventory ids (q-iv-*, x-iv-*, z-iv-*) are referenced by topics only.
// ─────────────────────────────────────────────────────────────────────────────

export const questionsTopicsIV: Question[] = [
  // ───────────── IV.A — Evaluate the deploy decision ─────────────
  {
    id: "n-iv-a-1",
    competencyId: "iv-a",
    type: "best",
    difficulty: 3,
    stem: "Priya, head of claims at a mid-size insurer, is evaluating a vendor's generative AI assistant that summarizes claim files. The vendor's benchmark results comfortably exceed the team's accuracy requirement, and Priya's director argues this settles the deploy decision. Priya notes that the insurer's claims archive is unlabeled and scattered across three legacy systems, and that no adjuster has ever been trained on AI-assisted workflows. Which statement BEST characterizes where the evaluation stands?",
    isMultiselect: false,
    options: [
      o("A", "Benchmark performance is the deciding factor in a deploy decision, so the evaluation is effectively complete", false, 0),
      o("B", "The evaluation cannot conclude until every conceivable risk of the assistant has been eliminated", false, 1),
      o("C", "Performance requirements look satisfied, but data availability and workforce readiness — two core use-case context factors — remain unassessed, so the evaluation is incomplete", true, 2),
      o("D", "The vendor's benchmarks are meaningless because only open-source models can be meaningfully evaluated", false, 3),
    ],
    correctExplanation:
      "Evaluating a use case means weighing business objectives, performance requirements, data availability, ethical considerations and workforce readiness together. Strong benchmarks answer only the performance question; the scattered, unlabeled archive and the untrained adjusters mean data availability and workforce readiness — which calls for comprehensive, organization-wide training — are still open.",
    whyWrong: {
      A: "Too narrow — performance is one context factor among several. The stem hands you two unassessed factors: data availability and workforce readiness.",
      B: "Premature precision — governance manages and mitigates risk; no evaluation standard requires eliminating every conceivable risk before concluding.",
      D: "A false absolute — proprietary models are routinely evaluated through vendor evidence, testing and diligence artifacts.",
    },
    strategyNote:
      "When a stem lists facts a confident character is ignoring (unlabeled data, untrained staff), those ignored facts usually are the answer.",
    trapType: "too-narrow",
    bokRef: "Domain IV, Competency A",
    source: "authored",
  },
  {
    id: "n-iv-a-2",
    competencyId: "iv-a",
    type: "distinction",
    difficulty: 3,
    stem: "A product team describes its new model to the governance committee: it composes original marketing copy rather than classifying inputs, its weights and code are published under a permissive license anyone can inspect, it is compact enough to run on a single laptop, and it accepts both text and product photos as input. Which option places the model correctly on all four model-type axes?",
    isMultiselect: false,
    options: [
      o("A", "Generative, proprietary, small, multimodal", false, 0),
      o("B", "Generative, open-source, small, multimodal", true, 1),
      o("C", "Classic, open-source, large, language model", false, 2),
      o("D", "Generative, open-source, small, language model", false, 3),
    ],
    correctExplanation:
      "The four axes are classic vs generative, proprietary vs open-source, small vs large, and language vs multimodal. Composing new content makes it generative; published, inspectable weights make it open-source; laptop-scale makes it small; and accepting text plus images makes it multimodal.",
    whyWrong: {
      A: "One axis off — weights and code published under a permissive license are the definition of open-source, not proprietary (closed and non-inspectable).",
      C: "A model that creates new content is generative, not classic, and a laptop-scale model is small, not large.",
      D: "Synonym-bait on the last axis — a model that accepts product photos alongside text is multimodal, not a language-only model.",
    },
    strategyNote:
      "Score each axis independently against the stem's facts. Distractors typically flip exactly one axis, hoping you stop checking after the first two match.",
    trapType: "synonym-bait",
    bokRef: "Domain IV, Competency A",
    source: "authored",
  },
  {
    id: "n-iv-a-3",
    competencyId: "iv-a",
    type: "distinction",
    difficulty: 3,
    stem: "Dr. Osei's health system lists three AI needs: (1) surface recurring themes from thousands of free-text notes written by physicians; (2) flag likely-fraudulent reimbursement claims using ten years of claims already labeled fraudulent or legitimate; and (3) walk patients through a fixed, rule-based triage flowchart of branching yes/no questions. Which mapping of need to machine-learning technique is correct?",
    isMultiselect: false,
    options: [
      o("A", "(1) decision tree; (2) unsupervised learning; (3) natural language processing", false, 0),
      o("B", "(1) supervised learning; (2) natural language processing; (3) multimodal model", false, 1),
      o("C", "(1) natural language processing; (2) reinforcement learning; (3) large language model", false, 2),
      o("D", "(1) natural language processing; (2) supervised learning; (3) decision tree", true, 3),
    ],
    correctExplanation:
      "Free-form text is the cue for natural language processing; a historical dataset already labeled with the outcome (fraudulent / legitimate) is the classic cue for supervised learning; and a fixed, rule-based flowchart of branching questions maps to a decision tree.",
    whyWrong: {
      A: "Scrambled — free-text notes point to NLP, not a decision tree, and outcome-labeled data calls for supervised, not unsupervised, learning.",
      B: "Swaps the first two cues, and nothing in the triage flowchart involves multiple modalities like images or audio.",
      C: "Gets the notes right, but labeled historical data means supervised learning, and a fixed flowchart needs only a decision tree — not a large language model.",
    },
    strategyNote:
      "Each need carries one keyword cue — \"free-text\" points to NLP, \"labeled\" to supervised learning, \"rule-based flowchart\" to a decision tree. Map the cues before reading the option combinations.",
    trapType: "synonym-bait",
    bokRef: "Domain IV, Competency A",
    source: "authored",
  },
  {
    id: "n-iv-a-4",
    competencyId: "iv-a",
    type: "distinction",
    difficulty: 3,
    stem: "Marisol audits AI governance at a conglomerate whose business units each select, approve and monitor their own AI tools. There is no group-level policy and no shared escalation path, and when one unit's chatbot leaked customer data, the other units never heard about it and later repeated the same mistake. Which option correctly names this governance model AND its characteristic weakness?",
    isMultiselect: false,
    options: [
      o("A", "Decentralized — local units act independently with no central coordination, so policies and incident lessons never propagate across the organization", true, 0),
      o("B", "Hybrid — the units' local autonomy demonstrates that a central coordinating body must exist somewhere", false, 1),
      o("C", "Centralized — every unit applying its own approach is itself a headquarters-driven decision", false, 2),
      o("D", "Decentralized — and therefore inherently unacceptable, requiring all AI decisions to be moved to headquarters in every case", false, 3),
    ],
    correctExplanation:
      "Independent local decision-making with no central coordination is the decentralized model, and its signature weakness is exactly what Marisol found: nothing propagates. The repair IAPP typically rewards for a large organization is hybrid governance — local risk evaluation plus a central coordinating body that sets policy and handles escalations.",
    whyWrong: {
      B: "Hybrid requires an actual central coordinating body that sets policy and handles escalations; none exists here, so local autonomy alone cannot make this hybrid.",
      C: "Centralized means decisions are made at headquarters. This conglomerate has no headquarters function for AI at all.",
      D: "Right label, wrong conclusion — the absolute (\"in every case\") overreaches. Full centralization is not the only alternative; hybrid governance is the rewarded fix.",
    },
    strategyNote:
      "Half-right options are still wrong. Option D names the model correctly, then attaches an absolute prescription — verify the classification AND the conclusion before committing.",
    trapType: "absolute",
    bokRef: "Domain IV, Competency A",
    source: "authored",
  },

  // ───────────── IV.B — Assess the AI system ─────────────
  {
    id: "n-iv-b-1",
    competencyId: "iv-b",
    type: "best",
    difficulty: 3,
    stem: "A state agency deployed an AI tool that screens voter-registration applications for eligibility. Deputy director Kwame proposes declaring the deployment a success because every county now processes roughly the same number of applications. Chief counsel Rivera objects that this number says nothing about whether the tool actually works or discriminates. Which assessment approach BEST evaluates the deployed tool?",
    isMultiselect: false,
    options: [
      o("A", "Track that application volumes remain equal across counties, since equal volume demonstrates equal treatment", false, 0),
      o("B", "Determine error rates through testing and user and stakeholder feedback, and run bias testing to check for discriminatory exclusion of eligible voters", true, 1),
      o("C", "Measure only uptime and average processing speed, because those are objective and easy to quantify", false, 2),
      o("D", "Rely on the vendor's written assurance that the model was tested for fairness before it was sold", false, 3),
    ],
    correctExplanation:
      "Meaningful assessment of a deployed AI tool determines error rates through testing plus user and stakeholder feedback, and includes bias testing for discriminatory exclusion. Counting the same number of applications per county is a vanity metric — it can look perfect while eligible voters are being wrongly screened out.",
    whyWrong: {
      A: "True-but-irrelevant — counties differ in population and eligibility, so identical counts prove nothing about accuracy or fairness and could even mask a problem.",
      C: "Too narrow — uptime and speed are operational health metrics; they cannot reveal wrongful rejections or biased outcomes.",
      D: "Abdication — a pre-sale assurance is not evidence about behavior in this deployment; the deployer must test and gather feedback itself.",
    },
    strategyNote:
      "IAPP loves a tidy-sounding vanity metric. Ask: could this number look perfect while the system wrongly excludes people? If yes, it is not a performance metric.",
    trapType: "true-but-irrelevant",
    bokRef: "Domain IV, Competency B",
    source: "authored",
  },
  {
    id: "n-iv-b-2",
    competencyId: "iv-b",
    type: "not",
    difficulty: 3,
    stem: "Retailer Bramble & Co. deploys two AI systems: a generative model that drafts all of its marketing copy and product imagery, and a screening model that ranks applicants for store-manager roles. General counsel is assembling legal specialists to advise on both deployments. Which legal discipline is LEAST likely to provide relevant guidance here?",
    isMultiselect: false,
    options: [
      o("A", "Copyright law, because the generative system produces marketing content", false, 0),
      o("B", "Data protection law, because the screening model processes applicants' personal data", false, 1),
      o("C", "Employment and anti-discrimination law, because the screening model influences hiring decisions", false, 2),
      o("D", "Antitrust law, applied to both systems", true, 3),
    ],
    correctExplanation:
      "Match legal disciplines to what the use case actually does: generative marketing content raises copyright, and recruitment screening raises data protection plus employment and anti-discrimination law. Antitrust governs competition between firms and has no bearing on either system — a real discipline aimed at the wrong target.",
    whyWrong: {
      A: "Directly relevant — generated marketing copy and imagery sit squarely in copyright territory.",
      B: "Directly relevant — an applicant-screening model processes personal data, which triggers data protection law.",
      C: "Directly relevant — a tool that ranks candidates implicates employment and anti-discrimination law.",
    },
    strategyNote:
      "In LEAST/NOT questions the outlier is usually a legitimate discipline with zero connection to the described use. Verify each option actually touches the scenario before hunting for the odd one out.",
    trapType: "true-but-irrelevant",
    bokRef: "Domain IV, Competency B",
    source: "authored",
  },
  {
    id: "n-iv-b-3",
    competencyId: "iv-b",
    type: "best",
    difficulty: 3,
    stem: "At fintech startup Lyra Pay, the CEO wants to abandon vendor negotiations and build a proprietary credit-scoring model entirely in-house, reasoning: \"If we own the model outright there is no vendor contract to review, so our legal obligations shrink.\" As AI governance lead, your BEST correction is to:",
    isMultiselect: false,
    options: [
      o("A", "Agree — with no vendor in the picture, most of the legal obligations fall away", false, 0),
      o("B", "Explain that the company must first obtain its own patent before it may lawfully operate any AI model", false, 1),
      o("C", "Explain that building and deploying your own proprietary model increases your obligations and potential liability, because the organization alone now answers for data rights, testing, documentation and compliance", true, 2),
      o("D", "Explain that obligations are identical whether you build or buy, so the choice has no governance implications", false, 3),
    ],
    correctExplanation:
      "Developing your own model brings increased obligations and higher potential liability compared with buying — there is no vendor sharing the chain, so training-data rights, bias testing, documentation and regulatory answers all concentrate on you. Owning the model means owning the exposure.",
    whyWrong: {
      A: "Wrong economics — removing the vendor removes a risk-sharing partner, not the obligations; they concentrate on the builder.",
      B: "A patent misconception — you never need your own patent to build or use AI; when buying, the vendor licenses the technology to you.",
      D: "False — the build-versus-buy choice changes the obligation and liability profile, and ownership raises both.",
    },
    strategyNote:
      "Build vs buy in one line: your OWN model = MORE obligations + MORE liability. Any option claiming ownership lightens the legal load is the planted error.",
    trapType: "wrong-economics",
    bokRef: "Domain IV, Competency B",
    source: "authored",
  },
  {
    id: "n-iv-b-4",
    competencyId: "iv-b",
    type: "best",
    difficulty: 3,
    stem: "MedScreen AG is preparing to launch the same high-risk AI hiring tool in the EU, the UK and Brazil. To protect the launch date, the compliance director proposes building the tool to the requirements of whichever jurisdiction is least demanding, and completing the EU conformity assessment \"in the months after go-live, once revenue is flowing.\" The BEST governance response is to:",
    isMultiselect: false,
    options: [
      o("A", "Integrate all three jurisdictions' requirements to the highest common standard, and complete the EU conformity assessment before the system is deployed on the EU market", true, 0),
      o("B", "Adopt the least-demanding jurisdiction's rules everywhere, because a single lighter build is cheaper to maintain", false, 1),
      o("C", "Launch first and run the conformity assessment afterwards, since post-deployment audits can stand in for it", false, 2),
      o("D", "Build three unrelated compliance programs from scratch so each regulator sees a bespoke local effort", false, 3),
    ],
    correctExplanation:
      "Multinational deployments should integrate the multiple international requirements to the highest common standard, never the laxest. And in the EU, a high-risk system requires a conformity assessment before market deployment — it is a pre-market gate, not a post-launch clean-up task.",
    whyWrong: {
      B: "Wrong economics — building to the laxest jurisdiction guarantees non-compliance in the stricter markets from day one.",
      C: "Wrong timing — the conformity assessment is a pre-market obligation; post-deployment audits complement it but never substitute for it.",
      D: "Three disconnected programs forfeit the consistency of a highest-common-standard baseline and multiply the chance of gaps.",
    },
    strategyNote:
      "Multinational stems resolve with one rule: harmonize UP to the highest standard, and clear EU conformity BEFORE deployment. \"Cheaper\" and \"later\" options are bait.",
    trapType: "wrong-economics",
    bokRef: "Domain IV, Competency B",
    source: "authored",
  },

  // ───────────── IV.C — Govern deployment & use ─────────────
  {
    id: "n-iv-c-1",
    competencyId: "iv-c",
    type: "best",
    difficulty: 3,
    stem: "Three months after its support chatbot goes live, HelpDeskAI's operations lead Tomas proposes two changes: retain every customer chat transcript indefinitely \"because the data might be useful someday,\" and cancel the scheduled agent-training refreshers \"because the interface is intuitive.\" Which response BEST reflects responsible production policies?",
    isMultiselect: false,
    options: [
      o("A", "Accept both changes — more data always improves future models, and the training budget is better spent on new features", false, 0),
      o("B", "Accept indefinite retention as long as the transcripts are encrypted, but keep the training program", false, 1),
      o("C", "Reject indefinite retention purely because storage is expensive, and let each agent decide individually whether refresher training is worthwhile", false, 2),
      o("D", "Reject both changes — collect and retain only the data necessary for defined purposes with enforced retention limits, and keep user training running as a standing production control", true, 3),
    ],
    correctExplanation:
      "Responsible production data governance means collecting only necessary data and enforcing retention limits — the GDPR-aligned pattern — and user training is an ongoing production policy, not a launch-week activity. Both of Tomas's proposals dismantle standing controls.",
    whyWrong: {
      A: "\"More data always helps\" is an absolute that ignores minimization and retention duties, and training is a control, not a discretionary expense.",
      B: "Too narrow — encryption protects stored data but does not justify holding it; retention limits govern whether you may keep the data at all.",
      C: "Reaches one right action for the wrong, economic reason (the retention duty applies regardless of storage cost) and abdicates training to individual preference.",
    },
    strategyNote:
      "Data-governance answers reward the minimization + retention-limit pair. Watch for options doing the right thing for a purely economic reason — IAPP marks the reasoning, not just the action.",
    trapType: "absolute",
    bokRef: "Domain IV, Competency C",
    source: "authored",
  },
  {
    id: "n-iv-c-2",
    competencyId: "iv-c",
    type: "role",
    difficulty: 3,
    stem: "InsurTech firm Corvid has deployed a pricing model and is assigning post-deployment responsibilities. The board debates who should watch the live dashboards for drift and anomalies every day, and who should own the broader control framework — policies, risk appetite and escalation paths. Which allocation BEST matches accepted governance practice?",
    isMultiselect: false,
    options: [
      o("A", "The ethics board should personally review every monitoring alert, because accountability can never be delegated below board level", false, 0),
      o("B", "Front-line machine-learning engineers own day-to-day continuous monitoring, while the chief privacy officer, AI governance committee and ethics board own the broader control framework and escalations", true, 1),
      o("C", "The vendor that supplied the model should run all monitoring, since it understands the model better than anyone", false, 2),
      o("D", "No one needs to own monitoring until the first incident occurs, at which point a response team can be stood up", false, 3),
    ],
    correctExplanation:
      "Day-to-day continuous monitoring can sit with the front-line engineers who operate the system, while the broader controls — policy, risk management, escalation — belong with the chief privacy officer, the AI governance committee and the ethics board. Governance works when both layers exist and connect.",
    whyWrong: {
      A: "Wrong altitude, sealed with an absolute — boards oversee the framework; routing every alert to them would drown governance in operations.",
      C: "Abdication — outsourcing all monitoring to the vendor surrenders the deployer's own oversight duty over a system it operates.",
      D: "Wrong timing — monitoring is a standing, continuous control; waiting for an incident defeats its entire purpose.",
    },
    strategyNote:
      "Role questions are altitude questions: engineers operate, committees govern. Distractors push a task one layer too high, too low, or out the door to the vendor.",
    trapType: "absolute",
    bokRef: "Domain IV, Competency C",
    source: "authored",
  },
  {
    id: "n-iv-c-3",
    competencyId: "iv-c",
    type: "distinction",
    difficulty: 3,
    stem: "Finch Bank schedules two recurring activities for its deployed customer-support chatbot. In the first, an independent internal team checks the system each quarter against the bank's fairness commitments, reliability targets and legal obligations, without ever attacking it. In the second, a dedicated team actively crafts adversarial prompts — jailbreak attempts, manipulative personas, injection tricks — trying to make the chatbot misbehave. Which pair correctly names the two activities?",
    isMultiselect: false,
    options: [
      o("A", "The first is an audit; the second is red teaming", true, 0),
      o("B", "The first is red teaming; the second is an audit", false, 1),
      o("C", "Both are forms of threat modeling that differ only in how often they run", false, 2),
      o("D", "The first is a conformity assessment; the second is routine regression testing", false, 3),
    ],
    correctExplanation:
      "A periodic consistency-and-compliance review — fairness, reliability, legal compliance, with no attacking — is an audit. Actively simulating adversarial attacks to break the system is red teaming. Both are periodic post-deployment assessments, but they are distinct instruments and the exam tests the line between them.",
    whyWrong: {
      B: "Flipped — the defining feature of red teaming is active adversarial attack simulation, which only the second activity involves.",
      C: "Threat modeling maps potential attack paths analytically; neither activity is that, and the two differ in method, not merely frequency.",
      D: "A conformity assessment is the EU pre-market exercise for high-risk systems, and deliberately hostile prompting is nothing like routine regression testing.",
    },
    strategyNote:
      "When two near-neighbor terms share a stem, the question IS the distinction: audit = check without attacking; red team = attack on purpose.",
    trapType: "synonym-bait",
    bokRef: "Domain IV, Competency C",
    source: "authored",
  },
  {
    id: "n-iv-c-4",
    competencyId: "iv-c",
    type: "best",
    difficulty: 3,
    stem: "Before the public launch of its AI mortgage advisor, Halcyon Bank's marketing chief drafts the customer announcement: \"Our AI eliminates human error and delivers perfectly accurate guidance every time.\" Governance must decide what external communication to approve. The BEST approach is to:",
    isMultiselect: false,
    options: [
      o("A", "Approve the draft, since projecting total confidence is what prevents customer anxiety", false, 0),
      o("B", "Describe only the advisor's capabilities and omit its limitations, because disclosing weaknesses invites lawsuits", false, 1),
      o("C", "Publish comprehensive, accessible information describing both what the advisor can do and what its limitations are, in balanced and realistic terms", true, 2),
      o("D", "Publish nothing about how the system works and route all customer questions to a call center", false, 3),
    ],
    correctExplanation:
      "External communication plans should give users comprehensive, accessible information on the AI's capabilities AND limitations — balanced and realistic. \"Perfectly accurate every time\" is precisely the overclaiming that external-communication governance exists to stop.",
    whyWrong: {
      A: "\"Eliminates error\" and \"perfectly accurate every time\" are absolutes no AI system can honor — approving them creates legal and trust exposure.",
      B: "Capabilities-only messaging is unbalanced; hiding limitations increases liability rather than reducing it.",
      D: "Silence fails the transparency expectation entirely — users are owed accessible information, not a call-center wall.",
    },
    strategyNote:
      "The exam's external-comms answer is always the balanced pair: capabilities AND limitations. Options that hype, hide, or go silent are the three standard distractors.",
    trapType: "premature",
    bokRef: "Domain IV, Competency C",
    source: "authored",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TOPIC SEQUENCE — Domain IV (Govern AI Deployment & Use)
// ─────────────────────────────────────────────────────────────────────────────

export const topicsIV: Topic[] = [
  // ───────────── IV.A ─────────────
  {
    id: "t-iv-a-1",
    competencyId: "iv-a",
    title: "Reading the Use-Case Context",
    conceptMd:
      "Before choosing any model, evaluate the **context of the use case**: the **business objectives** the AI must serve, the **performance requirements** it has to meet, **data availability** (do you actually have suitable data, and may you use it?), plus ethical considerations and **workforce readiness**. Workforce readiness deserves special attention — IAPP treats it as requiring **comprehensive, organization-wide training**, not a quick briefing for the IT team. A benchmark-topping model still fails as a use case if the data is not there or the people are not ready.",
    exampleMd:
      "Amara's logistics firm wants AI to predict delivery delays. The vendor's model is fast and accurate, but Amara discovers the company's delivery records are incomplete and dispatchers have never used prediction tools. She pauses the purchase: two context factors — data availability and workforce readiness — are unmet, however good the model's performance looks.",
    questionIds: ["n-iv-a-1"],
    sort: 1,
  },
  {
    id: "t-iv-a-2",
    competencyId: "iv-a",
    title: "The Four Model-Type Axes",
    conceptMd:
      "AI models are classified along four axes, and the exam expects you to place a described model on all of them. **Classic vs generative**: classic models classify or predict from inputs, while generative models create new content. **Proprietary vs open-source**: proprietary models are closed — you cannot inspect their code or parameters — while open-source models publish them. **Small vs large** refers to the model's scale, and **language vs multimodal** separates text-only models from those that also handle images, audio or video.",
    exampleMd:
      "Chen's company adopts a vendor chatbot whose weights and code are sealed from inspection — a **proprietary** model. Meanwhile his research group downloads a compact open-weights model that reads both text and X-ray images: **open-source**, **small** and **multimodal**, three different axes captured in one sentence.",
    questionIds: ["x-iv-a-5", "n-iv-a-2"],
    sort: 2,
  },
  {
    id: "t-iv-a-3",
    competencyId: "iv-a",
    title: "Cloud, On-Premise or Edge: Data Sensitivity Decides",
    conceptMd:
      "There are three deployment environments. **Cloud** means the model runs on a provider's remote infrastructure; **on-premise** means it runs on servers the organization itself owns and controls; **edge** means it runs on the end device (a phone, camera or sensor), cutting latency and keeping data local. The deciding factor is usually **data sensitivity and residency** — whether the data may leave your environment and who could access it — not raw benchmark scores or whichever model is newest.",
    exampleMd:
      "Darius's bank weighs where to run two models. The fraud model handles sensitive card data governed by residency rules, so it runs **on-premise**, inside servers the bank controls. The keyboard app's autocorrect model runs on each customer's phone — an **edge** deployment — so typing data never leaves the device at all.",
    questionIds: ["z-iv-a-1", "q-iv-a-3"],
    sort: 3,
  },
  {
    id: "t-iv-a-4",
    competencyId: "iv-a",
    title: "Fine-Tuning, RAG and Agentic Architectures",
    conceptMd:
      "A model rarely ships as-is; teams adapt it to the use case. **Fine-tuning** retrains the model's weights on your own examples to change how it behaves. **Retrieval-augmented generation (RAG)** leaves the weights untouched and instead retrieves your documents at query time, injecting them into the prompt so answers stay current and grounded. **Agentic architectures** let the model take autonomous actions across systems — which makes the first governance questions about permissions, oversight and logging, not features.",
    exampleMd:
      "Lena's legal team wants an assistant that answers from the firm's ever-changing policy manual. Fine-tuning would bake in policies that go stale next quarter, so they choose RAG: the assistant fetches the latest policy pages at query time. When leadership later asks for an agent that files documents automatically, Lena's first question is what actions it may take, with what permissions, under whose oversight.",
    questionIds: ["z-iv-a-2", "z-iv-a-3"],
    sort: 4,
  },
  {
    id: "t-iv-a-5",
    competencyId: "iv-a",
    title: "Four Use-Case Types",
    conceptMd:
      "IAPP classifies AI use cases into four types by their goal. **Detection** finds anomalies or events, such as fraud detection. **Recognition** matches an input against a known catalog or identity — facial recognition, or matching a customer's photo to products. **Optimization** improves a process or outcome, like routing or scheduling. **Personalization** builds a unique experience from an individual **user profile**, such as predicting purchases from a customer's history. The recognition-versus-personalization line is the one candidates most often miss.",
    exampleMd:
      "At retailer Novaline, one system flags suspicious card transactions (detection), another matches a shopper's uploaded photo against the product catalog (recognition), a third plans the shortest delivery routes (optimization), and a fourth assembles a homepage from each customer's browsing profile (personalization).",
    questionIds: ["x-iv-a-1", "q-iv-a-1"],
    sort: 5,
  },
  {
    id: "t-iv-a-6",
    competencyId: "iv-a",
    title: "Matching the ML Technique to the Problem",
    conceptMd:
      "Exam stems hide keyword cues that map straight to a technique. Free-form **text** — doctors' notes, reviews — points to **natural language processing (NLP)**. A dataset that is already **labeled** with outcomes (fraud / not fraud) points to **supervised learning**. A fixed, rule-based flowchart of branching questions points to a **decision tree**. Inputs that combine text with images or video point to a **multimodal** model, while predicting a number is **regression** and shrinking many variables into fewer is **dimensionality reduction**.",
    exampleMd:
      "Ibrahim's team receives three requests: mine themes from free-text patient feedback (NLP), forecast next quarter's claim cost as a dollar figure (regression), and score new claims using five years of claims already labeled fraudulent or legitimate (supervised learning). Each keyword in the request — \"free-text,\" \"dollar figure,\" \"labeled\" — picked the technique before any vendor was called.",
    questionIds: ["n-iv-a-3"],
    sort: 6,
  },
  {
    id: "t-iv-a-7",
    competencyId: "iv-a",
    title: "Centralized, Decentralized and Hybrid Governance",
    conceptMd:
      "**Centralized** governance makes all AI decisions at headquarters — consistent, but slow and far from local context. **Decentralized** governance lets local units act independently with **no central coordination** — fast, but policies and incident lessons never propagate. **Hybrid** governance combines **local risk evaluation with a central coordinating body** that sets policy and handles escalations. For a large multinational, hybrid is the model IAPP rewards.",
    exampleMd:
      "Grupo Andina operates in thirty countries. Each country unit evaluates local AI risks and approves everyday deployments itself, while a central AI council sets group-wide policy and takes the highest-risk escalations — hybrid governance. Its rival lets every country do as it pleases with no council at all: decentralized, and the same chatbot failure quietly recurs in three markets.",
    questionIds: ["q-iv-a-2", "n-iv-a-4"],
    sort: 7,
  },

  // ───────────── IV.B ─────────────
  {
    id: "t-iv-b-1",
    competencyId: "iv-b",
    title: "Assessing the Selected System: Impact and Real Metrics",
    conceptMd:
      "Once a system is selected, run an **impact assessment** on that specific system, and identify the applicable laws **before** incorporating the AI — not after. When you later assess the tool in operation, meaningful evaluation means determining **error rates** through testing, gathering **user and stakeholder feedback**, and running **bias testing** for discriminatory exclusion. Beware **vanity metrics** — numbers that look tidy (equal volumes everywhere) while saying nothing about accuracy or fairness.",
    exampleMd:
      "County clerk Adaeze inherits an AI tool that screens benefit applications. Her predecessor reported success as \"every district processes the same number of cases.\" Adaeze replaces that with a real assessment: measured error rates, feedback from caseworkers and applicants, and bias testing to confirm no eligible group is being wrongly screened out.",
    questionIds: ["n-iv-b-1"],
    sort: 1,
  },
  {
    id: "t-iv-b-2",
    competencyId: "iv-b",
    title: "What Actually Determines Applicable Law",
    conceptMd:
      "The **technology stack** — frameworks, tools and libraries — is **not** what makes laws apply. Applicable law is determined by the **jurisdiction** you operate in, the **sector** you serve, the **type of data** you process, and the **use** you put the system to. Match legal disciplines to the use case itself: generative marketing content raises **copyright**; recruitment tools raise **data protection and employment law**; quality control raises product safety. Watch for real laws that are simply irrelevant to the scenario — the exam's favorite trap.",
    exampleMd:
      "When Solent Toys adds AI-driven pricing for its children's products, counsel Marta lists the laws that matter: discrimination, consumer protection, data protection and copyright. A colleague suggests adding animal-welfare and child-labour law \"because it's a kids' company\" — real laws, but irrelevant to a pricing algorithm, which is exactly how the exam plants its true-but-irrelevant options.",
    questionIds: ["q-iv-b-2", "n-iv-b-2"],
    sort: 2,
  },
  {
    id: "t-iv-b-3",
    competencyId: "iv-b",
    title: "Open-Source Licensing: The Terms That Matter",
    conceptMd:
      "When evaluating an open-source AI agreement for privacy and intellectual-property exposure, the **most critical terms** are **training-data ownership and usage rights** and **ownership of the model's outputs**, with **derivative-works obligations** close behind — these drive your privacy and copyright risk. Distribution details, co-marketing rights and liability caps matter far less to that immediate goal. One common misconception to drop: you do **not** need your own patent to use a vendor's AI — the vendor licenses the technology to you.",
    exampleMd:
      "Reviewing an open-weights model for a marketing tool, counsel Yusuf zeroes in on three clauses: who owned and licensed the training data, who owns the generated outputs, and what must be shared back if his team modifies the model. The vendor's co-branding clause gets thirty seconds; the training-data warranty gets a full negotiation round.",
    questionIds: ["q-iv-b-1", "z-iv-b-1"],
    sort: 3,
  },
  {
    id: "t-iv-b-4",
    competencyId: "iv-b",
    title: "Diligence Artifacts: Evidence, Not Promises",
    conceptMd:
      "Before adopting a third-party system, request **diligence artifacts** — documents that prove behavior rather than assert it. The core set is the **model card** (purpose, performance, limitations, intended use), **evaluation results including bias testing**, the vendor's **security posture**, and its **incident history**. Sales decks, customer logos and verbal assurances are marketing, not evidence.",
    exampleMd:
      "Before piloting a vendor's fraud model, risk lead Priyanka sends a one-page request: the model card, evaluation results with bias testing, a security-posture summary, and every incident affecting the model in the past two years. The vendor's offer of \"a call with our happiest customer\" does not shorten the list.",
    questionIds: ["z-iv-b-2"],
    sort: 4,
  },
  {
    id: "t-iv-b-5",
    competencyId: "iv-b",
    title: "Owning the Model Means Owning the Liability",
    conceptMd:
      "Building your own **proprietary model** brings **increased obligations and higher potential liability** than buying from a vendor. With no vendor to share the chain, your organization alone answers for training-data rights, testing, bias, documentation and conformity. \"No vendor contract\" does not mean less legal exposure — it means more, concentrated entirely on you.",
    exampleMd:
      "Nordstrale Bank debates buying a credit model versus building its own. The CTO celebrates that building means \"no vendor terms to fight over.\" The governance lead corrects the picture: in-house means the bank alone carries data-rights clearance, bias testing, documentation and every regulator's questions — obligations a vendor deal would have shared.",
    questionIds: ["n-iv-b-3"],
    sort: 5,
  },
  {
    id: "t-iv-b-6",
    competencyId: "iv-b",
    title: "EU Conformity First, Highest Standard Everywhere",
    conceptMd:
      "A **high-risk AI system in the EU requires a conformity assessment before market deployment** — it is a pre-market gate, never a post-launch task. A **DPIA** and a conformity assessment are different instruments, but both require a **risk assessment plus a mitigation plan**. And when one system launches in several countries, integrate the multiple international requirements to the **highest common standard**, rather than building to the laxest jurisdiction.",
    exampleMd:
      "Velora prepares an AI hiring tool for Germany, Japan and Canada. The governance team builds one compliance baseline that meets the strictest requirement on each point, and completes the EU conformity assessment before the German go-live. The cheaper plan — \"launch now, assess later, follow the laxest law\" — never leaves the meeting room.",
    questionIds: ["x-iv-b-3", "n-iv-b-4"],
    sort: 6,
  },

  // ───────────── IV.C ─────────────
  {
    id: "t-iv-c-1",
    competencyId: "iv-c",
    title: "Production Policies: Data Governance, Retention, Training",
    conceptMd:
      "Deployment is where policies must actually operate: **data governance**, **risk management**, **issue management** and **user training**. Responsible data governance in production means **collecting only the data necessary** for defined purposes and **enforcing retention limits** — the GDPR-aligned pattern. User training is a standing control that continues for as long as the system runs, not a launch-week event.",
    exampleMd:
      "Six months after go-live, Ravenna Insurance reviews its claims chatbot. The team deletes transcripts past their retention date, confirms the bot still collects only the fields needed to route a claim, and runs the quarterly refresher for claims agents — three production policies working exactly as designed.",
    questionIds: ["n-iv-c-1"],
    sort: 1,
  },
  {
    id: "t-iv-c-2",
    competencyId: "iv-c",
    title: "Continuous Monitoring and Drift Response",
    conceptMd:
      "Production systems need **continuous monitoring** paired with a **regular maintenance, update and retraining schedule**. **Data drift** — the live inputs shifting away from what the model was trained on — is a leading indicator: act when drift appears, before accuracy visibly falls, by tightening monitoring and scheduling evaluation and possible retraining. Day-to-day monitoring can sit with **front-line engineers**, while the broader control framework belongs to the **chief privacy officer, AI governance committee and ethics board**.",
    exampleMd:
      "At Meridian Freight, engineer Sofia notices the delay-prediction model now sees far more cold-chain shipments than it was trained on. Accuracy has not dropped yet, but she flags the drift, tightens monitoring, and books a retraining evaluation — while the AI governance committee, not Sofia, decides whether policy or risk appetite must change.",
    questionIds: ["z-iv-c-1", "n-iv-c-2"],
    sort: 2,
  },
  {
    id: "t-iv-c-3",
    competencyId: "iv-c",
    title: "Audits and Red Teaming in Production",
    conceptMd:
      "Deployed systems need **periodic assessments**, and the exam expects you to tell the instruments apart. An **audit** checks the system and program against policy, law, fairness and reliability commitments — a consistency-and-compliance review with no attacking involved. **Red teaming** is **active adversarial attack simulation**: a team deliberately tries to break the system, for example by attacking a customer-support chatbot with hostile prompts. Threat modeling and security testing round out the periodic toolkit.",
    exampleMd:
      "Kestrel Bank's compliance calendar shows both instruments. In March, an independent reviewer checks the support chatbot against the bank's fairness and legal obligations without touching an attack tool — an audit. In April, a security squad spends a week crafting hostile prompts trying to make the same chatbot leak account data — red teaming.",
    questionIds: ["n-iv-c-3"],
    sort: 3,
  },
  {
    id: "t-iv-c-4",
    competencyId: "iv-c",
    title: "Telling the Public What It Can and Cannot Do",
    conceptMd:
      "An **external communication plan** should give users **comprehensive, accessible information about the AI system's capabilities AND its limitations** — balanced and realistic. Overclaiming (\"perfectly accurate, eliminates human error\") creates legal and trust exposure, while hiding limitations or going silent fails transparency expectations. On the exam, the winning answer is always the balanced pair.",
    exampleMd:
      "Launching an AI symptom checker, Bluebell Health publishes a plain-language page: what the tool can help with, the situations it handles poorly, and a clear statement that it does not replace a doctor. Marketing's earlier draft — \"clinically perfect answers, every time\" — was stopped by governance before it ever reached customers.",
    questionIds: ["x-iv-c-3", "n-iv-c-4"],
    sort: 4,
  },
  {
    id: "t-iv-c-5",
    competencyId: "iv-c",
    title: "Secondary Use, Scope Creep and Model Cards",
    conceptMd:
      "Deployers must **forecast and reduce secondary and unintended uses** and the downstream harms they cause. The recognized best-practice artifact for this is the **model card**, which documents a model's purpose, performance, limitations and intended use. Keep it distinct from the **AI system inventory** — the organization-wide register of systems used for governance and incident response. When users stretch a system beyond its intended use, restate the intended use, add guardrails, monitor, and update the model card and training.",
    exampleMd:
      "Hallow & Birch built its internal chatbot to answer HR-policy questions, but staff begin asking it for legal advice on client contracts. Governance treats this as unintended secondary use: it restates the intended scope, adds a disclaimer and prompt guardrails, monitors usage, and updates the model card so the boundary is documented.",
    questionIds: ["q-iv-c-4", "z-iv-c-5"],
    sort: 5,
  },
  {
    id: "t-iv-c-6",
    competencyId: "iv-c",
    title: "When to Switch It Off: Deactivation Policy",
    conceptMd:
      "Every deployed system needs a **deactivation and localization policy**: pre-agreed controls to **disable or localize** the AI when **regulatory requirements** or **performance problems** demand it. A valid reason to keep a troubled system running is that a **feasible mitigation was identified and applied in a timely way**. Invalid reasons to keep it running: it is **profitable**, or migrating away would be **burdensome**. Equally invalid as a reason to shut down: a new version was released — new versions build on the prior model and are not, by themselves, a deactivation trigger.",
    exampleMd:
      "Orbita's fraud model starts over-flagging a new customer segment. The team applies a tested threshold fix within days, so the system stays live — a valid, mitigated continuation. When a director later argues an aging model should keep running in a non-compliant market \"because it drives a fifth of our revenue,\" the policy overrules him: profit is never a reason to stay on.",
    questionIds: ["q-iv-c-2", "q-iv-c-1"],
    sort: 6,
  },
  {
    id: "t-iv-c-7",
    competencyId: "iv-c",
    title: "Feature Flags: Localizing Without a Redeploy",
    conceptMd:
      "**Feature flags** are switches that turn an AI capability on or off **by jurisdiction, without redeploying** the software. They are the practical mechanism behind localization: keep a feature offline in one country — say, while a regulatory negotiation runs — while it stays live everywhere else. The alternatives the exam offers (delete the model, email users to ignore it, wait for the next release) are destructive, ineffective or too slow.",
    exampleMd:
      "A regulator in one market opens a review of Lumen App's AI photo tagging. Engineering flips the jurisdiction-scoped feature flag: tagging disappears for users in that country the same afternoon, stays live in every other market, and no new version of the app has to ship.",
    questionIds: ["q-iv-c-3"],
    sort: 7,
  },
  {
    id: "t-iv-c-8",
    competencyId: "iv-c",
    title: "Redress: Explanation, Human Review, Correction",
    conceptMd:
      "When an automated decision harms someone, best-practice **redress** has three parts: provide a **meaningful explanation** of the decision, offer a route to **human review**, and **correct the record** if the decision was wrong — in line with policy and, where applicable, law such as GDPR Article 22. Pointing to the terms of service, hiding behind \"the model is proprietary,\" or offering compensation instead of review are the standard distractor patterns.",
    exampleMd:
      "Dmitri's mortgage application is refused by Halvard Bank's automated system. Under the bank's redress procedure he receives an explanation of the main factors behind the decision, a human underwriter re-reviews the case, and — after an income-data error surfaces — the record is corrected and the decision reversed.",
    questionIds: ["z-iv-c-2"],
    sort: 8,
  },
];
