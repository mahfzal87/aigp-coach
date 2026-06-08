# AIGP Coach

A personal study system for the **IAPP AIGP** exam (Body of Knowledge **v2.1**). Learn the material,
practice with instant rationales, take blueprint-accurate timed mock exams, and get a **data-driven readiness
verdict** that tells you whether you're ready to sit the exam.

Built with **Next.js 16 + TypeScript + Tailwind v4 + Supabase**. No login, no runtime AI cost — content is
bundled and (optionally) mirrored to Supabase; your progress lives in your browser.

## Features

- **Dashboard / Readiness** — overall readiness gauge, projected scaled score (100–500), a Ready / Almost /
  Not-yet verdict with reasons, domain heat-map, your weakest competencies, and an exam-date countdown.
- **Learn** — structured notes per domain & competency (the BoK deep-dives) plus spaced-repetition flashcards.
- **Practice** — filterable drills (competency / type / difficulty / unseen / wrong-only) with instant
  feedback, full rationales, "why each wrong option fails," confidence capture, and **K/T/R** miss tagging.
- **Mock exam** — blueprint-proportional, timed simulation (scales toward the real 100-Q / 2h45m), scaled
  scoring, per-domain breakdown, and a full review.
- **Strategy** — the convoluted-question playbook + technique drills by question type.
- **Analytics** — mastery by competency, why-you-miss (K/T/R), confidence calibration, time-per-question.
- **Updates** — a curated feed of AI-law / standards / BoK changes (EU AI Act, South Korea, Take It Down Act…).
- **Reference** — searchable library; **Settings** — exam date, theme, and JSON export/import of progress.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

That's it — the app is fully functional on bundled content with **no configuration**.

## Optional: Supabase (so content/updates can change without a redeploy)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/migrations/0001_init.sql`.
3. Copy `.env.local.example` → `.env.local` and fill in your project URL, anon key, and service-role key.
4. Seed the database from the bundled content:
   ```bash
   npm run seed
   ```
The app reads the **anon** key (public, read-only via RLS). The **service-role** key is used only by the
seed script and must never reach the browser.

## Deploy to Vercel

```bash
npm i -g vercel
vercel            # follow the prompts
```
If you set up Supabase, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as Vercel
environment variables. (The service-role key is not needed at runtime — only for seeding.)

## How content stays current ("managed from Claude Code")

All content lives in `/content` (`curriculum.ts`, `notes.ts`, `questions.ts`, `flashcards.ts`, `updates.ts`)
and is the single source of truth. To grow the question bank or add a law update, edit those files (ask your
coach to do it), then either redeploy (bundled mode) or run `npm run seed` (Supabase mode). An optional,
feature-flagged in-app "Fetch latest" button lives in `app/api/fetch-updates` (off by default).

> **Note:** the question bank ships with a strong starter set covering every competency and question type.
> It's designed to grow toward a full 100+ — ask your coach to expand it.

## Privacy

No accounts, no tracking. Your attempts, mock results, flashcard schedule and settings are stored only in
your browser's `localStorage`. Use **Settings → Export** to back them up.
