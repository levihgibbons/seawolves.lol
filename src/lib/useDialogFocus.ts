"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Focus handling for the two permanently-mounted `aria-modal` sheets (the mobile
 * menu and the roster's subject filter). They declared themselves modal but never
 * moved, trapped, or restored focus, which stranded keyboard users behind an open
 * panel — on desktop too, since the filter panel isn't mobile-only.
 *
 * Returns nothing; wire it up by passing the panel ref and the open flag.
 */
export function useDialogFocus(panelRef: RefObject<HTMLElement | null>, open: boolean) {
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;

    restoreTo.current = document.activeElement as HTMLElement | null;

    // Move focus into the panel so the next Tab starts inside it.
    const first = panel.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel).focus({ preventScroll: true });

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Send focus back to whatever opened the panel.
      restoreTo.current?.focus?.({ preventScroll: true });
    };
  }, [open, panelRef]);
}
