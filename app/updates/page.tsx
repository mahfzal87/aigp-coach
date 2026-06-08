"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getUpdates } from "@/lib/updates";
import type { LawUpdate } from "@/lib/types";
import { fmtDate } from "@/lib/utils";
import { useProgress } from "@/store/progress";
import { Badge, Button, Card, CardBody, PageHeader } from "@/components/ui";
import { Markdown } from "@/components/markdown";

const TONE: Record<string, "danger" | "warning" | "default"> = { critical: "danger", important: "warning", info: "default" };

export default function UpdatesPage() {
  const updatesEnabled = useProgress((s) => s.settings.updatesApiEnabled);
  const [items, setItems] = useState<LawUpdate[]>([]);
  const [fetching, setFetching] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    getUpdates().then(setItems);
  }, []);

  async function fetchLatest() {
    setFetching(true);
    setMsg(null);
    try {
      const res = await fetch("/api/fetch-updates", { method: "POST" });
      const data = await res.json();
      setMsg(data.message ?? "Done.");
      if (data.items) setItems(data.items);
    } catch {
      setMsg("Could not reach the update service.");
    } finally {
      setFetching(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="AI-governance updates"
        subtitle="Curated changes to AI laws, standards and the BoK. Maintained from your coach; re-seeded as the landscape shifts."
        action={updatesEnabled ? <Button variant="outline" onClick={fetchLatest} disabled={fetching}><RefreshCw size={16} className={fetching ? "animate-spin" : ""} /> Fetch latest</Button> : undefined}
      />
      {msg && <p className="mb-4 rounded-lg bg-[var(--surface-2)] p-3 text-sm text-[var(--muted)]">{msg}</p>}
      <div className="space-y-4">
        {items.map((u) => (
          <Card key={u.id}>
            <CardBody>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone={TONE[u.severity]}>{u.severity}</Badge>
                {u.bokRelevant && <Badge tone="primary">BoK-relevant</Badge>}
                <span className="text-xs text-[var(--muted)]">{u.jurisdiction} · {fmtDate(u.publishedDate)}</span>
              </div>
              <h2 className="mb-1 text-base font-semibold">{u.title}</h2>
              <Markdown>{u.bodyMd}</Markdown>
              {u.sourceUrl && (
                <a href={u.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-[var(--primary)] hover:underline">Source ↗</a>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
