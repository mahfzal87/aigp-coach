"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCompetenciesByDomain, getDomains, getQuestionsByCompetency, getNotesByCompetency } from "@/lib/content";
import { Badge, Card, CardBody, PageHeader } from "@/components/ui";

export default function LearnPage() {
  const domains = getDomains();
  return (
    <div>
      <PageHeader title="Learn" subtitle="Study the BoK v2.1 by domain and competency — notes, high-yield facts and flashcards." />
      <div className="space-y-6">
        {domains.map((d) => (
          <div key={d.id}>
            <div className="mb-2 flex items-center gap-2">
              <Badge tone="primary">Domain {d.code}</Badge>
              <h2 className="text-lg font-semibold">{d.name}</h2>
              <span className="text-xs text-[var(--muted)]">{d.minQ}–{d.maxQ} questions</span>
            </div>
            <p className="mb-3 text-sm text-[var(--muted)]">{d.summary}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {getCompetenciesByDomain(d.id).map((c) => {
                const qn = getQuestionsByCompetency(c.id).length;
                const nn = getNotesByCompetency(c.id).length;
                return (
                  <Link key={c.id} href={`/learn/${c.id}`}>
                    <Card className="h-full hover:border-[var(--primary)]">
                      <CardBody className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="text-sm font-semibold">{c.code} — {c.name}</div>
                          <div className="mt-1 text-xs text-[var(--muted)] line-clamp-2">{c.description}</div>
                          <div className="mt-2 flex gap-2 text-[10px] text-[var(--muted)]">
                            <span>{nn} note{nn === 1 ? "" : "s"}</span>·<span>{qn} question{qn === 1 ? "" : "s"}</span>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-[var(--muted)]" />
                      </CardBody>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
