"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({
  placeholder,
  defaultValue = "",
  size = "md",
}: {
  placeholder?: string;
  defaultValue?: string;
  size?: "md" | "lg";
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const large = size === "lg";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (value.trim()) params.set("q", value.trim());
        router.push(`/teachers${params.toString() ? `?${params}` : ""}`);
      }}
      className="flex gap-2"
    >
      <div className="relative flex-1">
        <svg
          viewBox="0 0 20 20"
          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 fill-none stroke-gray-400 ${
            large ? "h-5 w-5" : "h-4 w-4"
          }`}
        >
          <circle cx="9" cy="9" r="6" strokeWidth="1.5" />
          <path d="M17 17l-3.5-3.5" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? "Search teachers..."}
          aria-label="Search teachers"
          className={`w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy ${
            large ? "py-3 pl-10 pr-3 text-base" : "py-2 pl-9 pr-3 text-sm"
          }`}
        />
      </div>
      <button
        type="submit"
        className={`shrink-0 rounded-md bg-navy font-medium text-white hover:bg-navy-light ${
          large ? "px-6 py-3 text-base" : "px-4 py-2 text-sm"
        }`}
      >
        Search
      </button>
    </form>
  );
}
