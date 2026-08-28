"use client";

import { useState } from "react";

export function HelpfulButton({
  reviewId,
  initialCount,
  initialVoted,
  isSignedIn,
}: {
  reviewId: string;
  initialCount: number;
  initialVoted: boolean;
  isSignedIn: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={!isSignedIn || loading}
      title={isSignedIn ? undefined : "Sign in to vote"}
      onClick={async () => {
        setLoading(true);
        // optimistic update
        const nextVoted = !voted;
        setVoted(nextVoted);
        setCount((c) => c + (nextVoted ? 1 : -1));
        try {
          const res = await fetch(`/api/reviews/${reviewId}/helpful`, { method: "POST" });
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${
        voted ? "border-navy bg-steel-light text-navy" : "border-gray-300 text-gray-600 hover:border-navy"
      }`}
    >
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current">
        <path d="M10 3l5 6h-3v8H8V9H5z" />
      </svg>
      Helpful ({count})
    </button>
  );
}
