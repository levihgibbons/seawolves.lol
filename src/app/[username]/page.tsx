import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { reviewOverall } from "@/lib/ratings";
import { formatRelativeTime } from "@/lib/format";
import { Avatar } from "@/components/Avatar";
import { StarRatingDisplay } from "@/components/StarRating";
import { PageContent } from "@/components/PageHero";
import { Card, EmptyState } from "@/components/ui";
import { ShieldIcon, StarOutlineIcon } from "@/components/icons";

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
    <div>
      <section className="surface-deep relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <span
          className="animate-tide pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-surf-500/25 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pb-20 pt-14 text-center sm:px-6">
          <Avatar
            name={user.username}
            photoUrl={user.image}
            size="xl"
            className="animate-scale-in ring-4 ring-white/15"
          />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">
              {user.username}
            </h1>
            {user.role === "ADMIN" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-surf-200 ring-1 ring-inset ring-white/15">
                <ShieldIcon className="h-3.5 w-3.5" />
                Admin
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
            Seawolf since {joined}
          </p>
          {user.bio && (
            <p className="mt-4 max-w-md whitespace-pre-line text-pretty text-sm leading-relaxed text-white/70">
              {user.bio}
            </p>
          )}
          <div className="mt-6 flex gap-2">
            <div className="rounded-2xl bg-white/[0.07] px-5 py-2.5 ring-1 ring-inset ring-white/10">
              <p className="font-display text-xl font-extrabold leading-none text-white">
                {reviews.length}
              </p>
              <p className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white/45">
                Ratings
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.07] px-5 py-2.5 ring-1 ring-inset ring-white/10">
              <p className="font-display text-xl font-extrabold leading-none text-white">
                {commentCount}
              </p>
              <p className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white/45">
                Comments
              </p>
            </div>
          </div>
        </div>
      </section>

      <PageContent width="max-w-3xl">
        <h2 className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-navy-900">
          <StarOutlineIcon className="h-4 w-4 text-surf-500" />
          Ratings by {user.username}
        </h2>
        {reviews.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={<StarOutlineIcon className="h-6 w-6" />}
            title="Nothing posted yet"
          />
        ) : (
          <div className="mt-4 space-y-3">
            {reviews.map((review, i) => (
              <Link
                key={review.id}
                href={`/teachers/${review.teacherId}`}
                className="block animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 45, 320)}ms` }}
              >
                <Card className="p-4" interactive>
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-bold text-navy-900">{review.teacher.name}</p>
                    <StarRatingDisplay value={reviewOverall(review)} size="xs" />
                  </div>
                  <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-navy-500">
                    {review.comment}
                  </p>
                  <p className="mt-2.5 text-xs text-navy-300">
                    {formatRelativeTime(review.createdAt)}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
}
