import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { teacherSchema } from "@/lib/validation";
import { requireAdmin, handleApiError, ApiError } from "@/lib/apiAuth";
import { logAdminAction } from "@/lib/auditLog";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = teacherSchema.partial().safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input.");
    }

    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new ApiError(404, "Teacher not found.");

    const updated = await prisma.teacher.update({
      where: { id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.department !== undefined && { department: parsed.data.department }),
        ...(parsed.data.photoUrl !== undefined && { photoUrl: parsed.data.photoUrl || null }),
        ...(parsed.data.active !== undefined && { active: parsed.data.active }),
        ...(parsed.data.isFaculty !== undefined && { isFaculty: parsed.data.isFaculty }),
      },
    });

    // Active-toggle gets its own action type (mirrors the "Move to The
    // Fallen" / "Restore" UI) — everything else is a plain field edit.
    if (parsed.data.active !== undefined && parsed.data.active !== teacher.active) {
      await logAdminAction({
        adminId: admin.id,
        action: parsed.data.active ? "REACTIVATE_TEACHER" : "DEACTIVATE_TEACHER",
        targetType: "TEACHER",
        targetId: id,
        detail: updated.name,
      });
    } else {
      await logAdminAction({
        adminId: admin.id,
        action: "UPDATE_TEACHER",
        targetType: "TEACHER",
        targetId: id,
        detail: updated.name,
      });
    }

    return NextResponse.json({ ok: true, teacher: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

// Soft delete — keeps historical reviews intact but removes the teacher
// from public listings. Use PATCH { active: true } to restore.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new ApiError(404, "Teacher not found.");

    await prisma.teacher.update({ where: { id }, data: { active: false } });
    await logAdminAction({
      adminId: admin.id,
      action: "DEACTIVATE_TEACHER",
      targetType: "TEACHER",
      targetId: id,
      detail: teacher.name,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
