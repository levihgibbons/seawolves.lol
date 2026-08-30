"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDialogFocus } from "@/lib/useDialogFocus";
import { Input, cx } from "./ui";
import { groupDepartments } from "@/lib/constants";
import { CheckIcon, CloseIcon, SlidersIcon } from "./icons";

export function TeacherFilterPanel({
  departments,
  currentDepartment,
  currentQuery,
}: {
  departments: string[];
  currentDepartment?: string;
  currentQuery?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useDialogFocus(panelRef, open);

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
      <button
        type="button"
        onClick={() => {
          setSearch(""); // every open starts from the full list
          setOpen(true);
        }}
        className={cx(
          "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition duration-200 active:scale-95",
          currentDepartment
            ? "bg-navy-800 text-white shadow-soft hover:bg-navy-700"
            : "bg-white text-navy-700 ring-1 ring-inset ring-navy-100 hover:-translate-y-0.5 hover:shadow-soft"
        )}
      >
        <SlidersIcon className="h-4 w-4" />
        Subjects
        {currentDepartment && (
          <span className="rounded-full bg-white/20 px-1.5 text-xs">1</span>
        )}
      </button>

      <div
        className={cx("fixed inset-0 z-60", !open && "pointer-events-none")}
        role="dialog"
        aria-modal="true"
        aria-label="Filter teachers by subject"
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close filters"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          className={cx(
            "absolute inset-0 bg-navy-950/50 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          ref={panelRef}
          tabIndex={-1}
          className={cx(
            "absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-smooth",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="surface-deep px-5 pb-5 pt-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-extrabold tracking-tight text-white">
                Filter by subject
              </h2>
              <button
                type="button"
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-full text-white/60 transition duration-200 hover:bg-white/10 hover:text-white"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subjects"
                aria-label="Search subjects"
                tabIndex={open ? 0 : -1}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            <Link
              href={hrefFor(undefined)}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className={cx(
                "mb-2 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-bold transition duration-150",
                !currentDepartment
                  ? "bg-navy-800 text-white"
                  : "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
              )}
            >
              {!currentDepartment && <CheckIcon className="h-4 w-4 shrink-0" />}
              All subjects
            </Link>

            {visibleGroups.length === 0 && (
              <p className="px-3.5 py-6 text-sm text-navy-400">No subjects match.</p>
            )}

            {visibleGroups.map(({ group, departments: depts }) => (
              <div key={group} className="mb-1">
                <p className="px-3.5 pb-1.5 pt-4 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-navy-300">
                  {group}
                </p>
                {depts.map((dept) => {
                  const active = currentDepartment === dept;
                  return (
                    <Link
                      key={dept}
                      href={hrefFor(dept)}
                      onClick={() => setOpen(false)}
                      tabIndex={open ? 0 : -1}
                      className={cx(
                        "flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm transition duration-150",
                        active
                          ? "bg-surf-100 font-bold text-surf-600"
                          : "font-medium text-navy-600 hover:bg-navy-50 hover:text-navy-900"
                      )}
                    >
                      {active && <CheckIcon className="h-4 w-4 shrink-0" />}
                      {dept}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {currentDepartment && (
            <div className="border-t border-navy-100 p-4">
              <Link
                href={hrefFor(undefined)}
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                className="block rounded-full bg-navy-50 px-4 py-2.5 text-center text-sm font-bold text-navy-700 transition duration-200 hover:bg-navy-100"
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
