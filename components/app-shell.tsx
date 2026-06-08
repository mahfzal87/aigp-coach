"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { BarChart3, Brain, FileText, GraduationCap, Layers, Map, Moon, Newspaper, Settings, Sun } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useHydrated, useProgress } from "@/store/progress";
import { StatChips } from "@/components/gamify";

const primaryNav = [
  { href: "/", label: "Path", icon: Map },
  { href: "/practice", label: "Practice", icon: Brain },
  { href: "/mock", label: "Test", icon: GraduationCap },
  { href: "/profile", label: "Stats", icon: BarChart3 },
];
const secondaryNav = [
  { href: "/strategy", label: "Strategy", icon: Layers },
  { href: "/reference", label: "Reference", icon: FileText },
  { href: "/updates", label: "Updates", icon: Newspaper },
  { href: "/settings", label: "Settings", icon: Settings },
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  if (!m) return <div className="h-9 w-9" />;
  const dark = resolvedTheme === "dark";
  return (
    <button aria-label="Toggle theme" onClick={() => setTheme(dark ? "light" : "dark")} className="press grid h-9 w-9 place-items-center rounded-xl hover:bg-[var(--surface-2)]">
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function HeaderChips() {
  const hydrated = useHydrated();
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streakCount);
  const last = useProgress((s) => s.lastActiveDate);
  if (!hydrated) return <div className="h-6" />;
  return <StatChips xp={xp} streak={streak} lastActiveDate={last} />;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const nav = [...primaryNav, ...secondaryNav];

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r-2 border-[var(--border)] bg-[var(--surface)] md:flex md:flex-col">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--primary)] text-[var(--primary-fg)]" style={{ boxShadow: "0 3px 0 0 var(--primary-shade)" }}>
            <GraduationCap size={18} />
          </div>
          <div className="font-display text-lg font-extrabold leading-none">AIGP Coach</div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {primaryNav.map((n) => <NavLink key={n.href} {...n} active={isActive(n.href)} />)}
          <div className="my-2 border-t-2 border-[var(--border)]" />
          {secondaryNav.map((n) => <NavLink key={n.href} {...n} active={isActive(n.href)} small />)}
        </nav>
        <div className="flex items-center justify-between border-t-2 border-[var(--border)] px-4 py-3">
          <span className="text-xs font-bold text-[var(--muted)]">Theme</span>
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header (all sizes) with game chips */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b-2 border-[var(--border)] bg-[var(--surface)]/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-2 font-display text-base font-extrabold md:hidden">
            <GraduationCap size={18} className="text-[var(--primary)]" /> AIGP
          </div>
          <div className="ml-auto flex items-center gap-4">
            <HeaderChips />
            <div className="md:hidden"><ThemeToggle /></div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-4 border-t-2 border-[var(--border)] bg-[var(--surface)] md:hidden">
          {primaryNav.map((n) => {
            const Icon = n.icon;
            return (
              <Link key={n.href} href={n.href} className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-extrabold", isActive(n.href) ? "text-[var(--primary)]" : "text-[var(--muted)]")}>
                <Icon size={22} />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* hidden prefetch of secondary routes for snappy nav */}
      <div className="hidden">{nav.map((n) => <Link key={n.href} href={n.href} prefetch>{n.label}</Link>)}</div>
    </div>
  );
}

function NavLink({ href, label, icon: Icon, active, small }: { href: string; label: string; icon: typeof Map; active: boolean; small?: boolean }) {
  return (
    <Link href={href} className={cn("flex items-center gap-3 rounded-2xl px-3 font-extrabold transition-colors", small ? "py-1.5 text-xs" : "py-2.5 text-sm", active ? "bg-[var(--primary)]/12 text-[var(--primary)]" : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]")}>
      <Icon size={small ? 16 : 20} /> {label}
    </Link>
  );
}
