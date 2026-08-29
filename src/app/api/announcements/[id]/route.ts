import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleApiError, ApiError } from "@/lib/apiAuth";
import { logAdminAction } from "@/lib/auditLog";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) throw new ApiError(404, "Announcement not found.");

    await prisma.announcement.delete({ where: { id } });
    await logAdminAction({
      adminId: admin.id,
      action: "DELETE_ANNOUNCEMENT",
      targetType: "ANNOUNCEMENT",
      targetId: id,
      detail: announcement.title,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
