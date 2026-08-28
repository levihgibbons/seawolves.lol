"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-800 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
        >
          {children}
        </select>
        <svg
          viewBox="0 0 20 20"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-gray-400"
        >
          <path d="M5.5 7.5l4.5 4.5 4.5-4.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </label>
  );
}

export function LeaderboardFilters({
  sortOptions,
  currentSort,
  departments,
  currentDepartment,
}: {
  sortOptions: { key: string; label: string }[];
  currentSort: string;
  departments: string[];
  currentDepartment?: string;
}) {
  const router = useRouter();

  function navigate(sort: string, department?: string) {
    const params = new URLSearchParams();
    params.set("sort", sort);
    if (department) params.set("department", department);
    router.push(`/leaderboard?${params.toString()}`);
  }

  return (
    <div className="flex max-w-xs flex-col gap-3">
      <Select label="Sort by" value={currentSort} onChange={(v) => navigate(v, currentDepartment)}>
        {sortOptions.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </Select>

      <Select
        label="Department"
        value={currentDepartment ?? ""}
        onChange={(v) => navigate(currentSort, v || undefined)}
      >
        <option value="">All departments</option>
        {departments.map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </Select>
    </div>
  );
}
