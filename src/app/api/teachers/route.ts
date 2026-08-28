import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { teacherSchema } from "@/lib/validation";
import { requireAdmin, handleApiError, ApiError } from "@/lib/apiAuth";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = teacherSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input.");
    }

    const teacher = await prisma.teacher.create({
      data: {
        name: parsed.data.name,
        department: parsed.data.department,
        photoUrl: parsed.data.photoUrl || null,
      },
    });

    return NextResponse.json({ ok: true, teacher });
  } catch (err) {
    return handleApiError(err);
  }
}
