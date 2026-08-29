import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleApiError, ApiError } from "@/lib/apiAuth";
import { logAdminAction } from "@/lib/auditLog";

const moderateSchema = z.object({
  source: z.enum(["report", "auto"]),
  flagId: z.string().min(1).optional(),
  targetType: z.enum(["REVIEW", "COMMENT"]),
  targetId: z.string().min(1),
  action: z.enum(["REMOVE", "DISMISS"]),
});

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = moderateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid moderation request.");
    }
    const { source, flagId, targetType, targetId, action } = parsed.data;

    if (action === "REMOVE") {
      if (targetType === "REVIEW") {
        await prisma.review.update({ where: { id: targetId }, data: { status: "REMOVED" } });
      } else {
        await prisma.comment.update({ where: { id: targetId }, data: { status: "REMOVED" } });
      }
      await logAdminAction({
        adminId: admin.id,
        action: targetType === "REVIEW" ? "REMOVE_REVIEW" : "REMOVE_COMMENT",
        targetType,
        targetId,
        detail: source === "report" ? "From a user report" : "Auto-flagged content",
      });
    } else {
      await logAdminAction({
        adminId: admin.id,
        action: "DISMISS_REPORT",
        targetType,
        targetId,
        detail: source === "report" ? "Report dismissed" : "Auto-flag cleared",
      });
    }

    if (source === "report") {
      if (!flagId) throw new ApiError(400, "Missing flag id.");
      await prisma.flag.update({
        where: { id: flagId },
        data: {
          status: action === "REMOVE" ? "RESOLVED" : "DISMISSED",
          resolvedAt: new Date(),
        },
      });
    } else {
      // Auto-flagged content has no Flag row — clear the flag itself so it
      // drops out of the queue. If we also removed the content above, the
      // status change alone would already hide it, but clearing keeps the
      // two signals consistent if it's ever restored.
      if (targetType === "REVIEW") {
        await prisma.review.update({ where: { id: targetId }, data: { autoFlagged: false } });
      } else {
        await prisma.comment.update({ where: { id: targetId }, data: { autoFlagged: false } });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
