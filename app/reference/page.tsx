"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getCompetency, getNotes } from "@/lib/content";
import { Badge, Card, CardBody, PageHeader } from "@/components/ui";
import { Markdown } from "@/components/markdown";

export default function ReferencePage() {
  const [q, setQ] = useState("");
  const notes = getNotes();
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return notes;
    return notes.filter((n) => (n.title + " " + n.bodyMd).toLowerCase().includes(term));
  }, [q, notes]);

  return (
    <div>
      <PageHeader title="Reference library" subtitle="Searchable deep-dives on the laws, frameworks, and confusable concepts." />
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the reference… (e.g. 'penalties', 'red teaming', 'GDPR')"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        />
      </div>
      <div className="space-y-4">
        {filtered.map((n) => {
          const c = n.competencyId ? getCompetency(n.competencyId) : null;
          return (
            <Card key={n.id}>
              <CardBody>
                <div className="mb-2 flex items-center gap-2">
                  <h2 className="text-base font-semibold">{n.title}</h2>
                  {c && <Badge tone="primary">{c.code}</Badge>}
                  {!c && <Badge>Strategy</Badge>}
                </div>
                <Markdown>{n.bodyMd}</Markdown>
              </CardBody>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-[var(--muted)]">No matches for “{q}”.</p>}
      </div>
    </div>
  );
}
