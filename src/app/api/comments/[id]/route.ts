import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError, ApiError } from "@/lib/apiAuth";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireUser();

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new ApiError(404, "Comment not found.");
    if (comment.userId !== user.id && user.role !== "ADMIN") {
      throw new ApiError(403, "You can only delete your own comment.");
    }

    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
