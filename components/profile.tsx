"use client";

import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Check, CloudUpload, History, LogOut, Pencil } from "lucide-react";
import { firstNameOf, getPlan, pullAccountProgress, pushAccountProgress, setFirstName } from "@/lib/account";
import { Avatar, displayName, useSignOut } from "@/components/user-menu";
import { useProgress } from "@/store/progress";
import { Badge, Button, Card, CardBody, PageHeader } from "@/components/ui";

// Two-step confirm: the first click arms for a few seconds, the second acts.
function useArm(ms = 6000) {
  const [armed, setArmed] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);
  const arm = () => {
    setArmed(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setArmed(false), ms);
  };
  const disarm = () => {
    clearTimeout(t.current);
    setArmed(false);
  };
  return { armed, arm, disarm };
}

export function SignedInProfile({ session }: { session: Session }) {
  const first = firstNameOf(session);
  const name = displayName(first, session.user.email);
  const exportData = useProgress((s) => s.exportData);
  const importData = useProgress((s) => s.importData);
  const { busy: signingOut, run: doSignOut } = useSignOut();
  const restoreArm = useArm();

  const [plan, setPlan] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(first);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; tone: "ok" | "error" } | null>(null);

  useEffect(() => {
    let live = true;
    getPlan(session.user.id).then((p) => live && setPlan(p));
    return () => {
      live = false;
    };
  }, [session.user.id]);

  const since = session.user.created_at
    ? new Date(session.user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : null;

  async function saveName() {
    if (!draft.trim()) return;
    setSaving(true);
    const res = await setFirstName(draft);
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      setMsg({ text: "Name updated.", tone: "ok" });
    } else setMsg({ text: res.error ?? "Couldn't save that — try again.", tone: "error" });
  }

  async function backupNow() {
    setBusy(true);
    const r = await pushAccountProgress(session.user.id, exportData());
    setBusy(false);
    setMsg(r.ok ? { text: "Backed up just now.", tone: "ok" } : { text: `Backup failed: ${r.error}.`, tone: "error" });
  }

  async function restore() {
    restoreArm.disarm();
    setBusy(true);
    const r = await pullAccountProgress(session.user.id);
    setBusy(false);
    if (r.ok && r.data) {
      importData(r.data);
      setMsg({ text: "Progress restored from your account.", tone: "ok" });
    } else {
      setMsg({ text: r.error === "not-found" ? "No backup for this exam yet." : `Restore failed: ${r.error}.`, tone: "error" });
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Profile" />

      <Card>
        <CardBody className="flex flex-wrap items-center gap-4">
          <Avatar name={name} size={64} />
          <div className="min-w-0 flex-1">
            {editing ? (
              <form
                className="flex flex-wrap items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveName();
                }}
              >
                <label htmlFor="first-name" className="sr-only">First name</label>
                <input
                  id="first-name"
                  autoFocus
                  value={draft}
                  maxLength={40}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
                  placeholder="First name"
                  className="h-10 min-w-0 flex-1 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                />
                <Button type="submit" size="sm" disabled={saving || !draft.trim()}>{saving ? "Saving…" : "Save"}</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <span className="truncate font-display text-xl font-extrabold">{first || name}</span>
                <button
                  onClick={() => {
                    setDraft(first);
                    setEditing(true);
                  }}
                  aria-label="Edit first name"
                  className="press grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}
            <div className="truncate text-sm text-[var(--muted)]">{session.user.email}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
              <Badge tone="primary">{plan ? `${plan.charAt(0).toUpperCase()}${plan.slice(1)} plan` : "Free plan"}</Badge>
              {since && <span>Member since {since}</span>}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-[var(--success)]" />
            <span className="text-sm font-semibold">Progress backs up automatically</span>
          </div>
          <p className="text-xs text-[var(--muted)]">Saved to your account a few seconds after each answer, per exam.</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={busy} onClick={backupNow}>
              <CloudUpload size={14} /> Back up now
            </Button>
            <Button size="sm" variant={restoreArm.armed ? "danger" : "outline"} disabled={busy} onClick={restoreArm.armed ? restore : restoreArm.arm}>
              <History size={14} /> {restoreArm.armed ? "Replace this device's progress?" : "Restore from account"}
            </Button>
          </div>
        </CardBody>
      </Card>

      {msg && (
        <p role="status" className={msg.tone === "error" ? "text-sm font-semibold text-[var(--danger)]" : "text-sm font-semibold text-[var(--success)]"}>
          {msg.text}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
        <span className="text-xs text-[var(--muted)]">Signed in on this device until you sign out.</span>
        <Button size="sm" variant="ghost" disabled={signingOut} onClick={doSignOut} className="text-[var(--danger)] hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]">
          <LogOut size={14} /> {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </div>
  );
}
