# Deploying AIGP Coach

The app is a standard Next.js app and **builds with no environment variables** (progress lives in your
browser; Supabase is optional). Deploy in ~2 minutes.

## Option A — Vercel CLI (fastest)

```bash
cd /Users/ahmad/aigp-coach
npx vercel login        # one-time: opens your browser to authenticate
npx vercel --prod       # deploy; accept the defaults — it prints your live URL
```

That's it. Every later `npx vercel --prod` ships an update.

## Option B — GitHub + Vercel dashboard (auto-deploy on push)

```bash
# create an empty repo on github.com first, then:
git remote add origin https://github.com/<you>/aigp-coach.git
git push -u origin main
```

Then on **vercel.com → Add New → Project → Import** the repo. Framework auto-detects as Next.js; click
**Deploy**. Future `git push` redeploys automatically.

## Environment variables (all OPTIONAL)

Add these in Vercel → Project → Settings → Environment Variables only if you want the extras:

| Variable | Needed for |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Mirroring content to Supabase (`npm run seed`). Not required to run. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same. |
| `ANTHROPIC_API_KEY` (+ search key) | The optional in-app "Fetch latest updates" button. Off by default. |

Without any of these, the app runs fully on its bundled content — which is what you want for studying.

## Updating content (managed from Claude Code)

Edit files in `/content` (`questions-extra.ts`, `notes.ts`, `flashcards.ts`, `updates.ts`), commit, and
redeploy (`npx vercel --prod` or `git push`). Ask Claude Code to "add 20 more Domain II questions" and it
will edit `/content` for you.
