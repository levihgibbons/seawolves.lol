import { z } from "zod";
import {
  MAX_COMMENT_LENGTH,
  MAX_REVIEW_COMMENT_LENGTH,
  MIN_COMMENT_LENGTH,
  MIN_REVIEW_COMMENT_LENGTH,
} from "./constants";

const rating = z.number().int().min(1).max(5);

export const startSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const verifyCodeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

// Top-level route segments — a username matching one of these would be
// unreachable at seawolves.lol/<username> (the real page always wins), so
// block them at claim time. Keep in sync with src/app/*/ (and src/app/api).
const RESERVED_USERNAMES = new Set([
  "account",
  "admin",
  "announcements",
  "api",
  "choose-username",
  "forgot-password",
  "leaderboard",
  "login",
  "reset-password",
  "signup",
  "teachers",
  "the-fallen",
]);

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters.")
  .max(20, "Username must be at most 20 characters.")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores.")
  .refine((v) => !RESERVED_USERNAMES.has(v.toLowerCase()), "That username is reserved.");

export const setUsernameSchema = z.object({
  username: usernameSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
  // Only sent (and only ever applied once) by the "code verified, now
  // create your account" step of the login flow — see
  // src/app/login/page.tsx and src/lib/username.ts.
  username: usernameSchema.optional(),
});

export const reviewSchema = z.object({
  teacherId: z.string().min(1),
  clarity: rating,
  fairness: rating,
  // Omitted entirely for reviews of non-faculty staff — see
  // Teacher.isFaculty and applicableRatingCategories() in constants.ts. The
  // API routes enforce presence/absence based on the target teacher.
  workload: rating.optional(),
  approachability: rating,
  comment: z
    .string()
    .trim()
    .min(
      MIN_REVIEW_COMMENT_LENGTH,
      `Review must be at least ${MIN_REVIEW_COMMENT_LENGTH} characters — tell us more about your experience.`
    )
    .max(MAX_REVIEW_COMMENT_LENGTH),
});

export const commentSchema = z.object({
  teacherId: z.string().min(1),
  parentId: z.string().min(1).nullable().optional(),
  body: z
    .string()
    .trim()
    .min(MIN_COMMENT_LENGTH)
    .max(MAX_COMMENT_LENGTH),
});

export const flagSchema = z.object({
  targetType: z.enum(["REVIEW", "COMMENT"]),
  targetId: z.string().min(1),
  reason: z.string().trim().min(3).max(500),
});

// Profile pictures are uploaded as a file (see src/lib/image.ts) and stored
// as a base64 JPEG data URL — not an arbitrary URL. 1.5MB comfortably fits
// a 320px avatar re-encoded at quality 0.85, with headroom.
const MAX_AVATAR_DATA_URL_LENGTH = 1_500_000;
const AVATAR_DATA_URL_PATTERN = /^data:image\/(png|jpe?g|webp|gif);base64,/;

export const profileSchema = z.object({
  bio: z.string().trim().max(280, "Bio must be at most 280 characters.").optional(),
  image: z
    .string()
    .trim()
    .max(MAX_AVATAR_DATA_URL_LENGTH, "That image is too large.")
    .refine((v) => v === "" || AVATAR_DATA_URL_PATTERN.test(v), "Invalid image.")
    .optional(),
  username: usernameSchema.optional(),
});

export const announcementSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120),
  body: z.string().trim().min(1, "Announcement can't be empty.").max(2000),
});

export const teacherSchema = z.object({
  name: z.string().trim().min(1).max(150),
  department: z.string().trim().min(1).max(150),
  photoUrl: z.string().trim().url().optional().or(z.literal("")),
  active: z.boolean().optional(),
  isFaculty: z.boolean().optional(),
});
