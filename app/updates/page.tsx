"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, CloudDownload } from "lucide-react";
import { getUpdates } from "@/lib/updates";
import type { LawUpdate, Severity } from "@/lib/types";
import { fmtDate } from "@/lib/utils";
import { Badge, Card, PageHeader } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const RAIL: Record<Severity, string> = { critical: "var(--danger)", important: "var(--warning)", info: "var(--accent)" };
const TONE: Record<Severity, "danger" | "warning" | "default"> = { critical: "danger", important: "warning", info: "default" };

export default function UpdatesPage() {
  const [items, setItems] = useState<LawUpdate[]>([]);
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    getUpdates().then(setItems);
  }, []);

  const jurisdictions = useMemo(() => {
    const set = new Set<string>();
    for (const u of items) set.add(u.jurisdiction.startsWith("United States") ? "United States" : u.jurisdiction);
    return ["All", "Critical only", ...[...set].sort()];
  }, [items]);

  const shown = useMemo(() => {
    let list = [...items].sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
    if (filter === "Critical only") list = list.filter((u) => u.severity === "critical");
    else if (filter !== "All") list = list.filter((u) => (u.jurisdiction.startsWith("United States") ? "United States" : u.jurisdiction) === filter);
    return list;
  }, [items, filter]);

  return (
    <div className="space-y-5">
      <PageHeader title="Law updates" subtitle="What changed, when, and the exam angle — curated by your coach and synced from the cloud." />

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {jurisdictions.map((j) => (
          <button key={j} onClick={() => { haptic("tap"); setFilter(j); }} className={cn("press cursor-pointer rounded-full px-3 py-1 text-xs font-semibold", filter === j ? "bg-[var(--primary)] text-[var(--primary-fg)]" : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]")}>{j}</button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-2.5">
        {shown.map((u) => <UpdateRow key={u.id} u={u} />)}
        {shown.length === 0 && <p className="text-sm text-[var(--muted)]">Nothing matches this filter.</p>}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
        <CloudDownload size={13} /> Updates are curated and re-seeded by your coach as the legal landscape shifts — no configuration needed.
      </p>
    </div>
  );
}

function UpdateRow({ u }: { u: LawUpdate }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="w-1.5 shrink-0" style={{ background: RAIL[u.severity] }} />
        <div className="min-w-0 flex-1">
          <button onClick={() => { haptic("tap"); setOpen((o) => !o); }} className="press flex w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-left">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--muted)]">
                <span className="font-semibold tabular-nums">{fmtDate(u.publishedDate)}</span>
                <span>·</span>
                <span>{u.jurisdiction}</span>
                <Badge tone={TONE[u.severity]}>{u.severity}</Badge>
                {u.bokRelevant && <Badge tone="primary">exam-relevant</Badge>}
              </div>
              <div className="mt-1 text-sm font-bold leading-snug">{u.title}</div>
            </div>
            <ChevronDown size={16} className={cn("mt-1 shrink-0 text-[var(--muted)] transition-transform duration-200", open && "rotate-180")} />
          </button>
          {open && (
            <div className="prose-note border-t border-[var(--border)] px-4 pb-4 pt-3 text-sm leading-relaxed">
              <Markdown>{u.bodyMd}</Markdown>
              {u.sourceUrl && <a href={u.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-[var(--accent)] hover:underline">Source ↗</a>}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
