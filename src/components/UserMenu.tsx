"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Avatar } from "./Avatar";
import { ChevronDownIcon, LogOutIcon, ShieldIcon, UserIcon } from "./icons";
import { cx } from "./ui";

export function UserMenu({
  name,
  email,
  image,
  isAdmin,
}: {
  name: string;
  email: string;
  image: string | null;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const itemClass =
"flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-navy-700 transition duration-150 hover:bg-navy-50 hover:text-navy-900";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cx(
          "flex items-center gap-2 rounded-full p-1 pr-2.5 text-sm font-bold text-white transition duration-200",
          open ? "bg-white/15" : "hover:bg-white/10"
        )}
      >
        <Avatar name={name} photoUrl={image} size="xs" ring={false} className="ring-1 ring-white/30" />
        <span className="max-w-28 truncate">{name}</span>
        <ChevronDownIcon
          className={cx("h-3.5 w-3.5 opacity-70 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-60 origin-top-right animate-drop-in overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-lift">
          <div className="border-b border-navy-100 bg-navy-50/60 px-3 py-3">
            <p className="truncate text-sm font-extrabold text-navy-900">{name}</p>
            <p className="truncate text-xs text-navy-400">{email}</p>
          </div>
          <Link href="/account" className={itemClass} onClick={() => setOpen(false)}>
            <UserIcon className="h-4 w-4 text-navy-400" />
            My profile
          </Link>
          {isAdmin && (
            <Link href="/admin" className={itemClass} onClick={() => setOpen(false)}>
              <ShieldIcon className="h-4 w-4 text-navy-400" />
              Admin dashboard
            </Link>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className={cx(itemClass, "w-full border-t border-navy-100 text-left hover:text-rose-600")}
          >
            <LogOutIcon className="h-4 w-4 text-navy-400" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
