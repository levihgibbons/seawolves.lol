"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/nav";
import { cx } from "./ui";

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 rounded-full bg-white/[0.07] p-1 ring-1 ring-inset ring-white/10 lg:flex">
      {NAV_LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "relative rounded-full px-3.5 py-1.5 text-sm font-semibold transition duration-200",
              active
                ? "bg-white text-navy-800 shadow-soft"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
