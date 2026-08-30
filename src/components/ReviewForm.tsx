"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  RATING_CATEGORIES,
  RATING_CATEGORY_LABELS,
  MIN_REVIEW_COMMENT_LENGTH,
  ratingCategoryHelp,
  type RatingCategory,
} from "@/lib/constants";
import { StarRatingInput } from "./StarRating";
import { Button, Textarea, ErrorText, Card, cx } from "./ui";

type Ratings = Partial<Record<RatingCategory, number>>;

export function ReviewForm({
  teacherId,
  teacherName,
  mode,
  reviewId,
  initial,
  onDone,
  categories = RATING_CATEGORIES,
  isFaculty = true,
}: {
  teacherId: string;
  teacherName: string;
  mode: "create" | "edit";
  reviewId?: string;
  initial?: { ratings: Ratings; comment: string };
  onDone?: () => void;
  // Which rating categories to collect — excludes "workload" for
  // non-faculty staff. See applicableRatingCategories() in constants.ts.
  categories?: readonly RatingCategory[];
  // Picks faculty- vs. staff-flavored category descriptions and copy —
  // see ratingCategoryHelp() in constants.ts.
  isFaculty?: boolean;
}) {
  const router = useRouter();
  const [ratings, setRatings] = useState<Ratings>(
    initial?.ratings ?? Object.fromEntries(categories.map((c) => [c, 0]))
  );
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const allRated = categories.every((c) => (ratings[c] ?? 0) > 0);
  const length = comment.trim().length;
  const commentTooShort = length < MIN_REVIEW_COMMENT_LENGTH;
  const progress = Math.min(100, (length / MIN_REVIEW_COMMENT_LENGTH) * 100);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!allRated) {
      setError(`Give a score for all ${categories.length} categories first.`);
      return;
    }
    if (commentTooShort) {
      setError(`Write at least ${MIN_REVIEW_COMMENT_LENGTH} characters so it actually helps.`);
      return;
    }
    setLoading(true);
    try {
      const url = mode === "create" ? "/api/reviews" : `/api/reviews/${reviewId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, ...ratings, comment: comment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      router.refresh();
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-navy-100 bg-navy-50/50 px-5 py-3.5">
        <h3 className="font-display text-base font-extrabold tracking-tight text-navy-900">
          {mode === "create" ? `Rate ${teacherName}` : "Edit your rating"}
        </h3>
      </div>

      <form onSubmit={submit} className="space-y-5 p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category}
              className={cx(
                "rounded-2xl border p-3.5 transition duration-200",
                (ratings[category] ?? 0) > 0
                  ? "border-surf-200 bg-surf-100/30"
                  : "border-navy-100 bg-navy-50/40"
              )}
            >
              <p className="text-sm font-extrabold tracking-tight text-navy-900">
                {RATING_CATEGORY_LABELS[category]}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-navy-400">
                {ratingCategoryHelp(category, isFaculty)}
              </p>
              <div className="mt-2 -ml-1">
                <StarRatingInput
                  label={RATING_CATEGORY_LABELS[category]}
                  value={ratings[category] ?? 0}
                  onChange={(v) => setRatings((r) => ({ ...r, [category]: v }))}
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <label
            htmlFor="review-comment"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy-500"
          >
            What was the class actually like?
          </label>
          <Textarea
            id="review-comment"
            rows={5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Be honest. Keep it about the class, not the person."
          />
          <div className="mt-2 flex items-center gap-2.5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-navy-100">
              <div
                className={cx(
                  "h-full rounded-full transition-all duration-300",
                  commentTooShort ? "bg-navy-300" : "bg-surf-400"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p
              className={cx(
                "shrink-0 text-xs font-bold tabular-nums",
                commentTooShort ? "text-navy-300" : "text-surf-600"
              )}
            >
              {commentTooShort ? `${MIN_REVIEW_COMMENT_LENGTH - length} to go` : "Good to go"}
            </p>
          </div>
        </div>

        <ErrorText>{error}</ErrorText>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : mode === "create" ? "Post rating" : "Save changes"}
          </Button>
          {onDone && (
            <Button type="button" variant="ghost" onClick={onDone}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
