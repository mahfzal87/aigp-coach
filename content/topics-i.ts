import type { Question, Topic } from "@/lib/types";

function o(label: string, text: string, isCorrect = false, sort = 0) {
  return { label, text, isCorrect, sort };
}

export const questionsTopicsI: Question[] = [
  {
    id: "n-i-a-1",
    competencyId: "i-a",
    type: "distinction",
    difficulty: 3,
    stem: "A regional insurer's operations team has deployed software bots that log into a legacy claims system every night, copy policyholder fields into a new platform, and flag records that fail a fixed set of formatting rules — exactly the steps human clerks used to perform manually. The newly formed AI governance committee is now debating whether these bots must pass through the same model risk classification process as the company's machine-learning fraud detector. How should the governance lead characterize the bots?",
    isMultiselect: false,
    options: [
      o("A", "As robotic process automation: rule-based software that mimics repetitive human steps to automate tasks and reduce human intervention, which does not learn from data and therefore warrants different oversight than a machine-learning model.", true, 0),
      o("B", "As a form of supervised learning, because the bots were configured by observing how human clerks labeled and moved claim records.", false, 1),
      o("C", "As technology designed to maximize reliance on human judgment, since the bots exist to support the clerks who remain in the loop.", false, 2),
      o("D", "As agentic AI, because the bots act without supervision overnight and therefore require the same governance controls as the company's learning systems.", false, 3),
    ],
    correctExplanation: "The bots follow fixed, human-authored rules and simply replay the steps clerks used to perform — the definition of RPA. RPA mimics human actions to automate repetitive tasks and REDUCE human intervention; it does not learn from data or produce probabilistic decisions, so it does not belong in the same risk classification track as a machine-learning model.",
    whyWrong: {
      B: "Nothing here is learned from labeled data. The bots were configured with explicit rules, not trained to generalize to new cases — copying a human's steps is scripting, not supervised learning.",
      C: "This inverts RPA's purpose. RPA exists to reduce human intervention, not to rely on it — the 'RPA depends on humans' framing is a recurring IAPP trap.",
      D: "Executing fixed rules unattended is not agentic AI, which pursues goals through autonomous multi-step decision-making. Escalating simple automation into the heaviest governance tier ignores the risk-based distinction the question is testing.",
    },
    strategyNote: "The RPA inversion trap: exam options love to claim RPA 'relies on' or 'increases' human involvement, or to dress plain automation up as AI. Anchor on the definition — RPA mimics human steps to REDUCE intervention — and be suspicious of options that upgrade rule-based bots into learning systems.",
    trapType: "synonym-bait",
    bokRef: "Domain I, Competency A",
    source: "authored",
  },
  {
    id: "n-i-b-1",
    competencyId: "i-b",
    type: "best",
    difficulty: 3,
    stem: "A national bank assembles a review board for its consumer-lending models after a regulator questions whether the models disadvantage certain communities. The board already includes data scientists, compliance officers, in-house counsel and a risk manager, yet an internal audit finds the group keeps missing subtle problems — such as culturally loaded phrasing in adverse-action notices — until customers complain. Which addition to the board would BEST close this gap?",
    isMultiselect: false,
    options: [
      o("A", "Additional machine-learning engineers, so the models can be retrained more quickly whenever a confirmed problem surfaces.", false, 0),
      o("B", "Social-science experts such as psychologists, linguists and sociologists, who are positioned to surface non-obvious bias that the existing functions overlook.", true, 1),
      o("C", "An executive sponsor with budget authority, because governance initiatives stall without visible leadership support.", false, 2),
      o("D", "The model vendor's own assurance team, since it understands the system's design assumptions better than anyone else.", false, 3),
    ],
    correctExplanation: "The described failure is a detection gap: technically and legally skilled reviewers are missing culturally embedded bias. The BoK's answer is diversity of expertise — social experts like psychologists, linguists and sociologists bring exactly the perspective needed to surface non-obvious bias before customers are harmed.",
    whyWrong: {
      A: "More engineers speed up remediation after a problem is found, but the board's failure is in finding the problems at all. This answer fixes the wrong stage.",
      C: "Executive champions matter for momentum and funding, but a sponsor does not spot culturally loaded language. True in general, irrelevant to this gap.",
      D: "Asking the vendor to assure its own product creates a conflict of interest, and design knowledge is not the same as expertise in how language and culture encode bias.",
    },
    strategyNote: "When a scenario describes bias that a competent technical-and-legal team keeps missing, the BoK answer is diverse, cross-functional expertise — specifically social scientists. Watch for the true-but-irrelevant leadership or budget option that sounds responsible but does not answer the gap described.",
    trapType: "true-but-irrelevant",
    bokRef: "Domain I, Competency B",
    source: "authored",
  },
  {
    id: "n-i-b-2",
    competencyId: "i-b",
    type: "best",
    difficulty: 3,
    stem: "The chief privacy officer of a 12,000-employee retailer must stand up AI governance training after the company adopts a generative assistant used across store planning, marketing copy and HR inquiries. The CIO proposes an intensive certification course for the data science and IT teams only, arguing that 'the people who touch the models are the ones who create the risk.' What should the CPO recommend instead?",
    isMultiselect: false,
    options: [
      o("A", "Accept the CIO's plan, since concentrating training on technical staff puts scarce resources where model risk actually originates.", false, 0),
      o("B", "Train only the members of the new AI governance committee first, and let guidance cascade to other departments as concrete issues arise.", false, 1),
      o("C", "Deliver a comprehensive program to all stakeholders across the organization, covering AI terminology, strategy, governance and ethics.", true, 2),
      o("D", "Fold a short AI section into the existing annual security-awareness module, since employees are more likely to complete training they already receive.", false, 3),
    ],
    correctExplanation: "AI training and awareness must reach ALL stakeholders, not just a technical task force, and must span AI terminology, strategy, governance and ethics. Marketing writers, HR staff and store planners all use the assistant's outputs, so they all create and encounter risk — comprehensive, organization-wide training is the BoK answer.",
    whyWrong: {
      A: "Risk is not created only where models are built. Everyone who prompts the assistant or acts on its output can introduce harm, so an IT-only program leaves most of the risk surface untrained — the classic too-narrow answer.",
      B: "Waiting for issues to arise makes training reactive. Awareness has to precede incidents, and a committee-only audience repeats the same narrowness problem at a different level.",
      D: "A bolt-on module cannot cover the required breadth of terminology, strategy, governance and ethics, and it frames AI as a security topic rather than an organization-wide governance responsibility.",
    },
    strategyNote: "The training pattern: 'comprehensive and organization-wide, including ethics' beats any option that restricts the audience — whether to IT, to a committee, or to an existing compliance module. If an option narrows who gets trained, it is the trap.",
    trapType: "too-narrow",
    bokRef: "Domain I, Competency B",
    source: "authored",
  },
  {
    id: "n-i-b-3",
    competencyId: "i-b",
    type: "best",
    difficulty: 3,
    stem: "A multinational manufacturer with subsidiaries in healthcare devices, consumer goods and logistics is designing its first AI governance approach. Each subsidiary faces different regulators, different risk tolerances and different AI ambitions, and the parent company already operates mature enterprise risk-management and data-governance programs. The board asks the general counsel how AI governance should be organized. Which recommendation best reflects accepted practice?",
    isMultiselect: false,
    options: [
      o("A", "Create a brand-new, standalone AI governance function detached from existing programs, to signal that AI risk is being treated as a priority.", false, 0),
      o("B", "Centralize every AI decision at headquarters so that all subsidiaries follow one uniform rulebook regardless of local context.", false, 1),
      o("C", "Allow each subsidiary to govern its own AI independently, since local teams understand their own risks better than any central function.", false, 2),
      o("D", "Leverage and extend the existing governance models, using a hybrid structure in which subsidiaries evaluate local use cases within centrally coordinated policies.", true, 3),
    ],
    correctExplanation: "Governance should fit company size, maturity, industry and risk tolerance, and organizations should leverage EXISTING governance models rather than reinvent them. For a large multinational with divergent local contexts, the hybrid model — local evaluation under central coordination and policy — is the accepted fit.",
    whyWrong: {
      A: "Building from scratch when mature risk and data-governance programs already exist wastes resources and duplicates structures. The BoK explicitly favors adapting what already works.",
      B: "Full centralization ignores that governance must vary with local industry, regulation and risk tolerance. The absolute language — every decision, one rulebook, regardless of context — is the tell.",
      C: "Pure decentralization sacrifices consistency and coordinated policy, leaving the parent unable to manage enterprise-level AI risk. It is the opposite extreme of the same absolutist trap.",
    },
    strategyNote: "When two options sit at opposite extremes (centralize everything vs. free-for-all) and a third reinvents the wheel, the moderate option that leverages existing structures wins. Remember: hybrid governance suits large multinationals.",
    trapType: "absolute",
    bokRef: "Domain I, Competency B",
    source: "authored",
  },
  {
    id: "n-i-b-4",
    competencyId: "i-b",
    type: "role",
    difficulty: 3,
    stem: "A hospital network licenses a patient-triage model from a health-tech vendor, integrates it into its intake workflow, and has nurses act on its recommendations. The same hospital separately builds a small scheduling model in-house for its own clinics. During a governance review, the compliance director asks how the hospital's role should be recorded for the triage system. What is the most accurate answer?",
    isMultiselect: false,
    options: [
      o("A", "The hospital is the developer of the triage system, because the integration work required to embed it into the intake workflow counts as development.", false, 0),
      o("B", "The hospital acts as a deployer of the triage system — it operates a third-party system under its own authority — while separately holding a developer role for the scheduling model it built, since one organization can occupy several roles at once.", true, 1),
      o("C", "The hospital is solely an end user of the triage system, so governance responsibility for the system's behavior remains entirely with the vendor that built it.", false, 2),
      o("D", "Role labels such as developer, provider, deployer and user only matter to regulators, so the hospital does not need to assign itself any role in internal documentation.", false, 3),
    ],
    correctExplanation: "The BoK treats developer, provider, deployer and user as TASK labels with different responsibilities, opportunities and needs — and one organization often fills several roles at once. For the licensed triage model the hospital operates the system under its own authority, making it a deployer, while it is simultaneously a developer of its in-house scheduling model.",
    whyWrong: {
      A: "Configuring and integrating a purchased system is not developing it. Development means building the model; integration is part of deploying someone else's system.",
      C: "Deployers keep governance duties for how a system is operated, monitored and used on real patients. An organization cannot offload all responsibility onto its vendor by calling itself a mere user.",
      D: "The BoK uses these labels precisely so organizations can assign internal responsibilities. Dismissing them as regulator-only vocabulary defeats their governance purpose.",
    },
    strategyNote: "Developer, provider, deployer and user are task labels, not exclusive identities — one organization frequently holds several simultaneously. Distrust options that either promote integration work into 'development' or offload every duty onto the vendor.",
    trapType: "synonym-bait",
    bokRef: "Domain I, Competency B",
    source: "authored",
  },
  {
    id: "n-i-b-5",
    competencyId: "i-b",
    type: "best",
    difficulty: 3,
    stem: "A software company learns that an AI-powered lead-scoring feature embedded in its third-party marketing platform silently exposed inferred customer attributes for six weeks. When executives ask which customers must be notified, no team can even list which of the company's tools contain AI components, and no one can say who approved the feature or under what conditions. Which governance practice would MOST directly have prevented this scramble?",
    isMultiselect: false,
    options: [
      o("A", "Stricter encryption standards for all customer data stored by third-party vendors.", false, 0),
      o("B", "A policy prohibiting the purchase of any third-party product that contains AI functionality.", false, 1),
      o("C", "Maintaining a documented inventory of every third-party AI tool in use, together with recorded decisions about its approval and permitted use.", true, 2),
      o("D", "Waiting for the marketing platform vendor to complete its own investigation before assessing impact, since the vendor controls the system.", false, 3),
    ],
    correctExplanation: "The scramble has two causes the BoK addresses directly: the company never identified the third-party AI tools it uses, so it cannot determine which users are affected, and it never documented its decisions, so no one knows who approved what. A third-party AI inventory plus documented decisions limits misuse and liability and makes incident notification possible.",
    whyWrong: {
      A: "Encryption protects data at rest and in transit, but it would not tell the company which tools contain AI or which customers were touched by the exposure. It answers a different problem.",
      B: "An outright ban is not governance — it forfeits the benefits of third-party AI and still would not create the visibility the scenario demands for tools already in use.",
      D: "Passively waiting is the opposite of prevention. The company retains its own notification and accountability duties regardless of who controls the system.",
    },
    strategyNote: "When a scenario ends with 'we could not tell which users were affected' or 'no one knows who approved this,' the answer is the third-party tool inventory and documented decision-making. Security controls like encryption are the true-but-irrelevant bait.",
    trapType: "true-but-irrelevant",
    bokRef: "Domain I, Competency B",
    source: "authored",
  },
  {
    id: "n-i-c-1",
    competencyId: "i-c",
    type: "not",
    difficulty: 3,
    stem: "A media company's privacy counsel maintains a list of events that should trigger an immediate, out-of-cycle review of the privacy policy now that the business relies on AI. A new associate drafts four candidate triggers for the list. Which one is LEAST likely to require an immediate review, rather than simply being absorbed into the normal policy-update cadence?",
    isMultiselect: false,
    options: [
      o("A", "The analytics team embeds an AI recommendation engine into the company's existing subscriber-personalization program.", false, 0),
      o("B", "The company launches an entirely new AI-driven advertising product.", false, 1),
      o("C", "The company completes a routine internal reorganization that renames two departments but changes nothing about how data or AI systems are used.", true, 2),
      o("D", "A regulation takes effect in a market the company serves, imposing new obligations on AI-driven profiling.", false, 3),
    ],
    correctExplanation: "The recognized triggers for revisiting a privacy policy are: introducing AI into an existing program, launching a new AI program, and becoming subject to a new regulation. A marginal organizational change that alters nothing about data or AI use rides the normal update cadence — it does not force an immediate review.",
    whyWrong: {
      A: "Bringing AI into an existing program is one of the named triggers — the program's data practices change even though the program itself is not new.",
      B: "Launching a new AI program is a textbook trigger for an immediate policy review before the product goes live.",
      D: "Becoming subject to a new regulation is a named trigger; the policy must be checked against the new obligations without waiting for the annual cycle.",
    },
    strategyNote: "On NOT and LEAST questions, three options will cluster as genuine textbook facts and one will be the odd one out. Do not stop at the first option you recognize as true — here, being true is exactly what makes an option wrong.",
    trapType: "none",
    bokRef: "Domain I, Competency C",
    source: "authored",
  },
  {
    id: "n-i-c-2",
    competencyId: "i-c",
    type: "best",
    difficulty: 3,
    stem: "Before launching a customer-facing loan-assistance chatbot, a fintech's security engineer proposes a testing phase in which the team deliberately submits malicious prompts, malformed data and other adversarial inputs designed to make the bot misbehave. A product manager objects that 'intentionally attacking our own system is irresponsible and could teach it bad behavior.' How should the head of AI governance respond?",
    isMultiselect: false,
    options: [
      o("A", "Approve the plan: deliberately feeding malicious and adversarial inputs is part of responsible testing, because it verifies the system's robustness before real adversaries attempt the same thing.", true, 0),
      o("B", "Reject the plan: responsible-AI principles require that testing use only realistic, well-formed inputs that reflect the system's intended use.", false, 1),
      o("C", "Defer the adversarial testing until after deployment, when production traffic will show whether attacks actually occur in practice.", false, 2),
      o("D", "Limit pre-launch evaluation to accuracy on a clean holdout dataset, since accuracy is the measure stakeholders will scrutinize first.", false, 3),
    ],
    correctExplanation: "Responsible testing explicitly includes feeding malicious and adversarial inputs to test robustness. Probing your own system before launch is how you discover failure modes while they are still cheap to fix — it is a mark of responsibility, not a breach of it.",
    whyWrong: {
      B: "This inverts the principle. Testing only friendly, well-formed inputs leaves the system's behavior under attack completely unknown — the opposite of responsible practice.",
      C: "Waiting for production means real customers absorb the first attacks. Discovering vulnerabilities after deployment converts a testing exercise into an incident.",
      D: "Accuracy on clean data says nothing about robustness against hostile inputs. It is a necessary metric but far too narrow to stand alone as pre-launch evaluation.",
    },
    strategyNote: "Adversarial does not mean irresponsible. When an option frames deliberate stress-testing or attack simulation as unethical, it is an inversion trap — the BoK counts hostile-input testing as part of responsible testing, done BEFORE launch.",
    trapType: "absolute",
    bokRef: "Domain I, Competency C",
    source: "authored",
  },
  {
    id: "n-i-c-3",
    competencyId: "i-c",
    type: "best",
    difficulty: 3,
    stem: "A recruiting team uses a generative AI assistant to draft candidate outreach and to summarize why each shortlisted applicant was selected. A quality check finds that the assistant uses gendered slang when describing candidates for engineering roles, and that its shortlist rationales repeatedly cite attendance at a handful of elite universities in a single country as the decisive factor. A recruiter argues there is no issue because a human edits every message before it is sent. How should the AI governance team classify the finding?",
    isMultiselect: false,
    options: [
      o("A", "A tone-of-voice problem that should be routed to the brand and communications team for a style-guide update.", false, 0),
      o("B", "No violation, because human review of each message before sending removes any discriminatory effect the drafts might have had.", false, 1),
      o("C", "A violation of the organization's bias and discrimination policy for AI outputs, since the patterns could signal gender, age or ethnic discrimination and require remediation.", true, 2),
      o("D", "An intellectual-property exposure, because the assistant may be reproducing protected marketing language from the universities it favors.", false, 3),
    ],
    correctExplanation: "Gendered slang in role descriptions and systematic preference for elite, single-country schools are exactly the patterns an anti-bias policy for AI outputs exists to catch — they can signal gender, age or ethnic discrimination in hiring. The correct classification is a bias and discrimination policy violation that triggers remediation.",
    whyWrong: {
      A: "Framing discriminatory patterning as a style issue is the too-narrow trap. A style guide edits words; it does not correct a system that consistently favors one gender or one country's elite graduates.",
      B: "Editing individual messages does not cure the systematic pattern upstream: the shortlist rationales themselves encode who gets favored. Human review of outputs is not a cure-all for discriminatory patterning.",
      D: "Nothing in the scenario suggests copied protected text. This answer sorts the problem into the wrong risk bucket entirely.",
    },
    strategyNote: "Generative hiring outputs with gendered slang or elite-school, single-country favoritism map to the bias and discrimination policy. Watch two distractor moves: downgrading discrimination to 'tone,' and the 'a human reviews it' cure-all.",
    trapType: "too-narrow",
    bokRef: "Domain I, Competency C",
    source: "authored",
  },
];

export const topicsI: Topic[] = [
  // ─── I.A — What AI is and why it needs governance ───
  {
    id: "t-i-a-1",
    competencyId: "i-a",
    title: "What counts as AI: narrow vs. general",
    conceptMd:
      "**Artificial intelligence** describes machines performing tasks that normally require human intelligence — and every definition shares a few features: the system takes in its environment, makes decisions or predictions, and acts with some degree of **autonomy** and adaptability. **Narrow AI** is a system that does one task well, and every AI system in production today is narrow. **General AI (AGI)** would match human ability across many different tasks — it remains hypothetical. On the exam, famous systems like chess computers and chatbots should be classified as narrow AI, no matter how impressive they are at their single job.",
    exampleMd:
      "IBM's Deep Blue defeated the world chess champion in 1997, yet it could not read an X-ray, plan a route, or draft a sentence — it is narrow AI. A hospital's triage chatbot that only answers intake questions is also narrow AI. A single system that could play chess, diagnose the patient, AND write the discharge letter at human level would be general AI — and no such system exists.",
    questionIds: ["x-i-a-3", "x-i-a-4"],
    sort: 1,
  },
  {
    id: "t-i-a-2",
    competencyId: "i-a",
    title: "The four ways machines learn",
    conceptMd:
      "A **model** is the learned representation of patterns and relationships found in data — it is what training produces. Machine learning comes in four flavors:\n\n- **Supervised learning** trains on **labeled** data (examples that come with the correct answer attached) and then predicts the label for new cases.\n- **Unsupervised learning** gets **no labels** and instead finds hidden patterns or clusters on its own.\n- **Reinforcement learning** learns by trial and error, guided by **rewards and penalties**.\n- **Semi-supervised learning** mixes a small labeled set with a large unlabeled one.",
    exampleMd:
      "At Meridian Bank, analysts label past transactions as fraud or not-fraud, and a supervised model learns to flag new ones. The marketing team runs an unsupervised model over customer records and discovers spending clusters nobody had predefined. The logistics arm trains a routing agent that earns a reward for every on-time delivery — reinforcement learning. And the medical-imaging partner, with only a few hundred expert-labeled scans but millions of unlabeled ones, uses semi-supervised learning to stretch its scarce labels.",
    questionIds: ["x-i-a-1", "x-i-a-2"],
    sort: 2,
  },
  {
    id: "t-i-a-3",
    competencyId: "i-a",
    title: "Everyday model families: regression, classification, decision trees",
    conceptMd:
      "**Regression** models predict a **number** — a dollar amount, a temperature, a score. **Classification** models sort items into **categories**, like a spam filter deciding spam or not-spam. **Decision trees** reach an answer through a flowchart of yes/no questions, which makes them highly explainable — but small changes in the training data can reshuffle the whole tree, so they can be unstable. A related helper technique, **dimensionality reduction**, shrinks the number of variables in a dataset while keeping the meaningful signal.",
    exampleMd:
      "A credit union's mortgage team runs two models side by side: a regression model estimates the exact dollar loss if a loan defaults, while a classification model sorts each application into 'auto-approve' or 'refer to underwriter.' Their older decision-tree model is an auditor's favorite because you can trace every decision through its question path (Income above threshold? Employed two years?) — but after retraining on one new quarter of data, the tree's structure changed dramatically, which is exactly its known weakness.",
    questionIds: ["x-i-a-5", "x-i-a-9"],
    sort: 3,
  },
  {
    id: "t-i-a-4",
    competencyId: "i-a",
    title: "Neural networks, deep learning and multimodal models",
    conceptMd:
      "**Neural networks** stack layers of simple computing units that each transform the data a little; **deep learning** means many such layers, which brings power at the price of inspectability. **Convolutional neural networks (CNNs)** specialize in spatial patterns, which makes them the go-to architecture for image recognition. **Multimodal** models process more than one data type together — for example text plus the attached images or video — and are increasingly common. The broader family also includes **speech recognition** systems and **robotics**.",
    exampleMd:
      "An online marketplace's trust team uses a CNN to spot counterfeit product photos, because the giveaways are spatial — logos slightly off, stitching patterns wrong. Its newer multimodal model reads each listing's text AND its photos together, catching sellers whose description says 'genuine leather' while the image shows vinyl. When a flagged seller demands to know which of the model's layers decided against them, nobody can point to one — a preview of the black-box problem.",
    questionIds: ["x-i-a-7", "x-i-a-12"],
    sort: 4,
  },
  {
    id: "t-i-a-5",
    competencyId: "i-a",
    title: "NLP and the data that feeds AI",
    conceptMd:
      "**Natural language processing (NLP)** is the technique for analyzing free-form human text — notes, emails, transcripts — where the information does not sit in tidy rows and columns. Data itself comes in different shapes: **structured** data lives in tables, **unstructured** data includes free text and images, and **streaming** data arrives as a continuous real-time flow rather than a stored batch. Because AI is deeply **data-dependent**, choosing the right technique starts with recognizing what kind of data you actually have.",
    exampleMd:
      "St. Anne's Hospital wants to find patterns in doctors' free-form clinical notes — messy, unstructured text — so its analysts reach for NLP, not a spreadsheet model. Down the hall, the patient-flow team processes a live, continuously updating stream of check-in events to power a dynamic wait-time display; that real-time flow is streaming data, and it demands different plumbing than a monthly report ever would.",
    questionIds: ["x-i-a-10", "x-i-a-11"],
    sort: 5,
  },
  {
    id: "t-i-a-6",
    competencyId: "i-a",
    title: "Generative and agentic AI",
    conceptMd:
      "**Generative AI** creates new content — text, images, audio or video — rather than just scoring or sorting existing data. Teams often build it by **fine-tuning**: taking a large pretrained model and training it further on specialized data so it masters a narrow domain. **Agentic AI** goes a step beyond generation: it takes autonomous, multi-step actions toward a goal, chaining decisions together without a human directing each step. Generative systems can also **hallucinate** — produce confident, fluent output that is simply false — which is why both categories are explicitly in scope for governance.",
    exampleMd:
      "The law firm Calder & Wray fine-tunes a pretrained language model on thousands of its own contracts so it can review clauses like a specialist — that is generative AI built through fine-tuning. Its pilot 'research agent' goes further: given a question, it autonomously searches the document store, drafts a memo, and routes it for review — agentic AI. The pilot pauses the week an associate discovers the assistant cited a court case that does not exist: a hallucination, delivered in perfectly confident prose.",
    questionIds: ["x-i-a-13", "z-i-a-2"],
    sort: 6,
  },
  {
    id: "t-i-a-7",
    competencyId: "i-a",
    title: "RPA: automation that mimics, not learns",
    conceptMd:
      "**Robotic process automation (RPA)** is software that **mimics the repetitive steps a human performs** — logging into systems, copying fields, moving files — in order to automate tasks and **reduce human intervention**. It follows fixed, human-written rules: it does not learn from data, and it does not make probabilistic decisions the way a machine-learning model does. The exam sets two traps here: options claiming RPA exists to *rely on* humans (it exists to reduce their involvement), and options dressing RPA up as AI decision-making that needs full model governance.",
    exampleMd:
      "At Cobalt Insurance, overnight bots log into the legacy claims system, copy policyholder fields into the new platform, and flag badly formatted records — the exact keystrokes clerks used to perform. That is RPA: scripted mimicry that took humans OUT of a repetitive loop. Contrast it with Cobalt's fraud model, which learned patterns from labeled data and outputs a probability — a genuinely different kind of system that earns a different level of governance scrutiny.",
    questionIds: ["x-i-a-14", "n-i-a-1"],
    sort: 7,
  },
  {
    id: "t-i-a-8",
    competencyId: "i-a",
    title: "Why AI needs governing: the characteristics that make it different",
    conceptMd:
      "AI earns dedicated governance because of a cluster of traits ordinary software lacks: **complexity**, **opacity** (black-box systems whose reasoning cannot be inspected), **autonomy**, **speed and scale**, potential for harm and misuse, **data dependency**, and **probabilistic** outputs — AI gives likelihoods, not certainties. Data dependency has a famous consequence: **model drift**, where a deployed model's performance decays as the world it was trained on changes. Keep drift distinct from **overfitting**, where a model memorizes its training data and fails on new data from day one — overfitting is a *training* problem, drift is a *monitoring* problem.",
    exampleMd:
      "PayFlow's fraud model launched with excellent accuracy, but eighteen months later customer shopping habits had shifted and accuracy quietly sank — that is model drift, caught (or missed) in monitoring. Its sibling model had a different disease: it scored near-perfectly on training data yet flopped in its first week live, because it had memorized the past instead of learning general patterns — overfitting. Meanwhile, when a declined customer asked why, the five-layer network offered no inspectable answer at all: opacity, the black-box trait that makes governance non-optional.",
    questionIds: ["x-i-a-8", "q-i-a-3"],
    sort: 8,
  },
  {
    id: "t-i-a-9",
    competencyId: "i-a",
    title: "AI harms: who is hurt, and the privacy harms",
    conceptMd:
      "The exam classifies AI harms by **who** is affected, not by the technology involved:\n\n- **Individual** — one person (a denied loan, housing or insurance discrimination).\n- **Group** — a demographic or community (mass surveillance or facial recognition targeting an ethnic group).\n- **Organizational** — the company itself (reputational and economic damage, such as lost clients after inaccurate outputs).\n- **Societal** — society broadly (disinformation and deepfakes eroding trust; environmental harm).\n\nPrivacy harms are a classic species of individual harm: **inference** (the system derives sensitive traits a person never shared), **subjective** harm (the distress and chilled behavior of feeling watched), and **objective** harm (a concrete adverse consequence from how the data is used). A further framing is **acceleration** harm — AI advancing faster than safeguards can keep up.",
    exampleMd:
      "One city, four harms: the police AI scanning CCTV to flag members of one ethnic community inflicts a group harm. A lender's model inferring a resident's likely religion from her grocery purchases is an inference privacy harm to an individual — and if she starts avoiding certain shops out of unease, that is subjective harm; if her inferred profile raises her insurance premium, that is objective harm. The vendor whose inaccurate outputs make three corporate clients walk away suffers organizational harm. And the deepfake flood before the mayoral election, corroding everyone's trust in what they see, is societal harm.",
    questionIds: ["q-i-a-1", "x-i-a-15"],
    sort: 9,
  },
  {
    id: "t-i-a-10",
    competencyId: "i-a",
    title: "Responsible AI principles, transparency vs. explainability, and human-centered AI",
    conceptMd:
      "The common pillars of responsible AI are **fairness**, **safety and reliability**, **privacy and security**, **transparency and explainability**, **accountability**, and **human-centricity** — treat each as a lens you apply to a scenario. The most-tested distinction lives inside one pillar: **transparency** is about disclosing *what happened* — that AI is in use and how the system operates — while **explainability** is about *why* a specific decision came out the way it did; they are distinct and mutually supporting, never synonyms. **Human-centered AI (HCAI)** puts people before machines: it **augments** humans rather than displacing them and preserves **human control** (while **human-centered design** means involving users and iterating on their feedback). Under the privacy pillar, **differential privacy** adds statistical noise so individual records stay private while group-level trends remain usable.",
    exampleMd:
      "Northgate Bank publishes that AI screens loan applications and describes how the system works — that is transparency. Telling Sara which specific factors drove the denial of HER application — that is explainability, and claiming one delivers the other is the exam's favorite bait. The same bank designs its underwriting AI to draft recommendations that human officers can override, augmenting staff instead of replacing them (human-centered AI), and its analytics team releases neighborhood lending trends with statistical noise added so no individual borrower can be re-identified (differential privacy).",
    questionIds: ["q-i-a-2", "x-i-b-2"],
    sort: 10,
  },

  // ─── I.B — Organizational expectations for AI governance ───
  {
    id: "t-i-b-1",
    competencyId: "i-b",
    title: "Who must be at the table: core governance stakeholders",
    conceptMd:
      "AI governance starts by defining **roles and responsibilities** for every stakeholder involved. Two groups are **core and always needed**: **privacy experts and security experts** — no program stands up correctly without them from day one. Accountability cannot be poured into a single 'AI owner' either: governance is inherently a team effort spanning legal, ethics, technology, risk and compliance. Finally, seek out executive **champions who treat responsible AI as a differentiator** — a source of trust and advantage — rather than a compliance cost.",
    exampleMd:
      "When Harbor Mutual, a 4,000-person insurer, kicks off its AI governance program, the CPO and CISO are in the very first meeting — privacy and security are core stakeholders, not later invitees. The CEO's suggestion to appoint one 'AI czar' so 'governance doesn't slow the teams down' gets rebuffed: the general counsel explains that a lone owner cannot carry accountability for risks that cut across legal, security, ethics and engineering, and the board instead backs a cross-functional committee sponsored by an executive who pitches responsible AI to customers as a selling point.",
    questionIds: ["q-i-b-1", "z-i-b-1"],
    sort: 1,
  },
  {
    id: "t-i-b-2",
    competencyId: "i-b",
    title: "Diverse, cross-functional expertise — including social scientists",
    conceptMd:
      "**Cross-functional collaboration** makes governance both more effective and more perceptive, because each discipline sees risks the others miss. The exam's favorite version of this point: bring in **social experts** — psychologists, linguists, sociologists — because they surface **non-obvious bias** that purely technical and legal reviewers overlook. A diverse governance body is itself an ethical-risk control, not a nice-to-have.",
    exampleMd:
      "Meridian Bank's model review board — data scientists, lawyers, compliance, risk — keeps missing subtle problems in its lending program until customers complain. The turning point comes when a sociolinguist joins the board and immediately flags culturally loaded phrasing in the adverse-action letters and a pattern in which applicants from certain neighborhoods are described in subtly different terms. None of the technical metrics had caught it; a different kind of expertise did.",
    questionIds: ["x-i-b-1", "n-i-b-1"],
    sort: 2,
  },
  {
    id: "t-i-b-3",
    competencyId: "i-b",
    title: "Training and awareness: everyone, not just IT",
    conceptMd:
      "AI training and awareness must reach **all stakeholders across the organization** — not just a technical task force — and must cover **AI terminology, strategy, governance and ethics**. On the exam, any option that restricts training to the data science team, the IT department, or a small committee is the too-narrow trap: risk is created everywhere AI outputs are used, so awareness has to live everywhere too.",
    exampleMd:
      "After Brightline Retail rolls out a generative assistant used by store planners, marketers and HR alike, the CIO proposes an intensive certification course for the data and IT teams only. The CPO overrules it: the HR coordinator pasting candidate data into prompts and the marketer publishing AI-drafted copy create just as much risk as the engineers. The program that ships is organization-wide and covers what AI is, how the company intends to use it, the governance rules, and the ethical lines nobody may cross.",
    questionIds: ["n-i-b-2"],
    sort: 3,
  },
  {
    id: "t-i-b-4",
    competencyId: "i-b",
    title: "Right-sizing governance: size, risk tolerance and existing models",
    conceptMd:
      "There is no one-size-fits-all governance design: the right approach depends on **company size, maturity, industry, products and services, objectives, and risk tolerance**. Organizations should **leverage the governance models they already have** — enterprise risk management, data governance — rather than reinventing from scratch. Two reference designs bookend the choice: **centralized** governance keeps all decisions at headquarters, while **hybrid** governance lets local units evaluate their own use cases under centrally coordinated policy — the fit for large multinationals.",
    exampleMd:
      "Vantora Manufacturing operates healthcare-device, consumer-goods and logistics subsidiaries, each with different regulators and appetites for risk. Instead of building a standalone AI bureaucracy, its general counsel extends the existing enterprise risk framework: headquarters sets common AI policy and coordination, while each subsidiary evaluates its own use cases against local rules — a hybrid design. A 40-person startup down the road, with one product and high risk tolerance, rightly runs something far lighter; both are correct for who they are.",
    questionIds: ["n-i-b-3"],
    sort: 4,
  },
  {
    id: "t-i-b-5",
    competencyId: "i-b",
    title: "Developer, provider, deployer, user: know your role",
    conceptMd:
      "The BoK distinguishes four AI roles because their **responsibilities, opportunities and needs differ**: the **developer** builds the system, the **provider** makes it available to others, the **deployer** operates it under its own authority, and the **user** consumes its outputs. Crucially, these are **task labels, not identities** — one organization very often fills several roles at once, and governance duties attach to each role it holds. The trap options either promote integration work into 'development' or let a deployer offload all responsibility onto its vendor.",
    exampleMd:
      "Caldwell Health licenses a patient-triage model from a health-tech vendor and runs it inside its intake workflow — for that system, Caldwell is the deployer and its nurses are users, while the vendor is the developer and provider. But Caldwell also built its own clinic-scheduling model in-house, so for THAT system it is the developer too. One hospital, three roles — and its governance register records different responsibilities for each.",
    questionIds: ["n-i-b-4"],
    sort: 5,
  },
  {
    id: "t-i-b-6",
    competencyId: "i-b",
    title: "Creating the structure vs. implementing it (the classic trap)",
    conceptMd:
      "Creating an AI governance **structure** consists of exactly three moves: **(1)** determine whether a governance structure already exists in the organization, **(2)** name an **executive champion**, and **(3)** decide **who will maintain and implement** the structure. Activities like **identifying applicable laws** or **establishing data lineage** belong to **implementation** — they happen inside the structure once it exists. The exam loves to slip an implementation task into a list of structure-creation steps and ask which one does not belong.",
    exampleMd:
      "Priya, the privacy leader at Solara Corp, is chartered to CREATE the company's AI governance structure. Her kickoff plan has three items: check whether the existing data-governance council can be extended, recruit the COO as executive champion, and assign ongoing ownership to the risk office. When a colleague insists the kickoff must also map every applicable AI law and build data lineage for all models, Priya moves those to the implementation roadmap — real work, wrong phase, and exactly the distinction the exam tests.",
    questionIds: ["q-i-b-2"],
    sort: 6,
  },
  {
    id: "t-i-b-7",
    competencyId: "i-b",
    title: "Write it down: decisions and the third-party AI inventory",
    conceptMd:
      "Two documentation habits carry outsized exam weight. First, **document governance decisions** — who approved what, when, and under which conditions — because a written record **limits misuse and limits liability**. Second, **identify and inventory every third-party AI tool** the organization uses, because when an incident strikes, the inventory is what lets you determine — and notify — the affected users. An organization that cannot list its AI tools cannot govern them.",
    exampleMd:
      "When an AI lead-scoring feature buried inside Nexa Software's third-party marketing platform leaks inferred customer attributes, the executives' first question is 'which customers do we notify?' — and nobody can answer, because no inventory of AI-bearing tools exists and no record shows who approved the feature. The post-incident fix is exactly what governance should have built up front: a documented register of every third-party AI component, joined to recorded approval decisions and permitted-use conditions.",
    questionIds: ["n-i-b-5"],
    sort: 7,
  },

  // ─── I.C — Policies and procedures across the AI life cycle ───
  {
    id: "t-i-c-1",
    competencyId: "i-c",
    title: "Policies that span the whole AI lifecycle",
    conceptMd:
      "AI policy cannot cover just one moment; it must span the full lifecycle: **use-case assessment → risk management → ethics by design → data acquisition and use → model and system development → training and testing → deployment and monitoring → documentation and reporting → incident management**. For a new AI initiative, the planning sequence also has a tested order: start from the **business problem**, define the **use case**, map the **applicable laws**, assess **gaps and risks**, and only then turn to the **data**. Jumping straight to data or development is the classic out-of-order mistake.",
    exampleMd:
      "Lumen Apps wants to add a generative writing feature to its product. The product lead's sequence follows the book: articulate the business problem the feature solves, pin down the concrete use case, map which laws apply to it, assess the gaps and risks that emerge, and then — last — source and prepare the data. Her counterpart at a rival firm started by scraping training data first and is now retrofitting legal analysis onto a dataset the lawyers say they cannot use.",
    questionIds: ["z-i-c-2"],
    sort: 1,
  },
  {
    id: "t-i-c-2",
    competencyId: "i-c",
    title: "Updating existing policies for AI: the triggers",
    conceptMd:
      "You rarely write AI policy on a blank page — you **update the policies you already have**: data privacy, security, data governance, and **intellectual property**. Three events trigger an immediate, out-of-cycle review of the privacy policy: **introducing AI into an existing program**, **launching a new AI program**, and **becoming subject to a new regulation**. A *marginal* organizational change — one that does not alter how data or AI is used — simply rides the normal update cadence.",
    exampleMd:
      "Fernway Retail has used AI for product-copy generation for a year. When the HR director proposes an AI tool to screen job applicants, that is a NEW AI program — the privacy policy gets reviewed before launch, not after. The same quarter, Fernway renames two departments in a reorg that changes nothing about data flows; counsel logs it for the annual refresh and moves on, because a marginal change is not a trigger.",
    questionIds: ["q-i-c-1", "n-i-c-1"],
    sort: 2,
  },
  {
    id: "t-i-c-3",
    competencyId: "i-c",
    title: "Proportionality: put resources where the risk is",
    conceptMd:
      "Governance resources are finite, so they must be allocated **in proportion to risk**: the use cases carrying the highest risk get the deepest review, the strongest mitigations, and the first claim on budget and expert time. Spreading effort evenly across every project — or deferring the hard case because it is expensive — are both wrong answers. Risk-based prioritization is what lets a resource-constrained organization stay both responsible and productive.",
    exampleMd:
      "Atlas Analytics has one governance team and five AI initiatives. Its assessment flags the automated hiring screener as high privacy risk, while the internal document-search bot barely registers. The team gives the hiring tool the full treatment — deep assessment, bias testing, legal review — and applies a proportionate, lighter touch to the search bot. Splitting attention equally five ways would have starved the one project that could actually hurt people.",
    questionIds: ["q-i-c-2", "x-i-c-1"],
    sort: 3,
  },
  {
    id: "t-i-c-4",
    competencyId: "i-c",
    title: "Third-party and supply-chain risk in procurement",
    conceptMd:
      "AI risk does not stop at the company's walls: policy must reach the **supply chain**. That means **procurement and contract clauses** specific to AI, updated **HR policies**, and **acceptable-use** rules for the AI embedded in vendor products — with third-party risk **assessed and documented**, not assumed away. When the exam asks which clause set is most specific to AI third-party risk, generic confidentiality or uptime language is the decoy; the answer targets the AI behavior itself.",
    exampleMd:
      "Orchid Group's legal team overhauls its procurement template before renewing a vendor whose HR platform quietly gained AI features. The new clause set is AI-specific: what data the vendor's models may train on, required notice when AI functionality changes, testing and performance evidence, and acceptable-use limits for Orchid staff. The old template's confidentiality and service-level boilerplate — fine clauses, wrong tool — would have said nothing about any of it.",
    questionIds: ["z-i-c-1"],
    sort: 4,
  },
  {
    id: "t-i-c-5",
    competencyId: "i-c",
    title: "Responsible testing includes attacking your own system",
    conceptMd:
      "**Responsible testing** is not limited to friendly inputs: it explicitly includes feeding the system **malicious and adversarial inputs** to prove its robustness before real adversaries try the same tricks. Testing only clean, well-formed data measures accuracy but leaves behavior-under-attack completely unknown. Deliberate hostile testing before launch is a mark of responsibility — the exam trap is the option that frames it as unethical or defers it to production.",
    exampleMd:
      "Before Karst Financial launches its loan-assistance chatbot, its security engineer spends two weeks trying to break it: malicious prompts, malformed inputs, attempts to extract other customers' data. A product manager protests that 'attacking our own bot is irresponsible.' The governance head approves the testing anyway — and the team finds and fixes a prompt pattern that leaked account details. The alternative was letting a real attacker find it in production.",
    questionIds: ["n-i-c-2"],
    sort: 5,
  },
  {
    id: "t-i-c-6",
    competencyId: "i-c",
    title: "Innovation and governance are not enemies",
    conceptMd:
      "A culture of innovation **without oversight** is how organizations end up with biased models and privacy breaches — the governance components of **oversight, risk management and compliance are not optional extras** to be added after the fun part. The balanced answer on the exam is never 'pause all innovation' and never 'ship first, govern later': it is innovating *inside* guardrails, with review gates proportionate to risk, so speed and safety reinforce rather than fight each other.",
    exampleMd:
      "Two startups build AI hiring tools. Juno ships in eight weeks with no review — 'governance would slow us down' — and spends the next year managing a discrimination complaint and rebuilding customer trust. Its competitor Selene embeds a lightweight use-case review and bias check into each sprint, launches only three weeks later, and turns its responsible process into a sales asset with enterprise buyers. Selene did not choose between innovation and governance; it fused them.",
    questionIds: ["x-i-c-2"],
    sort: 6,
  },
  {
    id: "t-i-c-7",
    competencyId: "i-c",
    title: "Policing bias and discrimination in AI outputs",
    conceptMd:
      "Organizations need a policy that catches **bias and discrimination in what the AI actually produces** — not just in its training data. The tested example: a generative hiring assistant that uses **gendered slang** or consistently favors graduates of **elite universities from a single country** is violating the anti-bias policy, because those patterns can signal gender, age or ethnic discrimination. Note the cure-all trap: a human editing individual outputs does not fix a systematic discriminatory pattern upstream.",
    exampleMd:
      "Halcyon Corp's recruiters use a generative assistant to draft outreach and summarize why candidates made the shortlist. A quality review finds gendered slang in descriptions of engineering candidates and shortlist rationales that lean hard on a handful of elite US universities. A recruiter shrugs — 'a human edits every message anyway' — but the governance team classifies it as an output-bias policy violation: the discriminatory pattern lives in who gets favored and how they are described, and editing prose one message at a time will never remediate that.",
    questionIds: ["n-i-c-3"],
    sort: 7,
  },
];
