import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { reviewOverall, type RatableReview } from "@/lib/ratings";

export const metadata = { title: "Overview" };

const WEEKS_OF_HISTORY = 8;

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4" interactive>
      <p className="font-display text-3xl font-extrabold leading-none tracking-tight text-navy-900">
        {value}
      </p>
      <p className="mt-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-navy-400">
        {label}
      </p>
    </Card>
  );
}

export default async function AdminOverviewPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - WEEKS_OF_HISTORY * 7);

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

  const [ratingReviews, recentReviews, flags] = await Promise.all([
    prisma.review.findMany({
      where: { status: "VISIBLE" },
      select: { clarity: true, fairness: true, workload: true, approachability: true },
    }),
    prisma.review.findMany({
      where: { status: "VISIBLE", createdAt: { gte: eightWeeksAgo } },
      select: { createdAt: true },
    }),
    prisma.flag.findMany({
      include: {
        review: { include: { teacher: true } },
        comment: { include: { teacher: true } },
      },
    }),
  ]);

  const ratingCounts = [0, 0, 0, 0, 0];
  for (const review of ratingReviews) {
    const overall = reviewOverall(review as RatableReview);
    const star = Math.min(5, Math.max(1, Math.round(overall)));
    ratingCounts[star - 1] += 1;
  }
  const maxRatingCount = Math.max(...ratingCounts);

  const now = new Date().getTime();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeklyCounts = new Array(WEEKS_OF_HISTORY).fill(0) as number[];
  for (const review of recentReviews) {
    const weeksAgo = Math.floor((now - review.createdAt.getTime()) / msPerWeek);
    const bucket = WEEKS_OF_HISTORY - 1 - Math.min(Math.max(weeksAgo, 0), WEEKS_OF_HISTORY - 1);
    weeklyCounts[bucket] += 1;
  }
  const maxWeeklyCount = Math.max(...weeklyCounts);

  const flagCountsByTeacher = new Map<string, { name: string; count: number }>();
  for (const flag of flags) {
    const teacher = flag.review?.teacher ?? flag.comment?.teacher;
    if (!teacher) continue;
    const existing = flagCountsByTeacher.get(teacher.id);
    if (existing) {
      existing.count += 1;
    } else {
      flagCountsByTeacher.set(teacher.id, { name: teacher.name, count: 1 });
    }
  }
  const mostFlaggedTeachers = Array.from(flagCountsByTeacher.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

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
        <h2 className="font-display text-base font-extrabold tracking-tight text-navy-900">Most active reviewers</h2>
        <p className="mt-1 text-xs text-navy-500">
          Shown by review count only — not linked to identities here. Use the flagged content
          queue if you need to act on a specific account.
        </p>
        {topReviewers.length === 0 ? (
          <p className="mt-3 text-sm text-navy-500">No reviews yet.</p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {topReviewers.map((r, i) => (
              <li key={r.userId} className="flex items-center justify-between text-sm">
                <span className="text-navy-700">Reviewer #{i + 1}</span>
                <span className="font-medium text-navy-900">{r._count.userId} reviews</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-6 p-5">
        <h2 className="font-display text-base font-extrabold tracking-tight text-navy-900">Rating distribution</h2>
        {reviewCount === 0 ? (
          <p className="mt-3 text-sm text-navy-500">No reviews yet.</p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star - 1];
              const pct = maxRatingCount > 0 ? (count / maxRatingCount) * 100 : 0;
              return (
                <li key={star} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 text-sm text-navy-600">{star} stars</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-navy-800 to-surf-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 shrink-0 text-right text-sm font-medium text-navy-900">
                    {count}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card className="mt-6 p-5">
        <h2 className="font-display text-base font-extrabold tracking-tight text-navy-900">Reviews per week</h2>
        <p className="mt-1 text-xs text-navy-500">Last {WEEKS_OF_HISTORY} weeks, oldest to most recent.</p>
        {maxWeeklyCount === 0 ? (
          <p className="mt-3 text-sm text-navy-500">No reviews in the last {WEEKS_OF_HISTORY} weeks.</p>
        ) : (
          <div className="mt-4 flex h-32 items-end justify-between gap-2">
            {weeklyCounts.map((count, i) => {
              const pct = (count / maxWeeklyCount) * 100;
              return (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-xs font-medium text-navy-900">{count}</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-surf-500 to-surf-300"
                    style={{ height: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="mt-6 p-5">
        <h2 className="font-display text-base font-extrabold tracking-tight text-navy-900">Most flagged teachers</h2>
        {mostFlaggedTeachers.length === 0 ? (
          <p className="mt-3 text-sm text-navy-500">No flags yet.</p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {mostFlaggedTeachers.map((t, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-navy-700">
                  {i + 1}. {t.name}
                </span>
                <span className="font-medium text-navy-900">{t.count} flags</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
