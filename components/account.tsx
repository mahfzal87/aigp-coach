"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { Session } from "@supabase/supabase-js";
import { AlertCircle, ArrowRight, Eye, EyeOff, Info, LogOut, MailCheck, RefreshCw, ShieldCheck, User } from "lucide-react";
import {
  authConfigured,
  authRequired,
  firstNameOf,
  getSession,
  onAuthChange,
  pullAccountProgress,
  pushAccountProgress,
  signIn,
  signOut,
  signUp,
} from "@/lib/account";
import type { ProgressExport } from "@/lib/types";
import { useProgress } from "@/store/progress";
import { Badge, Button, Card, CardBody } from "@/components/ui";
import { BrandMark, Flash, Spinner, Splash, TextField, useArm, useFlash, useLensTransition } from "@/components/entry-ui";
import { cn } from "@/lib/utils";

// Session state shared by the settings card, the auth gate and the account
// sync manager. `ready` stays false until the persisted session (if any) has
// been read back from storage, so the gate never flashes the login screen at
// an already-signed-in user.
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!authConfigured);

  useEffect(() => {
    if (!authConfigured) return;
    let mounted = true;
    getSession().then((s) => {
      if (mounted) {
        setSession(s);
        setReady(true);
      }
    });
    const off = onAuthChange((s) => {
      setSession(s);
      setReady(true);
    });
    return () => {
      mounted = false;
      off();
    };
  }, []);

  return { session, ready };
}

// This device has had an account on it before → the welcome screen opens on
// "Log in" rather than "Create account". Survives sign-out on purpose.
const RETURNING_KEY = "coach-returning";

export function isReturningUser(): boolean {
  try {
    return localStorage.getItem(RETURNING_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberReturning() {
  try {
    localStorage.setItem(RETURNING_KEY, "1");
  } catch {
    /* storage unavailable */
  }
}

// ── Auth form ───────────────────────────────────────────────────────────────

type Mode = "in" | "up";
type Errors = { email?: string; password?: string; form?: string };
type Fix = { label: string; mode: Mode }; // one-tap recovery shown with an error

const TABS: { id: Mode; label: string }[] = [
  { id: "up", label: "Create account" },
  { id: "in", label: "Log in" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(mode: Mode, email: string, password: string): Errors {
  const out: Errors = {};
  const e = email.trim();
  if (!e) out.email = "Enter your email address.";
  else if (!EMAIL_RE.test(e)) out.email = "That email looks incomplete.";
  if (!password) out.password = mode === "up" ? "Choose a password." : "Enter your password.";
  else if (mode === "up" && password.length < 6) out.password = "Use at least 6 characters.";
  return out;
}

function sentence(raw: string): string {
  const t = raw.trim();
  if (!t) return "Something went wrong. Try again.";
  const s = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.!?]$/.test(s) ? s : `${s}.`;
}

// Supabase auth errors → the field they belong to, in plain words, with a
// recovery step where there is one.
function mapAuthError(raw: string, mode: Mode): { errors: Errors; notice?: string; fix?: Fix; switchTo?: Mode } {
  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials"))
    return {
      errors: { password: "Wrong email or password." },
      fix: mode === "in" ? { label: "New here? Create an account", mode: "up" } : undefined,
    };
  if (m.includes("already registered") || m.includes("already been registered") || m.includes("already exists"))
    return { errors: {}, switchTo: "in", notice: "That email already has an account — log in." };
  if (m.includes("not confirmed")) return { errors: { email: "Confirm your email first — the link is in your inbox." } };
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes"))
    return { errors: { form: "Too many attempts. Wait a minute, then try again." } };
  if (m.includes("password")) {
    if (m.includes("at least") || m.includes("short")) return { errors: { password: "Use at least 6 characters." } };
    if (m.includes("weak") || m.includes("guess") || m.includes("pwned")) return { errors: { password: "Too easy to guess — try a stronger one." } };
    return { errors: { password: sentence(raw) } };
  }
  if (m.includes("email") && (m.includes("invalid") || m.includes("valid") || m.includes("format")))
    return { errors: { email: "That email address isn't valid." } };
  if ((m.includes("signup") || m.includes("sign up")) && (m.includes("disabled") || m.includes("not allowed")))
    return { errors: { form: "New sign-ups are closed right now." } };
  if (m.includes("fetch") || m.includes("network") || m.includes("timed out") || m.includes("timeout"))
    return { errors: { form: "Can't reach the server. Check your connection and try again." } };
  if (m === "not-configured") return { errors: { form: "Accounts aren't set up on this copy of the app." } };
  return { errors: { form: sentence(raw) } };
}

// Email + password form used on the welcome screen, the profile page, the auth
// gate and the settings card. One mode at a time (tabs) and one submit button,
// so Enter always submits the ACTIVE mode — registering never silently turns
// into a failed login. Errors sit under the field they belong to.
export function AccountForm({ defaultMode = "in", autoFocus = false }: { defaultMode?: Mode; autoFocus?: boolean }) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [caps, setCaps] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [fix, setFix] = useState<Fix | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);
  const tabRefs = useRef<Partial<Record<Mode, HTMLButtonElement | null>>>({});
  const busyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const uid = useId();
  const pwId = `${uid}-password`;
  const lens = useLensTransition();

  useEffect(() => () => clearTimeout(busyTimer.current), []);

  // Desktop only: on phones an instant keyboard would cover the screen.
  useEffect(() => {
    if (autoFocus && window.matchMedia("(hover: hover) and (pointer: fine)").matches) emailRef.current?.focus();
  }, [autoFocus]);

  function switchMode(next: Mode, focus?: "email" | "password") {
    setMode(next);
    setErrors({});
    setNotice(null);
    setFix(null);
    setSentTo(null);
    if (focus) requestAnimationFrame(() => (focus === "email" ? emailRef : pwRef).current?.focus());
  }

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const next: Mode = e.key === "Home" ? "up" : e.key === "End" ? "in" : mode === "up" ? "in" : "up";
    if (next !== mode) switchMode(next);
    tabRefs.current[next]?.focus();
  }

  function onCaps(e: KeyboardEvent<HTMLInputElement>) {
    const on = e.getModifierState?.("CapsLock") ?? false;
    if (on !== caps) setCaps(on);
  }

  async function submit() {
    if (busy) return;
    const v = validate(mode, email, password);
    setFix(null);
    setNotice(null);
    if (v.email || v.password) {
      setErrors(v);
      (v.email ? emailRef : pwRef).current?.focus();
      return;
    }
    setErrors({});
    setShowPw(false); // back to a password field so password managers offer to save
    setBusy(true);
    const res = mode === "in" ? await signIn(email.trim(), password) : await signUp(email.trim(), password);
    if (!res.ok) {
      setBusy(false);
      const mapped = mapAuthError(res.error ?? "", mode);
      if (mapped.switchTo) setMode(mapped.switchTo);
      setErrors(mapped.errors);
      setNotice(mapped.notice ?? null);
      setFix(mapped.fix ?? null);
      if (mapped.errors.email) emailRef.current?.focus();
      else pwRef.current?.focus();
      return;
    }
    rememberReturning();
    if (mode === "up" && "needsConfirm" in res && res.needsConfirm) {
      setBusy(false);
      setSentTo(email.trim());
      setPassword("");
      return;
    }
    // Signed in: the session reaches every screen via onAuthChange and this
    // form unmounts, so keep the spinner until then (with a fallback).
    busyTimer.current = setTimeout(() => setBusy(false), 6000);
  }

  if (sentTo) {
    return <CheckInbox email={sentTo} onLogin={() => switchMode("in", "password")} onChangeEmail={() => switchMode("up", "email")} />;
  }

  const passwordError = errors.password ? (
    <>
      {errors.password}
      {fix && (
        <>
          {" "}
          <button
            type="button"
            onClick={() => switchMode(fix.mode, "password")}
            className="cursor-pointer font-semibold underline underline-offset-2 hover:opacity-80"
          >
            {fix.label}
          </button>
        </>
      )}
    </>
  ) : undefined;

  return (
    <form
      noValidate
      aria-busy={busy || undefined}
      className="@container"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      {/* Segmented control with the liquid lens gliding to the active mode. */}
      <div role="tablist" aria-label="Account" className="grid grid-cols-2 gap-1 rounded-full bg-[var(--surface-2)] p-1">
        {TABS.map((t) => {
          const on = mode === t.id;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${t.id}`}
              aria-selected={on}
              aria-controls={`${uid}-panel`}
              tabIndex={on ? 0 : -1}
              disabled={busy}
              onClick={() => !on && switchMode(t.id)}
              onKeyDown={onTabKey}
              className={cn(
                "press relative h-11 cursor-pointer rounded-full px-3 text-sm font-semibold focus-visible:outline-none sm:h-9 focus-visible:ring-2 focus-visible:ring-[var(--ring)]/50 disabled:cursor-not-allowed",
                on ? "text-[var(--primary)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              {on && (
                <motion.span
                  layoutId={`${uid}-lens`}
                  transition={lens}
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-[var(--primary)]/12 ring-1 ring-[var(--primary)]/22"
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${mode}`} className="mt-5 space-y-4">
        <div className="grid gap-4 @lg:grid-cols-2">
          <TextField
            ref={emailRef}
            label="Email"
            type="email"
            name="email"
            autoComplete="username"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="you@example.com"
            value={email}
            error={errors.email}
            onChange={(e) => {
              const next = e.target.value;
              setEmail(next);
              setFix(null);
              if (errors.email || errors.form) setErrors((x) => ({ ...x, email: x.email && validate(mode, next, password).email, form: undefined }));
            }}
            onBlur={(e) => {
              // read the live value: a blur can land before the last keystroke's render
              const value = e.currentTarget.value;
              const err = value.trim() ? validate(mode, value, password).email : undefined;
              if (err) setErrors((x) => ({ ...x, email: err }));
            }}
          />
          <TextField
            ref={pwRef}
            id={pwId}
            label="Password"
            type={showPw ? "text" : "password"}
            name="password"
            autoComplete={mode === "up" ? "new-password" : "current-password"}
            value={password}
            error={passwordError}
            warning={caps ? "Caps Lock is on." : undefined}
            hint={mode === "up" ? "At least 6 characters." : undefined}
            onChange={(e) => {
              const next = e.target.value;
              setPassword(next);
              setFix(null);
              if (errors.password || errors.form) setErrors((x) => ({ ...x, password: x.password && validate(mode, email, next).password, form: undefined }));
            }}
            onKeyDown={onCaps}
            onKeyUp={onCaps}
            onBlur={(e) => {
              setCaps(false);
              const value = e.currentTarget.value;
              if (mode === "up" && value && value.length < 6) setErrors((x) => ({ ...x, password: "Use at least 6 characters." }));
            }}
            trailing={
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label="Show password"
                aria-pressed={showPw}
                aria-controls={pwId}
                title={showPw ? "Hide password" : "Show password"}
                className="grid h-11 w-11 cursor-pointer place-items-center rounded-r-2xl text-[var(--muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]/50"
              >
                {showPw ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
              </button>
            }
          />
        </div>

        {notice && (
          <p role="status" className="flex items-start gap-1.5 text-xs font-medium leading-snug">
            <Info size={14} className="mt-px shrink-0 text-[var(--accent)]" aria-hidden />
            {notice}
          </p>
        )}
        {errors.form && (
          <p role="alert" className="flex items-start gap-1.5 text-xs font-medium leading-snug text-[var(--danger)]">
            <AlertCircle size={14} className="mt-px shrink-0" aria-hidden />
            {errors.form}
          </p>
        )}

        <div className="flex flex-col gap-3 @lg:flex-row @lg:items-center">
          <Button type="submit" className="w-full @lg:w-auto @lg:min-w-48" disabled={busy}>
            {busy ? (
              <>
                <Spinner /> {mode === "up" ? "Creating account…" : "Logging in…"}
              </>
            ) : (
              <>
                {mode === "up" ? "Create account" : "Log in"} <ArrowRight size={16} aria-hidden />
              </>
            )}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--muted)] @lg:justify-start">
            <ShieldCheck size={13} aria-hidden /> You stay signed in on this device.
          </p>
        </div>
      </div>
    </form>
  );
}

// After a sign-up that needs email confirmation: say what happened and offer
// the next step (log in once confirmed) plus the way back from a typo.
export function CheckInbox({ email, onLogin, onChangeEmail }: { email: string; onLogin: () => void; onChangeEmail?: () => void }) {
  return (
    <div role="status" className="text-center">
      <MailCheck size={30} className="mx-auto text-[var(--primary)]" aria-hidden />
      <h2 className="mt-3 text-lg font-bold tracking-tight">Check your inbox</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        We sent a confirmation link to
        <span className="block break-words font-semibold text-[var(--foreground)]">{email}</span>
      </p>
      <div className="mt-5 space-y-2">
        <Button className="w-full" onClick={onLogin}>
          I&apos;ve confirmed — log in <ArrowRight size={16} aria-hidden />
        </Button>
        {onChangeEmail && (
          <Button variant="ghost" className="w-full" onClick={onChangeEmail}>
            Use a different email
          </Button>
        )}
      </div>
    </div>
  );
}

// Account card: sign in / register, or manual backup controls once signed in.
// (Settings no longer shows it — the profile page owns account controls — but
// it stays exported for any page that wants the compact version.)
export function AccountCard() {
  const { session, ready } = useSession();
  const exportData = useProgress((s) => s.exportData);
  const importData = useProgress((s) => s.importData);
  const [busy, setBusy] = useState<"backup" | "restore" | "logout" | null>(null);
  const restore = useArm<ProgressExport>();
  const { msg, flash } = useFlash();

  if (!authConfigured) return null;

  if (!ready) {
    return (
      <Card>
        <CardBody className="text-xs text-[var(--muted)]">Checking session…</CardBody>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card>
        <CardBody className="space-y-4">
          <div>
            <div className="text-sm font-semibold">Back up with an account</div>
            <div className="mt-0.5 text-xs text-[var(--muted)]">Optional. Syncs progress across devices.</div>
          </div>
          <Flash msg={msg} />
          <AccountForm />
        </CardBody>
      </Card>
    );
  }

  const name = firstNameOf(session) || session.user.email?.split("@")[0] || "";
  const incoming = restore.armed?.attempts?.length ?? 0;

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-base font-bold text-[var(--primary-fg)]"
          >
            {name.charAt(0).toUpperCase() || <User size={18} />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-semibold">{name}</span>
              <Badge tone="success">Signed in</Badge>
            </div>
            <div className="truncate text-xs text-[var(--muted)]">{session.user.email}</div>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={busy === "logout"}
            onClick={async () => {
              setBusy("logout");
              await signOut(); // account-first mode reloads to the welcome screen
              if (!authRequired) {
                setBusy(null);
                flash("Logged out. Your progress stays on this device.", "info");
              }
            }}
          >
            {busy === "logout" ? <Spinner size={14} /> : <LogOut size={14} aria-hidden />} Log out
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={busy !== null}
            onClick={async () => {
              setBusy("backup");
              const r = await pushAccountProgress(session.user.id, exportData());
              setBusy(null);
              flash(r.ok ? "Backed up just now." : `Backup failed: ${r.error}.`, r.ok ? "ok" : "error");
            }}
          >
            {busy === "backup" ? <Spinner size={14} /> : <RefreshCw size={14} aria-hidden />} Back up now
          </Button>
          <Button
            size="sm"
            variant={restore.armed ? "danger" : "outline"}
            disabled={busy !== null}
            onBlur={restore.disarm}
            onClick={async () => {
              if (restore.armed) {
                importData(restore.armed);
                restore.disarm();
                flash(`Restored ${incoming} answers from your account.`);
                return;
              }
              setBusy("restore");
              const r = await pullAccountProgress(session.user.id);
              setBusy(null);
              if (r.ok && r.data) restore.arm(r.data);
              else flash(r.error === "not-found" ? "No backup on this account yet." : `Restore failed: ${r.error}.`, "error");
            }}
          >
            {busy === "restore" && <Spinner size={14} />}
            {restore.armed ? `Replace with ${incoming} answers?` : "Restore from account"}
          </Button>
        </div>
        <Flash msg={msg} />
      </CardBody>
    </Card>
  );
}

// Full-screen gate for private instances (NEXT_PUBLIC_REQUIRE_AUTH=true):
// nothing renders until there is a session.
export function AuthGate({ children }: { children: ReactNode }) {
  const { session, ready } = useSession();

  if (!authRequired) return <>{children}</>;
  if (!ready) return <Splash />;
  if (session) return <>{children}</>;

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        <Card>
          <CardBody className="p-6">
            <p className="mb-4 text-sm text-[var(--muted)]">Log in or create an account to continue.</p>
            <AccountForm autoFocus />
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
