import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { announcementSchema } from "@/lib/validation";
import { requireAdmin, handleApiError, ApiError } from "@/lib/apiAuth";

// Public — powers the bell icon in the header (see
// src/components/AnnouncementBell.tsx). No auth required to read.
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
      data: { title: parsed.data.title, body: parsed.data.body, authorId: admin.id },
    });

    return NextResponse.json({ ok: true, announcement });
  } catch (err) {
    return handleApiError(err);
  }
}
