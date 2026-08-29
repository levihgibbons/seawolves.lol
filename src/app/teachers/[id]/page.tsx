import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeRatingBreakdown } from "@/lib/ratings";
import { RATING_CATEGORY_LABELS, applicableRatingCategories } from "@/lib/constants";
import { Avatar } from "@/components/Avatar";
import { StarRatingDisplay } from "@/components/StarRating";
import { RatingBar } from "@/components/RatingBar";
import { DiscussionComposer } from "@/components/DiscussionComposer";
import { type ReviewCardData } from "@/components/ReviewCard";
import { type CommentNode } from "@/components/CommentThread";
import { DiscussionFeed, type DiscussionItem } from "@/components/DiscussionFeed";
import { Card, Badge } from "@/components/ui";

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <Link href="/teachers" className="text-sm font-medium text-navy hover:underline">
        ← Back to Roster
      </Link>

      <div className="mt-3 flex flex-wrap items-start gap-4 sm:flex-nowrap">
        <Avatar name={teacher.name} photoUrl={teacher.photoUrl} size="lg" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{teacher.name}</h1>
            {!teacher.active && <Badge tone="neutral">The Fallen</Badge>}
            {teacher.active && !teacher.isFaculty && <Badge tone="neutral">Staff</Badge>}
          </div>
          <p className="text-gray-600">{teacher.department}</p>
          <div className="mt-1.5">
            <StarRatingDisplay value={breakdown.overall} />
            <span className="ml-2 text-sm text-gray-500">
              based on {breakdown.count} review{breakdown.count === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      <Card className="mt-4 space-y-2.5 p-4">
        <h2 className="text-sm font-semibold text-gray-900">Rating breakdown</h2>
        {categories.map((category) => (
          <RatingBar
            key={category}
            label={RATING_CATEGORY_LABELS[category]}
            value={breakdown.byCategory[category]}
          />
        ))}
      </Card>

      <div className="mt-7 border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Discussion ({discussionItems.length})</h2>
          <div className="flex gap-3 text-xs font-medium">
            <Link
              href={`/teachers/${id}?sort=recent`}
              className={sort !== "helpful" ? "text-navy" : "text-gray-400 hover:text-navy"}
            >
              Most recent
            </Link>
            <Link
              href={`/teachers/${id}?sort=helpful`}
              className={sort === "helpful" ? "text-navy" : "text-gray-400 hover:text-navy"}
            >
              Most helpful
            </Link>
          </div>
        </div>

        <div className="mt-4">
          {!teacher.active ? (
            <Card className="p-4 text-sm text-gray-600">
              {teacher.name} is no longer at Pacifica, so this page is closed to new posts —
              existing ratings and comments are preserved below.
            </Card>
          ) : !session?.user ? (
            <Card className="p-4 text-sm text-gray-600">
              <Link href="/login" className="font-medium text-navy hover:underline">
                Sign in
              </Link>{" "}
              to rate or comment on {teacher.name}.
            </Card>
          ) : !session.user.emailVerified ? (
            <Card className="p-4 text-sm text-gray-600">
              Verify your email before posting.{" "}
              <Link href="/account" className="font-medium text-navy hover:underline">
                Resend verification email
              </Link>
              .
            </Card>
          ) : !session.user.username ? (
            <Card className="p-4 text-sm text-gray-600">
              <Link href="/choose-username" className="font-medium text-navy hover:underline">
                Pick a username
              </Link>{" "}
              before posting on {teacher.name}&apos;s page.
            </Card>
          ) : (
            <DiscussionComposer
              teacherId={teacher.id}
              teacherName={teacher.name}
              categories={categories}
              isFaculty={teacher.isFaculty}
              hasOwnReview={!!myReview}
            />
          )}
        </div>

        <div className="mt-5">
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
  );
}
