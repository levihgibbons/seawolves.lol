import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { announcementSchema } from "@/lib/validation";
import { requireAdmin, handleApiError, ApiError } from "@/lib/apiAuth";
import { logAdminAction } from "@/lib/auditLog";

// Public — powers the notification bell in the header (see
// src/components/NotificationBell.tsx) and the /announcements archive page.
// No auth required to read.
export async function GET() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { author: { select: { username: true } } },
  });
  return NextResponse.json({ announcements });
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = announcementSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input.");
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: parsed.data.title,
        body: parsed.data.body,
        imageUrl: parsed.data.imageUrl || null,
        authorId: admin.id,
      },
    });

    await logAdminAction({
      adminId: admin.id,
      action: "POST_ANNOUNCEMENT",
      targetType: "ANNOUNCEMENT",
      targetId: announcement.id,
      detail: announcement.title,
    });

    return NextResponse.json({ ok: true, announcement });
  } catch (err) {
    return handleApiError(err);
  }
}
