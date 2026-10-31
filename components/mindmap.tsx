"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { mapLeafKey, type LawMapDef } from "@/content/lawlab";

// Markmap-style horizontal mindmap: root → branches → lockable fact leaves.
// Nodes are laid out with normal flex flow; connector curves are measured
// after layout and drawn in an absolutely positioned SVG underlay.

const PALETTE = ["#10b981", "#0ea5e9", "#f59e0b", "#8b5cf6", "#f43f5e", "#14b8a6", "#f97316", "#6366f1"];

interface Edge {
  d: string;
  color: string;
  dim: boolean;
}

export function MindMap({
  def,
  locked,
  onToggle,
}: {
  def: LawMapDef;
  locked: Record<string, true>;
  onToggle: (key: string) => void;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLElement>());
  const [edges, setEdges] = useState<Edge[]>([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const setNode = (id: string) => (el: HTMLElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  };

  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const measure = () => {
      const base = inner.getBoundingClientRect();
      const get = (id: string) => {
        const el = nodeRefs.current.get(id);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { left: r.left - base.left, right: r.right - base.left, cy: r.top - base.top + r.height / 2 };
      };
      const next: Edge[] = [];
      const root = get("__root");
      def.branches.forEach((b, bi) => {
        const color = PALETTE[bi % PALETTE.length];
        const bn = get(`b:${b.id}`);
        if (root && bn) next.push({ d: curve(root.right, root.cy, bn.left, bn.cy), color, dim: false });
        if (!collapsed.has(b.id)) {
          b.leaves.forEach((_, li) => {
            const ln = get(`l:${b.id}:${li}`);
            if (bn && ln) next.push({ d: curve(bn.right, bn.cy, ln.left, ln.cy), color, dim: true });
          });
        }
      });
      setEdges((prev) => {
        const sig = next.map((e) => e.d).join("|");
        return prev.map((e) => e.d).join("|") === sig ? prev : next;
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [def, collapsed]);

  const toggleBranch = (id: string) => {
    haptic("tap");
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const lockedIn = def.branches.reduce(
    (n, b) => n + b.leaves.reduce((m, _, i) => m + (locked[mapLeafKey(def.id, b.id, i)] ? 1 : 0), 0),
    0
  );
  const total = def.branches.reduce((n, b) => n + b.leaves.length, 0);

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
      <div ref={innerRef} className="relative min-w-[640px] py-2">
        {/* connector underlay */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          {edges.map((e, i) => (
            <path key={i} d={e.d} fill="none" stroke={e.color} strokeWidth={e.dim ? 1.5 : 2.5} strokeOpacity={e.dim ? 0.4 : 0.8} strokeLinecap="round" />
          ))}
        </svg>

        <div className="relative flex items-stretch gap-10">
          {/* root — anchored to the top so it's the first thing you see */}
          <div className="flex items-start pt-1">
            <div ref={setNode("__root")} className="w-[150px] rounded-xl border-2 border-[var(--foreground)]/70 bg-[var(--surface)] px-3 py-2.5 shadow-sm">
              <div className="text-[13px] font-bold leading-snug">{def.name}</div>
              <div className="mt-1 text-[10px] font-semibold tabular-nums text-[var(--muted)]">
                {lockedIn}/{total} locked in
              </div>
            </div>
          </div>

          {/* branches + leaves */}
          <div className="flex flex-1 flex-col gap-4">
            {def.branches.map((b, bi) => {
              const color = PALETTE[bi % PALETTE.length];
              const isCollapsed = collapsed.has(b.id);
              const branchLocked = b.leaves.reduce((m, _, i) => m + (locked[mapLeafKey(def.id, b.id, i)] ? 1 : 0), 0);
              return (
                <div key={b.id} className="flex items-start gap-8">
                  <button
                    ref={setNode(`b:${b.id}`)}
                    onClick={() => toggleBranch(b.id)}
                    className="press mt-0.5 flex w-[168px] shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-2 text-left"
                    style={{ borderLeft: `3px solid ${color}` }}
                    aria-expanded={!isCollapsed}
                  >
                    <span className="flex-1 text-xs font-bold leading-tight">{b.t}</span>
                    <span className="text-[9px] font-semibold tabular-nums text-[var(--muted)]">{branchLocked}/{b.leaves.length}</span>
                    <ChevronDown size={12} className={cn("shrink-0 text-[var(--muted)] transition-transform", isCollapsed && "-rotate-90")} />
                  </button>

                  {!isCollapsed && (
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      {b.leaves.map((leaf, li) => {
                        const key = mapLeafKey(def.id, b.id, li);
                        const isLocked = !!locked[key];
                        return (
                          <button
                            key={li}
                            ref={setNode(`l:${b.id}:${li}`)}
                            onClick={() => {
                              haptic(isLocked ? "tap" : "success");
                              onToggle(key);
                            }}
                            className={cn(
                              "press flex max-w-[300px] cursor-pointer items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-[12px] leading-snug transition-colors",
                              isLocked
                                ? "border-[var(--primary)]/60 bg-[var(--primary)]/10 text-[var(--foreground)]"
                                : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--muted)]/50"
                            )}
                            title={isLocked ? "Locked in — tap to unmark" : "Tap when you know this cold"}
                          >
                            <span
                              className={cn(
                                "mt-[1px] grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border transition-colors",
                                isLocked ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-fg)]" : "border-[var(--border)] text-transparent"
                              )}
                            >
                              <Check size={9} strokeWidth={3.5} />
                            </span>
                            <span className={cn(isLocked && "opacity-80")}>{leaf}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function curve(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.max(20, (x2 - x1) / 2);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}
