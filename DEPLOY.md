# Deploying and forking AIGP Coach

Standard Next.js app. It **builds with no environment variables**, because all study content is
bundled TypeScript and progress lives in the browser. Supabase is the only external service, and it
is optional. There is **no LLM or AI API key** anywhere — nothing in the app calls a model.

## Fork quickstart

1. Fork the repo, then `npm install && npm run dev`. That already works — stop here if you just want to study.
2. Want cloud sync and accounts? Create a free project at [supabase.com](https://supabase.com).
3. In the project's **SQL Editor**, run `supabase/progress_sync.sql`, `supabase/accounts.sql` and `supabase/multi_exam.sql` (all idempotent).
4. Copy `.env.example` to `.env.local` and paste your **Project URL** and **anon key** (Supabase → Settings → API).
5. Deploy (below) with the same two variables set. Done.

## Option A. Vercel CLI (fastest)

```bash
cd aigp-coach
npx vercel login        # one-time: opens your browser to authenticate
npx vercel --prod       # deploy; accept the defaults, it prints your live URL
```

Every later `npx vercel --prod` ships an update.

## Option B. GitHub plus Vercel dashboard (auto-deploy on push)

```bash
# create an empty repo on github.com first, then:
git remote add origin https://github.com/<you>/aigp-coach.git
git push -u origin main
```

Then on **vercel.com → Add New → Project → Import** the repo. Framework auto-detects as Next.js; click
**Deploy**. Future `git push` redeploys automatically.

## Environment variables (all OPTIONAL)

| Variable | Needed for |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Accounts, the anonymous sync code, and mirroring content to Supabase. Not required to run. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same. |
| `NEXT_PUBLIC_REQUIRE_AUTH` | `true` turns on the account-first flow: register/login screen → first name → exam tiles → app. The hosted copy runs with this on; clones default to open mode (accounts optional). |

Without any of these, the app runs fully on its bundled content, which is what you want for studying.
If you are setting up environment variables before you have answered a single question, you are
studying deployment, not law.

## Accounts (email + password)

With Supabase configured and `supabase/accounts.sql` applied, **Settings** grows an Account card:
register with an email and password, and your progress backs up to your account automatically a few
seconds after each change, then follows you to any device you log in on.

- **Sessions do not expire.** The access token refreshes itself in the background and Supabase does
  not time-box sessions by default, so a user stays signed in until they log out.
- **Instant sign-up:** in Supabase under **Authentication → Sign In / Up → Email**, turn **off**
  "Confirm email". Otherwise sign-ups must click a confirmation link, which means configuring your
  own SMTP sender (Supabase's built-in one is rate-limited to a handful of emails per hour).
- **Private instance:** set `NEXT_PUBLIC_REQUIRE_AUTH=true` and nobody sees the app without logging in.
- **Data model:** one `account_progress` row per user (owner-only row-level security) plus a
  `profiles` row created by trigger on sign-up. `profiles.plan` defaults to `free` — that column is
  the hook if you ever take an instance commercial.
- Not wired yet: self-serve password reset. Until it is, an instance admin resets passwords from the
  Supabase dashboard (Authentication → Users).

## Anonymous cloud sync (sync code, no login)

For people who don't want an account: the Settings page can mint an unguessable `AIGP-XXXX-XXXX`
code and back progress up under it; entering the code on another device restores. Needs the same two
Supabase variables and `supabase/progress_sync.sql`. Accounts and sync codes coexist — a user can
use either or both.

Progress stays offline-first (localStorage) and mirrors to the cloud automatically a couple of
seconds after each change.

## Multi-exam packs

Each exam is a self-contained pack: `content/exams/<slug>/` holds its curriculum (official BoK
domains/competencies with blueprint weights), topics, question bank + hard pool, paper definitions,
Law Lab maps/confusables, glossary and updates feed, assembled in that folder's `pack.ts`. Register
new packs in `lib/exam-registry.ts` and add the slug in `lib/exam-state.ts`. Progress is stored per
exam (separate localStorage keys; cloud rows are keyed `(code|user, exam_id)`), the exam switcher
lives under the logo, and `GET /api/audit` integrity-checks every pack. Shipped packs: **AIGP**
(full), **CIPP/E** (BoK v1.3.3) and **CIPM** (BoK v4.2.0).

## Updating content

This is the part you will spend time in. All content is plain TypeScript in `/content` (`questions.ts`, `questions-extra.ts`, `notes.ts`,
`flashcards.ts`, `updates.ts`, `topics-*.ts`). Edit the files, commit, and redeploy with
`npx vercel --prod` or a `git push`. If you are running Supabase, run `npm run seed` instead of
redeploying.
