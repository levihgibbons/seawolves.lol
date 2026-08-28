// String-union "enums" used across the app. These map to plain String
// columns in prisma/schema.prisma (SQLite has no native enum type) — see
// the comment at the top of that file.

export const USER_ROLES = ["STUDENT", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["ACTIVE", "SUSPENDED", "BANNED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const CONTENT_STATUSES = ["VISIBLE", "REMOVED"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const FLAG_TYPES = ["REVIEW", "COMMENT"] as const;
export type FlagType = (typeof FLAG_TYPES)[number];

export const FLAG_STATUSES = ["PENDING", "RESOLVED", "DISMISSED"] as const;
export type FlagStatus = (typeof FLAG_STATUSES)[number];

export const RATING_CATEGORIES = [
  "clarity",
  "fairness",
  "workload",
  "approachability",
] as const;
export type RatingCategory = (typeof RATING_CATEGORIES)[number];

export const RATING_CATEGORY_LABELS: Record<RatingCategory, string> = {
  clarity: "Clarity",
  fairness: "Fairness",
  workload: "Workload",
  approachability: "Approachability",
};

export const RATING_CATEGORY_HELP: Record<RatingCategory, string> = {
  clarity: "Explains material in a way that's easy to follow",
  fairness: "Grades and treats students consistently and fairly",
  workload: "Homework and assessment load relative to the course",
  approachability: "Easy to ask questions of, in and out of class",
};

export const MIN_REVIEW_COMMENT_LENGTH = 40;
export const MAX_REVIEW_COMMENT_LENGTH = 2000;
export const MIN_COMMENT_LENGTH = 2;
export const MAX_COMMENT_LENGTH = 1000;

// Minimum number of reviews a teacher needs before they're eligible for the
// leaderboard, so a single review can't put someone at #1 or #27.
export const LEADERBOARD_MIN_REVIEWS = 3;
