"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { LogIn, LogOut, RefreshCw, User } from "lucide-react";
import {
  authConfigured,
  authRequired,
  getSession,
  onAuthChange,
  pullAccountProgress,
  pushAccountProgress,
  signIn,
  signOut,
  signUp,
} from "@/lib/account";
import { useProgress } from "@/store/progress";
import { Badge, Button, Card, CardBody } from "@/components/ui";

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

const inputCls =
  "w-full rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm";

// Friendly wording for the auth errors people actually hit.
function friendlyAuthError(raw: string, mode: "in" | "up"): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials"))
    return mode === "in"
      ? "Wrong email or password. New here? Switch to Create account above."
      : "Wrong email or password.";
  if (m.includes("already registered")) return "That email already has an account — log in instead.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts — wait a minute and try again.";
  if (m.includes("valid email")) return "That doesn't look like a valid email address.";
  return raw;
}

// Email + password form used both in Settings and on the welcome screen.
// One mode at a time (tabs), a single primary action, and Enter submits the
// ACTIVE mode — so registering never silently turns into a failed login.
export function AccountForm({ defaultMode = "in" }: { defaultMode?: "in" | "up" }) {
  const [mode, setMode] = useState<"in" | "up">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: "error" | "info" } | null>(null);

  const shortPw = password.length > 0 && password.length < 6;

  async function submit() {
    if (busy || !email.trim() || password.length < 6) return;
    setBusy(true);
    setMsg(null);
    const res = mode === "in" ? await signIn(email.trim(), password) : await signUp(email.trim(), password);
    setBusy(false);
    if (!res.ok) {
      const text = friendlyAuthError(res.error ?? "Something went wrong — try again.", mode);
      if ((res.error ?? "").toLowerCase().includes("already registered")) setMode("in");
      setMsg({ text, tone: "error" });
      return;
    }
    if (mode === "up" && "needsConfirm" in res && res.needsConfirm) {
      setMsg({ text: "Account created — check your email for the confirmation link, then log in here.", tone: "info" });
    }
    // On success the session change propagates via onAuthChange; no local state needed.
  }

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-1">
        {(["up", "in"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setMsg(null);
            }}
            className={
              "flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold " +
              (mode === m ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted)]")
            }
          >
            {m === "up" ? "Create account" : "Log in"}
          </button>
        ))}
      </div>
      <input
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className={inputCls}
      />
      <input
        type="password"
        autoComplete={mode === "up" ? "new-password" : "current-password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={mode === "up" ? "Choose a password (6+ characters)" : "Password"}
        className={inputCls}
      />
      {shortPw && <p className="text-xs font-semibold text-[var(--warning)]">Password needs at least 6 characters.</p>}
      <Button type="submit" variant="accent" className="w-full" disabled={busy || !email.trim() || password.length < 6}>
        <LogIn size={16} /> {busy ? "One moment…" : mode === "up" ? "Create account" : "Log in"}
      </Button>
      {msg && (
        <p className={"text-xs font-semibold " + (msg.tone === "error" ? "text-[var(--danger)]" : "text-[var(--muted)]")}>
          {msg.text}
        </p>
      )}
      <p className="text-xs text-[var(--muted)]">You stay signed in on this device until you log out — no session expiry.</p>
    </form>
  );
}

// Settings card: sign in / register, and manual backup controls once signed in.
export function AccountCard() {
  const { session, ready } = useSession();
  const exportData = useProgress((s) => s.exportData);
  const importData = useProgress((s) => s.importData);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!authConfigured) return null;

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-center gap-2">
          <User size={18} className="text-[var(--accent)]" />
          <span className="font-display font-extrabold">Account</span>
          {session && <Badge tone="success">Signed in</Badge>}
        </div>

        {!ready ? (
          <p className="text-xs text-[var(--muted)]">Checking session…</p>
        ) : session ? (
          <>
            <p className="text-xs text-[var(--muted)]">
              Signed in as <strong>{session.user.email}</strong>. Your progress backs up to your account automatically a few
              seconds after each change, and follows you to any device you log in on.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="accent"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  const r = await pushAccountProgress(session.user.id, exportData());
                  setBusy(false);
                  setMsg(r.ok ? "Backed up just now." : `Backup failed: ${r.error}.`);
                }}
              >
                <RefreshCw size={14} /> Back up now
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  const r = await pullAccountProgress(session.user.id);
                  setBusy(false);
                  if (r.ok && r.data) {
                    importData(r.data);
                    setMsg("Progress restored from your account.");
                  } else {
                    setMsg(r.error === "not-found" ? "No backup on this account yet." : `Restore failed: ${r.error}.`);
                  }
                }}
              >
                Restore from account
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={async () => {
                  await signOut();
                  setMsg("Logged out. Your progress stays on this device.");
                }}
              >
                <LogOut size={14} /> Log out
              </Button>
            </div>
            <p className="text-xs text-[var(--muted)]">Restoring overwrites this device&apos;s progress with the account copy.</p>
          </>
        ) : (
          <>
            <p className="text-xs text-[var(--muted)]">
              Optional. An account backs your progress up automatically and syncs it across devices — or skip it and use the
              sync code below, no email needed.
            </p>
            <AccountForm />
          </>
        )}
        {msg && session && <p className="text-xs text-[var(--muted)]">{msg}</p>}
      </CardBody>
    </Card>
  );
}

// Full-screen gate for private instances (NEXT_PUBLIC_REQUIRE_AUTH=true):
// nothing renders until there is a session.
export function AuthGate({ children }: { children: ReactNode }) {
  const { session, ready } = useSession();

  if (!authRequired) return <>{children}</>;
  if (!ready) return <div className="grid min-h-screen place-items-center text-sm text-[var(--muted)]">Loading…</div>;
  if (session) return <>{children}</>;

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardBody className="space-y-3">
            <div className="font-display text-xl font-extrabold">AIGP Coach</div>
            <p className="text-sm text-[var(--muted)]">This instance requires an account. Log in or create one to continue.</p>
            <AccountForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
