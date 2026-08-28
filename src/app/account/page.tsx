import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import { ResendVerificationButton } from "@/components/ResendVerificationButton";
import { StarRatingDisplay } from "@/components/StarRating";
import { formatRelativeTime } from "@/lib/format";

export const metadata = { title: "My Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

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
      <h1 className="text-2xl font-bold text-gray-900">My account</h1>

      <Card className="mt-4 p-4">
        <p className="text-sm text-gray-600">{session.user.email}</p>
        <div className="mt-2 flex items-center gap-2">
          {session.user.emailVerified ? (
            <Badge tone="green">Email verified</Badge>
          ) : (
            <Badge tone="amber">Email not verified</Badge>
          )}
          {session.user.role === "ADMIN" && <Badge tone="navy">Admin</Badge>}
        </div>
        {!session.user.emailVerified && (
          <div className="mt-4">
            <p className="mb-2 text-sm text-gray-600">
              Verify your email to post reviews and comments.
            </p>
            <ResendVerificationButton />
          </div>
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
              const overall =
                (review.clarity + review.fairness + review.workload + review.approachability) / 4;
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
