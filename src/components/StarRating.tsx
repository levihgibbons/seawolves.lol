"use client";

import { useState } from "react";

function Star({ fill }: { fill: number }) {
  // fill: 0 (empty) to 1 (full). Renders a clipped solid star over an
  // outline star so partial fills (e.g. 3.5) look right.
  return (
    <span className="relative inline-block h-4 w-4">
      <svg viewBox="0 0 20 20" className="absolute inset-0 h-4 w-4 fill-gray-200">
        <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z" />
      </svg>
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
        <svg viewBox="0 0 20 20" className="h-4 w-4 fill-navy">
          <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z" />
        </svg>
      </span>
    </span>
  );
}

export function StarRatingDisplay({
  value,
  size = "md",
  showValue = true,
}: {
  value: number | null;
  size?: "sm" | "md";
  showValue?: boolean;
}) {
  const rating = value ?? 0;
  return (
    <span className={`inline-flex items-center gap-1 ${size === "sm" ? "scale-90" : ""}`}>
      <span className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, rating - i));
          return <Star key={i} fill={fill} />;
        })}
      </span>
      {showValue && (
        <span className="ml-1 whitespace-nowrap text-sm font-medium text-gray-700">
          {value === null ? "No ratings" : value.toFixed(1)}
        </span>
      )}
    </span>
  );
}

export function StarRatingInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered(star)}
          onBlur={() => setHovered(null)}
          onClick={() => onChange(star)}
          className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
        >
          <svg
            viewBox="0 0 20 20"
            className={`h-6 w-6 ${star <= display ? "fill-navy" : "fill-gray-200"}`}
          >
            <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
