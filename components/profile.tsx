"use client";

import { useEffect, useId, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { CloudUpload, History, LogOut, Pencil } from "lucide-react";
import { firstNameOf, getPlan, pullAccountProgress, pushAccountProgress, setFirstName } from "@/lib/account";
import type { ProgressExport } from "@/lib/types";
import { getActiveMeta } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Avatar, displayName, useSignOut } from "@/components/user-menu";
import { useProgress } from "@/store/progress";
import { Badge, Button, Card, CardBody, Input, PageHeader } from "@/components/ui";
import { Flash, SettingRow, SettingsSection, Spinner, rowCtl, useArm, useFlash } from "@/components/entry-ui";

// The signed-in profile: who you are (one lit glass hero), how your progress is
// kept, and the way out. Same row language as Settings.
export function SignedInProfile({ session }: { session: Session }) {
  return (
    <div>
      <PageHeader title="Profile" subtitle="Your progress backs up to your account automatically." />
      <div className="space-y-7">
        <IdentityCard session={session} />
        <SettingsSection id="backup" title="Backup">
          <Card className="divide-y divide-[var(--border)]">
            <BackupNowRow userId={session.user.id} />
            <RestoreRow userId={session.user.id} />
          </Card>
        </SettingsSection>
        <SettingsSection id="device" title="This device">
          <Card>
            <SignOutRow />
          </Card>
        </SettingsSection>
      </div>
    </div>
  );
}

function IdentityCard({ session }: { session: Session }) {
  const first = firstNameOf(session);
  const name = displayName(first, session.user.email);
  const [plan, setPlan] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(first);
  const [saving, setSaving] = useState(false);
  const { msg, flash } = useFlash();
  const inputId = useId();

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
  const planLabel = plan ? `${plan.charAt(0).toUpperCase()}${plan.slice(1)} plan` : "Free plan";

  function startEdit() {
    setDraft(first);
    setEditing(true);
  }

  async function saveName() {
    const next = draft.trim();
    if (!next) {
      flash("Type a first name.", "error");
      return;
    }
    if (next === first) {
      setEditing(false);
      return;
    }
    setSaving(true);
    const res = await setFirstName(next);
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      flash("Name updated. Your dashboard greets you with it.");
    } else flash("Couldn't save that. Try again.", "error");
  }

  return (
    <Card className="mesh">
      <CardBody className="flex items-start gap-4 p-6">
        <Avatar name={editing ? draft || name : first || name} size={64} />
        <div className="min-w-0 flex-1">
          {editing ? (
            <form
              className="flex flex-wrap items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void saveName();
              }}
            >
              <label htmlFor={inputId} className="sr-only">
                First name
              </label>
              <Input
                id={inputId}
                autoFocus
                value={draft}
                maxLength={40}
                autoComplete="given-name"
                autoCapitalize="words"
                placeholder="First name"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
                className="min-w-40 flex-1 sm:h-9"
              />
              <Button type="submit" size="sm" className={rowCtl} disabled={saving}>
                {saving ? <Spinner size={14} /> : null} Save
              </Button>
              <Button type="button" size="sm" variant="ghost" className={rowCtl} onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </form>
          ) : (
            <div className="flex min-w-0 items-center gap-1">
              <span className="truncate font-display text-[25px] font-extrabold leading-tight">{first || name}</span>
              {first ? (
                <button
                  onClick={startEdit}
                  aria-label="Edit first name"
                  className="press grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl sm:h-9 sm:w-9 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  <Pencil size={15} aria-hidden />
                </button>
              ) : (
                <Button size="sm" variant="soft" className={cn(rowCtl, "ml-1.5 shrink-0")} onClick={startEdit}>
                  Add first name
                </Button>
              )}
            </div>
          )}
          <div className="mt-0.5 truncate text-[15px] text-[var(--muted)]">{session.user.email}</div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <Badge tone="primary">{planLabel}</Badge>
            {since && <span className="text-[13px] text-[var(--muted)]">Member since {since}</span>}
          </div>
          <Flash msg={msg} className="mt-3" />
        </div>
      </CardBody>
    </Card>
  );
}

function BackupNowRow({ userId }: { userId: string }) {
  const exportData = useProgress((s) => s.exportData);
  const [busy, setBusy] = useState(false);
  const { msg, flash } = useFlash();
  return (
    <SettingRow
      title="Automatic backup"
      badge={<Badge tone="success">On</Badge>}
      hint="After every answer, one copy per exam."
      footer={<Flash msg={msg} className="mt-2" />}
    >
      <Button
        size="sm"
        variant="outline"
        className={rowCtl}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const r = await pushAccountProgress(userId, exportData());
          setBusy(false);
          if (r.ok) flash("Backed up just now.");
          else flash(`Backup failed: ${r.error}.`, "error");
        }}
      >
        {busy ? <Spinner size={14} /> : <CloudUpload size={14} aria-hidden />} Back up now
      </Button>
    </SettingRow>
  );
}

// First press fetches the account copy and arms with what it holds; the second replaces.
function RestoreRow({ userId }: { userId: string }) {
  const importData = useProgress((s) => s.importData);
  const onDevice = useProgress((s) => s.attempts.length);
  const meta = getActiveMeta();
  const [busy, setBusy] = useState(false);
  const pending = useArm<ProgressExport>();
  const { msg, flash, clear } = useFlash();
  const incoming = pending.armed?.attempts?.length ?? 0;

  async function restore() {
    if (busy) return;
    if (pending.armed) {
      importData(pending.armed);
      pending.disarm();
      flash(`Restored ${incoming} answers from your account.`);
      return;
    }
    clear();
    setBusy(true);
    const r = await pullAccountProgress(userId);
    setBusy(false);
    if (r.ok && r.data) pending.arm(r.data);
    else flash(r.error === "not-found" ? `No ${meta.name} backup on this account yet.` : `Restore failed: ${r.error}.`, "error");
  }

  return (
    <SettingRow
      title="Restore from account"
      hint={pending.armed ? `This device has ${onDevice} answers. Tap again to replace them.` : `Replaces this device's ${meta.name} progress.`}
      footer={<Flash msg={msg} className="mt-2" />}
    >
      <Button size="sm" variant={pending.armed ? "danger" : "outline"} className={rowCtl} disabled={busy} onClick={() => void restore()}>
        {busy ? <Spinner size={14} /> : <History size={14} aria-hidden />}
        {pending.armed ? `Replace with ${incoming} answers` : "Restore"}
      </Button>
    </SettingRow>
  );
}

function SignOutRow() {
  const { busy, run } = useSignOut();
  return (
    <SettingRow title="Sign out" hint="You stay signed in here until you do.">
      <Button size="sm" variant="outline" className={cn(rowCtl, "text-[var(--danger)]")} disabled={busy} onClick={run}>
        {busy ? <Spinner size={14} /> : <LogOut size={14} aria-hidden />} {busy ? "Signing out…" : "Sign out"}
      </Button>
    </SettingRow>
  );
}
