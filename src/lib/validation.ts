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

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const reviewSchema = z.object({
  teacherId: z.string().min(1),
  clarity: rating,
  fairness: rating,
  workload: rating,
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

export const teacherSchema = z.object({
  name: z.string().trim().min(1).max(150),
  department: z.string().trim().min(1).max(150),
  photoUrl: z.string().trim().url().optional().or(z.literal("")),
  active: z.boolean().optional(),
});
