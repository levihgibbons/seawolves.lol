"use client";

import { useState } from "react";
import { type RatingCategory } from "@/lib/constants";
import { ReviewForm } from "./ReviewForm";
import { CommentComposer } from "./CommentThread";
import { Card } from "./ui";

// One composer for the whole discussion, instead of a separate "review"
// section and "comments" section — pick a mode instead of picking a
// different part of the page. A star rating is the only thing that needs
// its own tab (it needs the category inputs); everything else is just a
// comment.
export function DiscussionComposer({
  teacherId,
  teacherName,
  categories,
  isFaculty,
  hasOwnReview,
}: {
  teacherId: string;
  teacherName: string;
  categories: readonly RatingCategory[];
  isFaculty: boolean;
  hasOwnReview: boolean;
}) {
  const [mode, setMode] = useState<"review" | "comment">(hasOwnReview ? "comment" : "review");
  // hasOwnReview can flip true mid-session (right after submitting a
  // rating, via router.refresh()) — fall back to "comment" instead of
  // leaving the now-disabled rating tab's form on screen.
  const effectiveMode = hasOwnReview ? "comment" : mode;

  const tabClass = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
      active ? "bg-navy text-white" : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div>
      <div className="mb-3 inline-flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
        <button
          type="button"
          disabled={hasOwnReview}
          title={hasOwnReview ? `You've already rated ${teacherName} — find it below to edit.` : undefined}
          onClick={() => setMode("review")}
          className={tabClass(effectiveMode === "review")}
        >
          Leave a rating
        </button>
        <button type="button" onClick={() => setMode("comment")} className={tabClass(effectiveMode === "comment")}>
          Write a comment
        </button>
      </div>

      {hasOwnReview && (
        <p className="mb-3 text-xs text-gray-500">
          You&apos;ve already rated {teacherName} — find your rating below to edit or delete it.
        </p>
      )}

      {effectiveMode === "review" ? (
        <ReviewForm
          mode="create"
          teacherId={teacherId}
          teacherName={teacherName}
          categories={categories}
          isFaculty={isFaculty}
        />
      ) : (
        <Card className="p-4">
          <CommentComposer teacherId={teacherId} />
        </Card>
      )}
    </div>
  );
}
