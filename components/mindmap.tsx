"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { mapLeafKey, type LawMapDef } from "@/lib/lawlab-types";
import { Badge, Button } from "@/components/ui";

// Mindmap for one law: root → branches → lockable fact leaves.
//
// One DOM, two layouts, chosen by the CONTAINER width (Tailwind container
// queries, so no JS and no layout flash):
//   wide (≥ 36rem)  markmap-style tree: branch column, facts fan out to the right
//   narrow (phone)  stacked outline: branch header, facts indented beneath it
// A single trunk drops from the root, so branches never bundle into one point.
// Connectors are measured after layout and written straight into an SVG
// underlay (no React state, so measuring never re-renders the map).

// Branch colours come from the active exam's light (tokens), so each exam's map
// harmonises with its own field in both themes — AIGP lagoon/aqua/blue, CIPP/E
// union blue/periwinkle/cyan. CSS expressions, used in inline styles only.
const BRANCH = [
  "var(--primary)",
  "var(--accent)",
  "color-mix(in oklab, var(--glow) 78%, var(--foreground))",
  "color-mix(in oklab, var(--primary) 50%, var(--accent))",
  "color-mix(in oklab, var(--glow) 55%, var(--accent))",
  "color-mix(in oklab, var(--primary) 62%, var(--foreground))",
  "color-mix(in oklab, var(--accent) 55%, var(--glow))",
  "color-mix(in oklab, var(--primary) 55%, var(--glow))",
];
const TRUNK = "var(--muted)";
const R = 8; // elbow radius, px
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/50";
const EDGE_HOVER = "hover:border-[color-mix(in_srgb,var(--primary)_40%,var(--border))]";
const CHECK_SPRING = { type: "spring", stiffness: 560, damping: 14, mass: 0.6 } as const;

export function MindMap({
  def,
  locked,
  onToggle,
}: {
  def: LawMapDef;
  locked: Record<string, true>;
  onToggle: (key: string) => void;
}) {
  const uid = useId();
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [popKey, setPopKey] = useState<string | null>(null); // the leaf just locked: it alone pours + springs

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    if (!wrap || !svg) return;
    const draw = () => {
      svg.innerHTML = connectorMarkup(wrap);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [def, collapsed]);

  const total = def.branches.reduce((n, b) => n + b.leaves.length, 0);
  const lockedIn = def.branches.reduce(
    (n, b) => n + b.leaves.reduce((m, _, i) => m + (locked[mapLeafKey(def.id, b.id, i)] ? 1 : 0), 0),
    0
  );
  const complete = total > 0 && lockedIn >= total;
  const allCollapsed = def.branches.length > 0 && def.branches.every((b) => collapsed.has(b.id));

  const toggleBranch = (id: string) => {
    haptic("tap");
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    haptic("tap");
    setCollapsed(allCollapsed ? new Set() : new Set(def.branches.map((b) => b.id)));
  };

  const toggleLeaf = (key: string, isLocked: boolean) => {
    if (isLocked) haptic("tap");
    else haptic(lockedIn + 1 >= total ? "milestone" : "success");
    setPopKey(isLocked ? null : key);
    onToggle(key);
  };

  return (
    <div className="@container">
      <div ref={wrapRef} className="relative">
        {/* connector underlay — filled imperatively by connectorMarkup() */}
        <svg ref={svgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" />

        {/* root + map-level control */}
        <div className="relative flex items-center justify-between gap-3">
          <div
            data-mm="root"
            className="flex min-w-0 items-center gap-2 rounded-full bg-[var(--primary)]/12 py-1.5 pl-3.5 pr-1.5 text-[color-mix(in_srgb,var(--primary)_80%,var(--foreground))]"
          >
            <span className="truncate font-display text-[14px] font-bold leading-tight">{def.short}</span>
            <Badge tone={complete ? "success" : "default"} className="shrink-0 tabular-nums">
              {complete && <Check size={11} strokeWidth={3} aria-hidden="true" />}
              {lockedIn}/{total}
            </Badge>
          </div>
          {def.branches.length > 1 && (
            <Button variant="ghost" size="sm" onClick={toggleAll} className="shrink-0">
              {allCollapsed ? <ChevronsUpDown size={14} aria-hidden="true" /> : <ChevronsDownUp size={14} aria-hidden="true" />}
              {allCollapsed ? "Expand all" : "Collapse all"}
            </Button>
          )}
        </div>

        {/* branches → facts */}
        <div className="relative mt-4 flex flex-col gap-3 pl-7 @xl:gap-4 @xl:pl-9">
          {def.branches.map((b, bi) => {
            const color = BRANCH[bi % BRANCH.length];
            const isCollapsed = collapsed.has(b.id);
            const branchLocked = b.leaves.reduce((m, _, i) => m + (locked[mapLeafKey(def.id, b.id, i)] ? 1 : 0), 0);
            const branchDone = b.leaves.length > 0 && branchLocked >= b.leaves.length;
            const panelId = `${uid}-b${bi}`;
            return (
              <div key={b.id} className="flex flex-col gap-2 @xl:flex-row @xl:items-start @xl:gap-8">
                <button
                  type="button"
                  data-mm={`b:${bi}`}
                  onClick={() => toggleBranch(b.id)}
                  aria-expanded={!isCollapsed}
                  aria-controls={panelId}
                  className={cn(
                    "press flex min-h-11 w-full shrink-0 cursor-pointer items-center gap-2.5 rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] py-2 pl-3 pr-2 text-left @xl:min-h-10 @xl:w-[184px]",
                    EDGE_HOVER,
                    FOCUS
                  )}
                >
                  <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
                  <span className="min-w-0 flex-1 text-[13px] font-semibold leading-tight @xl:text-xs">{b.t}</span>
                  <span
                    className={cn(
                      "flex shrink-0 items-center gap-0.5 text-[11px] font-semibold tabular-nums",
                      branchDone ? "text-[var(--success)]" : "text-[var(--muted)]"
                    )}
                  >
                    {branchDone && <Check size={11} strokeWidth={3} aria-hidden="true" />}
                    {branchLocked}/{b.leaves.length}
                  </span>
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className={cn("shrink-0 text-[var(--muted)] motion-safe:transition-transform", isCollapsed && "-rotate-90")}
                  />
                </button>

                {!isCollapsed && (
                  <ul id={panelId} className="flex min-w-0 flex-1 flex-col gap-1.5 pl-7 @xl:max-w-[460px] @xl:pl-0">
                    {b.leaves.map((leaf, li) => {
                      const key = mapLeafKey(def.id, b.id, li);
                      const isLocked = !!locked[key];
                      const justLocked = isLocked && popKey === key;
                      return (
                        <li key={li}>
                          <button
                            type="button"
                            data-mm={`l:${bi}:${li}`}
                            aria-pressed={isLocked}
                            onClick={() => toggleLeaf(key, isLocked)}
                            title={isLocked ? "Locked in. Tap to unlock." : "Tap when you know it cold"}
                            className={cn(
                              "press flex min-h-11 w-full cursor-pointer items-start gap-2.5 rounded-[14px] border px-3 py-2.5 text-left text-[13px] leading-snug text-[var(--foreground)] @xl:min-h-0 @xl:py-2",
                              FOCUS,
                              isLocked
                                ? // the exam's liquid: pours in once for the fact just locked, then simply stays
                                  cn("liquid-fill border-[color-mix(in_srgb,var(--primary)_45%,var(--border))]", !justLocked && "before:animate-none!")
                                : cn("border-[var(--border)] bg-[var(--surface-2)]", EDGE_HOVER)
                            )}
                          >
                            <span
                              aria-hidden="true"
                              className={cn(
                                "mt-px grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-[1.5px]",
                                isLocked ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-fg)]" : "border-[var(--muted)]/60"
                              )}
                            >
                              {isLocked && (
                                <motion.span
                                  className="grid place-items-center"
                                  initial={justLocked && !reduce ? { scale: 0.2, rotate: -30 } : false}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={CHECK_SPRING}
                                >
                                  <Check size={11} strokeWidth={3.5} />
                                </motion.span>
                              )}
                            </span>
                            <span className="min-w-0">{leaf}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Connector geometry ──

interface Box {
  l: number;
  r: number;
  b: number;
  cy: number;
}

const f = (n: number) => Math.round(n * 10) / 10;

// Colours are CSS (token expressions), so they go in the style attribute where var() resolves.
function seg(d: string, color: string, width: number, opacity: number) {
  return `<path d="${d}" fill="none" style="stroke:${color};stroke-opacity:${opacity}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function curve(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.max(16, (x2 - x1) / 2);
  return `M${f(x1)} ${f(y1)} C${f(x1 + dx)} ${f(y1)} ${f(x2 - dx)} ${f(y2)} ${f(x2)} ${f(y2)}`;
}

// Rounded elbow from a vertical rail at x into a node's left edge at y.
function elbow(x: number, y: number, toX: number) {
  return `M${f(x)} ${f(y - R)} Q${f(x)} ${f(y)} ${f(x + R)} ${f(y)} H${f(toX)}`;
}

function connectorMarkup(wrap: HTMLElement): string {
  const base = wrap.getBoundingClientRect();
  if (base.width === 0) return "";

  let root: Box | null = null;
  const branches = new Map<number, Box>();
  const leaves = new Map<number, Box[]>();
  for (const el of Array.from(wrap.querySelectorAll<HTMLElement>("[data-mm]"))) {
    const r = el.getBoundingClientRect();
    const box: Box = { l: r.left - base.left, r: r.right - base.left, b: r.bottom - base.top, cy: r.top - base.top + r.height / 2 };
    const [kind, bi] = (el.dataset.mm ?? "").split(":");
    if (kind === "root") root = box;
    else if (kind === "b") branches.set(Number(bi), box);
    else if (kind === "l") leaves.set(Number(bi), [...(leaves.get(Number(bi)) ?? []), box]);
  }

  const ordered = [...branches.entries()].sort((a, b) => a[0] - b[0]);
  if (!root || ordered.length === 0) return "";

  const out: string[] = [];
  const trunkX = root.l + 14;
  out.push(seg(`M${f(trunkX)} ${f(root.b)} V${f(ordered[ordered.length - 1][1].cy - R)}`, TRUNK, 1.5, 0.4));

  for (const [bi, bx] of ordered) {
    const color = BRANCH[bi % BRANCH.length];
    out.push(seg(elbow(trunkX, bx.cy, bx.l), color, 2, 0.85));

    const ls = leaves.get(bi);
    if (!ls?.length) continue;
    if (ls[0].l > bx.r) {
      // tree: facts sit to the right of the branch → fan out with curves
      for (const lf of ls) out.push(seg(curve(bx.r, bx.cy, lf.l, lf.cy), color, 1.5, 0.45));
    } else {
      // outline: facts sit under the branch → rail + elbows
      const railX = bx.l + 12;
      out.push(seg(`M${f(railX)} ${f(bx.b)} V${f(ls[ls.length - 1].cy - R)}`, color, 1.5, 0.5));
      for (const lf of ls) out.push(seg(elbow(railX, lf.cy, lf.l), color, 1.5, 0.5));
    }
  }
  return out.join("");
}
