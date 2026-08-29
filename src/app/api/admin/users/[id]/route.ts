import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { USER_STATUSES, USER_ROLES } from "@/lib/constants";
import { requireAdmin, handleApiError, ApiError } from "@/lib/apiAuth";
import { logAdminAction } from "@/lib/auditLog";

const patchSchema = z
  .object({
    status: z.enum(USER_STATUSES).optional(),
    role: z.enum(USER_ROLES).optional(),
  })
  .refine((v) => v.status !== undefined || v.role !== undefined, {
    message: "Provide a status or role to update.",
  });

const STATUS_ACTION = {
  ACTIVE: "REACTIVATE_USER",
  SUSPENDED: "SUSPEND_USER",
  BANNED: "BAN_USER",
} as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input.");
    }

    if (id === admin.id) {
      throw new ApiError(400, "You can't change your own account.");
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new ApiError(404, "User not found.");

    const { status, role } = parsed.data;

    // Someone else's session could otherwise demote the last remaining
    // admin — count admins other than the target before allowing an
    // ADMIN -> STUDENT change, not just when the demoting admin is the
    // target themselves (the id === admin.id guard above already covers
    // that narrower self-demotion case).
    if (role === "STUDENT" && user.role === "ADMIN") {
      const otherAdmins = await prisma.user.count({
        where: { role: "ADMIN", id: { not: id } },
      });
      if (otherAdmins === 0) {
        throw new ApiError(400, "There must be at least one other admin before removing this one.");
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(role !== undefined && { role }),
      },
    });

    if (status !== undefined && status !== user.status) {
      await logAdminAction({
        adminId: admin.id,
        action: STATUS_ACTION[status],
        targetType: "USER",
        targetId: id,
        detail: user.email,
      });
    }

    if (role !== undefined && role !== user.role) {
      await logAdminAction({
        adminId: admin.id,
        action: role === "ADMIN" ? "PROMOTE_ADMIN" : "DEMOTE_ADMIN",
        targetType: "USER",
        targetId: id,
        detail: user.email,
      });
    }

    return NextResponse.json({ ok: true, status: updated.status, role: updated.role });
  } catch (err) {
    return handleApiError(err);
  }
}
