import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { flagSchema } from "@/lib/validation";
import { requireUser, handleApiError, ApiError } from "@/lib/apiAuth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: commentId } = await params;
    const user = await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = flagSchema.omit({ targetType: true, targetId: true }).safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "Please provide a reason for reporting this comment.");
    }

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new ApiError(404, "Comment not found.");

    await prisma.flag.create({
      data: {
        type: "COMMENT",
        commentId,
        reporterId: user.id,
        reason: parsed.data.reason,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
