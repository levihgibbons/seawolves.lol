"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useDialogFocus } from "@/lib/useDialogFocus";
import { NAV_LINKS } from "@/lib/nav";
import { CloseIcon, MenuIcon, LogOutIcon, ShieldIcon, UserIcon } from "./icons";
import { cx } from "./ui";

export function MobileMenu({
  signedIn,
  username,
  isAdmin,
}: {
  signedIn: boolean;
  username: string | null;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  // Storing the route the sheet was opened on (rather than a bare boolean)
  // means navigating anywhere closes it during render — no effect needed.
  const panelRef = useRef<HTMLDivElement>(null);
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const setOpen = (next: boolean) => setOpenedOn(next ? pathname : null);

  useDialogFocus(panelRef, open);

  // Lock body scroll while the sheet is up.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenedOn(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const itemClass = (active: boolean) =>
    cx(
      "flex items-center justify-between rounded-2xl px-4 py-3 text-base font-bold transition duration-200",
      active ? "bg-white text-navy-800" : "text-white/80 hover:bg-white/10 hover:text-white"
    );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-full text-white transition duration-200 hover:bg-white/10 active:scale-90 lg:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <div
        className={cx("fixed inset-0 z-60 lg:hidden", !open && "pointer-events-none")}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          className={cx(
            "absolute inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          ref={panelRef}
          tabIndex={-1}
          className={cx(
            "surface-deep absolute right-0 top-0 flex h-full w-[86%] max-w-xs flex-col shadow-2xl transition-transform duration-300 ease-smooth",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between px-5 pb-2 pt-5">
            <p className="font-display text-lg font-extrabold tracking-tight text-white">
              seawolves<span className="text-surf-300">.lol</span>
            </p>
            <button
              type="button"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  tabIndex={open ? 0 : -1}
                  className={itemClass(active)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="space-y-1 border-t border-white/10 p-3">
            {signedIn ? (
              <>
                <Link href="/account" tabIndex={open ? 0 : -1} className={itemClass(false)}>
                  <span className="flex items-center gap-2.5">
                    <UserIcon className="h-4 w-4" />
                    {username ?? "My profile"}
                  </span>
                </Link>
                {isAdmin && (
                  <Link href="/admin" tabIndex={open ? 0 : -1} className={itemClass(false)}>
                    <span className="flex items-center gap-2.5">
                      <ShieldIcon className="h-4 w-4" />
                      Admin
                    </span>
                  </Link>
                )}
                <button
                  type="button"
                  tabIndex={open ? 0 : -1}
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className={cx(itemClass(false), "w-full text-left")}
                >
                  <span className="flex items-center gap-2.5">
                    <LogOutIcon className="h-4 w-4" />
                    Sign out
                  </span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                tabIndex={open ? 0 : -1}
                className="flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-base font-extrabold text-navy-800 transition hover:bg-surf-100"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
