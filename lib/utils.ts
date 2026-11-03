import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pct(n: number) {
  return `${Math.round(n)}%`;
}

export function fmtDate(iso: string) {
  try {
    // Date-only strings parse as UTC midnight, which shows the previous day
    // west of UTC — build them as local dates instead.
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

export function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const d = (m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(iso)).getTime();
  if (Number.isNaN(d)) return null;
  return Math.ceil((d - Date.now()) / (24 * 60 * 60 * 1000));
}
