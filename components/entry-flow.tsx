"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Check, GraduationCap, Sparkles } from "lucide-react";
import { authRequired, firstNameOf, setFirstName } from "@/lib/account";
import { hasStoredExam, progressKeyFor, switchExam, type ExamSlug } from "@/lib/exam-state";
import { listPacks } from "@/lib/exam-registry";
import { AccountForm, useSession } from "@/components/account";
import { Badge, Button, Card, CardBody } from "@/components/ui";

// The SaaS front door (active when NEXT_PUBLIC_REQUIRE_AUTH=true):
// welcome (register/login) → first name → exam tiles → the app.
// Each step is skipped once satisfied, so returning users go straight in.

const NAME_SKIP_KEY = "coach-name-skip";

const COMING_SOON = [
  { name: "CIPP/US", fullName: "Certified Information Privacy Professional / United States" },
  { name: "CIPM", fullName: "Certified Information Privacy Manager" },
  { name: "CIPT", fullName: "Certified Information Privacy Technologist" },
];

function nameSkipped(): boolean {
  try {
    return localStorage.getItem(NAME_SKIP_KEY) === "1";
  } catch {
    return false;
  }
}

export function EntryFlow({ children }: { children: ReactNode }) {
  const { session, ready } = useSession();
  const [mounted, setMounted] = useState(false);
  const [, bump] = useState(0);
  useEffect(() => setMounted(true), []);

  // Open mode (clones without the flag): no gate, no steps — straight in.
  if (!authRequired) return <>{children}</>;

  if (!ready || !mounted) return <Splash />;
  if (!session) return <Welcome />;
  if (!firstNameOf(session) && !nameSkipped()) return <NameStep onDone={() => bump((x) => x + 1)} />;
  if (!hasStoredExam()) return <ExamTiles firstName={firstNameOf(session)} />;
  return <>{children}</>;
}

function Splash() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="flex items-center gap-2.5 opacity-70">
        <div className="grid h-9 w-9 animate-pulse place-items-center rounded-xl bg-[var(--primary)] text-[var(--primary-fg)]">
          <GraduationCap size={18} />
        </div>
        <span className="text-[15px] font-bold">AIGP Coach</span>
      </div>
    </div>
  );
}

function Welcome() {
  const packs = listPacks();
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="grid w-full max-w-4xl items-center gap-8 md:grid-cols-2">
        <div className="space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--primary)] text-[var(--primary-fg)]">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="text-lg font-bold leading-none">AIGP Coach</div>
              <div className="mt-0.5 text-[11px] font-medium text-[var(--muted)]">The IAPP exam simulator</div>
            </div>
          </div>
          <h1 className="font-display text-2xl font-extrabold leading-snug md:text-3xl">
            Train for the exam the way the exam actually behaves.
          </h1>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[var(--primary)]" /> Fixed mock papers on real timing, scored on the IAPP 100–500 scale.</li>
            <li className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[var(--primary)]" /> Every question explains why the right answer wins — and why the near-miss loses.</li>
            <li className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[var(--primary)]" /> Law Lab mindmaps, confusable tables, and a readiness score with reasons attached.</li>
          </ul>
          <div className="flex flex-wrap items-center gap-1.5">
            {packs.map((p) => (
              <Badge key={p.meta.slug} tone="primary">{p.meta.name}</Badge>
            ))}
            {COMING_SOON.map((c) => (
              <span key={c.name} className="rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--muted)]">{c.name} soon</span>
            ))}
          </div>
        </div>
        <Card>
          <CardBody className="space-y-3">
            <div className="font-display text-lg font-extrabold">Create your account</div>
            <p className="text-xs text-[var(--muted)]">Your progress backs up to your account automatically and follows you across devices. Already have one? Log in below.</p>
            <AccountForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function NameStep({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    if (!name.trim()) return;
    setBusy(true);
    setErr(null);
    const res = await setFirstName(name);
    setBusy(false);
    if (!res.ok) setErr(res.error ?? "Could not save that — try again.");
    else onDone(); // session metadata update also propagates via onAuthStateChange
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardBody className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[var(--accent)]" />
              <span className="font-display text-lg font-extrabold">One thing before we start</span>
            </div>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">What should we call you?</span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && save()}
                placeholder="First name"
                className="w-full rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <div className="flex items-center gap-2">
              <Button variant="accent" disabled={busy || !name.trim()} onClick={save}>
                Continue <ArrowRight size={15} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => {
                  try {
                    localStorage.setItem(NAME_SKIP_KEY, "1");
                  } catch {
                    /* ignore */
                  }
                  onDone();
                }}
              >
                Skip
              </Button>
            </div>
            {err && <p className="text-xs text-[var(--danger)]">{err}</p>}
            <p className="text-xs text-[var(--muted)]">Used only to greet you on your dashboard.</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function peekStats(slug: ExamSlug): { attempts: number; streak: number } | null {
  try {
    const raw = localStorage.getItem(progressKeyFor(slug));
    if (!raw) return null;
    const s = JSON.parse(raw)?.state;
    const attempts = Array.isArray(s?.attempts) ? s.attempts.length : 0;
    if (!attempts) return null;
    return { attempts, streak: typeof s?.streakCount === "number" ? s.streakCount : 0 };
  } catch {
    return null;
  }
}

export function ExamTiles({ firstName }: { firstName?: string }) {
  const packs = listPacks();
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-16">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        {firstName ? `Welcome, ${firstName}` : "Welcome"}
      </div>
      <h1 className="font-display text-2xl font-extrabold">Choose your exam</h1>
      <p className="mb-6 mt-1 text-sm text-[var(--muted)]">Each exam keeps its own progress, mock record and readiness. You can switch any time from the top-left corner.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {packs.map((p) => {
          const stats = peekStats(p.meta.slug);
          const qs = p.questions.length;
          const papers = p.paperDefs.length;
          return (
            <Card key={p.meta.slug} className="liftable">
              <CardBody className="flex h-full flex-col gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xl font-extrabold">{p.meta.name}</span>
                    <Badge tone="primary">{p.meta.bokLabel}</Badge>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{p.meta.fullName}</p>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                  <span className="font-semibold text-[var(--foreground)]">{qs} questions</span>
                  <span>{p.topics.length} topics</span>
                  <span>{papers} papers</span>
                  <span>{p.lawlab.maps.length} law maps</span>
                </div>
                {stats && (
                  <p className="text-xs font-semibold text-[var(--primary)]">
                    {stats.attempts} answered on this device{stats.streak > 0 ? ` · ${stats.streak}-day streak` : ""}
                  </p>
                )}
                <div className="mt-auto pt-1">
                  <Button variant="accent" onClick={() => switchExam(p.meta.slug)}>
                    {stats ? "Continue" : "Start"} <ArrowRight size={15} />
                  </Button>
                </div>
              </CardBody>
            </Card>
          );
        })}
        {COMING_SOON.map((c) => (
          <Card key={c.name} className="border-dashed opacity-70">
            <CardBody className="flex h-full flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-extrabold">{c.name}</span>
                <Badge tone="warning">In the works</Badge>
              </div>
              <p className="text-xs leading-relaxed text-[var(--muted)]">{c.fullName}</p>
              <p className="mt-auto pt-1 text-xs text-[var(--muted)]">Same engine — fixed papers, near-miss rationales, Law Lab.</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
