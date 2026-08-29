import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CONTENT_STATUSES } from "@/lib/constants";
import { requireAdmin, handleApiError, ApiError } from "@/lib/apiAuth";
import { logAdminAction } from "@/lib/auditLog";

const statusSchema = z.object({ status: z.enum(CONTENT_STATUSES) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(400, "Invalid status.");

    const review = await prisma.review.findUnique({ where: { id }, include: { teacher: true } });
    if (!review) throw new ApiError(404, "Review not found.");

    const updated = await prisma.review.update({
      where: { id },
      data: { status: parsed.data.status },
      include: { teacher: true, user: true },
    });

    await logAdminAction({
      adminId: admin.id,
      action: parsed.data.status === "REMOVED" ? "REMOVE_REVIEW" : "RESTORE_REVIEW",
      targetType: "REVIEW",
      targetId: id,
      detail: updated.teacher.name,
    });

    return NextResponse.json({ ok: true, review: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
