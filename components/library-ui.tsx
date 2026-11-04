"use client";

import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { Chip } from "@/components/ui";
import { cn } from "@/lib/utils";

// Small helpers shared by the library pages — Reference, Strategy and Law
// updates. Only those three pages import this file.

const noopSubscribe = () => () => {};

/** False during SSR and the hydration render, true afterwards (no effect round trip). */
export function useIsClient(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/** The page's query params once on the client (null during SSR / hydration). */
export function useUrlParams(): URLSearchParams | null {
  const search = useSyncExternalStore<string | null>(noopSubscribe, () => window.location.search, () => null);
  return useMemo(() => (search === null ? null : new URLSearchParams(search)), [search]);
}

/** Rewrites one query param in place — no navigation, no new history entry. */
export function setUrlParam(key: string, value: string | null) {
  try {
    const url = new URL(window.location.href);
    if (value === null) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  } catch {
    /* history unavailable — the in-page state still applies */
  }
}

// ── Search ──

/** Lower-cased search words. Under two characters counts as "not searching". */
export function tokenize(q: string): string[] {
  const t = q.trim().toLowerCase();
  return t.length < 2 ? [] : t.split(/\s+/).filter(Boolean);
}

/** Every word must appear somewhere in the haystack. */
export function matches(hay: string, tokens: string[]): boolean {
  if (!tokens.length) return true;
  const h = hay.toLowerCase();
  return tokens.every((t) => h.includes(t));
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Text with every search-word hit lit in the exam's glow. */
export function Hl({ text, tokens }: { text: string; tokens: string[] }) {
  if (!tokens.length) return <>{text}</>;
  const re = new RegExp(`(${[...tokens].sort((a, b) => b.length - a.length).map(escapeRe).join("|")})`, "gi");
  return (
    <>
      {text.split(re).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-[4px] bg-[var(--glow)]/35 px-px text-inherit">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

// ── Motion ──

const lensSpring = { type: "spring", stiffness: 380, damping: 30, mass: 0.9 } as const;

/** A count that springs to its new value when it changes (and starts where it is). */
export function Tick({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const sv = useSpring(value, { stiffness: 220, damping: 26 });
  const text = useTransform(sv, (v) => String(Math.round(v)));
  useEffect(() => {
    sv.set(value);
  }, [value, sv]);
  if (reduce) return <span className={cn("tabular-nums", className)}>{value}</span>;
  return <motion.span className={cn("tabular-nums", className)}>{text}</motion.span>;
}

// ── Layout bits ──

/** Sentence-case label that opens a group of rows inside a panel. */
export function GroupLabel({ children, count, className }: { children: ReactNode; count?: number; className?: string }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-3 px-4 pb-1 pt-4 text-[13px] font-semibold text-[var(--muted)] sm:px-5", className)}>
      <span className="min-w-0">{children}</span>
      {count !== undefined && <span className="tabular-nums">{count}</span>}
    </div>
  );
}

/**
 * One-row horizontal scroller. Wide content scrolls inside itself (never the
 * page); an edge fades only while there is more to scroll that way, and the
 * child marked data-active="true" is kept in view. `layoutScroll` lets a lens
 * inside measure correctly while the row is scrolled.
 */
export function ScrollRow({ children, className, activeKey }: { children: ReactNode; className?: string; activeKey?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ l: false, r: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const l = el.scrollLeft > 1;
      const r = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
      setEdge((e) => (e.l === l && e.r === r ? e : { l, r }));
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    const c = el?.querySelector<HTMLElement>("[data-active='true']");
    if (!el || !c || el.scrollWidth <= el.clientWidth) return;
    const pad = 28;
    const left = c.offsetLeft - pad;
    const right = c.offsetLeft + c.offsetWidth + pad - el.clientWidth;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    if (el.scrollLeft > left) el.scrollTo({ left, behavior });
    else if (el.scrollLeft < right) el.scrollTo({ left: right, behavior });
  }, [activeKey]);

  const fade = 28;
  const mask =
    edge.l && edge.r
      ? `linear-gradient(to right, transparent, black ${fade}px, black calc(100% - ${fade}px), transparent)`
      : edge.r
        ? `linear-gradient(to right, black calc(100% - ${fade}px), transparent)`
        : edge.l
          ? `linear-gradient(to right, transparent, black ${fade}px)`
          : undefined;

  return (
    <motion.div
      ref={ref}
      layoutScroll
      className={cn("relative overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
      style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
    >
      {children}
    </motion.div>
  );
}

export interface LensTab<K extends string> {
  key: K;
  label: ReactNode;
  count?: number;
  disabled?: boolean;
  title?: string;
}

/**
 * Tabs marked by the liquid lens: one spring pill (framer-motion layoutId)
 * glides to the active tab. Roving focus with ←/→/Home/End; on phones the row
 * scrolls inside itself. `lensId` must be unique per control on the screen.
 */
export function LensTabs<K extends string>({
  lensId,
  label,
  items,
  active,
  onPick,
  idPrefix,
  panelId,
}: {
  lensId: string;
  label: string;
  items: LensTab<K>[];
  active: K;
  onPick: (k: K) => void;
  idPrefix: string;
  panelId: string;
}) {
  const reduce = useReducedMotion();
  const transition = reduce ? { duration: 0 } : lensSpring;

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const enabled = items.filter((t) => !t.disabled);
    const i = enabled.findIndex((t) => t.key === active);
    const next =
      e.key === "ArrowRight" ? enabled[(i + 1) % enabled.length] :
      e.key === "ArrowLeft" ? enabled[(i - 1 + enabled.length) % enabled.length] :
      e.key === "Home" ? enabled[0] :
      e.key === "End" ? enabled[enabled.length - 1] : undefined;
    if (!next) return;
    e.preventDefault();
    onPick(next.key);
    document.getElementById(`${idPrefix}-${next.key}`)?.focus();
  }

  return (
    <ScrollRow activeKey={active}>
      <div role="tablist" aria-label={label} onKeyDown={onKey} className="flex w-max min-w-full gap-1">
        {items.map((t) => {
          const on = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              id={`${idPrefix}-${t.key}`}
              role="tab"
              aria-selected={on}
              aria-controls={panelId}
              tabIndex={on ? 0 : -1}
              data-active={on ? "true" : undefined}
              disabled={t.disabled}
              title={t.title}
              onClick={() => onPick(t.key)}
              className={cn(
                "press relative flex h-11 flex-none cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:flex-1",
                on ? "text-[color-mix(in_srgb,var(--primary)_82%,var(--foreground))]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              {on && <motion.span layoutId={lensId} transition={transition} aria-hidden className="absolute inset-0 rounded-full bg-[var(--primary)]/12 ring-1 ring-[var(--primary)]/25" />}
              <span className="relative">{t.label}</span>
              {t.count !== undefined && <Tick value={t.count} className="relative text-xs" />}
            </button>
          );
        })}
      </div>
    </ScrollRow>
  );
}

/** Filter chip on the shared Chip: label + live count; zero = disabled. */
export function FilterChip({
  label,
  count,
  active,
  disabled,
  onClick,
  dot,
  title,
}: {
  label: ReactNode;
  count?: number;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  dot?: string; // a status token, e.g. "var(--danger)"
  title?: string;
}) {
  return (
    <Chip
      selected={active}
      data-active={active ? "true" : undefined}
      disabled={disabled}
      title={title}
      onClick={onClick}
      className="h-11 shrink-0 gap-1.5 whitespace-nowrap sm:h-8"
    >
      {dot && <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} />}
      {label}
      {count !== undefined && <Tick value={count} />}
    </Chip>
  );
}

// ── Dates ──

/** "3 months ago" style age of a timestamp, relative to `now`. */
export function ago(ts: number, now: number): string {
  const diff = now - ts;
  if (diff < 0) return "upcoming";
  const d = Math.floor(diff / 86_400_000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 14) return `${d} days ago`;
  if (d < 60) return `${Math.round(d / 7)} weeks ago`;
  const m = Math.round(d / 30.44);
  if (m < 24) return `${m} months ago`;
  return `${Math.round(d / 365.25)} years ago`;
}
