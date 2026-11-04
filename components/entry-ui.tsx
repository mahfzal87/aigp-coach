"use client";

// Small building blocks shared by the entry flow (components/entry-flow.tsx),
// the account UI (components/account.tsx, components/profile.tsx) and Settings.
// Surfaces and controls come from components/ui.tsx; what lives here is
// behaviour plus a couple of compositions (a labelled field, a settings row).

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ComponentPropsWithRef, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle2, GraduationCap, Info, Loader2 } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui";

// ── Brand ──
export function LogoTile({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 place-items-center rounded-xl bg-[var(--primary)] text-[var(--primary-fg)]", className)}
      style={{ width: size, height: size }}
    >
      <GraduationCap size={Math.round(size * 0.5)} />
    </span>
  );
}

export function BrandMark({ tagline = "IAPP exam simulator" }: { tagline?: string | null }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoTile />
      <div className="min-w-0">
        <div className="font-display text-[18px] font-bold leading-none">AIGP Coach</div>
        {tagline && <div className="mt-1 text-xs leading-none text-[var(--muted)]">{tagline}</div>}
      </div>
    </div>
  );
}

// Shown for the server render and the hydration pass. It fades in after a
// beat, so a fast hydration never flashes it (pure CSS: works before JS runs).
const SPLASH_KEYFRAMES = "@keyframes entry-splash-in{from{opacity:0}to{opacity:1}}";
export function Splash() {
  return (
    <div role="status" aria-label="Loading AIGP Coach" className="grid min-h-dvh place-items-center">
      <style>{SPLASH_KEYFRAMES}</style>
      <div className="flex items-center gap-2.5" style={{ animation: "entry-splash-in 320ms ease-out 260ms both" }}>
        <LogoTile size={36} className="motion-safe:animate-pulse" />
        <span className="font-display text-[16px] font-bold">AIGP Coach</span>
      </div>
    </div>
  );
}

export function Spinner({ size = 16 }: { size?: number }) {
  return <Loader2 size={size} aria-hidden className="shrink-0 motion-safe:animate-spin" />;
}

// ── Exam light on one element ──
// globals.css resolves --primary from --exam-primary on :root only, so an
// element carrying its own data-exam must re-resolve the exam-driven tokens to
// glow in that exam's light (its --glow/--spark already follow data-exam).
export const EXAM_SCOPE = {
  "--primary": "var(--exam-primary)",
  "--primary-shade": "var(--exam-primary-shade)",
  "--accent": "var(--exam-accent)",
  "--accent-shade": "var(--exam-accent-shade)",
  "--ring": "var(--exam-primary)",
} as CSSProperties;

// The liquid lens (a framer-motion layoutId pill) — same spring as the shell's.
export function useLensTransition() {
  const reduce = useReducedMotion();
  return reduce ? { duration: 0 } : ({ type: "spring", stiffness: 380, damping: 30, mass: 0.9 } as const);
}

// ── Labelled text field on the shared Input ──
type TextFieldProps = ComponentPropsWithRef<"input"> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  warning?: ReactNode;
  trailing?: ReactNode; // e.g. a show/hide password button, pinned inside the right edge
};

// Visible label above, one note below (error > warning > hint), wired to the
// input with aria-invalid / aria-describedby.
export function TextField({ label, hint, error, warning, trailing, id, className, ...input }: TextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const noteId = `${fieldId}-note`;
  const note = error || warning || hint;
  return (
    <div className="min-w-0">
      <label htmlFor={fieldId} className="mb-1.5 block text-[13px] font-semibold">
        {label}
      </label>
      <div className="relative">
        <Input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={note ? noteId : undefined}
          {...input}
          className={cn(
            trailing && "pr-12",
            error && "border-[var(--danger)] focus-visible:border-[var(--danger)] focus-visible:ring-[var(--danger)]/15",
            className
          )}
        />
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center">{trailing}</div>}
      </div>
      {note && (
        <p
          id={noteId}
          role={error ? "alert" : undefined}
          className={cn("mt-1.5 flex items-start gap-1.5 text-xs leading-snug", error ? "font-medium text-[var(--danger)]" : "text-[var(--muted)]")}
        >
          {error ? (
            <AlertCircle size={14} className="mt-px shrink-0" aria-hidden />
          ) : warning ? (
            <AlertTriangle size={14} className="mt-px shrink-0 text-[var(--warning)]" aria-hidden />
          ) : null}
          <span className={cn("min-w-0", warning && !error && "font-medium text-[var(--foreground)]")}>{note}</span>
        </p>
      )}
    </div>
  );
}

// ── A labelled group of settings rows (Settings, Profile) ──
// Sentence-case label, no tracked capitals; an id makes it a deep-link target.
export function SettingsSection({ id, title, danger, children }: { id: string; title: string; danger?: boolean; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <h2 id={`${id}-title`} className={cn("mb-2 px-1 font-sans text-[13px] font-semibold", danger ? "text-[var(--danger)]" : "text-[var(--muted)]")}>
        {title}
      </h2>
      {children}
    </section>
  );
}

// ── A settings row: title + hint on the left, controls on the right (stacked
// under on phones), an optional status line underneath. ──
export function SettingRow({
  title,
  hint,
  badge,
  htmlFor,
  children,
  footer,
  className,
}: {
  title: ReactNode;
  hint?: ReactNode;
  badge?: ReactNode;
  htmlFor?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const titleCls = "flex flex-wrap items-center gap-2 text-[15px] font-semibold";
  return (
    <div className={cn("px-5 py-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          {htmlFor ? (
            <label htmlFor={htmlFor} className={titleCls}>
              {title}
              {badge}
            </label>
          ) : (
            <div className={titleCls}>
              {title}
              {badge}
            </div>
          )}
          {hint && <div className="mt-0.5 text-[13px] text-[var(--muted)]">{hint}</div>}
        </div>
        {children && <div className="flex min-w-0 flex-wrap items-center gap-2 sm:shrink-0 sm:flex-nowrap sm:justify-end">{children}</div>}
      </div>
      {footer}
    </div>
  );
}

// Row controls: 44px tall on phones (touch), 36px from sm up — one height per row.
export const rowCtl = "h-11 sm:h-9";

// ── Two-step confirm ("arm") ──
// First tap arms for ~6s (optionally holding what the second tap will apply),
// second tap acts. Callers swap the button to the danger variant while armed.
export function useArm<T = true>(ms = 6000) {
  const [armed, setArmed] = useState<T | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const disarm = useCallback(() => {
    clearTimeout(timer.current);
    setArmed(null);
  }, []);
  const arm = useCallback(
    (value: T) => {
      clearTimeout(timer.current);
      haptic("tap");
      setArmed(() => value);
      timer.current = setTimeout(() => setArmed(null), ms);
    },
    [ms]
  );
  return { armed, arm, disarm };
}

// ── Inline status next to the control that caused it ──
export type FlashTone = "ok" | "error" | "info";
export type FlashMsg = { text: string; tone: FlashTone };

export function useFlash(ms = 6000) {
  const [msg, setMsg] = useState<FlashMsg | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const flash = useCallback(
    (text: string, tone: FlashTone = "ok") => {
      clearTimeout(timer.current);
      setMsg({ text, tone });
      // Errors stay until the next action; confirmations clear themselves.
      if (tone !== "error") timer.current = setTimeout(() => setMsg(null), ms);
    },
    [ms]
  );
  const clear = useCallback(() => {
    clearTimeout(timer.current);
    setMsg(null);
  }, []);
  return { msg, flash, clear };
}

// The live region is always mounted (so screen readers hear changes) but has
// no size until there is a message — no dead band under the row.
export function Flash({ msg, className }: { msg: FlashMsg | null; className?: string }) {
  const Icon = msg?.tone === "error" ? AlertCircle : msg?.tone === "ok" ? CheckCircle2 : Info;
  return (
    <div aria-live="polite" aria-atomic="true">
      {msg && (
        <p
          className={cn(
            "flex items-start gap-1.5 text-[13px] font-medium leading-snug",
            msg.tone === "error" ? "text-[var(--danger)]" : "text-[var(--foreground)]",
            className
          )}
        >
          <Icon
            size={14}
            aria-hidden
            className={cn("mt-0.5 shrink-0", msg.tone === "ok" ? "text-[var(--success)]" : msg.tone === "info" ? "text-[var(--muted)]" : "")}
          />
          <span className="min-w-0">{msg.text}</span>
        </p>
      )}
    </div>
  );
}
