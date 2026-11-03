"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronRight,
  Cloud,
  CloudOff,
  Copy,
  Download,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Upload,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useHydrated, useProgress } from "@/store/progress";
import type { ProgressExport } from "@/lib/types";
import { genSyncCode, normalizeCode, pullProgress, pushProgress, syncConfigured } from "@/lib/sync";
import { authConfigured } from "@/lib/account";
import { getActiveMeta } from "@/lib/content";
import { playSuccessChime } from "@/lib/celebrate";
import { haptic } from "@/lib/haptics";
import { cn, daysUntil } from "@/lib/utils";
import { useSession } from "@/components/account";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { Flash, Spinner, inputCls, inputIdleCls, useArm, useFlash } from "@/components/entry-ui";

// Row controls: 44px tall on phones (touch), 36px from sm up — one height per row.
const ctl = "h-11 sm:h-9";

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
            <a href="#backup" className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/50">
              <Badge tone="warning" className="whitespace-nowrap">
                <CloudOff size={12} aria-hidden /> Not backed up
              </Badge>
            </a>
          ))
        }
      />

      <div className="space-y-8">
        {authConfigured && (
          <Card>
            <Link
              href="/account"
              className="flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/50"
            >
              <UserRound size={17} className="shrink-0 text-[var(--muted)]" aria-hidden />
              <span className="min-w-0 flex-1">{signedIn ? "Profile, backup & sign-out" : "Sign in to back up your progress"}</span>
              <ChevronRight size={16} className="shrink-0 text-[var(--muted)]" aria-hidden />
            </Link>
          </Card>
        )}

        <Section id="exam-date" title="Exam date" icon={CalendarDays}>
          <ExamDateCard examName={meta.name} />
        </Section>

        <Section id="preferences" title="Preferences" icon={SlidersHorizontal}>
          <PreferencesCard />
        </Section>

        <Section id="backup" title="Backup & sync" icon={Cloud}>
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
        </Section>

        <Section id="danger" title="Danger zone" icon={AlertTriangle} danger>
          <DangerCard examName={meta.name} signedIn={signedIn} />
        </Section>
      </div>
    </div>
  );
}

// ── Layout pieces ───────────────────────────────────────────────────────────

function Section({ id, title, icon: Icon, danger, children }: { id: string; title: string; icon: LucideIcon; danger?: boolean; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <h2
        id={`${id}-title`}
        className={cn(
          "mb-2.5 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
          danger ? "text-[var(--danger)]" : "text-[var(--muted)]"
        )}
      >
        <Icon size={13} aria-hidden /> {title}
      </h2>
      {children}
    </section>
  );
}

// Title + hint on the left, controls on the right (stacked under on phones),
// with an optional status line underneath.
function SettingRow({
  title,
  hint,
  badge,
  htmlFor,
  children,
  footer,
}: {
  title: ReactNode;
  hint?: ReactNode;
  badge?: ReactNode;
  htmlFor?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const titleCls = "flex flex-wrap items-center gap-2 text-sm font-semibold";
  return (
    <div className="px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          {htmlFor ? (
            <label htmlFor={htmlFor} className={titleCls}>
              {title}
              {badge}
            </label>
          ) : (
            <div className={titleCls}>
              {title}
              {badge}
            </div>
          )}
          {hint && <div className="mt-0.5 text-xs text-[var(--muted)]">{hint}</div>}
        </div>
        {children && <div className="flex min-w-0 flex-wrap items-center gap-2 sm:shrink-0 sm:flex-nowrap sm:justify-end">{children}</div>}
      </div>
      {footer}
    </div>
  );
}

// Instant-apply on/off setting. The whole row is the hit target.
function SwitchRow({ title, hint, checked, onChange }: { title: string; hint: string; checked: boolean; onChange: (on: boolean) => void }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4">
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block text-xs text-[var(--muted)]">{hint}</span>
      </span>
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="relative h-6 w-10 shrink-0 rounded-full bg-[var(--muted)]/35 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-[var(--surface)] after:shadow-[var(--e1)] after:transition-transform peer-checked:bg-[var(--primary)] peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--ring)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--surface)]"
      />
    </label>
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
        <input
          id={id}
          type="date"
          value={examDate ?? ""}
          onChange={(e) => setSettings({ examDate: e.target.value || undefined })}
          className={cn(inputCls, inputIdleCls, "min-w-0 flex-1 sm:h-9 sm:w-44 sm:flex-none")}
        />
        {examDate && (
          <Button size="sm" variant="ghost" className={ctl} onClick={() => setSettings({ examDate: undefined })}>
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
    const next = code || genSyncCode();
    setSettings({ syncEnabled: true, syncCode: next });
    const res = await pushProgress(next, exportData());
    setBusy(null);
    if (res.ok) flash("Sync is on. Keep the code somewhere safe.");
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
              Paused · <span className="font-mono font-semibold text-[var(--foreground)]">{code}</span>
            </>
          ) : signedIn ? (
            "Optional — your account already backs up."
          ) : (
            "Back up without an account."
          )
        }
        footer={footer}
      >
        <Button size="sm" variant="outline" className={ctl} disabled={busy === "on"} onClick={turnOn}>
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
          <span className="mt-1 block select-all font-mono text-sm font-bold tracking-wider text-[var(--foreground)]">{code}</span>
          <span className="mt-0.5 block">Anyone with it can load your progress.</span>
        </>
      }
      footer={footer}
    >
      <Button size="sm" variant="outline" className={ctl} onClick={copy}>
        {copied.armed ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />} {copied.armed ? "Copied" : "Copy"}
      </Button>
      <Button size="sm" variant="outline" className={ctl} disabled={busy === "sync"} onClick={syncNow}>
        {busy === "sync" ? <Spinner size={14} /> : <RefreshCw size={14} aria-hidden />} Sync now
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className={ctl}
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
      <input
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
        className={cn(inputCls, inputIdleCls, "min-w-0 flex-1 font-mono uppercase tracking-wider sm:h-9 sm:w-48 sm:flex-none")}
      />
      <Button size="sm" variant={pending.armed ? "danger" : "outline"} className={ctl} disabled={busy} onClick={() => void restore()}>
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
      <Button size="sm" variant="outline" className={ctl} onClick={doExport}>
        <Download size={14} aria-hidden /> Export
      </Button>
      <Button
        size="sm"
        variant={pending.armed ? "danger" : "outline"}
        className={ctl}
        onClick={() => {
          if (!pending.armed) return fileRef.current?.click();
          importData(pending.armed);
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
          className={cn(ctl, !confirm.armed && "text-[var(--danger)]")}
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
