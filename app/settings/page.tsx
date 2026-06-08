"use client";

import { useRef, useState } from "react";
import { Download, Upload, Trash2 } from "lucide-react";
import { useHydrated, useProgress } from "@/store/progress";
import type { ProgressExport } from "@/lib/types";
import { Button, Card, CardBody, PageHeader } from "@/components/ui";

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
          <p className="text-xs text-[var(--muted)]">Progress is stored only in this browser (no account). Export regularly so you don&apos;t lose it if you clear your cache.</p>
        </CardBody></Card>

        <Card><CardBody className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.sound ?? true} onChange={(e) => setSettings({ sound: e.target.checked })} />
            <span className="font-medium">Celebration &amp; feedback sounds</span>
          </label>
          <p className="text-xs text-[var(--muted)]">Plays a short chime when you complete a lesson. Confetti always respects your &ldquo;reduce motion&rdquo; setting.</p>
        </CardBody></Card>

        <Card><CardBody className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.updatesApiEnabled} onChange={(e) => setSettings({ updatesApiEnabled: e.target.checked })} />
            <span className="font-medium">Show in-app &ldquo;Fetch latest updates&rdquo; button</span>
          </label>
          <p className="text-xs text-[var(--muted)]">Off by default. The button calls a server endpoint that must be configured with provider keys; otherwise updates are curated from Claude Code and seeded to the database.</p>
        </CardBody></Card>

        <Card><CardBody className="space-y-3">
          <div className="text-sm font-medium text-[var(--danger)]">Danger zone</div>
          <Button variant="danger" onClick={() => { if (confirm("Erase all your progress? This cannot be undone.")) { reset(); setMsg("Progress reset."); } }}><Trash2 size={16} /> Reset all progress</Button>
        </CardBody></Card>
      </div>
    </div>
  );
}
