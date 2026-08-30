import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, ButtonLink, Card, EmptyState } from "@/components/ui";
import { Avatar } from "@/components/Avatar";
import { StarRatingDisplay } from "@/components/StarRating";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { PageHero, PageContent } from "@/components/PageHero";
import { formatRelativeTime } from "@/lib/format";
import { reviewOverall } from "@/lib/ratings";
import { usernameChangeAvailableAt } from "@/lib/username";
import { ChatIcon, ShieldIcon, StarOutlineIcon } from "@/components/icons";

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
    <div>
      <PageHero
        title={session.user.username ?? "Your profile"}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="text-white/60">{session.user.email}</span>
            <span className="text-white/25">·</span>
            <span className="text-white/40">Seawolf since {joined}</span>
          </span>
        }
      />

      <PageContent width="max-w-3xl">
        <Card className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar name={session.user.username ?? "?"} photoUrl={me?.image} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-xl font-extrabold tracking-tight text-navy-900">
                  {session.user.username}
                </p>
                <Badge tone="green">Verified</Badge>
                {session.user.role === "ADMIN" && <Badge tone="navy">Admin</Badge>}
              </div>
              {me?.bio ? (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy-600">
                  {me.bio}
                </p>
              ) : (
                <p className="mt-2 text-sm text-navy-300">No bio yet — add one.</p>
              )}

              <div className="mt-4 flex gap-6 border-t border-navy-50 pt-3.5">
                <span className="text-sm text-navy-400">
                  <strong className="font-display text-base font-extrabold text-navy-900">
                    {reviews.length}
                  </strong>{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </span>
                <span className="text-sm text-navy-400">
                  <strong className="font-display text-base font-extrabold text-navy-900">
                    {comments.length}
                  </strong>{" "}
                  {comments.length === 1 ? "comment" : "comments"}
                </span>
              </div>
            </div>
          </div>

          {session.user.role === "ADMIN" && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-navy-800 px-4 py-3.5">
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldIcon className="h-4 w-4 text-surf-300" />
                Admin
              </p>
              <ButtonLink href="/admin" variant="onDark" size="sm">
                Open dashboard
              </ButtonLink>
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

        <section className="mt-10">
          <h2 className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-navy-900">
            <StarOutlineIcon className="h-4 w-4 text-surf-500" />
            Your ratings
            <span className="rounded-full bg-navy-100 px-2 py-0.5 text-xs font-bold text-navy-500">
              {reviews.length}
            </span>
          </h2>
          {reviews.length === 0 ? (
            <EmptyState
              className="mt-4"
              icon={<StarOutlineIcon className="h-6 w-6" />}
              title="No ratings yet"
              action={{ href: "/teachers", label: "Rate a teacher" }}
            />
          ) : (
            <div className="mt-4 space-y-3">
              {reviews.map((review) => (
                <Link key={review.id} href={`/teachers/${review.teacherId}`} className="block">
                  <Card className="p-4" interactive>
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-bold text-navy-900">{review.teacher.name}</p>
                      <StarRatingDisplay value={reviewOverall(review)} size="xs" />
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-navy-500">
                      {review.comment}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2 text-xs text-navy-300">
                      <span>{formatRelativeTime(review.createdAt)}</span>
                      {review.status === "REMOVED" && <Badge tone="red">Removed</Badge>}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-navy-900">
            <ChatIcon className="h-4 w-4 text-surf-500" />
            Your comments
            <span className="rounded-full bg-navy-100 px-2 py-0.5 text-xs font-bold text-navy-500">
              {comments.length}
            </span>
          </h2>
          {comments.length === 0 ? (
            <EmptyState
              className="mt-4"
              icon={<ChatIcon className="h-6 w-6" />}
              title="No comments yet"
            />
          ) : (
            <div className="mt-4 space-y-3">
              {comments.map((comment) => (
                <Link key={comment.id} href={`/teachers/${comment.teacherId}`} className="block">
                  <Card className="p-4" interactive>
                    <p className="truncate text-sm font-bold text-navy-900">
                      {comment.teacher.name}
                    </p>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-navy-500">
                      {comment.body}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2 text-xs text-navy-300">
                      <span>{formatRelativeTime(comment.createdAt)}</span>
                      {comment.status === "REMOVED" && <Badge tone="red">Removed</Badge>}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </PageContent>
    </div>
  );
}
