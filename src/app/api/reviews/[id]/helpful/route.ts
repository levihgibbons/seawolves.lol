import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError, ApiError } from "@/lib/apiAuth";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: reviewId } = await params;
    const user = await requireUser();

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new ApiError(404, "Review not found.");

    const existing = await prisma.helpfulVote.findUnique({
      where: { reviewId_userId: { reviewId, userId: user.id } },
    });

    if (existing) {
      await prisma.helpfulVote.delete({ where: { id: existing.id } });
    } else {
      await prisma.helpfulVote.create({ data: { reviewId, userId: user.id } });
    }

    const helpfulCount = await prisma.helpfulVote.count({ where: { reviewId } });
    return NextResponse.json({ ok: true, helpfulCount, voted: !existing });
  } catch (err) {
    return handleApiError(err);
  }
}
