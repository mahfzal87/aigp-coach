"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { BarChart3, BookOpen, Brain, FileText, Flame, GraduationCap, Layers, Moon, Newspaper, Settings, Sun, Zap } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useHydrated, useProgress } from "@/store/progress";
import { streakAlive } from "@/lib/gamify";
import { haptic } from "@/lib/haptics";

const primaryNav = [
  { href: "/", label: "Study Plan", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: Brain },
  { href: "/mock", label: "Mock Exam", icon: GraduationCap },
  { href: "/profile", label: "Progress", icon: BarChart3 },
];
const secondaryNav = [
  { href: "/strategy", label: "Strategy", icon: Layers },
  { href: "/reference", label: "Reference", icon: FileText },
  { href: "/updates", label: "Law Updates", icon: Newspaper },
  { href: "/settings", label: "Settings", icon: Settings },
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  if (!m) return <div className="h-9 w-9" />;
  const dark = resolvedTheme === "dark";
  return (
    <button aria-label="Toggle theme" onClick={() => setTheme(dark ? "light" : "dark")} className="press grid h-9 w-9 cursor-pointer place-items-center rounded-lg hover:bg-[var(--surface-2)]">
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

function HeaderStats() {
  const hydrated = useHydrated();
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streakCount);
  const last = useProgress((s) => s.lastActiveDate);
  if (!hydrated) return <div className="h-6" />;
  const alive = streakAlive(last);
  return (
    <div className="flex items-center gap-4 text-sm font-semibold text-[var(--muted)]">
      <span className="flex items-center gap-1.5" title="Consecutive study days">
        <Flame size={16} className={alive ? "anim-flame text-[var(--streak)]" : "opacity-40"} fill={alive ? "var(--streak)" : "none"} />
        <span className="tabular-nums">{streak}<span className="hidden sm:inline"> day{streak === 1 ? "" : "s"}</span></span>
      </span>
      <span className="flex items-center gap-1.5" title="Study points earned">
        <Zap size={16} className="text-[var(--gold)]" />
        <span className="tabular-nums">{xp.toLocaleString()}<span className="hidden sm:inline"> pts</span></span>
      </span>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] md:flex md:flex-col">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--primary)] text-[var(--primary-fg)]">
            <GraduationCap size={18} />
          </div>
          <div>
            <div className="text-[15px] font-bold leading-none">AIGP Coach</div>
            <div className="mt-0.5 text-[10px] font-medium text-[var(--muted)]">BoK v2.1 · 2026</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {primaryNav.map((n) => <NavLink key={n.href} {...n} active={isActive(n.href)} />)}
          <div className="my-3 border-t border-[var(--border)]" />
          {secondaryNav.map((n) => <NavLink key={n.href} {...n} active={isActive(n.href)} small />)}
        </nav>
        <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3">
          <span className="text-xs text-[var(--muted)]">Theme</span>
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border)] px-4 py-3 md:px-8">
          <div className="flex items-center gap-2 text-sm font-bold md:hidden">
            <GraduationCap size={17} className="text-[var(--primary)]" /> AIGP Coach
          </div>
          <div className="ml-auto flex items-center gap-4">
            <HeaderStats />
            <div className="md:hidden"><ThemeToggle /></div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-10">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="glass fixed bottom-0 left-0 right-0 z-20 grid grid-cols-4 border-t border-[var(--border)] md:hidden">
          {primaryNav.map((n) => {
            const Icon = n.icon;
            return (
              <Link key={n.href} href={n.href} onClick={() => haptic("tap")} className={cn("press flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold", isActive(n.href) ? "text-[var(--primary)]" : "text-[var(--muted)]")}>
                <Icon size={20} />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function NavLink({ href, label, icon: Icon, active, small }: { href: string; label: string; icon: typeof BookOpen; active: boolean; small?: boolean }) {
  return (
    <Link href={href} className={cn("flex items-center gap-3 rounded-lg px-3 font-medium transition-colors", small ? "py-1.5 text-[13px]" : "py-2 text-sm", active ? "bg-[var(--primary)]/10 font-semibold text-[var(--primary)]" : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]")}>
      <Icon size={small ? 15 : 18} /> {label}
    </Link>
  );
}
