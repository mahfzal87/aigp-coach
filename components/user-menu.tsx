"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import type { Session } from "@supabase/supabase-js";
import { LayoutGrid, LogIn, LogOut, Monitor, Moon, Settings, Sun, User, UserRound } from "lucide-react";
import { authConfigured, firstNameOf, signOut } from "@/lib/account";
import { clearStoredExam } from "@/lib/exam-state";
import { getActiveMeta } from "@/lib/content";
import { useSession } from "@/components/account";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

type SessionLike = { user: { email?: string; created_at?: string; user_metadata?: Record<string, unknown> } } | null;

export function displayName(first: string, email?: string): string {
  if (first) return first;
  return email ? email.split("@")[0] : "";
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full bg-[var(--primary)] font-bold text-[var(--primary-fg)]"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {initial || <User size={Math.round(size * 0.5)} />}
    </span>
  );
}

const noopSubscribe = () => () => {};

// False during SSR and the hydration render, true afterwards — without a
// setState-in-effect round trip.
export function useIsClient(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

function openExamPicker() {
  clearStoredExam();
  window.location.assign("/");
}

export function useSignOut() {
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (busy) return;
    setBusy(true);
    haptic("tap");
    await signOut();
    setBusy(false);
  };
  return { busy, run };
}

const itemCls =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-2)] focus-visible:bg-[var(--surface-2)] focus-visible:outline-none";

const MODES = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
] as const;

// The top-right avatar menu: the single home for everything personal —
// profile, settings, exam switching, color mode and sign-out.
export function UserMenu() {
  const { session, ready } = useSession();
  return <UserMenuView session={session} ready={ready} />;
}

export function UserMenuView({ session, ready }: { session: SessionLike; ready: boolean }) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  // The menu is open for the route it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const mounted = useIsClient();
  const ref = useRef<HTMLDivElement>(null);
  const { busy, run: doSignOut } = useSignOut();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenOn(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!mounted || !ready) return <div className="h-9 w-9" />;

  const name = displayName(firstNameOf(session as Session | null), session?.user.email);
  const exam = getActiveMeta();
  const mode = theme ?? "system";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          haptic("tap");
          setOpenOn(open ? null : pathname);
        }}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className="press grid h-9 w-9 cursor-pointer place-items-center rounded-full ring-offset-2 ring-offset-[var(--background)] hover:ring-2 hover:ring-[var(--border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        {session ? (
          <Avatar name={name} size={34} />
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]">
            <User size={17} />
          </span>
        )}
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[var(--e3)]">
          <div className="flex items-center gap-2.5 px-2.5 pb-2.5 pt-2">
            {session ? (
              <Avatar name={name} size={36} />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--muted)]">
                <User size={17} />
              </span>
            )}
            <div className="min-w-0">
              <div className="truncate text-sm font-bold">{session ? name : "Not signed in"}</div>
              <div className="truncate text-xs text-[var(--muted)]">{session ? session.user.email : "Progress saved on this device"}</div>
            </div>
          </div>
          <div className="my-1 border-t border-[var(--border)]" />

          <Link role="menuitem" href="/account" className={itemCls}>
            <UserRound size={16} className="text-[var(--muted)]" /> Profile
          </Link>
          <Link role="menuitem" href="/settings" className={itemCls}>
            <Settings size={16} className="text-[var(--muted)]" /> Settings
          </Link>
          <button role="menuitem" className={itemCls} onClick={openExamPicker}>
            <LayoutGrid size={16} className="text-[var(--muted)]" />
            <span className="flex-1">All exams</span>
            <span className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--muted)]">{exam.name}</span>
          </button>

          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
            <span className="text-sm font-medium">Color mode</span>
            <div role="radiogroup" aria-label="Color mode" className="flex gap-0.5 rounded-lg bg-[var(--surface-2)] p-0.5">
              {MODES.map((m) => {
                const Icon = m.icon;
                const on = mode === m.id;
                return (
                  <button
                    key={m.id}
                    role="radio"
                    aria-checked={on}
                    aria-label={m.label}
                    title={m.label}
                    onClick={() => setTheme(m.id)}
                    className={cn(
                      "grid h-7 w-8 cursor-pointer place-items-center rounded-md",
                      on ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    )}
                  >
                    <Icon size={14} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="my-1 border-t border-[var(--border)]" />
          {session ? (
            <button
              role="menuitem"
              disabled={busy}
              className={cn(itemCls, "text-[var(--danger)] hover:bg-[var(--danger)]/10 disabled:opacity-60")}
              onClick={doSignOut}
            >
              <LogOut size={16} /> {busy ? "Signing out…" : "Sign out"}
            </button>
          ) : authConfigured ? (
            <Link role="menuitem" href="/account" className={itemCls}>
              <LogIn size={16} className="text-[var(--muted)]" /> Sign in to back up
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
