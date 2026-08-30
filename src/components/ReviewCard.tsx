"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RATING_CATEGORIES, RATING_CATEGORY_LABELS, type RatingCategory } from "@/lib/constants";
import { reviewOverall } from "@/lib/ratings";
import { formatRelativeTime } from "@/lib/format";
import { Avatar } from "./Avatar";
import { ScorePill } from "./StarRating";
import { HelpfulButton } from "./HelpfulButton";
import { FlagButton } from "./FlagButton";
import { ReviewForm } from "./ReviewForm";
import { Badge, cx, META_ACTION } from "./ui";
import { PencilIcon, TrashIcon } from "./icons";

export type ReviewCardData = {
  id: string;
  createdAt: string;
  clarity: number;
  fairness: number;
  workload: number | null; // null when this review's teacher isn't faculty
  approachability: number;
  comment: string;
  helpfulCount: number;
  viewerHasVoted: boolean;
  isOwn: boolean;
  username: string | null;
};

/** How a single category score reads at a glance: 4+ is good, 2 or under isn't. */
function scoreTone(value: number) {
  if (value >= 4) return "bg-emerald-50 text-emerald-700";
  if (value >= 3) return "bg-navy-50 text-navy-600";
  return "bg-rose-50 text-rose-600";
}

export function ReviewCard({
  review,
  teacherId,
  teacherName,
  isSignedIn,
  categories = RATING_CATEGORIES,
}: {
  review: ReviewCardData;
  teacherId: string;
  teacherName: string;
  isSignedIn: boolean;
  categories?: readonly RatingCategory[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const overall = reviewOverall(review);
  const isFaculty = categories.includes("workload");
  const name = review.username ?? "Seawolf";

  if (editing) {
    return (
      <ReviewForm
        mode="edit"
        reviewId={review.id}
        teacherId={teacherId}
        teacherName={teacherName}
        categories={categories}
        isFaculty={isFaculty}
        initial={{
          ratings: {
            clarity: review.clarity,
            fairness: review.fairness,
            ...(review.workload !== null && { workload: review.workload }),
            approachability: review.approachability,
          },
          comment: review.comment,
        }}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <article
      className={cx(
        "rounded-card border bg-white p-4 shadow-soft transition duration-300 hover:shadow-lift sm:p-5",
        review.isOwn ? "border-surf-200 ring-1 ring-surf-100" : "border-navy-100/80"
      )}
    >
      <header className="flex items-start gap-3">
        <Avatar name={name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {review.username ? (
              <Link
                href={`/${review.username}`}
                className="text-sm font-extrabold text-navy-900 transition-colors duration-150 hover:text-surf-600"
              >
                {review.username}
              </Link>
            ) : (
              <span className="text-sm font-extrabold text-navy-900">{name}</span>
            )}
            {review.isOwn && <Badge tone="surf">You</Badge>}
          </div>
          <p className="mt-0.5 text-xs text-navy-300">
            {formatRelativeTime(new Date(review.createdAt))}
          </p>
        </div>
        <ScorePill value={overall} className="shrink-0" />
      </header>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {categories.map((category: RatingCategory) => {
          const value = review[category];
          if (value === null) return null;
          return (
            <span
              key={category}
              className={cx(
                "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[0.7rem] font-bold",
                scoreTone(value)
              )}
            >
              {RATING_CATEGORY_LABELS[category]}
              <span className="tabular-nums opacity-70">{value}</span>
            </span>
          );
        })}
      </div>

      <p className="mt-3 whitespace-pre-line text-[0.9rem] leading-relaxed text-navy-700">
        {review.comment}
      </p>

      <footer className="mt-4 flex flex-wrap items-center gap-2">
        <HelpfulButton
          endpoint={`/api/reviews/${review.id}/helpful`}
          label="Helpful"
          initialCount={review.helpfulCount}
          initialVoted={review.viewerHasVoted}
          isSignedIn={isSignedIn}
        />
        {review.isOwn ? (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={cx(META_ACTION, "text-navy-400 hover:bg-navy-50 hover:text-navy-700")}
            >
              <PencilIcon className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!confirm("Delete this review? This can't be undone.")) return;
                const res = await fetch(`/api/reviews/${review.id}`, { method: "DELETE" });
                if (res.ok) router.refresh();
              }}
              className={cx(META_ACTION, "text-navy-300 hover:bg-rose-50 hover:text-rose-600")}
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Delete
            </button>
          </>
        ) : (
          <FlagButton endpoint={`/api/reviews/${review.id}/flag`} isSignedIn={isSignedIn} />
        )}
      </footer>
    </article>
  );
}
