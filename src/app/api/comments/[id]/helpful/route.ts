import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError, ApiError } from "@/lib/apiAuth";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: commentId } = await params;
    const user = await requireUser();

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new ApiError(404, "Comment not found.");

    const existing = await prisma.commentVote.findUnique({
      where: { commentId_userId: { commentId, userId: user.id } },
    });

    if (existing) {
      await prisma.commentVote.delete({ where: { id: existing.id } });
    } else {
      await prisma.commentVote.create({ data: { commentId, userId: user.id } });
    }

    const helpfulCount = await prisma.commentVote.count({ where: { commentId } });
    return NextResponse.json({ ok: true, helpfulCount, voted: !existing });
  } catch (err) {
    return handleApiError(err);
  }
}
