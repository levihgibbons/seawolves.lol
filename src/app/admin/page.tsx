import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";

export const metadata = { title: "Admin Overview" };

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-3.5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-0.5 text-2xl font-bold text-navy">{value}</p>
    </Card>
  );
}

export default async function AdminOverviewPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    teacherCount,
    reviewCount,
    reviewsLast30,
    commentCount,
    pendingReportCount,
    autoFlaggedReviewCount,
    autoFlaggedCommentCount,
    suspendedOrBannedCount,
    topReviewers,
  ] = await Promise.all([
    prisma.teacher.count({ where: { active: true } }),
    prisma.review.count({ where: { status: "VISIBLE" } }),
    prisma.review.count({ where: { status: "VISIBLE", createdAt: { gte: thirtyDaysAgo } } }),
    prisma.comment.count({ where: { status: "VISIBLE" } }),
    prisma.flag.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { autoFlagged: true, status: "VISIBLE" } }),
    prisma.comment.count({ where: { autoFlagged: true, status: "VISIBLE" } }),
    prisma.user.count({ where: { status: { not: "ACTIVE" } } }),
    prisma.review.groupBy({
      by: ["userId"],
      _count: { userId: true },
      orderBy: { _count: { userId: "desc" } },
      take: 5,
    }),
  ]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active teachers" value={teacherCount} />
        <StatCard label="Total reviews" value={reviewCount} />
        <StatCard label="Reviews (last 30 days)" value={reviewsLast30} />
        <StatCard label="Total comments" value={commentCount} />
        <StatCard label="Pending reports" value={pendingReportCount} />
        <StatCard
          label="Auto-flagged content"
          value={autoFlaggedReviewCount + autoFlaggedCommentCount}
        />
        <StatCard label="Suspended / banned accounts" value={suspendedOrBannedCount} />
      </div>

      <Card className="mt-6 p-5">
        <h2 className="text-sm font-semibold text-gray-900">Most active reviewers</h2>
        <p className="mt-1 text-xs text-gray-500">
          Shown by review count only — not linked to identities here. Use the flagged content
          queue if you need to act on a specific account.
        </p>
        {topReviewers.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No reviews yet.</p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {topReviewers.map((r, i) => (
              <li key={r.userId} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Reviewer #{i + 1}</span>
                <span className="font-medium text-gray-900">{r._count.userId} reviews</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
