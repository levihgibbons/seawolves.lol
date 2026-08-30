"use client";

import { useState } from "react";
import { type RatingCategory } from "@/lib/constants";
import { ReviewForm } from "./ReviewForm";
import { CommentComposer } from "./CommentThread";
import { Card, cx } from "./ui";
import { ChatIcon, StarOutlineIcon } from "./icons";

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
    cx(
      "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-initial",
      active ? "bg-white text-navy-900 shadow-soft" : "text-navy-500 hover:text-navy-800"
    );

  return (
    <div>
      <div className="mb-3 inline-flex w-full gap-1 rounded-full bg-navy-100/70 p-1 sm:w-auto">
        <button
          type="button"
          disabled={hasOwnReview}
          title={hasOwnReview ? `You already rated ${teacherName}` : undefined}
          onClick={() => setMode("review")}
          className={tabClass(effectiveMode === "review")}
        >
          <StarOutlineIcon className="h-4 w-4" />
          Rate
        </button>
        <button
          type="button"
          onClick={() => setMode("comment")}
          className={tabClass(effectiveMode === "comment")}
        >
          <ChatIcon className="h-4 w-4" />
          Comment
        </button>
      </div>

      {hasOwnReview && (
        <p className="mb-3 text-xs font-medium text-navy-500">Already rated. Edit yours below.</p>
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
        <Card className="p-4 sm:p-5">
          <CommentComposer teacherId={teacherId} />
        </Card>
      )}
    </div>
  );
}
