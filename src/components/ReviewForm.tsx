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
import { Button, Textarea, ErrorText, Card } from "./ui";

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
  const commentTooShort = comment.trim().length < MIN_REVIEW_COMMENT_LENGTH;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!allRated) {
      setError(`Please rate all ${categories.length} categories.`);
      return;
    }
    if (commentTooShort) {
      setError(`Please write at least ${MIN_REVIEW_COMMENT_LENGTH} characters.`);
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
    <Card className="p-5">
      <h3 className="font-semibold text-gray-900">
        {mode === "create" ? `Rate ${teacherName}` : "Edit your review"}
      </h3>
      <form onSubmit={submit} className="mt-4 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <div key={category}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-gray-800">
                  {RATING_CATEGORY_LABELS[category]}
                </span>
              </div>
              <p className="text-xs text-gray-500">{ratingCategoryHelp(category, isFaculty)}</p>
              <div className="mt-1.5">
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
          <label className="mb-1 block text-sm font-medium text-gray-800">Your review</label>
          <Textarea
            rows={5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              isFaculty
                ? "Focus on teaching quality: how they explain material, grading, workload, and how approachable they are. Keep it about the class, not the person."
                : "Focus on how they do their job: communication, fairness, and how approachable they are. Keep it about their role, not the person."
            }
          />
          <p className="mt-1 text-xs text-gray-400">
            {comment.trim().length}/{MIN_REVIEW_COMMENT_LENGTH} minimum characters
          </p>
        </div>

        <ErrorText>{error}</ErrorText>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : mode === "create" ? "Submit review" : "Save changes"}
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
