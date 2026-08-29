import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { formatRelativeTime } from "@/lib/format";

export const metadata = { title: "Announcements" };

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { username: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-gray-600">
          Site-wide updates from admins. New ones also show up under the bell icon in the header.
        </p>
      </div>

      {announcements.length === 0 ? (
        <Card className="mx-auto mt-8 max-w-md p-8 text-center">
          <p className="font-medium text-gray-900">No announcements yet.</p>
          <p className="mt-1.5 text-sm text-gray-500">Check back later.</p>
        </Card>
      ) : (
        <div className="mt-8 space-y-3">
          {announcements.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-gray-900">{a.title}</p>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatRelativeTime(a.createdAt)}
                </span>
              </div>
              <p className="mt-1.5 whitespace-pre-line text-sm text-gray-700">{a.body}</p>
              {a.author?.username && (
                <p className="mt-2 text-xs text-gray-400">— @{a.author.username}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
