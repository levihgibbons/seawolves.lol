import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, Badge, Button } from "@/components/ui";
import { Avatar } from "@/components/Avatar";
import { StarRatingDisplay } from "@/components/StarRating";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { formatRelativeTime } from "@/lib/format";
import { reviewOverall } from "@/lib/ratings";
import { usernameChangeAvailableAt } from "@/lib/username";

export const metadata = { title: "My Profile" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { bio: true, image: true, createdAt: true, usernameChangedAt: true },
  });

  const joined = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    me?.createdAt ?? new Date()
  );
  const usernameAvailableAt = usernameChangeAvailableAt(me?.usernameChangedAt ?? null);

  const reviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    include: { teacher: true },
    orderBy: { createdAt: "desc" },
  });

  const comments = await prisma.comment.findMany({
    where: { userId: session.user.id },
    include: { teacher: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">My profile</h1>

      <Card className="relative mt-4 p-5">
        <div className="flex items-start gap-4">
          <Avatar name={session.user.username ?? "?"} photoUrl={me?.image} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-gray-900">{session.user.username}</p>
            <p className="text-sm text-gray-600">{session.user.email}</p>
            <p className="mt-0.5 text-xs text-gray-400">Seawolf since {joined}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="green">Email verified</Badge>
              {session.user.role === "ADMIN" && <Badge tone="navy">Admin</Badge>}
            </div>
            {me?.bio ? (
              <p className="mt-3 whitespace-pre-line text-sm text-gray-700">{me.bio}</p>
            ) : (
              <p className="mt-3 text-sm text-gray-400">No bio yet.</p>
            )}
          </div>
        </div>
        {session.user.role === "ADMIN" && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-steel-light bg-steel-light/20 px-3 py-2.5">
            <p className="text-sm text-navy">You have admin access on this site.</p>
            <Link href="/admin">
              <Button variant="secondary" className="text-xs">
                Go to admin dashboard
              </Button>
            </Link>
          </div>
        )}
        {session.user.username && (
          <ProfileEditForm
            username={session.user.username}
            initialBio={me?.bio ?? ""}
            initialImage={me?.image ?? ""}
            usernameChangeAvailableAt={usernameAvailableAt?.toISOString() ?? null}
          />
        )}
      </Card>

      <div className="mt-7">
        <h2 className="text-lg font-semibold text-gray-900">Your reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">
            You haven&apos;t reviewed any teachers yet.{" "}
            <Link href="/teachers" className="font-medium text-navy hover:underline">
              View the Roster
            </Link>
            .
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {reviews.map((review) => {
              const overall = reviewOverall(review);
              return (
                <Link key={review.id} href={`/teachers/${review.teacherId}`}>
                  <Card className="p-4 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{review.teacher.name}</p>
                      <StarRatingDisplay value={overall} size="sm" />
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">{review.comment}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                      <span>{formatRelativeTime(review.createdAt)}</span>
                      {review.status === "REMOVED" && <Badge tone="red">Removed by moderator</Badge>}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-7">
        <h2 className="text-lg font-semibold text-gray-900">Your comments ({comments.length})</h2>
        {comments.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No comments yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {comments.map((comment) => (
              <Link key={comment.id} href={`/teachers/${comment.teacherId}`}>
                <Card className="p-4 hover:shadow-md">
                  <p className="text-sm font-medium text-gray-900">{comment.teacher.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{comment.body}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                    <span>{formatRelativeTime(comment.createdAt)}</span>
                    {comment.status === "REMOVED" && <Badge tone="red">Removed by moderator</Badge>}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
