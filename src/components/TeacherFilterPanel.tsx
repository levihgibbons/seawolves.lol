"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button, Input } from "./ui";
import { groupDepartments } from "@/lib/constants";

export function TeacherFilterPanel({
  departments,
  currentDepartment,
  currentQuery,
}: {
  departments: string[];
  currentDepartment?: string;
  currentQuery?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Close on Escape, and lock body scroll while the panel is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const groups = useMemo(() => groupDepartments(departments), [departments]);
  const visibleGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        group: g.group,
        departments: g.departments.filter((d) => d.toLowerCase().includes(q)),
      }))
      .filter((g) => g.departments.length > 0);
  }, [groups, search]);

  function hrefFor(dept?: string) {
    const params = new URLSearchParams();
    if (currentQuery) params.set("q", currentQuery);
    if (dept) params.set("department", dept);
    return `/teachers${params.toString() ? `?${params}` : ""}`;
  }

  return (
    <>
      <Button
        type="button"
        variant={currentDepartment ? "primary" : "outline"}
        onClick={() => setOpen(true)}
        className="shrink-0"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current">
          <path
            d="M3 5h14M6 10h8M9 15h2"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        Filters
        {currentDepartment && (
          <span className="ml-0.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">1</span>
        )}
      </Button>

      <div
        className="fixed inset-0 z-40 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-label="Filter teachers"
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close filters"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-gray-900/40 transition-opacity duration-200 ${
            open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
        <div
          className={`absolute right-0 top-0 flex h-full w-full max-w-xs flex-col bg-white shadow-xl transition-transform duration-300 ease-out sm:max-w-sm ${
            open ? "pointer-events-auto translate-x-0" : "pointer-events-none translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h2 className="text-base font-semibold text-gray-900">Filter by department</h2>
            <button
              type="button"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-md p-1 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current">
                <path d="M5 5l10 10M15 5L5 15" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="border-b border-gray-100 px-3 pb-2 pt-3">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search departments…"
              aria-label="Search departments"
              tabIndex={open ? 0 : -1}
            />
          </div>

          <div className="px-2 pt-2">
            <Link
              href={hrefFor(undefined)}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                !currentDepartment ? "bg-steel-light text-navy" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              All departments
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2">
            {visibleGroups.length === 0 && (
              <p className="px-3 py-4 text-sm text-gray-400">No departments match.</p>
            )}
            {visibleGroups.map(({ group, departments: depts }) => (
              <div key={group} className="mb-1">
                <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {group} <span className="text-gray-300">({depts.length})</span>
                </p>
                {depts.map((dept) => {
                  const active = currentDepartment === dept;
                  return (
                    <Link
                      key={dept}
                      href={hrefFor(dept)}
                      onClick={() => setOpen(false)}
                      tabIndex={open ? 0 : -1}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors duration-150 ${
                        active
                          ? "bg-steel-light font-semibold text-navy"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {active && (
                        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0 fill-current">
                          <path d="M8 13.5l-3.5-3.5 1.4-1.4L8 10.7l6.1-6.1 1.4 1.4z" />
                        </svg>
                      )}
                      {dept}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {currentDepartment && (
            <div className="border-t border-gray-200 p-3">
              <Link
                href={hrefFor(undefined)}
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                className="block rounded-md border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50"
              >
                Clear filter
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
