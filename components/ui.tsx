import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

// ── Chunky 3D Button (Duolingo style) ──
const buttonVariants = cva(
  "btn3d press inline-flex items-center justify-center gap-2 rounded-2xl font-extrabold uppercase tracking-wide font-[family-name:var(--font-display)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]/40 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed select-none",
  {
    variants: {
      variant: {
        primary: "bg-[var(--primary)] text-[var(--primary-fg)]",
        accent: "bg-[var(--accent)] text-white",
        danger: "bg-[var(--danger)] text-white",
        gold: "bg-[var(--gold)] text-[#5b4500]",
        outline: "bg-[var(--surface)] text-[var(--foreground)] border-2 border-[var(--border)]",
        ghost: "bg-transparent text-[var(--muted)] shadow-none",
      },
      size: { sm: "h-9 px-3 text-xs", md: "h-12 px-5 text-sm", lg: "h-14 px-7 text-base" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

const SHADE: Record<string, string> = {
  primary: "var(--primary-shade)",
  accent: "var(--accent-shade)",
  danger: "var(--danger-shade)",
  gold: "#d9a800",
  outline: "var(--border)",
  ghost: "transparent",
};

export function Button({
  className,
  variant,
  size,
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  const shade = SHADE[variant ?? "primary"];
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      style={{ ["--btn-shade" as string]: shade, ...(style as CSSProperties) }}
      {...props}
    />
  );
}

// ── Card (rounded, bordered) ──
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-3xl border-2 border-[var(--border)] bg-[var(--surface)]", className)} {...props} />;
}
export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

// ── Badge ──
const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold", {
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
    <div className={cn("h-4 w-full overflow-hidden rounded-full bg-[var(--surface-2)]", className)}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: `var(--${tone})` }} />
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm font-semibold text-[var(--muted)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card>
      <CardBody className="p-4">
        <div className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--muted)]">{label}</div>
        <div className="mt-0.5 text-2xl font-extrabold">{value}</div>
        {hint && <div className="mt-0.5 text-xs font-semibold text-[var(--muted)]">{hint}</div>}
      </CardBody>
    </Card>
  );
}
