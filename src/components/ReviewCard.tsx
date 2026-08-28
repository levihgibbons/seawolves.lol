"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RATING_CATEGORIES, RATING_CATEGORY_LABELS, type RatingCategory } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";
import { StarRatingDisplay } from "./StarRating";
import { HelpfulButton } from "./HelpfulButton";
import { FlagButton } from "./FlagButton";
import { ReviewForm } from "./ReviewForm";
import { Badge } from "./ui";

export type ReviewCardData = {
  id: string;
  createdAt: string;
  clarity: number;
  fairness: number;
  workload: number;
  approachability: number;
  comment: string;
  helpfulCount: number;
  viewerHasVoted: boolean;
  isOwn: boolean;
};

export function ReviewCard({
  review,
  teacherId,
  teacherName,
  isSignedIn,
}: {
  review: ReviewCardData;
  teacherId: string;
  teacherName: string;
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const overall =
    (review.clarity + review.fairness + review.workload + review.approachability) / 4;

  if (editing) {
    return (
      <ReviewForm
        mode="edit"
        reviewId={review.id}
        teacherId={teacherId}
        teacherName={teacherName}
        initial={{
          ratings: {
            clarity: review.clarity,
            fairness: review.fairness,
            workload: review.workload,
            approachability: review.approachability,
          },
          comment: review.comment,
        }}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="border-b border-gray-200 py-5 last:border-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StarRatingDisplay value={overall} size="sm" />
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-500">{formatRelativeTime(new Date(review.createdAt))}</span>
          {review.isOwn && <Badge tone="navy">Your review</Badge>}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {RATING_CATEGORIES.map((category: RatingCategory) => (
          <span key={category}>
            {RATING_CATEGORY_LABELS[category]}: <strong className="text-gray-700">{review[category]}/5</strong>
          </span>
        ))}
      </div>

      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-800">{review.comment}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <HelpfulButton
          reviewId={review.id}
          initialCount={review.helpfulCount}
          initialVoted={review.viewerHasVoted}
          isSignedIn={isSignedIn}
        />
        {review.isOwn ? (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs font-medium text-gray-500 hover:text-navy"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!confirm("Delete this review? This can't be undone.")) return;
                const res = await fetch(`/api/reviews/${review.id}`, { method: "DELETE" });
                if (res.ok) router.refresh();
              }}
              className="text-xs font-medium text-gray-500 hover:text-red-600"
            >
              Delete
            </button>
          </>
        ) : (
          <FlagButton endpoint={`/api/reviews/${review.id}/flag`} isSignedIn={isSignedIn} />
        )}
      </div>
    </div>
  );
}
