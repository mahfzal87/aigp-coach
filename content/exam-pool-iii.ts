import type { Question } from "@/lib/types";

// Hard exam pool — Domain III. Original items; reserved primarily for mock exam clusters.
function o(label: string, text: string, isCorrect = false, sort = 0) {
  return { label, text, isCorrect, sort };
}

const raw: Array<{
  id: string; c: string; type: Question["type"]; d: 1 | 2 | 3; stem: string;
  opts: [string, boolean][]; why: string; wrong?: Record<string, string>;
  strat?: string; trap?: Question["trapType"]; bok: string; multi?: boolean;
}> = [
  {
    id: "e-iii-1", c: "iii-a", type: "ordering", d: 3,
    stem: "Freightline Nordic, a rail-freight operator, is at the very start of planning an AI dispatch-optimization initiative. The program lead lists five planning tasks on the whiteboard: define the governance structure for the initiative; assess the quality and availability of candidate data; determine the business problem; define the scope of the problem; and identify the key use cases. Which option sequences the planning tasks correctly?",
    opts: [
      ["Define the governance structure; determine the business problem; identify the key use cases; define the scope of the problem; assess data quality and availability", false],
      ["Determine the business problem; identify the key use cases; define the scope of the problem; assess data quality and availability; define the governance structure", true],
      ["Determine the business problem; define the scope of the problem; identify the key use cases; define the governance structure; assess data quality and availability", false],
      ["Assess data quality and availability; determine the business problem; identify the key use cases; define the scope of the problem; define the governance structure", false],
    ],
    why: "The planning order runs business-understanding first: determine the business problem, identify the key use cases, define the scope of the problem, then assess data quality and availability, and only then define the governance structure for the initiative. Use cases give scope its content, scope tells you what data to assess, and the governance structure is sized to what the assessed initiative actually is.",
    wrong: {
      A: "Governance-first is the seductive wrong answer — 'integrate governance early' does not mean you can design a structure before you know the problem, use cases, scope, or data realities it must govern.",
      C: "Scope cannot precede use cases: the use cases are what define the boundaries of the problem. It also slots governance before the data assessment, inverting the final two steps.",
      D: "Data-first is the classic planning error. Assessing data before the business problem is defined means you cannot know what 'quality' or 'availability' even mean for this initiative."
    },
    strat: "For ordering items, write your own sequence before reading options: business before technical, and structural decisions after you know what they must structure. Then match.",
    trap: "premature", bok: "Domain III, Competency A"
  },
  {
    id: "e-iii-2", c: "iii-a", type: "best", d: 3,
    stem: "Aerovia's AI governance committee has finished scoring the potential harms of a proposed crew-scheduling model on a probability-and-severity matrix, producing a ranked register of twelve risks. The committee chair now asks which tool the team should apply NEXT so that the organization decides, risk by risk, how it will respond to the top of the register. Which tool fits the ask?",
    opts: [
      ["Re-score the register using a more granular probability scale before taking any action", false],
      ["A risk-mitigation hierarchy that works through avoidance, reduction, transfer, and acceptance for each ranked risk", true],
      ["A stakeholder map identifying which groups each of the twelve risks would affect", false],
      ["Benchmarking the scheduling model against competitor tools on the same risk dimensions", false],
    ],
    why: "The harms matrix quantifies and ranks; the risk-mitigation hierarchy is its companion tool that converts the ranking into a response decision — avoid, reduce, transfer, or accept — for each risk. The chair's ask ('decide how we respond') is precisely the hierarchy's job, not more analysis.",
    wrong: {
      A: "Premature precision: re-scoring sharpens a ranking the team already trusts enough to act on, and defers the actual governance decision. Analysis loops are not risk responses.",
      C: "Stakeholder mapping is an identification-stage input that feeds the matrix; it tells you who is affected, not what the organization will do about a ranked risk.",
      D: "Benchmarking compares performance against peers. It is a legitimate planning tool but answers a different question than how to respond to already-ranked harms."
    },
    strat: "Map each risk tool to its one job: matrix ranks, hierarchy chooses the response, stakeholder map identifies who is affected. The operative word in the stem is 'respond'.",
    trap: "synonym-bait", bok: "Domain III, Competency A"
  },
  {
    id: "e-iii-3", c: "iii-a", type: "best", d: 3,
    stem: "Clarivale Health is designing the human-oversight layer for an AI that triages dermatology photos by urgency. In a design-phase trial, reviewing clinicians agreed with the AI's suggested priority in 98% of cases — including the cases the test team had deliberately seeded with known errors. The design board halts the build and demands a revision to the oversight design itself. Which revision BEST addresses the observed failure?",
    opts: [
      ["Require each clinician to record their own provisional priority rating before the AI's suggestion is revealed to them", true],
      ["Add a second clinician who reviews the AI's suggestion after the first clinician has signed off", false],
      ["Retrain the model until seeded errors are no longer detectable in trials, removing the source of disagreement", false],
      ["Deliver annual training to clinicians on the dangers of over-relying on automated recommendations", false],
    ],
    why: "Clinicians ratifying seeded errors is automation bias. The structural fix is to capture independent human judgment before exposure to the machine's output, so review becomes evaluation rather than ratification. That is an oversight-by-design operational control, which is what the design phase is for.",
    wrong: {
      B: "Stacking a second anchored reviewer multiplies the same failure: both see the AI's answer first, so both are ratifying, not independently judging.",
      C: "Chasing a model that never errs is premature precision — and it dissolves the very rationale for human oversight, which exists because residual error is assumed.",
      D: "Awareness training is the weakest control: it asks people to resist anchoring without changing the decision pathway that produces the anchoring."
    },
    strat: "When a stem shows humans agreeing with a machine at implausible rates, the tested concept is automation bias — and the exam rewards the structural control over the educational one.",
    trap: "too-narrow", bok: "Domain III, Competency A"
  },
  {
    id: "e-iii-4", c: "iii-a", type: "not", d: 3,
    stem: "Voltana, an energy utility, is documenting the impact assessment for an AI that predicts household energy hardship and flags accounts for payment-support outreach. Under pressure to shorten the record before the design review, the team debates what can safely be dropped. Which element is LEAST necessary to the impact-assessment documentation?",
    opts: [
      ["The concerns raised by consumer-advocacy groups during the consultation round", false],
      ["The demographic profile of the households expected to be scored by the system", false],
      ["Details of the training algorithm and the reasoning behind its selection", false],
      ["The committed budget and channel plan for marketing the payment-support program", true],
    ],
    why: "Impact-assessment documentation should capture stakeholder inputs and concerns, the demographics of expected users (gathered at planning so bias can be caught early), and training-algorithm details. A marketing budget is genuine business-planning material — true and useful elsewhere, but it does nothing for the assessment's purpose of locating and mitigating risk.",
    wrong: {
      A: "Tempting to cut as 'external noise', but stakeholder concerns are a core documented input — dropping them guts the assessment's claim to have considered affected parties.",
      B: "Teams often want to exclude demographics on privacy instinct, but expected-user demographics are precisely what lets the assessment detect disparate-impact risk before build.",
      C: "Algorithm detail feels like engineering trivia, but it supports transparency, reproducibility, and the compliance record of why this approach was chosen."
    },
    strat: "In LEAST/NOT items where every option sounds defensible to cut, keep the ones that serve the artifact's purpose (finding risk) and eject the one serving a different purpose (selling the program).",
    trap: "true-but-irrelevant", bok: "Domain III, Competency A"
  },
  {
    id: "e-iii-5", c: "iii-a", type: "best", d: 3, multi: true,
    stem: "A university is at the design phase of an AI admissions-support tool. The governance office is sorting a backlog of proposed actions into 'now' versus 'later life-cycle stage'. Which THREE of the following belong in the design phase? Select THREE.",
    opts: [
      ["Document the system's intended purpose and the specific uses the institution has approved", true],
      ["Map stakeholders — including applicants who will never see the interface — and score potential harms by probability and severity", true],
      ["Write human-oversight requirements, including decision thresholds that trigger review by an admissions officer", true],
      ["Run inference testing to confirm the system's accuracy on live applicant traffic", false],
      ["Complete the readiness assessment and finalize the model card for release sign-off", false],
    ],
    why: "Design-phase governance means defining purpose and approved uses, identifying stakeholders and quantifying harms, and building human oversight into the requirements. All three are by-design activities that must exist before anything is built around them.",
    wrong: {
      D: "Right concept, wrong phase: inference testing measures real-world accuracy in production, so it can only happen after deployment — not at design.",
      E: "Readiness assessment and model-card finalization sit after development and before deployment. Proposing them at design is premature: there is nothing yet to assess for release."
    },
    strat: "Multi-selects about phases are five independent true/false calls: tag each option with its life-cycle stage first, then select. 'Real but later' is the standard false.",
    trap: "premature", bok: "Domain III, Competency A"
  },
  {
    id: "e-iii-6", c: "iii-a", type: "best", d: 3,
    stem: "Harborstone Mortgage has finished developing an AI underwriting assistant. Benchmark results beat the incumbent process on every metric, but the governance board says it will not take a release decision until it sees evidence of how the tool performs in the hands of real underwriters on realistic cases. Which risk-management tool directly answers the board's question?",
    opts: [
      ["A post-market monitoring plan covering the system's first year of operation", false],
      ["A pre-deployment pilot run with a limited group of underwriters under controlled conditions", true],
      ["Inference testing of the model against cases flowing through the production environment", false],
      ["A further round of benchmarking against industry-standard underwriting datasets", false],
    ],
    why: "A pre-deployment pilot is the controlled, limited, real-user trial run before the go/no-go decision — exactly the evidence the board is demanding. It is distinct from monitoring and inference testing (both post-deployment) and from benchmarking (comparative and offline, with no users in the loop).",
    wrong: {
      A: "A monitoring plan is mandatory, but it generates evidence only after release — it cannot inform a decision about whether to release.",
      C: "Inference testing validates production accuracy after deployment; the option quietly asks you to run a post-deployment stage before the system is deployed, which is a contradiction.",
      D: "The board already has benchmarks; more of them adds comparison, not the real-user evidence that was explicitly requested."
    },
    strat: "Anchor each testing term to its position in the life cycle. When a stem says 'before the release decision' and 'real users', only the pilot satisfies both conditions at once.",
    trap: "synonym-bait", bok: "Domain III, Competency A"
  },
  {
    id: "e-iii-7", c: "iii-a", type: "best", d: 3,
    stem: "Tellaro, a telecom, built a churn-prediction model with a documented approved use: ranking which customers receive retention offers. Months later, a routine governance review discovers the collections department has been using the same scores to decide which indebted customers get the most aggressive call schedules. Nothing about the model or its data has changed. What is the BEST response?",
    opts: [
      ["Update the model card so that collections scoring appears among the listed uses", false],
      ["Treat collections scoring as a new use case: check it against the documented approved uses and require a fresh risk and impact assessment before the practice continues", true],
      ["Permit the practice, since the model, its training data, and its performance are all unchanged", false],
      ["Retire the model so that no further unapproved uses can emerge from it", false],
    ],
    why: "Documenting approved uses exists precisely to catch scope creep. A materially different use — retention offers versus collections pressure — changes the affected people, the harms, and potentially the legal exposure, so it must be assessed as a new use case before it is allowed to continue.",
    wrong: {
      A: "Premature: updating the card merely records the creep as if it had been approved. Documentation follows assessment and approval; it does not substitute for them.",
      C: "Risk lives in the use context, not only in the artifact. An unchanged model applied to a harsher decision is a changed risk profile.",
      D: "Avoidance without assessment destroys legitimate value and leaves the actual control gap — unmonitored reuse — unfixed for every other model."
    },
    strat: "When a stem shows a system used beyond its documented purpose, the rewarded answer re-runs assessment for the new use. Options that only update paperwork or only destroy the asset bracket the right one.",
    trap: "premature", bok: "Domain III, Competency A"
  },
  {
    id: "e-iii-8", c: "iii-a", type: "not", d: 2,
    stem: "Fabrikk is specifying human-oversight mechanisms for a factory cobot's vision-guidance AI during the design phase. Which of the following is NOT an oversight-by-design operational control?",
    opts: [
      ["An operator-accessible override that immediately halts autonomous motion", false],
      ["Confidence thresholds below which the system stops and requests human confirmation before acting", false],
      ["A feedback channel through which line workers report anomalous behavior into the governance process", false],
      ["An annual third-party audit of the deployed system's compliance with company policy", true],
    ],
    why: "Overrides, metric thresholds that force escalation, and stakeholder feedback channels are the canonical oversight-by-design controls: they operate inside the running system. An annual audit is periodic external assurance performed on the deployed system — valuable, but it is not a control designed into the system's operation.",
    wrong: {
      A: "A human override is the archetypal operational control: it gives the human real-time authority over the machine's action.",
      B: "Threshold-triggered escalation is oversight engineered into the decision logic itself — exactly what 'by design' means.",
      C: "Stakeholder feedback mechanisms are a named component of designing human oversight; they route field observations back into governance."
    },
    strat: "Sort options by where they live: inside the operating system (controls) versus around it on a calendar (assurance). NOT items love to plant one calendar activity among three controls.",
    trap: "true-but-irrelevant", bok: "Domain III, Competency A"
  },
  {
    id: "e-iii-9", c: "iii-a", type: "role", d: 3,
    stem: "The City of Brandt, an EU public body, is planning to deploy a purchased high-risk AI system that scores welfare-benefit eligibility. The vendor has supplied its EU declaration of conformity and full technical documentation, and the city's CTO concludes that 'the compliance work is covered.' Before go-live, what does the city's governance planning still require?",
    opts: [
      ["A fundamental rights impact assessment conducted by the city as deployer — plus a DPIA where GDPR requires one — because the vendor's conformity assessment does not discharge deployer duties", true],
      ["Nothing further: the provider's conformity assessment transfers compliance responsibility for the system's use to the vendor", false],
      ["Only a DPIA, since the fundamental rights impact assessment is an obligation that sits with the provider rather than the deployer", false],
      ["A new conformity assessment performed by the city itself, since putting the system into service makes the city the provider", false],
    ],
    why: "The FRIA is a deployer duty that applies to public bodies deploying high-risk systems, and it sits alongside any GDPR-required DPIA. Conformity assessment is the provider's pre-market obligation; it proves the product could be placed on the market, not that this deployer's use respects fundamental rights.",
    wrong: {
      B: "Role-shift error: provider paperwork never absorbs deployer obligations. Each actor's duties attach to its role.",
      C: "Inverts the FRIA's addressee. The FRIA is defined as a deployer-side assessment (public bodies and certain private deployers), not a provider document.",
      D: "Merely using a purchased system under the provider's name, without rebranding or substantial modification, does not flip the deployer into a provider."
    },
    strat: "Decide who built-and-placed versus who uses before reading obligations. Then remember the assessment pairing: conformity = provider, FRIA = deployer (public body), DPIA = controller.",
    trap: "synonym-bait", bok: "Domain III, Competency A"
  },
  {
    id: "e-iii-10", c: "iii-a", type: "best", d: 2,
    stem: "Silvergate Care is designing a fall-detection AI for its care homes. Residents with dementia will never operate the interface, yet they bear the consequences of missed falls and false alarms. Which design-phase exercise is BEST suited to surfacing their interests?",
    opts: [
      ["User-acceptance testing with the nursing staff who will operate the monitoring dashboard", false],
      ["Stakeholder mapping that deliberately includes indirectly affected groups and the harms they could bear", true],
      ["A probability-and-severity harms matrix applied to the project's risk register", false],
      ["Benchmarking the system's sensor accuracy against competing fall-detection products", false],
    ],
    why: "Stakeholder mapping is the exercise whose job is to identify everyone affected — including people who never touch the system — so their interests and potential harms enter the design record. The residents are classic indirectly affected stakeholders.",
    wrong: {
      A: "User-acceptance testing reaches operators only; the stem's whole point is that the most affected people are not users.",
      C: "Close runner-up, but the matrix scores harms that have already been identified. Without mapping first, the residents' harms never reach the matrix.",
      D: "Benchmarking measures performance against competitors; it says nothing about whose interests are at stake."
    },
    strat: "Watch for stems that separate 'users' from 'affected people'. The identification tool (mapping) must precede the quantification tool (matrix) — a sequencing distinction the options exploit.",
    trap: "too-narrow", bok: "Domain III, Competency A"
  },
  {
    id: "e-iii-11", c: "iii-b", type: "distinction", d: 3,
    stem: "During a pre-training review of Granary Analytics' commodity-pricing dataset, the audit team asks two questions. Question 1: \"For each record, where did it originate, who collected it, and under what authority?\" Question 2: \"What happened to it — the cleaning, joins, and aggregations — between the original source and the final training table?\" Which pairing matches each question to the data-governance concept it probes?",
    opts: [
      ["Question 1 probes lineage; Question 2 probes provenance", false],
      ["Question 1 probes provenance; Question 2 probes lineage", true],
      ["Both questions probe lineage; provenance applies only to the outputs of generative models", false],
      ["Question 1 probes data quality; Question 2 probes data integrity", false],
    ],
    why: "Provenance is about origin: source, custody, and the authority under which data was collected. Lineage is about the path: tracking data from its source through every transformation into the model. Question 1 is origin; Question 2 is the transformation path.",
    wrong: {
      A: "Exact swap — the trap for anyone who knows both words but not which is which.",
      C: "Invents a false limiter: provenance is a general data-governance concept, not something reserved for generative outputs.",
      D: "Synonym drift into a different axis: quality (accuracy, fit) and integrity (uncorrupted, consistent) are properties of data, not answers to 'where from' and 'what happened to it'."
    },
    strat: "When two near-neighbor terms both appear in the options, the question IS the distinction. Anchor each to one word: provenance = origin, lineage = path.",
    trap: "synonym-bait", bok: "Domain III, Competency B"
  },
  {
    id: "e-iii-12", c: "iii-b", type: "best", d: 3,
    stem: "LexTerra is assembling fine-tuning data for a legal-drafting assistant from three sources: a commercially licensed case-summary corpus, publicly accessible forum posts gathered by a scraper, and memoranda that clients submitted for unrelated engagements. The corpus license permits internal research but is silent on model training. Before training begins, which data-governance action matters MOST?",
    opts: [
      ["Assess and document the lawful rights to use each source for training — the license's scope, the terms under which the posts were collected, and the basis for repurposing client material", true],
      ["Construct a lineage graph so that every transformation applied to the merged data is traceable", false],
      ["Deduplicate and quality-score the merged dataset so that it is demonstrably fit for purpose", false],
      ["Anonymize all three sources so that questions about rights to the data no longer arise", false],
    ],
    why: "Assessing and documenting lawful rights to collect and use data comes before any use. Each source here carries a distinct rights problem: a license silent on training, scraped content whose accessibility is not a license, and client documents supplied for a different purpose. No downstream technical step cures a missing right to use.",
    wrong: {
      B: "Strong runner-up, but traceability documents what you did with data — it cannot establish that you were entitled to use it in the first place.",
      C: "Quality after legality: a beautifully curated dataset you had no right to train on is a liability, not an asset.",
      D: "An absolute and a category error. Anonymization addresses personal-data risk; it does not expand a license's scope or authorize repurposing, so rights questions very much still arise."
    },
    strat: "Mid-sentence facts decide hard items: 'silent on model training' and 'unrelated engagements' are the tells. Publicly accessible never means free to train on.",
    trap: "too-narrow", bok: "Domain III, Competency B"
  },
  {
    id: "e-iii-13", c: "iii-b", type: "best", d: 3,
    stem: "Meadowbrook Hospital's readmission-risk model posts a near-perfect score on its held-out validation set. A reviewer flags one input feature: the number of follow-up appointments booked at discharge — a value staff enter after clinicians have already formed a view of the patient's risk. In production, the model would have to score patients before any such bookings exist. What is the correct diagnosis?",
    opts: [
      ["Overfitting: the model has memorized its training data rather than learning general patterns", false],
      ["Label leakage: a training feature carries outcome information that will not be available in the same form at prediction time", true],
      ["Concept drift: the relationship between discharge practices and readmission has shifted since training", false],
      ["Sampling bias: the discharge cohort used for training is not representative of future patients", false],
    ],
    why: "A feature recorded downstream of the clinical judgment it predicts smuggles the outcome into the inputs. Because the leak exists in both the training and validation splits, scores look superb everywhere except production — the signature of label leakage, not of a generalization failure.",
    wrong: {
      A: "The classic bait. Overfitting reveals itself as strong training performance but poor held-out performance; here the held-out score is near-perfect, which overfitting cannot explain.",
      C: "Nothing has shifted yet — the system is not deployed. The defect was built in at feature selection, not introduced by a changing world.",
      D: "The cohort's composition is not in question; the problem is one feature's timing relative to the outcome, which no resampling would fix."
    },
    strat: "Suspiciously perfect validation plus a feature that exists only after the outcome pathway starts = leakage. Overfitting and leakage are separated by where the good scores stop.",
    trap: "synonym-bait", bok: "Domain III, Competency B"
  },
  {
    id: "e-iii-14", c: "iii-b", type: "best", d: 2,
    stem: "RoadSense trains a telematics pricing model using a verified annual-mileage feature available in its research warehouse. The production quoting system cannot supply that field — it collects only self-reported mileage, with different definitions and error rates. Validation on warehouse data looks strong, and the team proposes shipping. What is the governance flaw?",
    opts: [
      ["A train/serving feature mismatch: the model must be evaluated on the same features, defined the same way, that production will actually supply", true],
      ["Overfitting: the model performs well on warehouse data only because it has memorized it", false],
      ["Insufficient data quantity: the warehouse sample is too small to support a pricing model", false],
      ["Model drift: the model's performance has degraded since it was trained", false],
    ],
    why: "Training and test data must use the same features as each other and as the serving environment. Evaluating on a verified field that production replaces with a noisier, differently defined one makes the validation evidence inapplicable to the system that will actually run.",
    wrong: {
      B: "Nothing indicates memorization; the scores are honest for warehouse data. The problem is that warehouse data is not what production will see.",
      C: "Volume is never raised in the stem — a plausible-sounding gap imported from a different failure mode.",
      D: "Drift is post-deployment change over time. This defect exists before deployment: it is a design-stage evaluation mismatch."
    },
    strat: "Check what the production pipeline can actually serve before trusting any validation number. 'Strong validation' is only evidence when the features match end to end.",
    trap: "synonym-bait", bok: "Domain III, Competency B"
  },
  {
    id: "e-iii-15", c: "iii-b", type: "distinction", d: 3,
    stem: "Gridworks reviews bias findings for an apprenticeship-screening model trained on fifteen years of application data. Women are underrepresented in the training data overall, and the draft remediation plan proposes oversampling female applicants across the full fifteen-year window. A reviewer points out that the imbalance is concentrated in records predating 2018 — the year the utility opened its programs to part-time schedules — and that cohorts since then are close to balanced. What has the reviewer identified?",
    opts: [
      ["Sampling bias, correctly remediated by oversampling the underrepresented group across the entire window", false],
      ["Temporal bias: the data is unbalanced over time, so the remedy is to weight toward, or restrict to, the recent representative period rather than oversample the full window", true],
      ["Computational bias introduced by the training algorithm's optimization choices", false],
      ["Confirmation bias in the review team's own analysis of the training data", false],
    ],
    why: "An imbalance concentrated in a historical era — before a structural change — is data unbalanced over time: temporal bias. Oversampling across the whole window would amplify records from the obsolete regime and bake pre-2018 patterns into current decisions; the time-aware remedy is recency weighting or window restriction.",
    wrong: {
      A: "The surface read. The aggregate imbalance is real, but treating a time-structured imbalance as a selection problem leads to a remedy that propagates exactly the outdated patterns the review found.",
      C: "No mechanism in the stem implicates the algorithm or an external skew event; the evidence is entirely about when the records were generated.",
      D: "The reviewer followed the data to an era-specific pattern — the opposite of seeking evidence to confirm a prior belief."
    },
    strat: "Layered-bias stems hide one bias inside another. Before accepting 'sampling', ask when the imbalance occurs; if it clusters in a period, the answer is temporal and the remedy changes with it.",
    trap: "synonym-bait", bok: "Domain III, Competency B"
  },
  {
    id: "e-iii-16", c: "iii-b", type: "distinction", d: 3, multi: true,
    stem: "A privacy engineer briefs the governance board on privacy-enhancing techniques being considered for an upcoming training program. Which THREE statements present the techniques and their trade-offs accurately? Select THREE.",
    opts: [
      ["Differential privacy protects individual records by adding statistical noise, at a measurable cost to output accuracy that grows as the privacy guarantee is strengthened", true],
      ["Federated learning keeps raw data at each source and trains locally, in exchange for added coordination, infrastructure, and participant-management overhead", true],
      ["Synthetic data can raise model accuracy and extend coverage to rare or novel cases, but its fidelity to real-world relationships must be validated rather than assumed", true],
      ["Anonymization keeps the underlying data at its source, so the data itself never has to move", false],
      ["Differential privacy works by generating new artificial records that replace the originals in the training set", false],
    ],
    why: "Each correct statement names the technique's mechanism and its honest cost: noise buys privacy at the price of utility; federated learning buys data locality at the price of coordination; synthetic data buys coverage at the price of fidelity risk. Selecting PETs is a trade-off exercise, not a menu of free wins.",
    wrong: {
      D: "Mechanism swap: anonymization strips identifiers from real data, which still moves to wherever training happens. Keeping data in place is federated learning's property.",
      E: "Mechanism swap again: generating artificial records describes synthetic data. Differential privacy perturbs computations or outputs with noise; it does not fabricate records."
    },
    strat: "Treat each option as its own true/false and test the mechanism verb: noise = differential privacy, stays local = federated, generated = synthetic, stripped identifiers = anonymization. Two options will swap verbs.",
    trap: "synonym-bait", bok: "Domain III, Competency B"
  },
  {
    id: "e-iii-17", c: "iii-b", type: "best", d: 3,
    stem: "SkyPort's pre-release test plan for a fare-and-voucher chatbot covers unit, integration, performance, bias, and interpretability testing. The security lead objects that nothing in the plan exercises the system against inputs crafted to make it misbehave — prompt injection, evasion, or poisoned reference content. Management replies that adversarial work can wait for the post-launch red-team engagement already on the calendar. What is the BEST correction to the plan?",
    opts: [
      ["Add pre-release security testing that simulates adversarial and malicious inputs, so exploitable behavior is found before exposure — with the post-launch red team as a complement, not the first line", true],
      ["Keep the plan as is: a post-launch red-team engagement is the accepted point at which adversarial evaluation begins", false],
      ["Close the gap with a network penetration test of the hosting environment before release", false],
      ["Extend the existing bias-testing workstream, since manipulated inputs are ultimately a form of input skew", false],
    ],
    why: "Security testing — including simulated malicious inputs — is a pre-release testing type in its own right. Shipping a voucher-issuing system whose exploitability has never been probed, and discovering the exploits in production, is a governance failure; scheduled red teaming later complements but cannot replace it.",
    wrong: {
      B: "Wrong timing dressed as standard practice: periodic red teaming is a post-deployment assurance activity, not a substitute for testing before users and attackers get access.",
      C: "Too narrow: penetration testing probes the perimeter and infrastructure. The flagged risk is the model's behavior under crafted inputs, which network testing never touches.",
      D: "Synonym stretch: bias testing measures differential performance across groups; adversarial robustness is about exploitation, a different failure class with different methods."
    },
    strat: "List the testing types and check which box the stem's risk belongs in. When an option defers a pre-release test to a post-release activity with a similar name, timing is the trap.",
    trap: "premature", bok: "Domain III, Competency B"
  },
  {
    id: "e-iii-18", c: "iii-b", type: "not", d: 3,
    stem: "Novexa is designing the evaluation protocol that will choose between three candidate clinical-coding models. Which protocol element does the LEAST to protect the evaluation against automation bias?",
    opts: [
      ["Human raters record quality judgments on sampled outputs before seeing any model's confidence score or ranking", false],
      ["A secondary review hunts for unintended or out-of-scope outputs beyond the primary metrics", false],
      ["Quantitative metrics are paired with structured human interpretation before any model is shortlisted", false],
      ["Candidate models are ranked solely on their aggregate scores from an automated benchmark suite", true],
    ],
    why: "Ranking solely by automated benchmark aggregates is not a protection at all — it is the condition the safeguards exist to prevent: wholesale deference to machine-generated measures. A comprehensive evaluation combines model output, human interpretation, and attention to secondary or unintended outputs.",
    wrong: {
      A: "Blind-first human judgment is the archetypal automation-bias control: it captures an independent opinion before the machine's answer can anchor it.",
      B: "Reviewing for unintended outputs catches harms that headline metrics never surface, forcing human attention beyond the automated score.",
      C: "Pairing metrics with structured human interpretation is the definition of comprehensive evaluation, the stated antidote to narrow benchmarking."
    },
    strat: "In LEAST items, the absolute gives it away: 'solely' marks the option that abdicates judgment rather than protecting it. Three options add human judgment; one removes it.",
    trap: "absolute", bok: "Domain III, Competency B"
  },
  {
    id: "e-iii-19", c: "iii-b", type: "best", d: 2,
    stem: "Brightpool, a fintech, proposes training a credit-limit model on a vast, accurate, well-maintained dataset that its marketing team built for lifestyle segmentation. A data-governance reviewer objects, even while conceding that the data's volume and accuracy are excellent. Which data-quality dimension is the objection about?",
    opts: [
      ["Quantity: the dataset is too small for credit modeling", false],
      ["Integrity: the dataset has been corrupted since collection", false],
      ["Fitness for purpose: data assembled for lifestyle segmentation is not thereby suitable for credit decisions", true],
      ["Variety: the dataset mixes too many formats and source types", false],
    ],
    why: "Data governance assesses quality, quantity, integrity, AND fitness for purpose as separate dimensions. A dataset can max out the first three and still fail the fourth: segmentation data was collected, structured, and labeled to answer a different question than creditworthiness.",
    wrong: {
      A: "The stem stipulates the dataset is vast; quantity is the one dimension plainly satisfied.",
      B: "Nothing suggests corruption or inconsistency — the data is conceded to be well maintained.",
      D: "A big-data 'V' imported as bait; heterogeneity of formats is not the reviewer's concern, suitability is."
    },
    strat: "When a stem concedes several quality dimensions explicitly, the answer is the dimension it never concedes. Fit-for-purpose is the quiet fourth axis candidates forget.",
    trap: "true-but-irrelevant", bok: "Domain III, Competency B"
  },
  {
    id: "e-iii-20", c: "iii-b", type: "distinction", d: 3,
    stem: "Keystone Valuations' property model shows exceptional performance on its held-out test set. An audit then finds the county-records feed had ingested many properties twice under different parcel identifiers, and the random split placed duplicates on both sides — so the 'unseen' test set substantially mirrors the training rows. Which evaluation failure has the audit found?",
    opts: [
      ["Overfitting: the model memorized its training data and the test score proves it", false],
      ["Label leakage: outcome information is embedded within the model's input features", false],
      ["Train/test contamination: the required separation between training and test data was not maintained, so the evaluation cannot evidence generalization", true],
      ["Concept drift: the relationship between property features and value has changed over time", false],
    ],
    why: "Keeping training and test sets separate is the rule that makes a test score mean anything. Duplicate records straddling the split collapse that separation: the model is being examined on questions it has already seen, so the measurement itself — not necessarily the model — is what failed.",
    wrong: {
      A: "The usual suspect, but with a contaminated split you cannot diagnose overfitting at all: the clean held-out comparison that would reveal it no longer exists.",
      B: "Near-neighbor trap: leakage is outcome information inside features. Here no feature carries the outcome; whole records were duplicated across the split boundary.",
      D: "Drift is a post-deployment phenomenon of a changing world; this defect was manufactured during data preparation."
    },
    strat: "Three distinct evaluation pathologies — memorizing (overfitting), outcome-in-features (leakage), and test-set-isn't-unseen (contamination) — share one symptom: scores too good to trust. Diagnose by mechanism, not symptom.",
    trap: "synonym-bait", bok: "Domain III, Competency B"
  },
  {
    id: "e-iii-21", c: "iii-b", type: "recall", d: 3, multi: true,
    stem: "AgriView is compiling the data-rights documentation that must exist before drone imagery and farm telemetry are used to train a crop-stress model. Which THREE records belong in that documentation? Select THREE.",
    opts: [
      ["The license terms and permitted-use scope for each third-party imagery dataset", true],
      ["The legal basis, consent, or contract records covering telemetry collected from farm operators", true],
      ["Provenance records showing each source's origin and the authority under which it was collected", true],
      ["The model card's intended-use statement prepared for the release package", false],
      ["The train/test split ratios and the holdout methodology used in evaluation", false],
    ],
    why: "Documenting lawful rights to collect and use data means evidencing, per source, what you may do (license scope), on what basis personal or contractual data was obtained (legal basis and agreements), and where the data came from and under whose authority (provenance). Together these establish the right to train.",
    wrong: {
      D: "Right concept, wrong phase: the model card is a release-stage transparency artifact about the model. It records intended use of the system, not rights over the inputs.",
      E: "A data-quality and evaluation-process record. Split methodology says nothing about whether the organization was entitled to use the data at all."
    },
    strat: "For documentation multi-selects, ask what question each record answers. Anything answering 'may we use this?' is rights documentation; anything answering 'how good is it?' or 'what does the model do?' belongs to another artifact.",
    trap: "premature", bok: "Domain III, Competency B"
  },
  {
    id: "e-iii-22", c: "iii-b", type: "best", d: 3,
    stem: "Helix Network's regional genetics labs must jointly train a rare-variant classifier under two binding constraints: regulators in several regions prohibit patient-level genomic records — even de-identified ones — from leaving the lab that produced them, and the variants of interest are so rare that no single lab holds enough positive cases. Which approach BEST satisfies both constraints?",
    opts: [
      ["Apply differential privacy to a pooled central dataset assembled from all participating labs", false],
      ["Train with federated learning across the labs, augmented with validated synthetic data to extend rare-case coverage", true],
      ["Anonymize each lab's genomic records and transfer them to a central training store", false],
      ["Train entirely on synthetic genomes generated at one lab from its own case collection", false],
    ],
    why: "Federated learning keeps raw data at each source — satisfying the no-transfer rule — while synthetic data's recognized strength is increasing accuracy and covering rare cases the real data underrepresents. The combination answers both constraints where each technique alone answers only one.",
    wrong: {
      A: "Pooling centrally violates the transfer prohibition before any privacy math begins — and noise injection degrades exactly the rare-case signal the project exists to capture.",
      C: "The stem forecloses this mid-sentence: the prohibition covers de-identified records too, so anonymized data moving to a central store still breaches it.",
      D: "A generator trained at one lab cannot represent variants it has never seen, and single-source synthetic fidelity would be unvalidated — coverage is the one thing this option cannot deliver."
    },
    strat: "Two-constraint stems are elimination machines: strike every option that violates either constraint, however sophisticated it sounds. The buried 'even de-identified ones' is doing the real work.",
    trap: "too-narrow", bok: "Domain III, Competency B"
  },
  {
    id: "e-iii-23", c: "iii-c", type: "ordering", d: 3,
    stem: "MetroPulse has finished developing a transit-demand forecaster. The release manager lists the five remaining stages on the plan: continuous monitoring with scheduled retraining; a pre-deployment pilot with a limited operator group; inference testing against live production traffic; the readiness assessment with model card and conformity sign-off; and deployment to all operators. Which option runs the stages in the correct order?",
    opts: [
      ["Readiness assessment; pilot; deployment; inference testing; continuous monitoring", false],
      ["Pilot; inference testing; readiness assessment; deployment; continuous monitoring", false],
      ["Pilot; readiness assessment; deployment; inference testing; continuous monitoring", true],
      ["Pilot; readiness assessment; inference testing; deployment; continuous monitoring", false],
    ],
    why: "The pilot generates the controlled real-user evidence that feeds the readiness assessment, which sits after development and before deployment and carries the model card and conformity sign-off. Inference testing is by definition performed against production — so it follows deployment — and continuous monitoring with scheduled retraining runs from then on.",
    wrong: {
      A: "Signing off readiness before the pilot inverts evidence and decision: the go/no-go would be taken without the trial results it is supposed to weigh.",
      B: "Places inference testing before the system is in production — a contradiction, since inference testing measures real-world production accuracy.",
      D: "Same contradiction one slot later: there is no production traffic to test against until deployment has happened."
    },
    strat: "Pin the two fixed anchors first — readiness is pre-deployment, inference testing is post-deployment — and the sequence resolves itself. Both wrong-inference options bet you'll read 'testing' as always-before-release.",
    trap: "premature", bok: "Domain III, Competency C"
  },
  {
    id: "e-iii-24", c: "iii-c", type: "distinction", d: 3,
    stem: "Payvora's chargeback-fraud model is monitored through input-distribution alarms, none of which have fired for months. Yet reviews against confirmed outcomes show precision falling steadily as fraud rings adapt their behavior to mimic legitimate purchases. Transaction volumes and the customer mix are statistically unchanged. What is happening, and what must monitoring additionally track?",
    opts: [
      ["Data drift; the input-distribution alarms should be tightened until they detect the change", false],
      ["Concept drift: the relationship between the features and the fraud outcome has shifted, so monitoring must track outcome-based performance against confirmed labels, not only input statistics", true],
      ["Model drift caused by infrastructure changes; a routine platform review will surface the cause", false],
      ["Automation bias among the fraud analysts reviewing the model's alerts", false],
    ],
    why: "Stable inputs plus decaying predictive validity is the signature of concept drift: the world's mapping from features to outcome has moved while the feature distributions stayed put. Input-only monitoring is structurally blind to it; the fix is outcome-based performance tracking against confirmed labels.",
    wrong: {
      A: "The stem rules it out mid-sentence: distributions are statistically unchanged, so no tightening of input alarms will ever see this failure.",
      C: "Names generic degradation without the mechanism, then prescribes an infrastructure review that nothing in the evidence motivates.",
      D: "Analyst over-reliance would not move measured precision against confirmed outcomes; the metric is computed on labels, not on analyst behavior."
    },
    strat: "Drift triage: inputs changed = data drift; inputs stable but the feature-outcome relationship changed = concept drift. Match the monitoring response to the mechanism, not the family name.",
    trap: "synonym-bait", bok: "Domain III, Competency C"
  },
  {
    id: "e-iii-25", c: "iii-c", type: "best", d: 3,
    stem: "Nordgrid's load forecaster mispredicts demand during a planned transformer-maintenance pattern, forcing costly reserve-power purchases. The post-incident review establishes three facts: the maintenance pattern has been on the project's risk register since design; it recurs several times a year; and the pre-release test suite contains no case exercising it. The model otherwise performs within specification. Which root cause should the review record?",
    opts: [
      ["Brittleness: the model cannot handle novel conditions outside its training envelope", false],
      ["Insufficient testing: a foreseeable, risk-registered, recurrent operating condition was never covered by a test case before release", true],
      ["Poor-quality training data: the historical load data was inaccurate or corrupted", false],
      ["Concept drift: the relationship between grid conditions and demand has shifted since training", false],
    ],
    why: "Root-cause triage distinguishes the common causes — brittleness, robustness gaps, poor data quality, insufficient testing, drift — by the evidence chain. Here the condition was known, registered, and recurrent, and the test plan simply never exercised it: a correctable testing-coverage failure, which is the actionable governance finding.",
    wrong: {
      A: "The strong runner-up: the symptom looks like brittleness, but brittleness describes failure on novel, unanticipated conditions. A risk the team itself registered at design was neither novel nor unanticipated — calling it brittleness buries the process failure.",
      C: "No evidence of data defects appears anywhere in the review's findings; importing one invents a cause.",
      D: "The world did not change — a recurring, documented pattern was missed. Drift explains degradation over time, not a gap present since day one."
    },
    strat: "In incident items, follow the documentary trail: a risk-register entry with no matching test case points at the test plan. Prefer the root cause the organization can actually fix.",
    trap: "synonym-bait", bok: "Domain III, Competency C"
  },
  {
    id: "e-iii-26", c: "iii-c", type: "best", d: 3,
    stem: "Marlowe Retail's returns-fraud scorer embeds ParcelGuard, a third-party image-verification API. After a surge of wrongful fraud flags is traced to a silent ParcelGuard model update, Marlowe's engineers open a strictly internal root-cause investigation covering only the components Marlowe built. What critical element of incident response is missing?",
    opts: [
      ["Treating the integrated third-party tool as in scope: identifying it within the incident process and activating the notification duties that run between Marlowe and the vendor under contract and regulation", true],
      ["Immediately replacing ParcelGuard with an in-house image-verification model", false],
      ["Publishing a full public forensic report disclosing the complete incident timeline", false],
      ["Invoking the contract's penalty clause against ParcelGuard before the investigation concludes", false],
    ],
    why: "Incident response must identify integrated third-party tools because they carry notification duties in both directions — the vendor owes Marlowe change notice, and Marlowe owes counterparties and possibly regulators notice of the incident. An investigation scoped to exclude the component that caused the failure cannot reach root cause or discharge those duties.",
    wrong: {
      B: "Premature avoidance: swapping vendors before root cause is established may rebuild the same integration failure and does nothing about the notification duties already triggered.",
      C: "Transparency obligations do not mean publishing forensics; over-disclosure is not the missing control, scoping and notification are.",
      D: "Remedies follow findings. Penalizing the vendor before the investigation concludes gets the sequence backwards and poisons the collaboration the investigation needs."
    },
    strat: "When a stem plants a third-party component inside the system, expect the answer to hinge on it: inventory the integration, then trace whose notification duties fire.",
    trap: "too-narrow", bok: "Domain III, Competency C"
  },
  {
    id: "e-iii-27", c: "iii-c", type: "best", d: 3,
    stem: "Two hours after UrbanGo's surge-pricing model begins issuing erratic fares, its data-science team diagnoses 'an upstream data-quality blip,' applies a fix, documents it, and closes the incident. Riders were overcharged, a city regulator has emailed questions, and the legal team learns of the closure only afterward. What is the PRIMARY governance defect in how this incident was handled?",
    opts: [
      ["The diagnosis took two hours, which exceeds a reasonable response window", false],
      ["Root-cause analysis was confined to a single function, when incident management requires cross-functional collaboration because candidate causes and duties span data quality, brittleness, testing gaps, drift, and legal and regulatory obligations", true],
      ["The team failed to retrain the model immediately after applying the fix", false],
      ["The incident should have remained open until the regulator confirmed it had no further questions", false],
    ],
    why: "Establishing root cause is a cross-functional exercise precisely because a single team sees only the causes it knows how to find — a data team will find a data cause. Meanwhile the incident's legal, customer-harm, and regulatory dimensions were never owned by anyone, as the regulator's unanswered email shows.",
    wrong: {
      A: "Speed is not the defect; a fast wrong process is still a wrong process, and nothing suggests two hours breached any standard.",
      C: "Retraining is one possible remedy among several and may be irrelevant to an upstream data failure; prescribing it before a validated root cause repeats the original error.",
      D: "Ticket status is cosmetic. Keeping the record open changes nothing if legal, communications, and domain functions are still excluded from the analysis."
    },
    strat: "A suspiciously quick single-team diagnosis that happens to match the team's specialty is the exam's cue for confirmation bias — the cure is cross-functional root-cause work.",
    trap: "too-narrow", bok: "Domain III, Competency C"
  },
  {
    id: "e-iii-28", c: "iii-c", type: "not", d: 3,
    stem: "Atlasphere AI is preparing the model card that will accompany its released document-classification model, and reviewers have proposed additions. Which proposed addition goes beyond what a model card is for?",
    opts: [
      ["The model's intended uses, alongside the uses the provider considers out of scope", false],
      ["Performance results, including evaluation outcomes across relevant subgroups", false],
      ["Known limitations and the conditions under which performance degrades", false],
      ["The organization's full artifact repository — system documentation, incident-response plans, data dictionaries, and links to source code — so that responders find everything in one place", true],
    ],
    why: "A model card is a short summary document: purpose, performance, limitations, intended use, and development details, published for transparency. The option describing an organized database of artifacts — documentation, incident-response plans, data dictionaries, source-code links, contacts — describes the AI system inventory, a different and broader artifact.",
    wrong: {
      A: "Intended use — and by extension out-of-scope use — is core card content; it is how the card forecasts and limits unintended applications.",
      B: "Performance reporting, including subgroup results, is exactly what the card summarizes for its readers.",
      C: "Documenting limitations and degradation conditions is a defining function of the card."
    },
    strat: "Card versus inventory is a size-and-purpose distinction: concise public summary versus internal operational repository. The wrong addition is the one that swallows the repository into the summary.",
    trap: "synonym-bait", bok: "Domain III, Competency C"
  },
  {
    id: "e-iii-29", c: "iii-c", type: "best", d: 3,
    stem: "Lumina Imaging provides a deployed radiology-assist system. Its post-market monitoring confirms a malfunction: a recent software update degraded detection performance on one scanner model, and several hospital deployers are affected. Engineering has slotted a patch into next quarter's scheduled release train. What does governance require NOW?",
    opts: [
      ["Hold the patch for the scheduled release train, since bypassing change control would itself create risk", false],
      ["Initiate corrective action without waiting: remediate or restrict the affected configuration, update the instructions for use, notify the affected deployers — and authorities where required — under the post-market monitoring plan, and document every step", true],
      ["Notify only the deployers that have filed complaints about the affected scanner model", false],
      ["Ship the patch quietly in the next maintenance window and update the documentation afterward", false],
    ],
    why: "Post-market monitoring exists to drive corrective action when a confirmed malfunction affects deployed use. The ladder runs: investigate, correct or restrict, update the instructions for use so deployers can operate safely in the interim, notify affected deployers and any required authorities, and document. A confirmed, safety-relevant defect does not queue behind a release calendar.",
    wrong: {
      A: "Process-worship: change control governs how an urgent fix ships safely, not whether a confirmed malfunction may wait a quarter. Cadence yields to confirmed harm.",
      C: "The duty runs to all affected deployers; waiting for complaints converts a provider obligation into a customer-service queue.",
      D: "A silent fix leaves deployers operating degraded systems without warning until the patch lands, and updating documentation after the fact defeats its purpose."
    },
    strat: "Corrective-action items test the ladder's order and reach: fix or restrict, inform those who operate the system, notify as required, document. Any option that narrows the audience or defers the clock is the trap.",
    trap: "wrong-economics", bok: "Domain III, Competency C"
  },
  {
    id: "e-iii-30", c: "iii-c", type: "not", d: 3,
    stem: "VerdantAI is assembling the public transparency package for a released high-risk screening system. Which item is LEAST appropriate to include in the public package?",
    opts: [
      ["Instructions for use that enable deployers to operate the system correctly", false],
      ["A summary of the post-market monitoring plan", false],
      ["Documentation of the system's capabilities, limitations, and appropriate operating conditions", false],
      ["The complete adversarial prompt library and attack scripts used during pre-release security testing", true],
    ],
    why: "Public disclosures for transparency center on technical documentation, instructions for use to deployers, and post-market monitoring plans. A full attack corpus is security-testing material: publishing it equips adversaries with a ready-made exploitation manual while adding nothing to users' or deployers' ability to operate the system responsibly.",
    wrong: {
      A: "Instructions for use are a defining transparency artifact — they are how the provider enables correct deployment.",
      B: "Disclosing the monitoring plan shows how the provider will detect and respond to post-release problems; it is standard transparency content.",
      C: "Capabilities, limitations, and operating conditions are the heart of public technical documentation."
    },
    strat: "Transparency has a boundary: disclose what enables safe, accountable use; withhold what enables attack. An option can wear the transparency costume while actually being an exploit kit.",
    trap: "true-but-irrelevant", bok: "Domain III, Competency C"
  },
  {
    id: "e-iii-31", c: "iii-c", type: "best", d: 3,
    stem: "After a scoring incident, Crescent Pay's program office drafts the incident record 'with the auditors in mind': the timeline is accurate, but passages describing a known limitation the team had knowingly accepted at launch are removed, and hedged engineering language is rewritten to sound confident. Counsel is asked to approve the record. Which principle should govern counsel's answer?",
    opts: [
      ["Documentation exists to establish compliance and to manage risk, so the record must remain accurate and complete — curating it for an audit audience converts a known-limitation record into a misrepresentation risk and destroys its root-cause value", true],
      ["Records prepared for auditors may be summarized as the organization prefers, provided the factual timeline remains accurate", false],
      ["Future documentation should be minimized so that less material exists to produce in audits or litigation", false],
      ["The office should maintain an internal complete version and an external audit version of the record", false],
    ],
    why: "Build documentation earns its protective value only if it is accurate and complete: it is how an organization proves what it knew, decided, and did. Sanitizing a record for auditors inverts that function — the document stops managing risk and starts manufacturing it, and the organization loses the honest account that root-cause learning requires.",
    wrong: {
      B: "Partial-accuracy comfort: an accurate timeline with the known limitation excised is still a misleading record, because the omission is the material fact.",
      C: "The wrong-economics classic. Documentation is a control; starving it to shrink discovery exposure trades a managed risk for an unmanaged one and signals bad faith.",
      D: "Two-books is a textbook integrity failure: both versions are discoverable, and their divergence is itself evidence against the organization."
    },
    strat: "When a stem pits documentation against legal-exposure instincts, the exam rewards the accurate-and-complete principle. Any option that shades, starves, or forks the record is a named trap.",
    trap: "wrong-economics", bok: "Domain III, Competency C"
  },
  {
    id: "e-iii-32", c: "iii-c", type: "best", d: 2,
    stem: "Cartwheel's COO sets next year's AI-operations objective: 'the recommendation system reaches 100% accuracy and zero incidents, after which monitoring can be scaled back.' What is the BEST governance correction to this objective?",
    opts: [
      ["Continuous improvement aims to adapt the system to evolving data and keep reducing errors and bias across the life cycle — perfect accuracy is unattainable, and monitoring is not a phase that completes", true],
      ["Accept the objective but extend the deadline so the team has longer to reach it", false],
      ["Redefine the accuracy metric so that the 100% target becomes achievable", false],
      ["Agree to scale back monitoring once the system has recorded twelve consecutive stable months", false],
    ],
    why: "The purpose of continuous improvement is adaptation — to evolving data, emerging errors, and bias — not the attainment of a perfect end state. Because drift arrives unannounced, monitoring is a permanent operating condition of a deployed system, not a gate that is eventually passed.",
    wrong: {
      B: "Keeps the false premise and merely reschedules it; no deadline makes 100% accuracy or zero incidents a coherent target.",
      C: "Metric gaming: redefining the measure to hit the number abandons the real goal and corrupts the monitoring signal itself.",
      D: "Stability is not permission to stop watching — twelve quiet months say nothing about month thirteen, which is precisely when unmonitored drift does its damage."
    },
    strat: "Absolutes in objectives — 100%, zero, 'after which' — are the premature-precision tell. The correct option reframes the goal as continuous, not terminal.",
    trap: "premature", bok: "Domain III, Competency C"
  },
  {
    id: "e-iii-33", c: "iii-c", type: "distinction", d: 3,
    stem: "Caldera Bank's assurance calendar for a deployed credit chatbot includes a preparatory slot before this year's adversarial engagement: the security team will systematically enumerate how an attacker could abuse the system — entry points, assets at risk, likely techniques — and use that map to decide what the later attack simulation should attempt. The team debates what to call this preparatory activity. Which is it?",
    opts: [
      ["Red teaming, because the work concerns attacker behavior", false],
      ["Threat modeling: mapping the possible threats to the system, which scopes and precedes the attack simulation", true],
      ["An audit, because it is a scheduled, systematic assurance activity", false],
      ["Inference testing, because the chatbot being examined is in production", false],
    ],
    why: "Threat modeling is the mapping exercise — enumerating potential threats, entry points, and targets — and it naturally precedes red teaming, which is the active simulation of those attacks. The stem describes a map built to scope a later simulation: modeling, not attacking.",
    wrong: {
      A: "Red teaming is the engagement this work prepares for: specialists actively attempting the attacks. Thinking about attackers is not yet simulating them.",
      C: "An audit checks the program against policy and law without attacking or threat-mapping anything; 'scheduled and systematic' describes many activities.",
      D: "Inference testing measures a production model's real-world accuracy — a performance stage, unrelated to adversarial preparation."
    },
    strat: "Four assurance look-alikes, one verb each: model maps, red team attacks, audit checks, inference testing measures. Match the stem's verb before touching the options.",
    trap: "synonym-bait", bok: "Domain III, Competency C"
  },
  {
    id: "e-iii-34", c: "iii-c", type: "best", d: 3,
    stem: "WorkBridge's job-matching model triggers a data-drift alarm after a national employer joins the platform and shifts the input mix heavily toward hospitality roles. Outcome-based performance metrics remain within thresholds. An engineer proposes an emergency retrain that night using only the past 30 days of data, 'so the model reflects the new reality.' What is the BEST monitoring response?",
    opts: [
      ["Approve the emergency retrain so the model adapts before performance can degrade", false],
      ["Investigate and document the shift, keep heightened watch on outcome metrics, and fold the new population into scheduled retraining using a representative data window — a 30-day-only emergency retrain would trade a tolerated input shift for self-inflicted temporal bias", true],
      ["Suppress the alarm, since performance is unaffected and the alert is therefore a false positive", false],
      ["Roll back to the previous model version until input distributions return to their historical pattern", false],
    ],
    why: "Drift response is proportionate to impact: input drift without performance degradation calls for investigation, intensified outcome monitoring, and incorporation into the scheduled retraining cycle on a representative window. Training on a 30-day slice would manufacture a dataset unbalanced over time — the very temporal bias good retraining practice avoids.",
    wrong: {
      A: "Premature: an untested emergency change responding to no measured harm, built on an unrepresentative window, adds risk rather than removing it.",
      C: "The alarm did its job — it prompted investigation. Suppressing it blinds the program to the moment the shift does start moving outcomes.",
      D: "Rollback is an incident response to malfunction; nothing has malfunctioned, and the input shift reflects a real, probably permanent, change in the served population."
    },
    strat: "Separate detection from reaction: an alarm justifies investigation, not automatic retraining. Watch for remedies that would themselves violate data-governance rules the exam tests elsewhere.",
    trap: "premature", bok: "Domain III, Competency C"
  },
];

export const examPoolIII: Question[] = raw.map((r) => ({
  id: r.id,
  competencyId: r.c,
  type: r.type,
  difficulty: r.d,
  stem: r.stem,
  isMultiselect: r.multi ?? false,
  options: r.opts.map(([text, isCorrect], i) => o(String.fromCharCode(65 + i), text, isCorrect, i)),
  correctExplanation: r.why,
  whyWrong: r.wrong ?? {},
  strategyNote: r.strat,
  trapType: r.trap ?? "none",
  bokRef: r.bok,
  source: "curated",
}));
