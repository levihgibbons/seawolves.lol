"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchIcon } from "./icons";
import { cx } from "./ui";

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
      className="group relative w-full"
    >
      <SearchIcon
        className={cx(
          "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-300 transition-colors duration-200 group-focus-within:text-surf-500",
          large ? "h-5 w-5" : "h-[1.05rem] w-[1.05rem]"
        )}
      />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? "Search teachers"}
        aria-label="Search teachers"
        className={cx(
          "w-full rounded-full border border-navy-100 bg-white font-medium text-navy-900 shadow-soft transition duration-200 placeholder:font-normal placeholder:text-navy-300 hover:border-navy-200 focus:border-surf-400 focus:ring-4 focus:ring-surf-400/15",
          large ? "py-3.5 pl-12 pr-28 text-base" : "py-2.5 pl-11 pr-24 text-sm"
        )}
      />
      <button
        type="submit"
        className={cx(
          "absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-navy-800 font-bold text-white transition duration-200 hover:bg-navy-700 active:scale-95",
          large ? "px-5 py-2.5 text-sm" : "px-4 py-1.5 text-xs"
        )}
      >
        Search
      </button>
    </form>
  );
}
