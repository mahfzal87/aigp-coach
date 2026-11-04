"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown, LayoutGrid } from "lucide-react";
import { clearStoredExam, getActiveExam, switchExam } from "@/lib/exam-state";
import { listPacks } from "@/lib/exam-registry";
import { getActiveMeta } from "@/lib/content";
import { useMenuFocus } from "@/components/a11y";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

// Exam picker that lives under the product name. Rendered inside ExamGate, so
// by the time a non-default exam is active the subtree has remounted and this
// reads the correct pack. Switching does a full reload for clean state.
export function ExamSwitcher({ compact }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const meta = getActiveMeta();
  const active = getActiveExam();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  useMenuFocus(menuRef, open, () => setOpen(false), triggerRef);

  const item = "flex w-full cursor-pointer items-start gap-2 rounded-xl px-3 py-2.5 text-left hover:bg-[var(--surface-2)] focus-visible:bg-[var(--surface-2)] focus-visible:outline-none";
  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        onClick={() => {
          haptic("tap");
          setOpen((o) => !o);
        }}
        className={cn(
          "press flex cursor-pointer items-center gap-1 rounded-lg font-medium text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]",
          // A real 44px target on phones without growing the header.
          compact ? "-my-2 h-11 px-2 text-xs" : "-mx-1 px-1 py-0.5 text-[11px]"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Exam: ${meta.name}. Switch exam`}
      >
        <span className="font-semibold text-[var(--foreground)]">{meta.name}</span>
        {!compact && <span>{meta.bokLabel}</span>}
        <ChevronsUpDown size={compact ? 13 : 11} aria-hidden />
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Switch exam"
          className={cn(
            "z-50 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[var(--e3)]",
            // Phone: a full-width panel under the header, so it never runs off-screen.
            compact ? "fixed inset-x-3 top-[68px]" : "absolute left-0 top-full mt-1.5 w-64"
          )}
        >
          {listPacks().map((p) => (
            <button
              key={p.meta.slug}
              role="menuitemradio"
              aria-checked={p.meta.slug === active}
              onClick={() => {
                setOpen(false);
                if (p.meta.slug !== active) switchExam(p.meta.slug);
              }}
              className={item}
            >
              <span className="mt-0.5 w-4 shrink-0 text-[var(--primary-ink)]">{p.meta.slug === active && <Check size={14} aria-hidden />}</span>
              <span className="min-w-0">
                <span className="block text-sm font-bold leading-tight">{p.meta.name}</span>
                <span className="block text-xs leading-snug text-[var(--muted)]">{p.meta.fullName}</span>
              </span>
            </button>
          ))}
          <div className="my-1 border-t border-[var(--border)]" />
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              clearStoredExam();
              window.location.assign("/");
            }}
            className={cn(item, "items-center text-sm font-semibold text-[var(--primary-ink)]")}
          >
            <LayoutGrid size={15} aria-hidden /> Browse all exams
          </button>
          <p className="px-3 pb-1.5 pt-1 text-xs leading-snug text-[var(--muted)]">Each exam keeps its own progress, mocks and streak.</p>
        </div>
      )}
    </div>
  );
}
