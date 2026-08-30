import { prisma } from "@/lib/prisma";
import { AdminModerationQueue, type QueueItem } from "@/components/admin/AdminModerationQueue";

export const metadata = { title: "Flagged" };

export default async function AdminFlagsPage() {
  const [reportedFlags, autoFlaggedReviews, autoFlaggedComments] = await Promise.all([
    prisma.flag.findMany({
      where: { status: "PENDING" },
      include: {
        review: { include: { teacher: true, user: true } },
        comment: { include: { teacher: true, user: true } },
        reporter: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.review.findMany({
      where: { autoFlagged: true, status: "VISIBLE" },
      include: { teacher: true, user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.comment.findMany({
      where: { autoFlagged: true, status: "VISIBLE" },
      include: { teacher: true, user: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const items: QueueItem[] = [];

  for (const flag of reportedFlags) {
    if (flag.type === "REVIEW" && flag.review) {
      items.push({
        key: `report-${flag.id}`,
        source: "report",
        flagId: flag.id,
        targetType: "REVIEW",
        targetId: flag.review.id,
        teacherName: flag.review.teacher.name,
        teacherId: flag.review.teacherId,
        authorId: flag.review.userId,
        authorEmail: flag.review.user.email,
        contentPreview: flag.review.comment,
        reason: flag.reason,
        reporterEmail: flag.reporter.email,
        createdAt: flag.createdAt.toISOString(),
      });
    } else if (flag.type === "COMMENT" && flag.comment) {
      items.push({
        key: `report-${flag.id}`,
        source: "report",
        flagId: flag.id,
        targetType: "COMMENT",
        targetId: flag.comment.id,
        teacherName: flag.comment.teacher.name,
        teacherId: flag.comment.teacherId,
        authorId: flag.comment.userId,
        authorEmail: flag.comment.user.email,
        contentPreview: flag.comment.body,
        reason: flag.reason,
        reporterEmail: flag.reporter.email,
        createdAt: flag.createdAt.toISOString(),
      });
    }
  }

  for (const review of autoFlaggedReviews) {
    items.push({
      key: `auto-review-${review.id}`,
      source: "auto",
      targetType: "REVIEW",
      targetId: review.id,
      teacherName: review.teacher.name,
      teacherId: review.teacherId,
      authorId: review.userId,
      authorEmail: review.user.email,
      contentPreview: review.comment,
      reason: review.autoFlagReason ?? "Flagged by automated content filter.",
      createdAt: review.createdAt.toISOString(),
    });
  }

  for (const comment of autoFlaggedComments) {
    items.push({
      key: `auto-comment-${comment.id}`,
      source: "auto",
      targetType: "COMMENT",
      targetId: comment.id,
      teacherName: comment.teacher.name,
      teacherId: comment.teacherId,
      authorId: comment.userId,
      authorEmail: comment.user.email,
      contentPreview: comment.body,
      reason: "Flagged by automated content filter.",
      createdAt: comment.createdAt.toISOString(),
    });
  }

  items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div>
      <p className="mb-6 text-sm text-navy-600">
        {items.length} item{items.length === 1 ? "" : "s"} awaiting review — user reports and
        content the automated filter flagged for a human to check.
      </p>
      <AdminModerationQueue items={items} />
    </div>
  );
}
