import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AnnouncementsFeed } from "@/components/AnnouncementsFeed";

export const metadata = { title: "Announcements" };

export default async function AnnouncementsPage() {
  const [session, announcements] = await Promise.all([
    auth(),
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const isAdmin = session?.user?.role === "ADMIN";
  // Announcements are posted anonymously on purpose — no author byline, even
  // though authorId is still tracked internally for the admin audit log.
  const data = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    imageUrl: a.imageUrl,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-gray-600">
          Site-wide updates from admins. New ones also show up under the bell icon in the header.
        </p>
      </div>

      <AnnouncementsFeed announcements={data} isAdmin={isAdmin} />
    </div>
  );
}
