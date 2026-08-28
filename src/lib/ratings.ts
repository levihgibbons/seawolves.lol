import { RATING_CATEGORIES, type RatingCategory } from "./constants";

export type RatableReview = {
  clarity: number;
  fairness: number;
  workload: number;
  approachability: number;
};

export type RatingBreakdown = {
  overall: number | null;
  count: number;
  byCategory: Record<RatingCategory, number | null>;
};

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

  const sums: Record<RatingCategory, number> = {
    clarity: 0,
    fairness: 0,
    workload: 0,
    approachability: 0,
  };

  for (const review of reviews) {
    for (const category of RATING_CATEGORIES) {
      sums[category] += review[category];
    }
  }

  const byCategory = Object.fromEntries(
    RATING_CATEGORIES.map((category) => [category, sums[category] / reviews.length])
  ) as Record<RatingCategory, number>;

  const overall =
    RATING_CATEGORIES.reduce((total, category) => total + byCategory[category], 0) /
    RATING_CATEGORIES.length;

  return { overall, count: reviews.length, byCategory };
}

export function formatRating(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}
