"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function focusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.closest("[inert]") && el.getAttribute("aria-hidden") !== "true");
}

// Modal sheets: focus moves in on open, Tab stays inside, Escape closes and
// returns focus to the control that opened it.
export function useModalFocus(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void, trigger?: RefObject<HTMLElement | null>) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const root = ref.current;
    if (!root) return;
    const opener = trigger?.current ?? (document.activeElement as HTMLElement | null);
    focusables(root)[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
        opener?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables(root);
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, ref, trigger]);
}

// Menus: focus the first item on open; arrows/Home/End move between items;
// Tab closes (focus moves on naturally); Escape closes and refocuses the trigger.
export function useMenuFocus(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void, trigger: RefObject<HTMLElement | null>) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const root = ref.current;
    if (!root) return;
    const items = () => [...root.querySelectorAll<HTMLElement>('[role^="menuitem"]')];
    items()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      const list = items();
      const i = list.indexOf(document.activeElement as HTMLElement);
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
        trigger.current?.focus();
      } else if (e.key === "Tab") {
        close.current();
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const step = e.key === "ArrowDown" ? 1 : -1;
        list[(i + step + list.length) % list.length]?.focus();
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        (e.key === "Home" ? list[0] : list[list.length - 1])?.focus();
      }
    };
    root.addEventListener("keydown", onKey);
    return () => root.removeEventListener("keydown", onKey);
  }, [open, ref, trigger]);
}
