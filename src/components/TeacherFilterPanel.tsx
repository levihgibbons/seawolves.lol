"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui";

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

      {open && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Filter teachers">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-gray-900/40"
          />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-xs flex-col bg-white shadow-xl sm:max-w-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h2 className="text-base font-semibold text-gray-900">Filter by department</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current">
                  <path d="M5 5l10 10M15 5L5 15" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2">
              <Link
                href={hrefFor(undefined)}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  !currentDepartment ? "bg-steel-light text-navy" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                All departments
              </Link>
              {departments.map((dept) => (
                <Link
                  key={dept}
                  href={hrefFor(dept)}
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm font-medium ${
                    currentDepartment === dept
                      ? "bg-steel-light text-navy"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {dept}
                </Link>
              ))}
            </div>

            {currentDepartment && (
              <div className="border-t border-gray-200 p-3">
                <Link
                  href={hrefFor(undefined)}
                  onClick={() => setOpen(false)}
                  className="block rounded-md border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Clear filter
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
