"use client";

// Small building blocks shared by the entry flow (components/entry-flow.tsx),
// the account UI (components/account.tsx) and Settings (app/settings/page.tsx).
// Surfaces come from components/ui.tsx; what lives here is behaviour plus the
// few controls ui.tsx doesn't have yet (a labelled text field).

import { useCallback, useEffect, useId, useRef, useState, type ComponentPropsWithRef, type ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, GraduationCap, Info, Loader2 } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

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
        <div className="text-[17px] font-bold leading-none tracking-tight">AIGP Coach</div>
        {tagline && <div className="mt-1 text-[11px] font-medium leading-none text-[var(--muted)]">{tagline}</div>}
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
        <span className="text-[15px] font-bold">AIGP Coach</span>
      </div>
    </div>
  );
}

export function Spinner({ size = 16 }: { size?: number }) {
  return <Loader2 size={size} aria-hidden className="shrink-0 motion-safe:animate-spin" />;
}

// ── Text input ──
// 16px text on phones so iOS doesn't zoom on focus; 44px tall for touch.
export const inputCls =
  "h-11 w-full min-w-0 rounded-xl border bg-[var(--surface)] px-3.5 text-base text-[var(--foreground)] outline-none transition-[border-color,box-shadow] placeholder:text-[var(--muted)]/60 focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm";
export const inputIdleCls =
  "border-[var(--border)] hover:border-[var(--muted)]/50 focus-visible:border-[var(--primary)] focus-visible:ring-[var(--ring)]/15";
export const inputErrorCls = "border-[var(--danger)] focus-visible:border-[var(--danger)] focus-visible:ring-[var(--danger)]/15";

type TextFieldProps = ComponentPropsWithRef<"input"> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  warning?: ReactNode;
  trailing?: ReactNode; // e.g. a show/hide password button, pinned inside the right edge
};

// Visible label above, one note below (error > warning > hint), wired to the
// input with aria-invalid / aria-describedby.
export function TextField({ label, hint, error, warning, trailing, id, className, style, ...input }: TextFieldProps) {
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
        <input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={note ? noteId : undefined}
          {...input}
          className={cn(inputCls, error ? inputErrorCls : inputIdleCls, trailing ? "pr-12" : "", className)}
          // Inline so the error border always shows: globals.css's unlayered
          // `* { border-color }` currently outranks Tailwind's border-color utilities.
          style={error ? { ...style, borderColor: "var(--danger)" } : style}
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
            "flex items-start gap-1.5 text-xs font-medium leading-snug",
            msg.tone === "error" ? "text-[var(--danger)]" : "text-[var(--foreground)]",
            className
          )}
        >
          <Icon
            size={14}
            aria-hidden
            className={cn("mt-px shrink-0", msg.tone === "ok" ? "text-[var(--success)]" : msg.tone === "info" ? "text-[var(--muted)]" : "")}
          />
          <span className="min-w-0">{msg.text}</span>
        </p>
      )}
    </div>
  );
}
