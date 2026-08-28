import { prisma } from "@/lib/prisma";
import { AdminAnnouncementManager } from "@/components/admin/AdminAnnouncementManager";

export const metadata = { title: "Manage Announcements" };

export default async function AdminAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { username: true } } },
  });

  const data = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    createdAt: a.createdAt.toISOString(),
    authorUsername: a.author?.username ?? null,
  }));

  return <AdminAnnouncementManager announcements={data} />;
}
