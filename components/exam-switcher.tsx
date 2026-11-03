"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { getActiveExam, switchExam } from "@/lib/exam-state";
import { listPacks } from "@/lib/exam-registry";
import { getActiveMeta } from "@/lib/content";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

// Exam picker that lives under the product name. Rendered inside ExamGate, so
// by the time a non-default exam is active the subtree has remounted and this
// reads the correct pack. Switching does a full reload for clean state.
export function ExamSwitcher({ compact }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          haptic("tap");
          setOpen((o) => !o);
        }}
        className={cn(
          "press flex cursor-pointer items-center gap-1 rounded-md font-medium text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]",
          compact ? "px-1.5 py-0.5 text-[11px]" : "-mx-1 px-1 py-0.5 text-[10px]"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {compact ? meta.name : `${meta.name} · ${meta.bokLabel}`}
        <ChevronsUpDown size={compact ? 12 : 10} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] shadow-lg">
          <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">Exam</div>
          {listPacks().map((p) => (
            <button
              key={p.meta.slug}
              onClick={() => {
                setOpen(false);
                if (p.meta.slug !== active) switchExam(p.meta.slug);
              }}
              className="flex w-full cursor-pointer items-start gap-2 px-3 py-2 text-left hover:bg-[var(--surface-2)]"
            >
              <span className="mt-0.5 w-4 shrink-0 text-[var(--primary)]">{p.meta.slug === active && <Check size={14} />}</span>
              <span>
                <span className="block text-sm font-bold leading-tight">{p.meta.name}</span>
                <span className="block text-[11px] leading-tight text-[var(--muted)]">
                  {p.meta.fullName} · {p.meta.bokLabel}
                </span>
              </span>
            </button>
          ))}
          <div className="border-t border-[var(--border)] px-3 py-2 text-[10px] leading-snug text-[var(--muted)]">
            Each exam keeps its own progress, mocks and streak.
          </div>
        </div>
      )}
    </div>
  );
}
