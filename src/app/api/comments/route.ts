import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validation";
import { containsProfanity } from "@/lib/profanity";
import { checkPersonalLifeContent } from "@/lib/personalLifeFilter";
import { requireActivePostingUser, handleApiError, ApiError } from "@/lib/apiAuth";

export async function POST(request: Request) {
  try {
    const user = await requireActivePostingUser();
    const body = await request.json().catch(() => null);
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input.");
    }
    const { teacherId, parentId, body: text } = parsed.data;

    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher || !teacher.active) throw new ApiError(404, "Teacher not found.");

    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent || parent.teacherId !== teacherId) {
        throw new ApiError(400, "The comment you're replying to no longer exists.");
      }
    }

    if (containsProfanity(text)) {
      throw new ApiError(
        400,
        "Your comment contains language that isn't allowed. Please revise it and try again."
      );
    }

    const personalLife = checkPersonalLifeContent(text);

    const comment = await prisma.comment.create({
      data: {
        teacherId,
        userId: user.id,
        parentId: parentId ?? null,
        body: text,
        autoFlagged: personalLife.flagged,
      },
    });

    return NextResponse.json({ ok: true, comment });
  } catch (err) {
    return handleApiError(err);
  }
}
