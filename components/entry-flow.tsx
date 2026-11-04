"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, CheckCircle2, Target } from "lucide-react";
import { authRequired, firstNameOf, setFirstName } from "@/lib/account";
import { DEFAULT_EXAM, EXAM_SLUGS, hasStoredExam, switchExam, type ExamSlug } from "@/lib/exam-state";
import { getPack, listPacks } from "@/lib/exam-registry";
import { toScaledScore } from "@/lib/scoring";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { AccountForm, isReturningUser, useSession } from "@/components/account";
import { AnimatedNumber } from "@/components/motion";
import { LiquidOrb } from "@/components/liquid-orb";
import { Badge, Bar, Button, Card, CardBody, Chip } from "@/components/ui";
import { BrandMark, EXAM_SCOPE, LogoTile, Spinner, Splash, TextField } from "@/components/entry-ui";

// The front door.
// • Account-first (NEXT_PUBLIC_REQUIRE_AUTH=true): welcome (register/login) →
//   first name → exam tiles → the app. Each step is skipped once satisfied,
//   so returning users go straight in.
// • Open mode: no account steps. The exam tiles show until an exam has been
//   chosen on this device (first visit, or after "All exams").
// Both modes show the Splash for the server render and the hydration pass, so
// nothing that reads the session or localStorage has to match the server.

const NAME_SKIP_KEY = "coach-name-skip";
const COMING_SOON = "CIPP/US, CIPM and CIPT are coming soon";

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

// The exam chips preview each exam's light on the whole door (the room
// changes). Nothing is stored; the page's own light comes back on the way out.
function useExamPreview() {
  const [slug, setSlug] = useState<ExamSlug>(() => {
    const v = typeof document === "undefined" ? null : document.documentElement.getAttribute("data-exam");
    return (EXAM_SLUGS as readonly string[]).includes(v ?? "") ? (v as ExamSlug) : DEFAULT_EXAM;
  });
  useEffect(() => {
    const root = document.documentElement;
    const original = root.getAttribute("data-exam");
    return () => {
      if (original) root.setAttribute("data-exam", original);
      else root.removeAttribute("data-exam");
    };
  }, []);
  const preview = useCallback((next: ExamSlug) => {
    haptic("tap");
    setSlug(next);
    document.documentElement.setAttribute("data-exam", next);
  }, []);
  return { slug, preview };
}

const POINTS = ["Fixed mock papers on real exam timing", "Every answer explained, near-misses too", "A readiness score with the reasons"];

export function Welcome() {
  const packs = listPacks();
  const returning = isReturningUser();
  const { slug, preview } = useExamPreview();
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center gap-8 px-4 py-8 sm:px-6 md:py-12">
      <header className="space-y-5">
        <BrandMark />
        <h1 className="max-w-3xl text-balance text-[31px] font-extrabold leading-[1.06] sm:text-[49px]">
          Train for the exam the way the exam actually behaves.
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div role="group" aria-label="Preview an exam" className="flex gap-1.5">
            {packs.map(({ meta }) => (
              <Chip
                key={meta.slug}
                data-exam={meta.slug}
                style={EXAM_SCOPE}
                selected={slug === meta.slug}
                title={meta.fullName}
                onClick={() => preview(meta.slug)}
                className="h-11 px-4 text-[color-mix(in_srgb,var(--primary)_82%,var(--foreground))] sm:h-8 sm:px-3"
              >
                {meta.name}
              </Chip>
            ))}
          </div>
          <span className="text-[13px] text-[var(--muted)]">{COMING_SOON}</span>
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
          <ScoreSample slug={slug} />
        </div>
      </div>
    </main>
  );
}

// The hero instrument: what a finished mock looks like, for the exam being
// previewed. The numbers tie — each domain gets its blueprint share of the
// scored questions, the domains sum to the raw score, and the scaled score
// comes from the app's own IAPP 100–500 mapping.
const SAMPLE_ACCURACY: Partial<Record<ExamSlug, number[]>> = {
  aigp: [0.86, 0.72, 0.81, 0.78],
  cippe: [0.9, 0.7, 0.82, 0.62, 0.75],
};
const onScale = (scaled: number) => ((scaled - 100) / 400) * 100;

function sampleFor(slug: ExamSlug) {
  const pack = getPack(slug);
  const accuracy = SAMPLE_ACCURACY[slug] ?? [];
  const domains = [...pack.domains]
    .sort((a, b) => a.sort - b.sort)
    .map((d, i) => {
      const of = Math.round((d.minQ + d.maxQ) / 2);
      return { code: d.code, of, right: Math.min(of, Math.round(of * (accuracy[i] ?? 0.78))) };
    });
  const right = domains.reduce((n, d) => n + d.right, 0);
  const of = domains.reduce((n, d) => n + d.of, 0);
  const weakest = [...domains].sort((a, b) => a.right / a.of - b.right / b.of)[0];
  return { meta: pack.meta, domains, right, of, weakest, pct: Math.round((right / of) * 100), scaled: toScaledScore(right / of) };
}

function ScoreSample({ slug }: { slug: ExamSlug }) {
  const { meta, domains, right, of, weakest, pct, scaled } = sampleFor(slug);
  const passed = scaled >= meta.passScaled;
  return (
    <Card role="group" aria-label={`Example ${meta.name} mock result: ${scaled} of 500, ${pct}% correct`} className="mesh h-full">
      {/* justify-between spreads any height the form adds evenly, so the two
          panels share both edges without a dead band in this one. */}
      <CardBody className="flex h-full flex-col justify-between gap-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-[var(--muted)]">Example {meta.name} mock</span>
          <Badge tone={passed ? "success" : "danger"}>
            <Check size={12} aria-hidden /> {passed ? "Above pass line" : "Below pass line"}
          </Badge>
        </div>

        <div className="flex items-center gap-5">
          <LiquidOrb value={pct} size={112} sub="% correct" label={`Example ${meta.name} mock, percent correct`} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5">
              <AnimatedNumber value={scaled} className="font-display text-[39px] font-extrabold leading-none" />
              <span className="text-sm text-[var(--muted)]">/ 500</span>
            </div>
            <div className="mt-1 text-[13px] text-[var(--muted)]">
              Scaled score, {right} of {of} right
            </div>
            <div className="relative mt-3">
              <Bar value={onScale(scaled)} />
              <span
                aria-hidden
                className="absolute -top-1 -bottom-1 w-0.5 -translate-x-1/2 rounded-full bg-[var(--foreground)]/50"
                style={{ left: `${onScale(meta.passScaled)}%` }}
              />
            </div>
            <div aria-hidden className="relative mt-1.5 h-3.5 text-[11px] font-medium tabular-nums text-[var(--muted)]">
              <span className="absolute left-0">100</span>
              <span className="absolute -translate-x-1/2" style={{ left: `${onScale(meta.passScaled)}%` }}>
                {meta.passScaled} pass
              </span>
              <span className="absolute right-0">500</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-4">
          <div className="mb-2 text-[13px] text-[var(--muted)]">By domain</div>
          <div
            className="grid grid-cols-[repeat(var(--n),minmax(0,1fr))] gap-x-4 gap-y-3"
            style={{ "--n": domains.length } as CSSProperties}
          >
            {domains.map((d) => {
              const p = Math.round((d.right / d.of) * 100);
              return (
                <div key={d.code} className="min-w-0">
                  <div className="flex items-baseline justify-between gap-1 text-xs">
                    <span className="font-semibold text-[var(--muted)]">
                      <span className="sr-only">Domain </span>
                      {d.code}
                    </span>
                    <span className="font-semibold tabular-nums">{p}%</span>
                  </div>
                  <Bar value={p} tone={p >= 80 ? "success" : p >= 60 ? "warning" : "danger"} className="mt-1.5 h-1.5" />
                </div>
              );
            })}
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-[13px] text-[var(--muted)]">
          <Target size={14} className="shrink-0 text-[var(--primary)]" aria-hidden />
          Weakest: <span className="font-semibold text-[var(--foreground)]">Domain {weakest.code}</span> — your next drill
        </p>

        <ul className="space-y-2 border-t border-[var(--border)] pt-4 text-sm">
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

function greetingWord(): string {
  const h = new Date().getHours();
  if (h < 5) return "Late-night session";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function NameStep({ onDone, email }: { onDone: () => void; email?: string }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [hello] = useState(greetingWord);
  const inputRef = useRef<HTMLInputElement>(null);
  const first = name.trim();

  async function save(e?: FormEvent) {
    e?.preventDefault();
    if (busy) return;
    if (!first) {
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
              <p className="mb-4 flex min-w-0 items-center gap-1.5 text-[13px] text-[var(--muted)]">
                <CheckCircle2 size={14} className="shrink-0 text-[var(--success)]" aria-hidden />
                <span className="truncate">
                  Signed in as <span className="font-semibold text-[var(--foreground)]">{email}</span>
                </span>
              </p>
            )}
            <h1 className="text-[25px] font-extrabold leading-tight">What should we call you?</h1>
            {/* The hint previews the greeting it is for. */}
            <p className="mt-1 min-h-[1lh] truncate text-[15px] text-[var(--muted)]">
              {first ? (
                <>
                  {hello}, <span className="font-semibold text-[var(--primary)]">{first}</span>.
                </>
              ) : (
                "Only used to greet you."
              )}
            </p>
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
// Just the cards, nothing else — each lit in its own exam's light. Picking one
// fills it with that exam's liquid while the dashboard loads.

export function ExamTiles() {
  const packs = listPacks();
  const reduce = useReducedMotion();
  const [opening, setOpening] = useState<ExamSlug | null>(null);
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-8 flex flex-col items-center gap-3">
          <LogoTile />
          <h1 className="text-[31px] font-extrabold leading-tight">Choose your exam</h1>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {packs.map(({ meta }) => {
            const isOpening = opening === meta.slug;
            return (
              <Card
                key={meta.slug}
                data-exam={meta.slug}
                style={EXAM_SCOPE}
                className={cn(
                  "mesh press liftable relative overflow-hidden has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--ring)] has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[var(--canvas)]",
                  opening !== null && !isOpening && "opacity-50"
                )}
              >
                {isOpening && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 origin-bottom"
                    style={{
                      background:
                        "linear-gradient(180deg, color-mix(in srgb, var(--glow) 34%, transparent), color-mix(in srgb, var(--primary) 28%, transparent))",
                    }}
                    initial={reduce ? false : { scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                  />
                )}
                <button
                  type="button"
                  disabled={opening !== null}
                  aria-busy={isOpening || undefined}
                  onClick={() => {
                    haptic("tap");
                    setOpening(meta.slug);
                    // Stores the choice and reloads into that exam — back to the deep link the visitor arrived on.
                    switchExam(meta.slug, window.location.pathname + window.location.search + window.location.hash);
                  }}
                  className="relative flex h-full w-full cursor-pointer flex-col items-center rounded-[22px] px-5 py-7 text-center focus-visible:outline-none disabled:cursor-default sm:px-6 sm:py-8"
                >
                  <span className="font-display text-[39px] font-extrabold leading-none text-[color-mix(in_srgb,var(--primary)_82%,var(--foreground))]">
                    {meta.name}
                  </span>
                  {/* side by side, both names keep two lines so titles and badges align */}
                  <span className="mt-2.5 line-clamp-2 text-[13px] leading-snug text-[var(--muted)] sm:min-h-[2lh]">{meta.fullName}</span>
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
        <p className="mt-6 text-center text-[13px] text-[var(--muted)]">{COMING_SOON}</p>
      </div>
    </main>
  );
}
