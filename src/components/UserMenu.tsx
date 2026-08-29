"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export function UserMenu({
  name,
  email,
  isAdmin,
}: {
  name: string;
  email: string;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        {name}
        <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current opacity-70">
          <path d="M5.5 7.5l4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-52 rounded-md border border-gray-200 bg-white py-1 text-sm text-gray-700 shadow-lg">
          <div className="border-b border-gray-100 px-3 py-2 text-xs text-gray-500">{email}</div>
          <Link href="/account" className="block px-3 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
            My profile
          </Link>
          {isAdmin && (
            <Link href="/admin" className="block px-3 py-2 hover:bg-gray-50" onClick={() => setOpen(false)}>
              Admin dashboard
            </Link>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full px-3 py-2 text-left hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
