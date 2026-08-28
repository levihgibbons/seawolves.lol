import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { teacherSchema } from "@/lib/validation";
import { requireAdmin, handleApiError, ApiError } from "@/lib/apiAuth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
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
      },
    });

    return NextResponse.json({ ok: true, teacher: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

// Soft delete — keeps historical reviews intact but removes the teacher
// from public listings. Use PATCH { active: true } to restore.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) throw new ApiError(404, "Teacher not found.");

    await prisma.teacher.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
