import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { teacherSchema } from "@/lib/validation";
import { requireAdmin, handleApiError, ApiError } from "@/lib/apiAuth";
import { logAdminAction } from "@/lib/auditLog";

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = teacherSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input.");
    }

    const teacher = await prisma.teacher.create({
      data: {
        name: parsed.data.name,
        department: parsed.data.department,
        isFaculty: parsed.data.isFaculty ?? true,
        photoUrl: parsed.data.photoUrl || null,
      },
    });

    await logAdminAction({
      adminId: admin.id,
      action: "CREATE_TEACHER",
      targetType: "TEACHER",
      targetId: teacher.id,
      detail: teacher.name,
    });

    return NextResponse.json({ ok: true, teacher });
  } catch (err) {
    return handleApiError(err);
  }
}
