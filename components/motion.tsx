"use client";

// Shared motion primitives — one rhythm across the app.
// Springs over curves (HIG), enter ease-out ≤300ms, exits ~65% of enter,
// 35ms stagger, transform/opacity only, reduced-motion respected globally.

import { motion, useReducedMotion, useSpring, useTransform, type HTMLMotionProps } from "framer-motion";
import { useEffect, type ReactNode } from "react";

const m = motion;

export const spring = { type: "spring", stiffness: 420, damping: 32, mass: 0.9 } as const;
export const springSoft = { type: "spring", stiffness: 260, damping: 30 } as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** Fade-and-rise entrance. */
export function Reveal({ delay = 0, y = 10, className, children, ...rest }: { delay?: number; y?: number } & HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  return (
    <m.div
      initial={reduce ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springSoft, delay }}
      className={className}
      {...rest}
    >
      {children}
    </m.div>
  );
}

/** Stagger container + item for lists. */
export function Stagger({ className, children, delay = 0, ...rest }: { className?: string; children: ReactNode; delay?: number } & Omit<HTMLMotionProps<"div">, "children">) {
  const reduce = useReducedMotion();
  return (
    <m.div
      className={className}
      {...rest}
      initial={reduce ? false : "hidden"}
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035, delayChildren: delay } } }}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({ className, children, y = 8 }: { className?: string; children: ReactNode; y?: number }) {
  return (
    <m.div className={className} variants={{ hidden: { opacity: 0, y }, show: { opacity: 1, y: 0, transition: springSoft } }}>
      {children}
    </m.div>
  );
}

/** Spring count-up number. Tabular so layout never shifts. */
export function AnimatedNumber({ value, className, format }: { value: number; className?: string; format?: (n: number) => string }) {
  const reduce = useReducedMotion();
  const springVal = useSpring(reduce ? value : 0, { stiffness: 90, damping: 22 });
  const text = useTransform(springVal, (v) => (format ? format(Math.round(v)) : Math.round(v).toLocaleString()));
  useEffect(() => {
    springVal.set(value);
  }, [value, springVal]);
  if (reduce) return <span className={`tabular-nums ${className ?? ""}`}>{format ? format(value) : value.toLocaleString()}</span>;
  return <m.span className={`tabular-nums ${className ?? ""}`}>{text}</m.span>;
}

/** Animated progress bar (transform-based, no layout shift). */
export function MotionBar({ value, tone = "primary", className }: { value: number; tone?: "primary" | "accent" | "gold" | "streak" | "success" | "warning" | "danger"; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)] ${className ?? ""}`}>
      <m.div
        className="h-full origin-left rounded-full"
        style={{ background: `var(--${tone})` }}
        initial={false}
        animate={{ scaleX: pct / 100 }}
        transition={springSoft}
      />
    </div>
  );
}

export { m };
