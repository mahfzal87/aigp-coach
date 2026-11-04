"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronRight, Cloud, CloudOff, Copy, Download, RefreshCw, ShieldCheck, Trash2, Upload, UserRound, X } from "lucide-react";
import { useHydrated, useProgress } from "@/store/progress";
import type { ProgressExport } from "@/lib/types";
import { genSyncCode, normalizeCode, pullProgress, pushProgress, syncConfigured } from "@/lib/sync";
import { authConfigured } from "@/lib/account";
import { getActiveMeta, getQuestion } from "@/lib/content";
import { getActiveExam, type ExamSlug } from "@/lib/exam-state";
import { getPack } from "@/lib/exam-registry";
import { playSuccessChime } from "@/lib/celebrate";
import { haptic } from "@/lib/haptics";
import { cn, daysUntil } from "@/lib/utils";
import { useSession } from "@/components/account";
import { Badge, Button, Card, Input, PageHeader, Switch } from "@/components/ui";
import { Flash, SettingRow, SettingsSection, Spinner, rowCtl, useArm, useFlash } from "@/components/entry-ui";

export default function SettingsPage() {
  const hydrated = useHydrated();
  const { session, ready } = useSession();
  const syncOn = useProgress((s) => syncConfigured && !!s.settings.syncEnabled && !!s.settings.syncCode);
  const hasProgress = useProgress((s) => s.attempts.length > 0 || s.mocks.length > 0);

  // Deep links (/settings#backup …): the sections only exist once the store has
  // hydrated, so the browser's own jump-to-anchor misses them on a cold load.
  useEffect(() => {
    if (!hydrated) return;
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, [hydrated]);

  if (!hydrated) return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  const meta = getActiveMeta();
  const signedIn = !!session;
  const backedUp = signedIn || syncOn;
  // Verdict first — but only warn once there is something to lose.
  const atRisk = !backedUp && hasProgress;

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle={
          !ready
            ? " " // hold the line's height until the session is known
            : signedIn
              ? "Your account backs up your progress automatically."
              : syncOn
                ? "Your sync code backs up your progress."
                : atRisk
                  ? "On this device only — Safari can clear it."
                  : "Progress saves in this browser."
        }
        action={
          ready &&
          (backedUp || atRisk) &&
          (backedUp ? (
            <Badge tone="success" className="shrink-0 whitespace-nowrap">
              <ShieldCheck size={12} aria-hidden /> Backed up
            </Badge>
          ) : (
            <a href="#backup" className="press relative shrink-0 rounded-full before:absolute before:-inset-x-1 before:-inset-y-2.5 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
              <Badge tone="warning" className="whitespace-nowrap">
                <CloudOff size={12} aria-hidden /> Not backed up
              </Badge>
            </a>
          ))
        }
      />

      <div className="space-y-7">
        {authConfigured && (
          <Card>
            <Link
              href="/account"
              className="press flex items-center gap-3 rounded-[22px] px-5 py-4 text-[15px] font-semibold hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <UserRound size={18} className="shrink-0 text-[var(--primary)]" aria-hidden />
              <span className="min-w-0 flex-1">{signedIn ? "Profile, backup & sign-out" : "Sign in to back up your progress"}</span>
              <ChevronRight size={16} className="shrink-0 text-[var(--muted)]" aria-hidden />
            </Link>
          </Card>
        )}

        <SettingsSection id="exam-date" title="Exam date">
          <ExamDateCard examName={meta.name} />
        </SettingsSection>

        <SettingsSection id="preferences" title="Preferences">
          <PreferencesCard />
        </SettingsSection>

        <SettingsSection id="backup" title="Backup & sync">
          <Card className="divide-y divide-[var(--border)]">
            {syncConfigured ? (
              <>
                <SyncCodeRow signedIn={signedIn} />
                <RestoreCodeRow examName={meta.name} />
              </>
            ) : (
              <SettingRow title="Cloud sync" hint="Not set up on this copy — see DEPLOY.md." />
            )}
            <FileRow slug={meta.slug} />
          </Card>
        </SettingsSection>

        <SettingsSection id="danger" title="Danger zone" danger>
          <DangerCard examName={meta.name} signedIn={signedIn} />
        </SettingsSection>
      </div>
    </div>
  );
}

// ── Layout pieces ───────────────────────────────────────────────────────────

// Instant-apply on/off setting. The label covers the row, so the whole row toggles.
function SwitchRow({ title, hint, checked, onChange }: { title: string; hint: string; checked: boolean; onChange: (on: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <span className="block text-[15px] font-semibold">{title}</span>
        <span id={`${id}-hint`} className="mt-0.5 block text-[13px] text-[var(--muted)]">
          {hint}
        </span>
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} aria-describedby={`${id}-hint`} />
    </div>
  );
}

// ── Exam date ───────────────────────────────────────────────────────────────

function ExamDateCard({ examName }: { examName: string }) {
  const examDate = useProgress((s) => s.settings.examDate);
  const setSettings = useProgress((s) => s.setSettings);
  const id = useId();
  const days = daysUntil(examDate);

  const status =
    days === null ? (
      "Powers your dashboard countdown."
    ) : days < 0 ? (
      <Badge>Date has passed</Badge>
    ) : days === 0 ? (
      <Badge tone="success">Exam day</Badge>
    ) : (
      <Badge tone={days <= 14 ? "warning" : "default"}>
        {days} day{days === 1 ? "" : "s"} to go
      </Badge>
    );

  return (
    <Card>
      <SettingRow htmlFor={id} title={`${examName} exam date`} hint={<span className={cn(days !== null && "mt-1 inline-flex")}>{status}</span>}>
        <Input
          id={id}
          type="date"
          value={examDate ?? ""}
          onChange={(e) => setSettings({ examDate: e.target.value || undefined })}
          className="flex-1 sm:h-9 sm:w-44 sm:flex-none"
        />
        {examDate && (
          <Button size="sm" variant="ghost" className={rowCtl} onClick={() => setSettings({ examDate: undefined })}>
            <X size={14} aria-hidden /> Clear
          </Button>
        )}
      </SettingRow>
    </Card>
  );
}

// ── Preferences ─────────────────────────────────────────────────────────────

function PreferencesCard() {
  const haptics = useProgress((s) => s.settings.haptics ?? true);
  const sound = useProgress((s) => s.settings.sound ?? false);
  const setSettings = useProgress((s) => s.setSettings);
  return (
    <Card className="divide-y divide-[var(--border)]">
      <SwitchRow
        title="Haptic feedback"
        hint="Vibration, where supported"
        checked={haptics}
        onChange={(on) => {
          setSettings({ haptics: on });
          if (on) haptic("select"); // a sample buzz
        }}
      />
      <SwitchRow
        title="Sounds"
        hint="A chime when you finish a lesson"
        checked={sound}
        onChange={(on) => {
          setSettings({ sound: on });
          if (on) playSuccessChime(); // a sample of what you'll hear
        }}
      />
    </Card>
  );
}

// ── Backup & sync ───────────────────────────────────────────────────────────

const answers = (d: ProgressExport) => d.attempts?.length ?? 0;

function SyncCodeRow({ signedIn }: { signedIn: boolean }) {
  const code = useProgress((s) => s.settings.syncCode);
  const enabled = useProgress((s) => !!s.settings.syncEnabled);
  const setSettings = useProgress((s) => s.setSettings);
  const exportData = useProgress((s) => s.exportData);
  const [busy, setBusy] = useState<"on" | "sync" | null>(null);
  const copied = useArm(2000);
  const { msg, flash } = useFlash();
  const footer = <Flash msg={msg} className="mt-2" />;

  async function turnOn() {
    setBusy("on");
    // Resuming an existing code: read the cloud copy first — it may be ahead of
    // this device, and a blind push would overwrite it.
    if (code) {
      const pulled = await pullProgress(code).catch(() => null);
      if (!pulled || (!pulled.ok && pulled.error !== "not-found")) {
        setBusy(null);
        flash("Couldn't reach the cloud, so sync stays paused. Try again.", "error");
        return;
      }
      const store = useProgress.getState();
      if (pulled.ok && pulled.data && answers(pulled.data) > store.attempts.length) {
        store.importData({ ...pulled.data, settings: { ...pulled.data.settings, syncEnabled: true, syncCode: code } });
        setBusy(null);
        flash(`Sync resumed. Restored ${answers(pulled.data)} answers from the cloud.`);
        return;
      }
    }
    const next = code || genSyncCode();
    setSettings({ syncEnabled: true, syncCode: next });
    const res = await pushProgress(next, exportData());
    setBusy(null);
    if (res.ok) flash(code ? "Sync resumed." : "Sync is on. Keep the code somewhere safe.");
    else flash(`Couldn't reach the cloud: ${res.error}.`, "error");
  }

  async function syncNow() {
    if (!code) return;
    setBusy("sync");
    const res = await pushProgress(code, exportData());
    setBusy(null);
    if (res.ok) flash("Synced just now.");
    else flash(`Sync failed: ${res.error}.`, "error");
  }

  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      copied.arm(true);
    } catch {
      flash("Couldn't copy — select the code and copy it.", "error");
    }
  }

  if (!enabled || !code) {
    return (
      <SettingRow
        title="Sync code"
        hint={
          code ? (
            <>
              Paused: <span className="font-semibold tracking-wide text-[var(--foreground)]">{code}</span>
            </>
          ) : signedIn ? (
            "Optional — your account already backs up."
          ) : (
            "Back up without an account."
          )
        }
        footer={footer}
      >
        <Button size="sm" variant="outline" className={rowCtl} disabled={busy === "on"} onClick={turnOn}>
          {busy === "on" ? <Spinner size={14} /> : <Cloud size={14} aria-hidden />} {code ? "Resume" : "Turn on"}
        </Button>
      </SettingRow>
    );
  }

  return (
    <SettingRow
      title="Sync code"
      badge={<Badge tone="success">On</Badge>}
      hint={
        <>
          <span className="mt-1 block select-all font-display text-[17px] font-bold tracking-wide text-[var(--foreground)]">{code}</span>
          <span className="mt-0.5 block">Anyone with it can load your progress.</span>
        </>
      }
      footer={footer}
    >
      <Button size="sm" variant="outline" className={rowCtl} onClick={copy}>
        {copied.armed ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />} {copied.armed ? "Copied" : "Copy"}
      </Button>
      <Button size="sm" variant="outline" className={rowCtl} disabled={busy === "sync"} onClick={syncNow}>
        {busy === "sync" ? <Spinner size={14} /> : <RefreshCw size={14} aria-hidden />} Sync now
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className={rowCtl}
        onClick={() => {
          setSettings({ syncEnabled: false });
          flash("Sync paused. The code still restores later.", "info");
        }}
      >
        Turn off
      </Button>
    </SettingRow>
  );
}

function RestoreCodeRow({ examName }: { examName: string }) {
  const importData = useProgress((s) => s.importData);
  const setSettings = useProgress((s) => s.setSettings);
  const onDevice = useProgress((s) => s.attempts.length);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useArm<{ code: string; data: ProgressExport }>();
  const { msg, flash, clear } = useFlash();
  const id = useId();

  // First press fetches what the code holds and arms; the second replaces.
  async function restore() {
    if (busy) return;
    if (pending.armed) {
      const { code, data } = pending.armed;
      pending.disarm();
      importData(data);
      setSettings({ syncEnabled: true, syncCode: code });
      setValue("");
      flash(`Restored ${answers(data)} answers. Sync is on with this code.`);
      return;
    }
    const code = normalizeCode(value);
    if (!code) {
      flash("Enter your sync code first.", "error");
      return;
    }
    clear();
    setBusy(true);
    const res = await pullProgress(code);
    setBusy(false);
    if (res.ok && res.data) pending.arm({ code, data: res.data });
    else flash(res.error === "not-found" ? `No ${examName} progress saved under that code.` : `Restore failed: ${res.error}.`, "error");
  }

  return (
    <SettingRow
      htmlFor={id}
      title="Restore from a code"
      hint={pending.armed ? `This device has ${onDevice} answers. Tap again to replace them.` : `Replaces this device's ${examName} progress.`}
      footer={<Flash msg={msg} className="mt-2" />}
    >
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          pending.disarm();
          clear();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void restore();
          }
        }}
        placeholder="AIGP-XXXX-XXXX"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        className="flex-1 uppercase tracking-wide sm:h-9 sm:w-48 sm:flex-none"
      />
      <Button size="sm" variant={pending.armed ? "danger" : "outline"} className={rowCtl} disabled={busy} onClick={() => void restore()}>
        {busy && <Spinner size={14} />}
        {pending.armed ? `Replace with ${answers(pending.armed.data)} answers` : "Restore"}
      </Button>
    </SettingRow>
  );
}

function FileRow({ slug }: { slug: string }) {
  const exportData = useProgress((s) => s.exportData);
  const importData = useProgress((s) => s.importData);
  const onDevice = useProgress((s) => s.attempts.length);
  const fileRef = useRef<HTMLInputElement>(null);
  const pending = useArm<ProgressExport>();
  const { msg, flash, clear } = useFlash();

  function doExport() {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aigp-coach-${slug}-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    flash(`Exported ${answers(data)} answers.`);
  }

  // Validate before anything is replaced — a stray JSON file must never wipe progress.
  async function readFile(file: File) {
    clear();
    try {
      const data = JSON.parse(await file.text()) as ProgressExport;
      if (!data || typeof data !== "object" || !Array.isArray(data.attempts)) throw new Error("not an export");
      // Backups are stamped with their exam; never pour one exam's file into another.
      if (data.examId && data.examId !== getActiveExam()) {
        const other = getPack(data.examId as ExamSlug)?.meta.name ?? data.examId;
        flash(`That backup is for ${other}. Switch to ${other} to import it.`, "error");
        return;
      }
      // Older files carry no exam stamp: check the answers belong to this exam's bank.
      if (!data.examId && data.attempts.length > 0) {
        const known = data.attempts.filter((a) => getQuestion(a.questionId)).length;
        if (known / data.attempts.length < 0.5) {
          flash(`Those answers aren't from the ${getActiveMeta().name} question bank — switch exams to import it.`, "error");
          return;
        }
      }
      pending.arm(data);
    } catch {
      flash("That file isn't a progress export.", "error");
    }
  }

  return (
    <SettingRow
      title="Backup file"
      hint={pending.armed ? `File has ${answers(pending.armed)} answers; this device has ${onDevice}. Tap again to replace.` : "A JSON copy of this exam's progress."}
      footer={<Flash msg={msg} className="mt-2" />}
    >
      <Button size="sm" variant="outline" className={rowCtl} onClick={doExport}>
        <Download size={14} aria-hidden /> Export
      </Button>
      <Button
        size="sm"
        variant={pending.armed ? "danger" : "outline"}
        className={rowCtl}
        onClick={() => {
          if (!pending.armed) return fileRef.current?.click();
          // Keep this device's own sync code — a file must not switch sync off.
          const own = useProgress.getState().settings;
          importData({ ...pending.armed, settings: { ...pending.armed.settings, syncEnabled: own.syncEnabled, syncCode: own.syncCode } });
          flash(`Imported ${answers(pending.armed)} answers.`);
          pending.disarm();
        }}
      >
        <Upload size={14} aria-hidden /> {pending.armed ? `Replace with ${answers(pending.armed)} answers` : "Import"}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = ""; // so picking the same file again still fires
          if (file) void readFile(file);
        }}
      />
    </SettingRow>
  );
}

// ── Danger zone ─────────────────────────────────────────────────────────────

function DangerCard({ examName, signedIn }: { examName: string; signedIn: boolean }) {
  const reset = useProgress((s) => s.reset);
  const confirm = useArm();
  const { msg, flash } = useFlash();
  return (
    <Card className="border-[var(--danger)]/30">
      <SettingRow
        title={`Reset ${examName} progress`}
        hint={signedIn ? "Erases it here and in your account." : "Erases answers, mocks and streak."}
        footer={<Flash msg={msg} className="mt-2" />}
      >
        <Button
          size="sm"
          variant={confirm.armed ? "danger" : "outline"}
          className={cn(rowCtl, !confirm.armed && "text-[var(--danger)]")}
          onBlur={confirm.disarm}
          onKeyDown={(e) => e.key === "Escape" && confirm.disarm()}
          onClick={() => {
            if (!confirm.armed) return confirm.arm(true);
            confirm.disarm();
            reset();
            flash(`${examName} progress reset.`);
          }}
        >
          <Trash2 size={14} aria-hidden /> {confirm.armed ? "Sure? Tap again" : "Reset progress"}
        </Button>
      </SettingRow>
    </Card>
  );
}
