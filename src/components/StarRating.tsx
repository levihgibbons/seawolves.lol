"use client";

import { useState } from "react";
import { cx } from "./ui";

const STAR_PATH =
  "M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.21l-4.94 2.6.94-5.5-4-3.9 5.53-.8z";

const SIZES = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-[1.05rem] w-[1.05rem]",
  lg: "h-6 w-6",
} as const;

function Star({
  fill,
  size,
  onDark,
}: {
  fill: number;
  size: keyof typeof SIZES;
  onDark?: boolean;
}) {
  return (
    <span className={cx("relative inline-block", SIZES[size])}>
      <svg
        viewBox="0 0 20 20"
        className={cx("absolute inset-0", onDark ? "fill-white/25" : "fill-navy-100", SIZES[size])}
      >
        <path d={STAR_PATH} />
      </svg>
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
        <svg viewBox="0 0 20 20" className={cx("fill-gold-400", SIZES[size])}>
          <path d={STAR_PATH} />
        </svg>
      </span>
    </span>
  );
}

export function StarRatingDisplay({
  value,
  size = "md",
  showValue = true,
  onDark = false,
  className,
}: {
  value: number | null;
  size?: keyof typeof SIZES;
  showValue?: boolean;
  /** Lightens the empty-star track so it stays visible on a navy panel. */
  onDark?: boolean;
  className?: string;
}) {
  const rating = value ?? 0;
  return (
    <span
      className={cx("inline-flex items-center gap-1.5", className)}
      role="img"
      aria-label={value === null ? "Not rated yet" : `${value.toFixed(1)} out of 5`}
    >
      <span className="flex items-center gap-px" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} fill={Math.max(0, Math.min(1, rating - i))} size={size} onDark={onDark} />
        ))}
      </span>
      {showValue && (
        <span
          className={cx(
            "whitespace-nowrap font-display font-extrabold tracking-tight",
            onDark ? "text-white" : value === null ? "text-navy-300" : "text-navy-800",
            size === "lg" ? "text-lg" : size === "md" ? "text-sm" : "text-xs"
          )}
        >
          {value === null ? "—" : value.toFixed(1)}
        </span>
      )}
    </span>
  );
}

/** A compact "4.6" chip — used on cards where the full star row is too busy. */
export function ScorePill({
  value,
  className,
}: {
  value: number | null;
  className?: string;
}) {
  if (value === null) {
    return (
      <span
        className={cx(
          "inline-flex items-center gap-1 rounded-full bg-navy-50 px-2 py-0.5 text-xs font-bold text-navy-400",
          className
        )}
      >
        New
      </span>
    );
  }
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 font-display text-xs font-extrabold text-gold-500 ring-1 ring-inset ring-gold-200",
        className
      )}
    >
      <svg viewBox="0 0 20 20" className="h-3 w-3 fill-gold-400">
        <path d={STAR_PATH} />
      </svg>
      {value.toFixed(1)}
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
    <div className="flex items-center" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => {
        const on = star <= display;
        return (
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
            className="rounded-lg p-2 transition-transform duration-150 ease-out-back hover:scale-110 active:scale-95"
          >
            <svg
              viewBox="0 0 20 20"
              className={cx(
                "h-7 w-7 transition-colors duration-150",
                on ? "fill-gold-400 drop-shadow-[0_2px_6px_rgba(247,182,45,0.45)]" : "fill-navy-100"
              )}
            >
              <path d={STAR_PATH} />
            </svg>
          </button>
        );
      })}
      <span
        className={cx(
          "ml-2 font-display text-sm font-extrabold transition-opacity duration-150",
          display > 0 ? "text-navy-800 opacity-100" : "opacity-0"
        )}
      >
        {display || ""}
      </span>
    </div>
  );
}
