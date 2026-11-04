import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

// ── Button — pills with a tactile press ──
export const buttonVariants = cva(
  "press inline-flex items-center justify-center gap-2 rounded-full font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--primary)] text-[var(--primary-fg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_6px_16px_-8px_var(--primary)] hover:bg-[var(--primary-shade)]",
        accent: "bg-[var(--accent)] text-[var(--accent-fg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-[var(--accent-shade)]",
        danger: "bg-[var(--danger)] text-[var(--danger-fg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-[var(--danger-shade)]",
        gold: "bg-[var(--gold)] text-[#1b1300] hover:opacity-90",
        outline:
          "bg-[var(--glass-tint-strong)] text-[var(--foreground)] border border-[var(--border)] hover:border-[color-mix(in_srgb,var(--primary)_40%,var(--border))]",
        soft: "bg-[var(--primary)]/12 text-[var(--primary-ink)] hover:bg-[var(--primary)]/18",
        ghost: "bg-transparent text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]",
      },
      size: { sm: "h-9 px-3.5 text-xs", md: "h-11 px-5 text-sm", lg: "h-12 px-6 text-sm" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export function Button({ className, variant, size, ...props }: ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

// ── Card — minimal liquid glass. Nested cards flatten automatically (globals.css). ──
export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("glass-panel rounded-[22px]", className)} {...props} />;
}
export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-5", className)} {...props} />;
}

// ── Badge — tinted pills; text tones darkened toward the ink so they pass AA on glass ──
const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    tone: {
      default: "bg-[var(--surface-2)] text-[var(--muted)]",
      primary: "bg-[var(--primary)]/14 text-[var(--primary-ink)]",
      accent: "bg-[var(--accent)]/14 text-[var(--accent-ink)]",
      gold: "bg-[var(--gold)]/18 text-[color-mix(in_srgb,var(--gold)_55%,var(--foreground))]",
      streak: "bg-[var(--streak)]/15 text-[color-mix(in_srgb,var(--streak)_72%,var(--foreground))]",
      success: "bg-[var(--success)]/14 text-[color-mix(in_srgb,var(--success)_66%,var(--foreground))]",
      warning: "bg-[var(--warning)]/16 text-[color-mix(in_srgb,var(--warning)_60%,var(--foreground))]",
      danger: "bg-[var(--danger)]/14 text-[color-mix(in_srgb,var(--danger)_70%,var(--foreground))]",
    },
  },
  defaultVariants: { tone: "default" },
});
export function Badge({ className, tone, children }: { className?: string; children: ReactNode } & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>;
}

// ── Progress bar — the primary tone pours the exam's liquid (glow → primary) ──
export function Bar({ value, className, tone = "primary" }: { value: number; className?: string; tone?: "primary" | "accent" | "gold" | "streak" | "success" | "warning" | "danger" }) {
  const fill = tone === "primary" ? "linear-gradient(90deg, var(--glow), var(--primary))" : `var(--${tone})`;
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]", className)}>
      <div className="h-full rounded-full motion-safe:transition-[width] motion-safe:duration-500" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: fill }} />
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[28px] font-extrabold leading-[1.1] sm:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-prose text-[15px] text-[var(--muted)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card>
      <CardBody className="p-4">
        <div className="text-xs font-medium text-[var(--muted)]">{label}</div>
        <div className="mt-0.5 font-display text-2xl font-bold tabular-nums">{value}</div>
        {hint && <div className="mt-0.5 text-xs text-[var(--muted)]">{hint}</div>}
      </CardBody>
    </Card>
  );
}

// ── Form primitives ──
export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3.5 text-base text-[var(--foreground)] placeholder:text-[var(--muted)] focus-visible:border-[var(--ring)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-60 aria-[invalid=true]:border-[var(--danger)] aria-[invalid=true]:focus-visible:ring-[var(--danger)] sm:text-sm",
        className
      )}
      {...props}
    />
  );
}

export function Switch({
  checked,
  onCheckedChange,
  className,
  ...props
}: { checked: boolean; onCheckedChange: (v: boolean) => void } & Omit<ComponentProps<"button">, "onChange">) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "press relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-[var(--border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] before:absolute before:-inset-2 before:content-['']",
        checked ? "bg-[var(--primary)]" : "bg-[var(--surface-2)]",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-0.5 h-6 w-6 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.2)] motion-safe:transition-transform motion-safe:duration-200",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}

// A filter/selection chip: quiet when off, soft-tinted when on.
export function Chip({ selected, className, ...props }: { selected?: boolean } & ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(buttonVariants({ variant: selected ? "soft" : "outline", size: "sm" }), "h-11 px-3.5 sm:h-8 sm:px-3", className)}
      {...props}
    />
  );
}
