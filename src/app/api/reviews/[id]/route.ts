import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validation";
import { containsProfanity } from "@/lib/profanity";
import { checkPersonalLifeContent } from "@/lib/personalLifeFilter";
import { requireActivePostingUser, requireUser, handleApiError, ApiError } from "@/lib/apiAuth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireActivePostingUser();
    const body = await request.json().catch(() => null);
    const parsed = reviewSchema.omit({ teacherId: true }).safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input.");
    }

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new ApiError(404, "Review not found.");
    if (review.userId !== user.id) throw new ApiError(403, "You can only edit your own review.");

    const { clarity, fairness, workload, approachability, comment } = parsed.data;
    if (containsProfanity(comment)) {
      throw new ApiError(
        400,
        "Your review contains language that isn't allowed. Please revise it and try again."
      );
    }
    const personalLife = checkPersonalLifeContent(comment);

    const updated = await prisma.review.update({
      where: { id },
      data: {
        clarity,
        fairness,
        workload,
        approachability,
        comment,
        autoFlagged: personalLife.flagged,
        autoFlagReason: personalLife.reason,
      },
    });

    return NextResponse.json({ ok: true, review: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireUser();

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new ApiError(404, "Review not found.");
    if (review.userId !== user.id && user.role !== "ADMIN") {
      throw new ApiError(403, "You can only delete your own review.");
    }

    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
