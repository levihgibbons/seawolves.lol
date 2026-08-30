"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/components/ui";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/flags", label: "Flagged" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/teachers", label: "Teachers" },
  { href: "/admin/users", label: "Users" },
  { href: "/announcements", label: "Announcements" },
  { href: "/admin/audit-log", label: "Audit log" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 rounded-full bg-white p-1 shadow-soft ring-1 ring-inset ring-navy-100">
      {TABS.map((tab) => {
        // Overview lives at the exact /admin path — match it exactly so it
        // doesn't also light up for every other /admin/* tab.
        const active =
          tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "rounded-full px-3.5 py-1.5 text-sm font-bold transition duration-200",
              active
                ? "bg-navy-800 text-white shadow-soft"
                : "text-navy-500 hover:bg-navy-50 hover:text-navy-800"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
