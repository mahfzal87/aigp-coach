"use client";

import { useRef, useState } from "react";
import { Cloud, Copy, Download, RefreshCw, Trash2, Upload } from "lucide-react";
import { useHydrated, useProgress } from "@/store/progress";
import type { ProgressExport } from "@/lib/types";
import { genSyncCode, normalizeCode, pullProgress, pushProgress, syncConfigured } from "@/lib/sync";
import { Badge, Button, Card, CardBody, PageHeader } from "@/components/ui";

export default function SettingsPage() {
  const hydrated = useHydrated();
  const settings = useProgress((s) => s.settings);
  const setSettings = useProgress((s) => s.setSettings);
  const exportData = useProgress((s) => s.exportData);
  const importData = useProgress((s) => s.importData);
  const reset = useProgress((s) => s.reset);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function doExport() {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aigp-coach-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function doImport(file: File) {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ProgressExport;
      importData(data);
      setMsg("Progress imported successfully.");
    } catch {
      setMsg("Could not read that file — make sure it's a valid export.");
    }
  }

  const [restoreCode, setRestoreCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function enableSync() {
    setBusy(true);
    const code = settings.syncCode || genSyncCode();
    setSettings({ syncEnabled: true, syncCode: code });
    const res = await pushProgress(code, exportData());
    setBusy(false);
    setMsg(res.ok ? `Cloud sync on. Your code is ${code} — save it to restore on another device.` : `Couldn't reach the cloud: ${res.error}. Check Supabase is configured.`);
  }

  async function restore() {
    const code = normalizeCode(restoreCode);
    if (!code) return;
    setBusy(true);
    const res = await pullProgress(code);
    setBusy(false);
    if (res.ok && res.data) {
      importData(res.data);
      setSettings({ syncEnabled: true, syncCode: code });
      setMsg("Progress restored from the cloud and sync turned on.");
    } else {
      setMsg(res.error === "not-found" ? "No saved progress found for that code." : `Restore failed: ${res.error}.`);
    }
  }

  if (!hydrated) return <div className="text-sm text-[var(--muted)]">Loading…</div>;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Your progress lives in this browser. Export it to back up or move devices." />
      {msg && <p className="mb-4 rounded-lg bg-[var(--surface-2)] p-3 text-sm">{msg}</p>}
      <div className="space-y-4">
        <Card><CardBody className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Exam date</span>
            <input
              type="date"
              value={settings.examDate ?? ""}
              onChange={(e) => setSettings({ examDate: e.target.value || undefined })}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-sm"
            />
            <span className="mt-1 block text-xs text-[var(--muted)]">Drives the countdown on your dashboard.</span>
          </label>
        </CardBody></Card>

        <Card><CardBody className="space-y-3">
          <div className="text-sm font-medium">Back up & restore</div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={doExport}><Download size={16} /> Export progress</Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload size={16} /> Import progress</Button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
          </div>
          <p className="text-xs text-[var(--muted)]">Progress is stored in this browser. Turn on cloud sync below to back it up and move between devices.</p>
        </CardBody></Card>

        {/* Cloud sync (sync code, no login) */}
        <Card><CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <Cloud size={18} className="text-[var(--accent)]" />
            <span className="font-display font-extrabold">Cloud sync</span>
            {settings.syncEnabled && <Badge tone="success">On</Badge>}
          </div>

          {!syncConfigured ? (
            <p className="text-xs text-[var(--muted)]">Cloud sync needs Supabase configured (set <code className="rounded bg-[var(--surface-2)] px-1">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="rounded bg-[var(--surface-2)] px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then run <code className="rounded bg-[var(--surface-2)] px-1">supabase/progress_sync.sql</code>). Until then, use Export/Import above. See <code className="rounded bg-[var(--surface-2)] px-1">DEPLOY.md</code>.</p>
          ) : (
            <>
              <p className="text-xs text-[var(--muted)]">No account needed. We save your progress under a private <strong>sync code</strong>. Keep the code safe — anyone with it can load your progress.</p>

              {settings.syncEnabled && settings.syncCode ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-xl bg-[var(--surface-2)] px-3 py-2 font-mono text-sm font-extrabold tracking-wider">{settings.syncCode}</span>
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(settings.syncCode!); setMsg("Sync code copied."); }}><Copy size={14} /> Copy</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setSettings({ syncEnabled: false }); setMsg("Cloud sync paused. Your code still works to restore later."); }}>Turn off</Button>
                  <Button size="sm" variant="accent" disabled={busy} onClick={async () => { setBusy(true); const r = await pushProgress(settings.syncCode!, exportData()); setBusy(false); setMsg(r.ok ? "Synced just now." : `Sync failed: ${r.error}.`); }}><RefreshCw size={14} /> Sync now</Button>
                </div>
              ) : (
                <Button variant="accent" disabled={busy} onClick={enableSync}><Cloud size={16} /> Turn on cloud sync</Button>
              )}

              <div className="border-t-2 border-[var(--border)] pt-3">
                <div className="mb-1 text-sm font-extrabold">Restore on another device</div>
                <div className="flex flex-wrap gap-2">
                  <input value={restoreCode} onChange={(e) => setRestoreCode(e.target.value)} placeholder="AIGP-XXXX-XXXX" className="flex-1 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-mono text-sm uppercase" />
                  <Button variant="outline" disabled={busy || !restoreCode.trim()} onClick={restore}>Restore</Button>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">Restoring overwrites this device&apos;s progress with the cloud copy.</p>
              </div>
            </>
          )}
        </CardBody></Card>

        <Card><CardBody className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.haptics ?? true} onChange={(e) => setSettings({ haptics: e.target.checked })} />
            <span className="font-medium">Haptic feedback (vibration, where supported)</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.sound ?? false} onChange={(e) => setSettings({ sound: e.target.checked })} />
            <span className="font-medium">Celebration &amp; feedback sounds</span>
          </label>
          <p className="text-xs text-[var(--muted)]">Plays a short chime when you complete a lesson. Confetti always respects your &ldquo;reduce motion&rdquo; setting.</p>
        </CardBody></Card>

        <Card><CardBody className="space-y-3">
          <div className="text-sm font-medium text-[var(--danger)]">Danger zone</div>
          <Button variant="danger" onClick={() => { if (confirm("Erase all your progress? This cannot be undone.")) { reset(); setMsg("Progress reset."); } }}><Trash2 size={16} /> Reset all progress</Button>
        </CardBody></Card>
      </div>
    </div>
  );
}
