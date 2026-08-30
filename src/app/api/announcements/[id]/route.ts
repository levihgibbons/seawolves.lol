import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { announcementUpdateSchema } from "@/lib/validation";
import { requireAdmin, handleApiError, ApiError } from "@/lib/apiAuth";
import { logAdminAction } from "@/lib/auditLog";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Announcement not found.");

    const body = await request.json().catch(() => null);
    const parsed = announcementUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input.");
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
        ...(parsed.data.body !== undefined ? { body: parsed.data.body } : {}),
        ...(parsed.data.imageUrl !== undefined ? { imageUrl: parsed.data.imageUrl || null } : {}),
      },
    });

    await logAdminAction({
      adminId: admin.id,
      action: "UPDATE_ANNOUNCEMENT",
      targetType: "ANNOUNCEMENT",
      targetId: announcement.id,
      detail: announcement.title,
    });

    return NextResponse.json({ ok: true, announcement });
  } catch (err) {
    return handleApiError(err);
  }
}

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
