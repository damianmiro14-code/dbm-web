"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, object, embed, [contenteditable], [tabindex]:not([tabindex="-1"])';

type FocusTrapOptions = {
  /** If true, focus the first focusable element in the container when opening. Defaults to false. */
  autoFocus?: boolean;
  /** If true, restore focus to the previously focused element on close. Defaults to true. */
  restoreFocus?: boolean;
};

/**
 * Locks the page scroll without layout jumps on iOS (uses position: fixed).
 */
export function useBodyScrollLock(open: boolean) {
  const scrollYRef = useRef(0);
  const prevStyleRef = useRef<{ position: string; top: string; width: string; overflow: string } | null>(null);

  useEffect(() => {
    if (!open) return;

    const body = document.body;
    scrollYRef.current = window.scrollY || 0;
    prevStyleRef.current = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      const prev = prevStyleRef.current;
      if (prev) {
        body.style.position = prev.position;
        body.style.top = prev.top;
        body.style.width = prev.width;
        body.style.overflow = prev.overflow;
      } else {
        body.style.position = "";
        body.style.top = "";
        body.style.width = "";
        body.style.overflow = "";
      }
      window.scrollTo(0, scrollYRef.current);
    };
  }, [open]);
}

/**
 * Traps Tab focus within the container while open.
 */
export function useFocusTrap(open: boolean, containerRef: RefObject<HTMLElement | null>, opts: FocusTrapOptions = {}) {
  const { autoFocus = false, restoreFocus = true } = opts;
  const prevFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const container = containerRef.current;
    if (!container) return;

    if (restoreFocus) {
      prevFocusedRef.current = (document.activeElement as HTMLElement | null) ?? null;
    }

    if (autoFocus) {
      // Give the browser a tick so the dialog is painted before focusing.
      requestAnimationFrame(() => {
        const first = container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        first?.focus?.();
      });
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (!active || active === last || !container.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (restoreFocus) {
        prevFocusedRef.current?.focus?.();
      }
    };
  }, [open, containerRef, autoFocus, restoreFocus]);
}
