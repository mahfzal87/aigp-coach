import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

// ── Button — flat, focused ──
const buttonVariants = cva(
  "press inline-flex items-center justify-center gap-2 rounded-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-[var(--primary)] text-[var(--primary-fg)] hover:bg-[var(--primary-shade)]",
        accent: "bg-[var(--accent)] text-white hover:bg-[var(--accent-shade)]",
        danger: "bg-[var(--danger)] text-white hover:bg-[var(--danger-shade)]",
        gold: "bg-[var(--gold)] text-white hover:opacity-90",
        outline: "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-2)]",
        ghost: "bg-transparent text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]",
      },
      size: { sm: "h-9 px-3 text-xs", md: "h-11 px-5 text-sm", lg: "h-12 px-6 text-sm" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export function Button({
  className,
  variant,
  size,
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} style={style as CSSProperties} {...props} />
  );
}

// ── Card ──
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]", className)} {...props} />;
}
export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

// ── Badge ──
const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    tone: {
      default: "bg-[var(--surface-2)] text-[var(--muted)]",
      primary: "bg-[var(--primary)]/15 text-[var(--primary)]",
      accent: "bg-[var(--accent)]/15 text-[var(--accent)]",
      gold: "bg-[var(--gold)]/20 text-[#a07a00]",
      streak: "bg-[var(--streak)]/15 text-[var(--streak)]",
      success: "bg-[var(--success)]/15 text-[var(--success)]",
      warning: "bg-[var(--warning)]/15 text-[var(--warning)]",
      danger: "bg-[var(--danger)]/15 text-[var(--danger)]",
    },
  },
  defaultVariants: { tone: "default" },
});
export function Badge({ className, tone, children }: { className?: string; children: ReactNode } & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>;
}

// ── Progress bar (thick, rounded, Duolingo) ──
export function Bar({ value, className, tone = "primary" }: { value: number; className?: string; tone?: "primary" | "accent" | "gold" | "streak" | "success" | "warning" | "danger" }) {
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]", className)}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: `var(--${tone})` }} />
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card>
      <CardBody className="p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</div>
        <div className="mt-0.5 text-2xl font-bold tabular-nums">{value}</div>
        {hint && <div className="mt-0.5 text-xs text-[var(--muted)]">{hint}</div>}
      </CardBody>
    </Card>
  );
}
