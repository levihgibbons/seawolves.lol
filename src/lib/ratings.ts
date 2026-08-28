import { RATING_CATEGORIES, type RatingCategory } from "./constants";

export type RatableReview = {
  clarity: number;
  fairness: number;
  workload: number | null; // null for reviews of non-faculty staff — see constants.ts
  approachability: number;
};

export type RatingBreakdown = {
  overall: number | null;
  count: number;
  byCategory: Record<RatingCategory, number | null>;
};

// A single review's overall score, averaged only over the categories it
// actually has (i.e. skips workload for a non-faculty staff review).
export function reviewOverall(review: RatableReview): number {
  const values = RATING_CATEGORIES.map((c) => review[c]).filter(
    (v): v is number => v !== null
  );
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function computeRatingBreakdown(reviews: RatableReview[]): RatingBreakdown {
  if (reviews.length === 0) {
    return {
      overall: null,
      count: 0,
      byCategory: {
        clarity: null,
        fairness: null,
        workload: null,
        approachability: null,
      },
    };
  }

  const byCategory = Object.fromEntries(
    RATING_CATEGORIES.map((category) => {
      const values = reviews
        .map((r) => r[category])
        .filter((v): v is number => v !== null);
      return [category, values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null];
    })
  ) as Record<RatingCategory, number | null>;

  const present = RATING_CATEGORIES.filter((c) => byCategory[c] !== null);
  const overall =
    present.length > 0
      ? present.reduce((total, c) => total + (byCategory[c] as number), 0) / present.length
      : null;

  return { overall, count: reviews.length, byCategory };
}

export function formatRating(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}
