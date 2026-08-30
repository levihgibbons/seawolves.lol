import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AnnouncementsFeed } from "@/components/AnnouncementsFeed";
import { PageHero, PageContent } from "@/components/PageHero";

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
    <div>
      <PageHero title="Announcements" />

      <PageContent width="max-w-3xl">
        <AnnouncementsFeed announcements={data} isAdmin={isAdmin} />
      </PageContent>
    </div>
  );
}
