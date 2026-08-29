"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/flags", label: "Flagged content" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/teachers", label: "Teachers" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/audit-log", label: "Audit log" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-3 flex flex-wrap gap-1 border-b border-gray-200">
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
            className={`rounded-t-md border-b-2 px-3 py-2 text-sm font-medium transition-colors duration-150 ${
              active
                ? "border-navy text-navy"
                : "border-transparent text-gray-600 hover:border-navy hover:text-navy"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
