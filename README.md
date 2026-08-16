# AIGP Coach

**A study system for the IAPP AIGP exam, built because the material I could buy told me *what* to know and never *why I kept getting questions wrong*.**

Clone it and run your own copy. No accounts, no tracking, no API keys, no configuration. Your progress stays in your browser.

```bash
git clone https://github.com/mahfzal87/aigp-coach.git
cd aigp-coach
npm install
npm run dev
```

Then open **http://localhost:3000**. That is the whole setup. Node 20 or later.

<img src="docs/study-plan.png" alt="AIGP Coach study plan: a readiness score out of 100, a projected scaled score, and the Body of Knowledge broken into domains and competencies with per-topic progress" width="100%">

---

## The problem

I was preparing for the IAPP's AI Governance Professional exam. The material I could get had two gaps I could not work around.

The first is that question banks tell you the answer, not the reasoning. You learn that C was right. You do not learn why B was the trap, and you certainly do not learn that you fall for that exact trap every single time a scenario mentions deployer obligations.

The second is that AI law does not sit still. The EU AI Act's obligations phase in on different dates, those dates were themselves amended in July 2026, and US state law moves every quarter. A PDF bought in January is quietly wrong by June, and it has the decency to say nothing about which parts.

So I could not answer the only question that mattered: **am I ready to sit this, and if not, what specifically is broken?**

## The approach

I built the thing I wanted. Three decisions shaped it.

**Diagnose the miss, not the answer.** Every question carries a rationale, a line on why each wrong option fails, and a trap type. After answering I tag the miss as Knowledge, Technique, or Read-error: I did not know it, I knew it and attacked the question wrong, or I simply misread the stem. Those three need completely different remedies, and lumping them together is why "just do more questions" stops working somewhere around the fourth hundred.

<img src="docs/practice.png" alt="A practice question with the answer revealed, showing the correct option, the reasoning, and a why-the-others-fail breakdown for each distractor" width="100%">

**Treat exam technique as its own skill.** Past a certain point the gap is not knowledge, it is how you read a sentence that has been deliberately built to be read wrong. So question type is a first-class attribute (Best/Most, NOT/Least, ordering, role-ID, distinction, recall), each with its own playbook and its own drill.

<img src="docs/strategy.png" alt="The question strategy page: timing budget, a six-step method for attacking any question, and a per-question-type playbook" width="100%">

**Make readiness a number with reasons attached.** The dashboard projects a scaled score against the pass mark, gives a Ready / Almost / Not-yet verdict, and then names the competencies dragging it down. Confidence is captured per question, so the analytics can surface overconfidence, which is high certainty paired with low accuracy, and which is the pattern that actually fails people.

## What it does

| | |
|---|---|
| **Learn** | 101 topics mapped to the Body of Knowledge v2.1, plain-English explanations, spaced-repetition flashcards |
| **Practice** | 192 questions, filterable by competency, type, difficulty, unseen, or previously-wrong |
| **Mock exam** | Blueprint-proportional and timed, scaled scoring, per-domain breakdown |
| **Strategy** | Six-step question attack, playbooks and drills per question type |
| **Analytics** | Mastery by competency, the Knowledge/Technique/Read-error split, confidence calibration, time per question |
| **Law updates** | A dated feed of what changed, so stale content is visible rather than silently rotting |

Coverage: 4 domains, 13 competencies, 6 question types, 101 topics, 192 questions, 32 flashcards.

**Stack:** Next.js 16, TypeScript, Tailwind v4, Zustand, Recharts. Progress lives in `localStorage`. There are no accounts and nothing is sent anywhere.

## Running it

Everything is bundled, so `npm install && npm run dev` really is the whole thing. No configuration, no key, no network calls at runtime.

**Deploy your own instance** if you want it on your phone. It is a standard Next.js app, so anything that runs Next will do:

```bash
npm run build && npm start
```

I deliberately do not run a public instance for other people. Progress lives in `localStorage`, so a shared deployment means either shared progress or building accounts, and I did not want to be quietly holding a stranger's exam results. Run your own copy and it stays yours.

**Optional:** Supabase can be wired in so content updates without a redeploy. Off by default. Notes in [DEPLOY.md](DEPLOY.md).

## Make it your own

The content is the actual product, and it is all plain TypeScript in `/content`:

| File | What is in it |
|---|---|
| `curriculum.ts` | Domains and competencies, with the exam blueprint weights |
| `topics-i.ts` … `topics-iv.ts` | The 101 topic explanations |
| `questions*.ts` | The question bank |
| `flashcards.ts` | Spaced-repetition cards |
| `updates.ts` | The law-updates feed |

Add your own questions, correct mine, or rewrite the topics in your own words, which is the version that actually sticks. If you fix something wrong, a PR is welcome.

## What I would do differently

**I built content and product at the same time, and content won.** Roughly two thirds of the effort went into writing questions and topic explanations rather than into the app. That was the right call for a study tool with one user. It was not the thing I had been telling myself I was doing. I thought I was building a product. I was building a textbook with a progress bar.

**The readiness score is under-validated.** It projects a scaled score from a weighted competency model I designed myself. The weights come from the published blueprint so the shape is defensible, but I have no outcome data to calibrate against, and one person's result is never going to provide any. I would still rather ship a number with visible reasoning than a soothing "you're doing great." I should have put an honest error bar on it instead of a clean integer that looks like it knows something.

**Spaced repetition is bolted on, not designed in.** Flashcards run SM-2 on their own schedule while the question bank tracks mastery separately. They should have been one scheduler over one pool of items. Splitting them was a modelling shortcut on day two that got expensive by week six.

**Freshness is manual, which is the real product risk.** The law-updates feed is exactly as current as the last time I edited a file. For a domain that decays this fast, the honest design is an ingestion pipeline with source links and review dates, not an array I maintain by hand. I scoped an in-app fetcher, looked at how much of it I would actually finish, and left it switched off rather than shipping half.

## Credits

The question bank mixes items I wrote with items adapted from community-shared AIGP study banks that circulate among candidates, including the bank shared by "Dr. David". Adapted items are tagged `community` in the source; the banks travel without per-item bylines, so crediting a named individual is not possible at item level. Thanks to everyone who has published free study material for this exam. If you recognise your work here and want it credited differently or gone, open an issue and I will sort it.

## Disclaimer

Not affiliated with, endorsed by, or connected to the IAPP in any way. AIGP and CIPP are trademarks of the International Association of Privacy Professionals. This is an independent study aid built for my own preparation and shared as-is, and it reproduces no official exam content. Nothing here is legal advice.

## Licence

Code is MIT. Study content is shared for personal, non-commercial study use. Details in [LICENSE](LICENSE).
