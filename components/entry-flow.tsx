"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Check, GraduationCap, Sparkles } from "lucide-react";
import { authRequired, firstNameOf, setFirstName } from "@/lib/account";
import { hasStoredExam, switchExam } from "@/lib/exam-state";
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
  if (!hasStoredExam()) return <ExamTiles />;
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
            <div className="font-display text-lg font-extrabold">Get started</div>
            <p className="text-xs text-[var(--muted)]">Your progress backs up to your account automatically and follows you across devices.</p>
            <AccountForm defaultMode="up" />
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

// Post-login exam picker: just the cards, nothing else. Picking one loads its
// dashboard; logging out clears the choice so the next login lands here again.
export function ExamTiles() {
  const packs = listPacks();
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--primary)] text-[var(--primary-fg)]">
            <GraduationCap size={16} />
          </div>
          <span className="font-display text-lg font-extrabold">Choose your exam</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {packs.map((p) => (
            <button
              key={p.meta.slug}
              onClick={() => switchExam(p.meta.slug)}
              className="press liftable cursor-pointer rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-6 text-center transition-colors hover:border-[var(--primary)]"
            >
              <span className="font-display block text-3xl font-extrabold">{p.meta.name}</span>
              <span className="mt-2 block text-xs leading-snug text-[var(--muted)]">{p.meta.fullName}</span>
              <Badge tone="primary" className="mt-3">{p.meta.bokLabel}</Badge>
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          Coming soon: {COMING_SOON.map((c) => c.name).join(" · ")}
        </p>
      </div>
    </div>
  );
}
