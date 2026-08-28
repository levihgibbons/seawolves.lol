import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validation";
import { containsProfanity } from "@/lib/profanity";
import { checkPersonalLifeContent } from "@/lib/personalLifeFilter";
import { requireActivePostingUser, handleApiError, ApiError } from "@/lib/apiAuth";

export async function POST(request: Request) {
  try {
    const user = await requireActivePostingUser();
    const body = await request.json().catch(() => null);
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input.");
    }
    const { teacherId, clarity, fairness, workload, approachability, comment } = parsed.data;

    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher || !teacher.active) {
      throw new ApiError(404, "Teacher not found.");
    }

    if (teacher.isFaculty && workload === undefined) {
      throw new ApiError(400, "Please rate workload.");
    }

    if (containsProfanity(comment)) {
      throw new ApiError(
        400,
        "Your review contains language that isn't allowed. Please revise it and try again."
      );
    }

    const existing = await prisma.review.findUnique({
      where: { teacherId_userId: { teacherId, userId: user.id } },
    });
    if (existing) {
      throw new ApiError(
        409,
        "You've already reviewed this teacher. Edit your existing review instead."
      );
    }

    const personalLife = checkPersonalLifeContent(comment);

    const review = await prisma.review.create({
      data: {
        teacherId,
        userId: user.id,
        clarity,
        fairness,
        workload: teacher.isFaculty ? workload : null,
        approachability,
        comment,
        autoFlagged: personalLife.flagged,
        autoFlagReason: personalLife.reason,
      },
    });

    return NextResponse.json({ ok: true, review });
  } catch (err) {
    return handleApiError(err);
  }
}
