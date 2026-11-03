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

// Email + password form used both in Settings and on the full-screen gate.
export function AccountForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(mode: "in" | "up") {
    if (!email.trim() || !password) return;
    setBusy(true);
    setMsg(null);
    const res = mode === "in" ? await signIn(email.trim(), password) : await signUp(email.trim(), password);
    setBusy(false);
    if (!res.ok) {
      setMsg(res.error ?? "Something went wrong.");
      return;
    }
    if (mode === "up" && "needsConfirm" in res && res.needsConfirm) {
      setMsg("Account created — check your email for the confirmation link, then log in here.");
    }
    // On success the session change propagates via onAuthChange; no local state needed.
  }

  return (
    <div className="space-y-2">
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
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit("in")}
        placeholder="Password (at least 6 characters)"
        className={inputCls}
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="accent" disabled={busy || !email.trim() || password.length < 6} onClick={() => submit("in")}>
          <LogIn size={16} /> Log in
        </Button>
        <Button variant="outline" disabled={busy || !email.trim() || password.length < 6} onClick={() => submit("up")}>
          Create account
        </Button>
      </div>
      {msg && <p className="text-xs text-[var(--muted)]">{msg}</p>}
      <p className="text-xs text-[var(--muted)]">You stay signed in on this device until you log out — no session expiry.</p>
    </div>
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
