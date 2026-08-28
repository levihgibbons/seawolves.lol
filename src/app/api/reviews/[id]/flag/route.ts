import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { flagSchema } from "@/lib/validation";
import { requireUser, handleApiError, ApiError } from "@/lib/apiAuth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: reviewId } = await params;
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = flagSchema
      .omit({ targetType: true, targetId: true })
      .safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "Please provide a reason for reporting this review.");
    }

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new ApiError(404, "Review not found.");

    await prisma.flag.create({
      data: {
        type: "REVIEW",
        reviewId,
        reporterId: user.id,
        reason: parsed.data.reason,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
