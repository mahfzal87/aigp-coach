"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Brain, ChevronRight, FileText, Flame, GraduationCap, Layers, MoreHorizontal, Newspaper, Scale, X, Zap } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ExamSwitcher } from "@/components/exam-switcher";
import { UserMenu } from "@/components/user-menu";
import { useHydrated, useProgress } from "@/store/progress";
import { streakAlive } from "@/lib/gamify";
import { haptic } from "@/lib/haptics";

const primaryNav = [
  { href: "/", label: "Study Plan", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: Brain },
  { href: "/mock", label: "Mock Exam", icon: GraduationCap },
  { href: "/lawlab", label: "Law Lab", icon: Scale },
  { href: "/profile", label: "Progress", icon: BarChart3 },
];
const secondaryNav = [
  { href: "/strategy", label: "Strategy", icon: Layers },
  { href: "/reference", label: "Reference", icon: FileText },
  { href: "/updates", label: "Law Updates", icon: Newspaper },
];

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
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] md:flex md:flex-col">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--primary)] text-[var(--primary-fg)]">
            <GraduationCap size={18} />
          </div>
          <div>
            <div className="text-[15px] font-bold leading-none">AIGP Coach</div>
            <div className="mt-0.5"><ExamSwitcher /></div>
          </div>
        </div>
        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3">
          {primaryNav.map((n) => <NavLink key={n.href} {...n} active={isActive(n.href)} />)}
          <div className="my-3 border-t border-[var(--border)]" />
          {secondaryNav.map((n) => <NavLink key={n.href} {...n} active={isActive(n.href)} small />)}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border)] px-4 py-3 md:px-8">
          <div className="flex items-center gap-2 text-sm font-bold md:hidden">
            <GraduationCap size={17} className="text-[var(--primary)]" /> AIGP Coach
            <ExamSwitcher compact />
          </div>
          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <HeaderStats />
            <UserMenu />
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-10">{children}</main>

        <MobileNav pathname={pathname} isActive={isActive} />
      </div>
    </div>
  );
}

// Phone navigation: the five primary destinations plus a "More" sheet holding
// every secondary page, so nothing is unreachable without the sidebar.
function MobileNav({ pathname, isActive }: { pathname: string; isActive: (href: string) => boolean }) {
  // Open for the route it was opened on — navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const moreActive = secondaryNav.some((n) => isActive(n.href));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const tab = "press flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold";
  return (
    <>
      <nav aria-label="Primary" className="glass fixed bottom-0 left-0 right-0 z-30 grid grid-cols-6 border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)] md:hidden">
        {primaryNav.map((n) => {
          const Icon = n.icon;
          const active = isActive(n.href);
          return (
            <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} onClick={() => haptic("tap")} className={cn(tab, active ? "text-[var(--primary)]" : "text-[var(--muted)]")}>
              <Icon size={20} />
              {n.label}
            </Link>
          );
        })}
        <button
          onClick={() => {
            haptic("tap");
            setOpenOn(open ? null : pathname);
          }}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={cn(tab, "cursor-pointer", moreActive || open ? "text-[var(--primary)]" : "text-[var(--muted)]")}
        >
          <MoreHorizontal size={20} />
          More
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="More pages">
          <button aria-label="Close" className="absolute inset-0 cursor-default bg-black/50" onClick={() => setOpenOn(null)} />
          <div className="sheet-up absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-[var(--border)] bg-[var(--surface)] px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2">
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-[var(--border)]" />
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">More</span>
              <button aria-label="Close" onClick={() => setOpenOn(null)} className="press grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-2)]">
                <X size={18} />
              </button>
            </div>
            {secondaryNav.map((n) => {
              const Icon = n.icon;
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => haptic("tap")}
                  className={cn("flex h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold", active ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--foreground)] active:bg-[var(--surface-2)]")}
                >
                  <Icon size={18} className={active ? "" : "text-[var(--muted)]"} />
                  <span className="flex-1">{n.label}</span>
                  <ChevronRight size={16} className="text-[var(--muted)]" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function NavLink({ href, label, icon: Icon, active, small }: { href: string; label: string; icon: typeof BookOpen; active: boolean; small?: boolean }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-3 rounded-lg px-3 font-medium transition-colors", small ? "py-1.5 text-[13px]" : "py-2 text-sm", active ? "bg-[var(--primary)]/10 font-semibold text-[var(--primary)]" : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]")}>
      <Icon size={small ? 15 : 18} /> {label}
    </Link>
  );
}
