import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeRatingBreakdown } from "@/lib/ratings";
import { RATING_CATEGORY_LABELS, applicableRatingCategories, teacherRoleLabel } from "@/lib/constants";
import { Avatar } from "@/components/Avatar";
import { StarRatingDisplay } from "@/components/StarRating";
import { RatingBar } from "@/components/RatingBar";
import { DiscussionComposer } from "@/components/DiscussionComposer";
import { type ReviewCardData } from "@/components/ReviewCard";
import { type CommentNode } from "@/components/CommentThread";
import { DiscussionFeed, type DiscussionItem } from "@/components/DiscussionFeed";
import { Card, NoticeCard, cx } from "@/components/ui";
import { ArrowLeftIcon, ArrowRightIcon, GhostIcon } from "@/components/icons";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const teacher = await prisma.teacher.findUnique({ where: { id }, select: { name: true } });
  return { title: teacher?.name ?? "Teacher" };
}

export default async function TeacherProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { id } = await params;
  const { sort } = await searchParams;
  const session = await auth();

  const teacher = await prisma.teacher.findUnique({ where: { id } });
  // Inactive teachers stay viewable (that's the point of The Fallen — their
  // reviews live on) — they're just closed to new reviews. Only a teacher
  // that's never existed 404s.
  if (!teacher) notFound();

  const categories = applicableRatingCategories(teacher.isFaculty);

  const reviews = await prisma.review.findMany({
    where: { teacherId: id, status: "VISIBLE" },
    include: {
      user: { select: { username: true } },
      helpfulVotes: session?.user ? { where: { userId: session.user.id } } : false,
      _count: { select: { helpfulVotes: true } },
    },
  });

  const breakdown = computeRatingBreakdown(reviews);

  const myReview = session?.user ? reviews.find((r) => r.userId === session.user.id) : undefined;

  const reviewCards: ReviewCardData[] = reviews.map((r) => ({
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    clarity: r.clarity,
    fairness: r.fairness,
    workload: r.workload,
    approachability: r.approachability,
    comment: r.comment,
    helpfulCount: r._count.helpfulVotes,
    viewerHasVoted: session?.user ? r.helpfulVotes.length > 0 : false,
    isOwn: session?.user ? r.userId === session.user.id : false,
    username: r.user.username,
  }));

  const rawComments = await prisma.comment.findMany({
    where: { teacherId: id, status: "VISIBLE" },
    include: {
      user: { select: { username: true } },
      votes: session?.user ? { where: { userId: session.user.id } } : false,
      _count: { select: { votes: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const byId = new Map(rawComments.map((c) => [c.id, c]));
  const nodeMap = new Map<string, CommentNode>();
  for (const c of rawComments) {
    nodeMap.set(c.id, {
      id: c.id,
      createdAt: c.createdAt.toISOString(),
      body: c.body,
      isOwn: session?.user ? c.userId === session.user.id : false,
      username: c.user.username,
      helpfulCount: c._count.votes,
      viewerHasVoted: session?.user ? c.votes.length > 0 : false,
      replies: [],
    });
  }
  const topLevelComments: CommentNode[] = [];
  for (const c of rawComments) {
    const node = nodeMap.get(c.id)!;
    if (c.parentId && byId.has(c.parentId)) {
      nodeMap.get(c.parentId)!.replies.push(node);
    } else {
      topLevelComments.push(node);
    }
  }

  // One combined, sortable feed instead of a separate "review" list and
  // "comment" thread — see DiscussionFeed. Replies stay nested under their
  // parent comment regardless of sort; only top-level items (reviews and
  // top-level comments) get reordered.
  const discussionItems: DiscussionItem[] = [
    ...reviewCards.map((r): DiscussionItem => ({ type: "review", createdAt: r.createdAt, score: r.helpfulCount, data: r })),
    ...topLevelComments.map((c): DiscussionItem => ({ type: "comment", createdAt: c.createdAt, score: c.helpfulCount, data: c })),
  ].sort((a, b) => {
    if (sort === "helpful" && b.score !== a.score) return b.score - a.score;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Eligible to post right now — signed in, verified, has a username, and
  // the teacher hasn't left Pacifica. Drives both whether the composer
  // shows and whether Reply is offered on individual comments.
  const canPost = teacher.active && !!session?.user && !!session.user.emailVerified && !!session.user.username;

  // A departed teacher isn't on /teachers, so sending them back there is a dead
  // end — point at the list they're actually in.
  const backTo = teacher.active
    ? { href: "/teachers", label: "Roster" }
    : { href: "/the-fallen", label: "The Fallen" };

  const sortLink = (key: "recent" | "helpful", label: string) => {
    const active = key === "helpful" ? sort === "helpful" : sort !== "helpful";
    return (
      <Link
        key={key}
        href={`/teachers/${id}?sort=${key}`}
        scroll={false}
        className={cx(
          "inline-flex min-h-10 items-center rounded-full px-4 text-xs font-bold transition duration-200",
          active ? "bg-white text-navy-900 shadow-soft" : "text-navy-500 hover:text-navy-800"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <div>
      {/* ------------------------------------------------------------ hero */}
      <section className="surface-deep relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <span
          className="animate-tide pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-surf-500/25 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6">
          <Link
            href={backTo.href}
            className="group inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-white/60 transition duration-200 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            {backTo.label}
          </Link>

          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end">
            <Avatar
              name={teacher.name}
              photoUrl={teacher.photoUrl}
              size="xl"
              priority
              className="animate-scale-in ring-4 ring-white/15"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {teacher.name}
                </h1>
                {!teacher.active && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-white/70 ring-1 ring-inset ring-white/15">
                    <GhostIcon className="h-3.5 w-3.5" />
                    The Fallen
                  </span>
                )}
                {teacher.active && (
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-white/70 ring-1 ring-inset ring-white/15">
                    {teacherRoleLabel(teacher.department, teacher.isFaculty)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-semibold text-surf-300">{teacher.department}</p>
            </div>

            {breakdown.overall === null ? (
              <a
                href="#compose"
                className="group rounded-2xl bg-white/[0.07] px-5 py-3.5 text-center ring-1 ring-inset ring-white/10 transition duration-200 hover:bg-white/[0.13] active:scale-[0.98] sm:shrink-0"
              >
                <p className="font-display text-lg font-extrabold leading-none text-white">
                  Not rated yet
                </p>
                <p className="mt-1.5 inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-surf-300">
                  Be the first
                  <ArrowRightIcon className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </p>
              </a>
            ) : (
              <div className="flex items-center gap-4 rounded-2xl bg-white/[0.07] px-5 py-3.5 ring-1 ring-inset ring-white/10 sm:shrink-0">
                <div>
                  <p className="font-display text-4xl font-extrabold leading-none text-white">
                    {breakdown.overall.toFixed(1)}
                  </p>
                  <p className="mt-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white/45">
                    {breakdown.count} review{breakdown.count === 1 ? "" : "s"}
                  </p>
                </div>
                <StarRatingDisplay value={breakdown.overall} size="sm" showValue={false} onDark />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- content */}
      <div className="relative z-10 -mt-10 rounded-t-[2rem] bg-mist shadow-[0_-24px_48px_-24px_rgba(0,21,46,0.35)]">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div className="lg:order-2">
            <Card className="p-5 lg:sticky lg:top-24">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-navy-400">
                Score breakdown
              </h2>
              <div className="mt-4 space-y-3">
                {categories.map((category, i) => (
                  <RatingBar
                    key={category}
                    index={i}
                    label={RATING_CATEGORY_LABELS[category]}
                    value={breakdown.byCategory[category]}
                  />
                ))}
              </div>
            </Card>
          </div>

          <div id="compose" className="lg:order-1">
            {!teacher.active ? (
              <NoticeCard>
                <strong className="font-bold text-navy-800">{teacher.name}</strong> left. This page
                is closed, but nothing gets deleted.
              </NoticeCard>
            ) : !session?.user ? (
              <NoticeCard>
                <Link href="/login" className="font-bold text-surf-600 hover:underline">
                  Sign in
                </Link>{" "}
                to rate or comment on {teacher.name}.
              </NoticeCard>
            ) : !session.user.emailVerified ? (
              <NoticeCard>
                Verify your email to start posting.{" "}
                <Link href="/account" className="font-bold text-surf-600 hover:underline">
                  Resend the link
                </Link>
              </NoticeCard>
            ) : !session.user.username ? (
              <NoticeCard>
                <Link href="/choose-username" className="font-bold text-surf-600 hover:underline">
                  Pick a username
                </Link>{" "}
                and you&apos;re good to post.
              </NoticeCard>
            ) : (
              <DiscussionComposer
                teacherId={teacher.id}
                teacherName={teacher.name}
                categories={categories}
                isFaculty={teacher.isFaculty}
                hasOwnReview={!!myReview}
              />
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-extrabold tracking-tight text-navy-900">
                Discussion
                <span className="ml-2 rounded-full bg-navy-100 px-2.5 py-0.5 align-middle text-sm font-bold text-navy-500">
                  {discussionItems.length}
                </span>
              </h2>
              <div className="inline-flex gap-1 rounded-full bg-navy-100/70 p-1">
                {sortLink("recent", "Recent")}
                {sortLink("helpful", "Top")}
              </div>
            </div>

            <div className="mt-4">
              <DiscussionFeed
                items={discussionItems}
                teacherId={teacher.id}
                teacherName={teacher.name}
                categories={categories}
                isSignedIn={!!session?.user}
                canPost={canPost}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
