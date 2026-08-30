"use client";

import { useState } from "react";
import { cx, META_ACTION } from "./ui";

export function HelpfulButton({
  endpoint,
  label = "Helpful",
  initialCount,
  initialVoted,
  isSignedIn,
}: {
  endpoint: string;
  label?: string;
  initialCount: number;
  initialVoted: boolean;
  isSignedIn: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [loading, setLoading] = useState(false);
  const [popping, setPopping] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={voted}
      disabled={!isSignedIn || loading}
      title={isSignedIn ? undefined : "Sign in to vote"}
      onClick={async () => {
        setLoading(true);
        const nextVoted = !voted;
        // Optimistic — the pop only fires when adding a vote, not removing one.
        setVoted(nextVoted);
        setCount((c) => c + (nextVoted ? 1 : -1));
        if (nextVoted) {
          setPopping(true);
          setTimeout(() => setPopping(false), 350);
        }
        try {
          const res = await fetch(endpoint, { method: "POST" });
          const data = await res.json();
          if (res.ok) {
            setCount(data.helpfulCount);
            setVoted(data.voted);
          } else {
            setVoted(voted);
            setCount((c) => c + (nextVoted ? -1 : 1));
          }
        } catch {
          setVoted(voted);
          setCount((c) => c + (nextVoted ? -1 : 1));
        } finally {
          setLoading(false);
        }
      }}
      className={cx(
        META_ACTION,
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
        voted
          ? "bg-surf-100 text-surf-600 ring-1 ring-inset ring-surf-300"
          : "bg-navy-50 text-navy-500 hover:bg-navy-100 hover:text-navy-700"
      )}
    >
      <svg
        viewBox="0 0 20 20"
        className={cx("h-3.5 w-3.5 fill-current", popping && "animate-pop")}
      >
        <path d="M10 2.6l6 6.6h-3.4v7.2H7.4V9.2H4z" />
      </svg>
      {label}
      <span className={cx("tabular-nums", count === 0 && "opacity-50")}>{count}</span>
    </button>
  );
}
