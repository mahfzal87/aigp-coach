"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, BookMarked, BookOpen, Brain, ChevronRight, FileText, Flame, GraduationCap, Layers, MoreHorizontal, Newspaper, Scale, X, Zap } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { getPackExtras } from "@/lib/content";
import { ExamSwitcher } from "@/components/exam-switcher";
import { UserMenu } from "@/components/user-menu";
import { useModalFocus } from "@/components/a11y";
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
  { href: "/learn", label: "Study sheets", icon: BookMarked },
  { href: "/strategy", label: "Strategy", icon: Layers },
  { href: "/reference", label: "Reference", icon: FileText },
  { href: "/updates", label: "Law Updates", icon: Newspaper },
];

// The liquid lens: one spring pill that glides to the active destination.
function useLensTransition() {
  const reduce = useReducedMotion();
  return reduce ? { duration: 0 } : ({ type: "spring", stiffness: 380, damping: 30, mass: 0.9 } as const);
}

// True when the pack has law updates newer than the user's last visit to the feed.
function useUpdatesDot(): boolean {
  const hydrated = useHydrated();
  const lastSeen = useProgress((s) => s.settings.lastSeenUpdateTs);
  if (!hydrated || lastSeen === undefined) return false;
  const newest = getPackExtras().updates.reduce((m, u) => {
    const t = Date.parse(u.publishedDate);
    return Number.isNaN(t) ? m : Math.max(m, t);
  }, 0);
  return newest > lastSeen;
}

function HeaderStats() {
  const hydrated = useHydrated();
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streakCount);
  const last = useProgress((s) => s.lastActiveDate);
  if (!hydrated) return <div className="h-6" />;
  const alive = streakAlive(last);
  return (
    <div className="flex items-center gap-3.5 text-sm font-semibold text-[var(--muted)]">
      <span className="flex items-center gap-1.5" title="Consecutive study days">
        <Flame size={16} className={alive ? "anim-flame text-[var(--streak)]" : "opacity-40"} fill={alive ? "var(--streak)" : "none"} />
        <span className="tabular-nums text-[var(--foreground)]">
          {streak}
          <span className="hidden font-medium text-[var(--muted)] sm:inline"> day{streak === 1 ? "" : "s"}</span>
        </span>
      </span>
      <span className="flex items-center gap-1.5" title="Study points earned">
        <Zap size={16} className="text-[var(--gold)]" fill="var(--gold)" />
        <span className="tabular-nums text-[var(--foreground)]">
          {xp.toLocaleString()}
          <span className="hidden font-medium text-[var(--muted)] sm:inline"> pts</span>
        </span>
      </span>
    </div>
  );
}

function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-[14px] text-[var(--primary-fg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_18px_-10px_var(--primary)]"
      style={{ width: size, height: size, background: "linear-gradient(145deg, var(--glow), var(--primary))" }}
    >
      <GraduationCap size={Math.round(size * 0.5)} />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const updatesDot = useUpdatesDot();

  return (
    <div className="flex min-h-dvh">
      {/* Desktop: a floating glass rail */}
      <aside className="sticky top-0 z-40 hidden h-dvh w-[268px] shrink-0 p-3 pr-0 md:block">
        <div className="glass-panel flex h-full flex-col rounded-[28px]">
          <div className="flex items-center gap-3 px-4 pb-3 pt-4">
            <BrandMark />
            <div className="min-w-0">
              <div className="font-display text-[17px] font-extrabold leading-none">AIGP Coach</div>
              <div className="mt-1"><ExamSwitcher /></div>
            </div>
          </div>
          <nav aria-label="Primary" className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-3">
            <div className="space-y-0.5">
              {primaryNav.map((n) => <NavLink key={n.href} {...n} active={isActive(n.href)} />)}
            </div>
            <div className="mx-3 my-3 h-px bg-[var(--glass-hairline)]" />
            <div className="space-y-0.5">
              {secondaryNav.map((n) => <NavLink key={n.href} {...n} active={isActive(n.href)} small dot={n.href === "/updates" && updatesDot} />)}
            </div>
          </nav>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Phone: one glass bar. Desktop: a floating status island, top-right. */}
        <header className="pointer-events-none sticky top-0 z-30 px-3 pt-3 md:px-6">
          <div className="pointer-events-auto glass-float flex h-[52px] items-center justify-between rounded-[20px] pl-3 pr-1.5 md:ml-auto md:w-fit md:rounded-full md:pl-4">
            <div className="flex min-w-0 items-center gap-2 md:hidden">
              <BrandMark size={30} />
              <span className="truncate font-display text-[15px] font-extrabold max-[419px]:sr-only">AIGP Coach</span>
              <ExamSwitcher compact />
            </div>
            <div className="ml-auto flex items-center gap-3 md:ml-0">
              <HeaderStats />
              <UserMenu />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-[calc(var(--bottom-nav-h)+28px)] pt-5 md:px-8 md:pb-12 md:pt-6">{children}</main>

        <MobileNav pathname={pathname} isActive={isActive} updatesDot={updatesDot} />
      </div>
    </div>
  );
}

// Phone navigation: a floating glass dock with its own lens, plus a "More"
// sheet holding every secondary page. Hidden in exam focus mode (a timed mock
// sets body[data-focus="exam"]).
function MobileNav({ pathname, isActive, updatesDot }: { pathname: string; isActive: (href: string) => boolean; updatesDot: boolean }) {
  // Open for the route it was opened on — navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const moreActive = secondaryNav.some((n) => isActive(n.href));
  const lens = useLensTransition();

  const sheetRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  useModalFocus(sheetRef, open, () => setOpenOn(null), moreRef);

  const tab = "press relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold";
  return (
    <>
      <nav aria-label="Primary" className="app-dock fixed inset-x-3 bottom-[max(10px,env(safe-area-inset-bottom))] z-30 md:hidden">
        <div className="glass-float grid h-[62px] grid-cols-6 rounded-[24px] px-1">
          {primaryNav.map((n) => {
            const Icon = n.icon;
            const active = isActive(n.href);
            return (
              <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} onClick={() => haptic("tap")} className={cn(tab, active ? "text-[var(--primary-ink)]" : "text-[var(--muted)]")}>
                {active && <motion.span layoutId="dock-lens" transition={lens} className="absolute inset-x-0.5 inset-y-1.5 rounded-[18px] bg-[var(--primary)]/12 ring-1 ring-[var(--primary)]/25" />}
                <Icon size={20} className="relative" />
                <span className="relative">{n.label}</span>
              </Link>
            );
          })}
          <button
            ref={moreRef}
            onClick={() => {
              haptic("tap");
              setOpenOn(open ? null : pathname);
            }}
            aria-expanded={open}
            aria-haspopup="dialog"
            className={cn(tab, "cursor-pointer", moreActive || open ? "text-[var(--primary-ink)]" : "text-[var(--muted)]")}
          >
            {moreActive && !open && <motion.span layoutId="dock-lens" transition={lens} className="absolute inset-x-0.5 inset-y-1.5 rounded-[18px] bg-[var(--primary)]/12 ring-1 ring-[var(--primary)]/25" />}
            <span className="relative">
              <MoreHorizontal size={20} />
              {updatesDot && <span aria-hidden className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-[var(--danger)] ring-2 ring-[var(--surface)]" />}
            </span>
            <span className="relative">More</span>
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="More pages">
          <div aria-hidden className="absolute inset-0 bg-black/45" onClick={() => setOpenOn(null)} />
          <div ref={sheetRef} className="sheet-up glass-float absolute bottom-0 left-0 right-0 rounded-t-[28px] px-3 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-2">
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-[var(--border)]" />
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="font-display text-lg font-extrabold">More</span>
              <button aria-label="Close" onClick={() => setOpenOn(null)} className="press grid h-10 w-10 cursor-pointer place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-2)]">
                <X size={18} />
              </button>
            </div>
            {secondaryNav.map((n) => {
              const Icon = n.icon;
              const active = isActive(n.href);
              const dot = n.href === "/updates" && updatesDot;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => haptic("tap")}
                  className={cn("flex h-12 items-center gap-3 rounded-2xl px-3 text-[15px] font-semibold", active ? "bg-[var(--primary)]/12 text-[var(--primary-ink)]" : "text-[var(--foreground)] active:bg-[var(--surface-2)]")}
                >
                  <Icon size={18} className={active ? "" : "text-[var(--muted)]"} />
                  <span className="flex-1">{n.label}</span>
                  {dot && <span className="rounded-full bg-[var(--danger)]/14 px-2 py-0.5 text-[11px] font-bold text-[var(--danger)]">New</span>}
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

function NavLink({ href, label, icon: Icon, active, small, dot }: { href: string; label: string; icon: typeof BookOpen; active: boolean; small?: boolean; dot?: boolean }) {
  const lens = useLensTransition();
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "press relative flex items-center gap-3 rounded-2xl px-3 font-medium",
        small ? "py-2 text-[13px]" : "py-2.5 text-[14.5px]",
        active ? "font-semibold text-[var(--primary-ink)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
      )}
    >
      {active && <motion.span layoutId="nav-lens" transition={lens} className="absolute inset-0 rounded-2xl bg-[var(--primary)]/12 ring-1 ring-[var(--primary)]/22" />}
      <Icon size={small ? 16 : 18} className="relative shrink-0" />
      <span className="relative min-w-0 flex-1 truncate">{label}</span>
      {dot && <span aria-label="New updates" className="relative h-2 w-2 shrink-0 rounded-full bg-[var(--danger)]" />}
    </Link>
  );
}
