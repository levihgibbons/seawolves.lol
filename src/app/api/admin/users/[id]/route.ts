import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { USER_STATUSES } from "@/lib/constants";
import { requireAdmin, handleApiError, ApiError } from "@/lib/apiAuth";

const statusSchema = z.object({ status: z.enum(USER_STATUSES) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(400, "Invalid status.");

    if (id === admin.id) {
      throw new ApiError(400, "You can't change your own account status.");
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new ApiError(404, "User not found.");

    const updated = await prisma.user.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({ ok: true, status: updated.status });
  } catch (err) {
    return handleApiError(err);
  }
}
