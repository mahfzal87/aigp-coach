"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Check, CheckCircle2, Target } from "lucide-react";
import { authRequired, firstNameOf, setFirstName } from "@/lib/account";
import { hasStoredExam, switchExam, type ExamSlug } from "@/lib/exam-state";
import { listPacks } from "@/lib/exam-registry";
import { toScaledScore } from "@/lib/scoring";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { AccountForm, isReturningUser, useSession } from "@/components/account";
import { AnimatedNumber } from "@/components/motion";
import { Badge, Bar, Button, Card, CardBody } from "@/components/ui";
import { BrandMark, LogoTile, Spinner, Splash, TextField } from "@/components/entry-ui";

// The front door.
// • Account-first (NEXT_PUBLIC_REQUIRE_AUTH=true): welcome (register/login) →
//   first name → exam tiles → the app. Each step is skipped once satisfied,
//   so returning users go straight in.
// • Open mode: no account steps. The exam tiles show until an exam has been
//   chosen on this device (first visit, or after "All exams").
// Both modes show the Splash for the server render and the hydration pass, so
// nothing that reads the session or localStorage has to match the server.

const NAME_SKIP_KEY = "coach-name-skip";
const COMING_SOON = ["CIPP/US", "CIPM", "CIPT"];

const noSubscribe = () => () => {};
function useMounted() {
  // false on the server and during hydration, true from the first client render after it
  return useSyncExternalStore(noSubscribe, () => true, () => false);
}

function nameSkipped(): boolean {
  try {
    return localStorage.getItem(NAME_SKIP_KEY) === "1";
  } catch {
    return false;
  }
}

export function EntryFlow({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  const { session, ready } = useSession();
  const [, bump] = useState(0);
  // Open mode decides once per page load: a mid-session logout (which forgets
  // the exam choice) must not yank someone onto the picker. Read on the client
  // only — the server pass always renders the Splash.
  const [pickFirst] = useState(() => !authRequired && typeof window !== "undefined" && !hasStoredExam());

  if (!mounted) return <Splash />;
  if (!authRequired) return pickFirst ? <ExamTiles /> : <>{children}</>;

  if (!ready) return <Splash />;
  if (!session) return <Welcome />;
  if (!firstNameOf(session) && !nameSkipped())
    return <NameStep email={session.user.email} onDone={() => bump((x) => x + 1)} />;
  if (!hasStoredExam()) return <ExamTiles />;
  return <>{children}</>;
}

// ── Welcome: the login door ─────────────────────────────────────────────────

const POINTS = ["Fixed mock papers on real exam timing", "Every answer explained, near-misses too", "A readiness score with the reasons"];

export function Welcome() {
  const packs = listPacks();
  const returning = isReturningUser();
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center gap-8 px-4 py-8 sm:px-6 md:py-12">
      <header className="space-y-5">
        <BrandMark />
        <h1 className="max-w-3xl text-balance text-[26px] font-extrabold leading-[1.15] tracking-tight sm:text-4xl">
          Train for the exam the way the exam actually behaves.
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex gap-1.5">
            {packs.map((p) => (
              <Badge key={p.meta.slug} tone="primary">
                {p.meta.name}
              </Badge>
            ))}
          </div>
          <span className="text-xs text-[var(--muted)]">{COMING_SOON.join(" · ")} coming soon</span>
        </div>
      </header>

      {/* Two equal-height panels. The form comes first in the DOM (phones see
          it above the fold, keyboards reach it first); desktop puts the proof
          on the left. */}
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] md:gap-10">
        <section aria-label="Create an account or log in" className="min-w-0 md:order-2">
          <Card className="h-full">
            <CardBody className="flex h-full flex-col justify-center p-6 sm:p-7">
              <AccountForm defaultMode={returning ? "in" : "up"} autoFocus />
            </CardBody>
          </Card>
        </section>
        <div className="min-w-0 md:order-1">
          <ScoreSample />
        </div>
      </div>
    </main>
  );
}

// The hero instrument: what a finished mock looks like. The numbers tie —
// domain results sum to the raw score, and the scaled score comes from the
// app's own IAPP 100–500 mapping.
const SAMPLE = [
  { code: "I", right: 18, of: 21 },
  { code: "II", right: 18, of: 25 },
  { code: "III", right: 22, of: 27 },
  { code: "IV", right: 21, of: 27 },
];
const onScale = (scaled: number) => ((scaled - 100) / 400) * 100;

function ScoreSample() {
  const right = SAMPLE.reduce((n, d) => n + d.right, 0);
  const of = SAMPLE.reduce((n, d) => n + d.of, 0);
  const scaled = toScaledScore(right / of);
  const weakest = [...SAMPLE].sort((a, b) => a.right / a.of - b.right / b.of)[0];
  return (
    <Card role="group" aria-label={`Example mock result: ${scaled} of 500, above the 300 pass line`} className="h-full">
      {/* justify-between spreads any height the form adds evenly, so the two
          panels share both edges without a dead band in this one. */}
      <CardBody className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Example · full mock</span>
          <Badge tone="success">
            <Check size={12} aria-hidden /> Above pass line
          </Badge>
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <AnimatedNumber value={scaled} className="text-4xl font-bold" />
            <span className="text-sm text-[var(--muted)]">/ 500</span>
            <span className="ml-auto text-xs tabular-nums text-[var(--muted)]">
              {right} / {of} correct
            </span>
          </div>
          <div className="relative mt-3">
            <Bar value={onScale(scaled)} tone="success" />
            <span
              aria-hidden
              className="absolute -top-1 -bottom-1 w-0.5 -translate-x-1/2 rounded-full bg-[var(--foreground)]/50"
              style={{ left: `${onScale(300)}%` }}
            />
          </div>
          <div aria-hidden className="relative mt-1.5 h-3.5 text-[10px] font-medium tabular-nums text-[var(--muted)]">
            <span className="absolute left-0">100</span>
            <span className="absolute -translate-x-1/2" style={{ left: `${onScale(300)}%` }}>
              300 pass
            </span>
            <span className="absolute right-0">500</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-3 border-t border-[var(--border)] pt-4 sm:grid-cols-4">
          {SAMPLE.map((d) => {
            const p = Math.round((d.right / d.of) * 100);
            return (
              <div key={d.code} className="min-w-0">
                <div className="flex items-baseline justify-between gap-2 text-[11px]">
                  <span className="truncate font-semibold text-[var(--muted)]">Domain {d.code}</span>
                  <span className="font-semibold tabular-nums">{p}%</span>
                </div>
                <Bar value={p} tone={p >= 80 ? "success" : p >= 60 ? "warning" : "danger"} className="mt-1.5 h-1.5" />
              </div>
            );
          })}
        </div>

        <p className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
          <Target size={13} className="shrink-0 text-[var(--accent)]" aria-hidden />
          Weakest: <span className="font-semibold text-[var(--foreground)]">Domain {weakest.code}</span> — your next drill
        </p>

        <ul className="space-y-2 border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)]">
          {POINTS.map((p) => (
            <li key={p} className="flex items-start gap-2">
              <Check size={16} className="mt-0.5 shrink-0 text-[var(--primary)]" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

// ── First name ──────────────────────────────────────────────────────────────

export function NameStep({ onDone, email }: { onDone: () => void; email?: string }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function save(e?: FormEvent) {
    e?.preventDefault();
    if (busy) return;
    if (!name.trim()) {
      setErr("Type a first name, or skip for now.");
      inputRef.current?.focus();
      return;
    }
    setBusy(true);
    setErr(null);
    const res = await setFirstName(name);
    setBusy(false);
    if (!res.ok) {
      setErr("Couldn't save that. Try again, or skip for now.");
      inputRef.current?.focus();
    } else onDone(); // the session's metadata update also arrives via onAuthChange
  }

  function skip() {
    try {
      localStorage.setItem(NAME_SKIP_KEY, "1");
    } catch {
      /* ignore */
    }
    onDone();
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <LogoTile />
        </div>
        <Card>
          <CardBody className="p-6 sm:p-7">
            {email && (
              <p className="mb-4 flex min-w-0 items-center gap-1.5 text-xs text-[var(--muted)]">
                <CheckCircle2 size={14} className="shrink-0 text-[var(--success)]" aria-hidden />
                <span className="truncate">
                  Signed in as <span className="font-semibold text-[var(--foreground)]">{email}</span>
                </span>
              </p>
            )}
            <h1 className="text-xl font-bold tracking-tight">What should we call you?</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Only used to greet you.</p>
            <form noValidate onSubmit={save} className="mt-5 space-y-5">
              <TextField
                ref={inputRef}
                label="First name"
                name="given-name"
                autoComplete="given-name"
                autoCapitalize="words"
                maxLength={40}
                autoFocus
                value={name}
                error={err}
                onChange={(e) => {
                  setName(e.target.value);
                  if (err) setErr(null);
                }}
              />
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? (
                    <>
                      <Spinner /> Saving…
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight size={16} aria-hidden />
                    </>
                  )}
                </Button>
                <Button type="button" variant="ghost" className="w-full" disabled={busy} onClick={skip}>
                  Skip for now
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}

// ── Exam picker ─────────────────────────────────────────────────────────────
// Just the cards, nothing else. Picking one loads its dashboard; logging out
// (or "All exams") clears the choice so the next load lands here again.

export function ExamTiles() {
  const packs = listPacks();
  const [opening, setOpening] = useState<ExamSlug | null>(null);
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-7 flex flex-col items-center gap-3">
          <LogoTile />
          <h1 className="text-2xl font-bold tracking-tight">Choose your exam</h1>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {packs.map(({ meta }) => {
            const isOpening = opening === meta.slug;
            return (
              <Card
                key={meta.slug}
                className={cn(
                  "press liftable hover:border-[var(--primary)] has-[:focus-visible]:border-[var(--primary)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--ring)]/40",
                  opening !== null && !isOpening && "opacity-50"
                )}
              >
                <button
                  type="button"
                  disabled={opening !== null}
                  aria-busy={isOpening || undefined}
                  onClick={() => {
                    haptic("tap");
                    setOpening(meta.slug);
                    switchExam(meta.slug); // stores the choice and reloads into that exam
                  }}
                  className="flex h-full w-full cursor-pointer flex-col items-center rounded-2xl px-5 py-6 text-center focus-visible:outline-none disabled:cursor-default sm:px-6 sm:py-7"
                >
                  <span className="text-3xl font-extrabold tracking-tight">{meta.name}</span>
                  {/* side by side, both names keep two lines so titles and badges align */}
                  <span className="mt-2 line-clamp-2 text-[13px] leading-snug text-[var(--muted)] sm:min-h-[2lh]">{meta.fullName}</span>
                  <span className="mt-4">
                    <Badge tone="primary">
                      {isOpening ? (
                        <>
                          <Spinner size={12} /> Opening…
                        </>
                      ) : (
                        meta.bokLabel
                      )}
                    </Badge>
                  </span>
                </button>
              </Card>
            );
          })}
        </div>
        <p className="mt-6 text-center text-xs text-[var(--muted)]">Coming soon: {COMING_SOON.join(" · ")}</p>
      </div>
    </main>
  );
}
