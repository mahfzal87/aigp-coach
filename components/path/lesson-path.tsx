"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BookOpen, Check, Crown, Lock, Star } from "lucide-react";
import { getCompetenciesByDomain, getDomains } from "@/lib/content";
import { LESSON_PASS } from "@/lib/gamify";
import { useProgress } from "@/store/progress";

const UNIT_COLORS = ["#58cc02", "#1cb0f6", "#ff9600", "#a560e8"];
const UNIT_SHADE = ["#46a302", "#1592d4", "#e07f00", "#8a45cc"];
// gentle left-right wave
const WAVE = [0, 38, 58, 38, 0, -38, -58, -38];

type NodeState = "done" | "current" | "todo";
type PathNodeData = { id: string; label: string; title: string; kind: "lesson" | "test"; state: NodeState };

export function LessonPath() {
  const lessons = useProgress((s) => s.lessons);
  const domains = getDomains();

  // Build the ordered node list with state.
  const units = useMemo(() => {
    let foundCurrent = false;
    return domains.map((d, di) => {
      const comps = getCompetenciesByDomain(d.id);
      const nodes: PathNodeData[] = comps.map((c) => {
        const done = (lessons[c.id]?.bestScore ?? 0) >= LESSON_PASS;
        let state: NodeState = done ? "done" : "todo";
        if (!done && !foundCurrent) { state = "current"; foundCurrent = true; }
        return { id: c.id, label: c.code, title: c.name, kind: "lesson", state };
      });
      const testId = `test-${d.code}`;
      const allDone = comps.every((c) => (lessons[c.id]?.bestScore ?? 0) >= LESSON_PASS);
      const testDone = (lessons[testId]?.bestScore ?? 0) >= LESSON_PASS;
      let testState: NodeState = testDone ? "done" : allDone ? "current" : "todo";
      if (testState === "current" && foundCurrent) testState = "todo";
      if (testState === "current") foundCurrent = true;
      nodes.push({ id: testId, label: "TEST", title: `${d.name} — Unit Test`, kind: "test", state: testState });
      return { domain: d, color: UNIT_COLORS[di % 4], shade: UNIT_SHADE[di % 4], nodes };
    });
  }, [domains, lessons]);

  let globalIdx = 0;
  return (
    <div className="space-y-10">
      {units.map((u) => (
        <section key={u.domain.id}>
          {/* Unit banner */}
          <div className="mb-6 flex items-center gap-3 rounded-3xl px-5 py-4 text-white" style={{ background: u.color, boxShadow: `0 4px 0 0 ${u.shade}` }}>
            <div className="text-xs font-extrabold uppercase tracking-widest opacity-90">Unit {u.domain.code}</div>
            <div className="font-display text-lg font-extrabold leading-tight">{u.domain.name}</div>
          </div>
          <div className="flex flex-col items-center gap-5">
            {u.nodes.map((n) => {
              const x = WAVE[globalIdx++ % WAVE.length];
              return <PathNode key={n.id} node={n} color={u.color} shade={u.shade} offsetX={x} />;
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function PathNode({ node, color, shade, offsetX }: { node: { id: string; label: string; title: string; kind: "lesson" | "test"; state: NodeState }; color: string; shade: string; offsetX: number }) {
  const isTest = node.kind === "test";
  const done = node.state === "done";
  const current = node.state === "current";

  const bg = done ? "var(--gold)" : current ? color : "var(--surface-2)";
  const sh = done ? "#d9a800" : current ? shade : "var(--border)";
  const fg = done || current ? "#fff" : "var(--muted)";
  const Icon = done ? Check : isTest ? Crown : current ? (isTest ? Crown : Star) : node.label === "TEST" ? Lock : BookOpen;

  return (
    <div className="flex flex-col items-center" style={{ transform: `translateX(${offsetX}px)` }}>
      {current && (
        <div className="mb-1 animate-bounce rounded-xl bg-[var(--surface)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[var(--foreground)] shadow" style={{ border: `2px solid ${color}` }}>
          Start
        </div>
      )}
      <Link
        href={`/lesson/${node.id}`}
        aria-label={`${node.title} (${node.state})`}
        className="press grid place-items-center rounded-full"
        style={{ width: isTest ? 76 : 68, height: isTest ? 76 : 68, background: bg, color: fg, boxShadow: `0 6px 0 0 ${sh}` }}
      >
        <Icon size={isTest ? 32 : 28} fill={done || (current && (isTest || node.kind === "lesson")) ? "currentColor" : "none"} className={done || current ? "" : "opacity-70"} strokeWidth={2.5} />
      </Link>
      <div className="mt-1.5 max-w-[8rem] text-center text-[11px] font-extrabold text-[var(--muted)]">{node.label === "TEST" ? "Unit Test" : node.label}</div>
    </div>
  );
}
