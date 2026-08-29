import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { reviewOverall } from "@/lib/ratings";
import { formatRelativeTime } from "@/lib/format";
import { Avatar } from "@/components/Avatar";
import { StarRatingDisplay } from "@/components/StarRating";
import { Card, Badge } from "@/components/ui";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: { id: true, username: true, bio: true, image: true, role: true, createdAt: true },
  });
  if (!user || !user.username) notFound();

  const reviews = await prisma.review.findMany({
    where: { userId: user.id, status: "VISIBLE" },
    include: { teacher: true },
    orderBy: { createdAt: "desc" },
  });

  const commentCount = await prisma.comment.count({
    where: { userId: user.id, status: "VISIBLE" },
  });

  const joined = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    user.createdAt
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <Avatar name={user.username} photoUrl={user.image} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">@{user.username}</h1>
              {user.role === "ADMIN" && <Badge tone="navy">Admin</Badge>}
            </div>
            <p className="mt-0.5 text-xs text-gray-400">Seawolf since {joined}</p>
            {user.bio ? (
              <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{user.bio}</p>
            ) : (
              <p className="mt-2 text-sm text-gray-400">No bio yet.</p>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-4 border-t border-gray-100 pt-3 text-sm text-gray-500">
          <span>
            <strong className="text-gray-900">{reviews.length}</strong> review
            {reviews.length === 1 ? "" : "s"}
          </span>
          <span>
            <strong className="text-gray-900">{commentCount}</strong> comment
            {commentCount === 1 ? "" : "s"}
          </span>
        </div>
      </Card>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-gray-900">Reviews by @{user.username}</h2>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No reviews posted yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {reviews.map((review) => (
              <Link key={review.id} href={`/teachers/${review.teacherId}`}>
                <Card className="p-4 hover:shadow-md">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-900">{review.teacher.name}</p>
                    <StarRatingDisplay value={reviewOverall(review)} size="sm" />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{review.comment}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {formatRelativeTime(review.createdAt)}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
