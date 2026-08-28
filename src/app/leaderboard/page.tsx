import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { computeRatingBreakdown } from "@/lib/ratings";
import {
  LEADERBOARD_MIN_REVIEWS,
  RATING_CATEGORIES,
  RATING_CATEGORY_LABELS,
  type RatingCategory,
} from "@/lib/constants";
import { Avatar } from "@/components/Avatar";
import { StarRatingDisplay } from "@/components/StarRating";
import { LeaderboardFilters } from "@/components/LeaderboardFilters";
import { Card } from "@/components/ui";

export const metadata = { title: "Leaderboard" };

type SortKey = "overall" | "mostReviewed" | RatingCategory;

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "overall", label: "Overall rating" },
  ...RATING_CATEGORIES.map((c) => ({ key: c, label: RATING_CATEGORY_LABELS[c] })),
  { key: "mostReviewed", label: "Most reviewed" },
];

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; department?: string }>;
}) {
  const { sort: rawSort, department } = await searchParams;
  const sort: SortKey = (SORT_OPTIONS.find((o) => o.key === rawSort)?.key ?? "overall") as SortKey;

  const teachers = await prisma.teacher.findMany({
    where: { active: true },
    include: {
      reviews: {
        where: { status: "VISIBLE" },
        select: {
          clarity: true,
          fairness: true,
          workload: true,
          approachability: true,
          createdAt: true,
        },
      },
    },
  });

  const departments = [...new Set(teachers.map((t) => t.department))].sort();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const ranked = teachers
    .filter((t) => !department || t.department === department)
    .map((t) => {
      const breakdown = computeRatingBreakdown(t.reviews);
      const reviewsThisMonth = t.reviews.filter((r) => r.createdAt >= startOfMonth).length;
      return {
        id: t.id,
        name: t.name,
        department: t.department,
        photoUrl: t.photoUrl,
        overall: breakdown.overall,
        count: breakdown.count,
        byCategory: breakdown.byCategory,
        reviewsThisMonth,
      };
    });

  const eligible = ranked.filter((t) => t.count >= LEADERBOARD_MIN_REVIEWS);

  const sortValue = (t: (typeof ranked)[number]) =>
    sort === "overall" ? t.overall : sort === "mostReviewed" ? t.count : t.byCategory[sort];

  const sorted = [...eligible].sort((a, b) => (sortValue(b) ?? -1) - (sortValue(a) ?? -1));

  const mostReviewedThisMonth = [...ranked]
    .filter((t) => t.reviewsThisMonth > 0)
    .sort((a, b) => b.reviewsThisMonth - a.reviewsThisMonth)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
      <p className="mt-1 text-sm text-gray-600">
        Ranked by average rating. Teachers need at least {LEADERBOARD_MIN_REVIEWS} reviews to
        appear, so one review can&apos;t swing the ranking.
      </p>

      <div className="mt-5">
        <LeaderboardFilters
          sortOptions={SORT_OPTIONS}
          currentSort={sort}
          departments={departments}
          currentDepartment={department}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {sorted.length === 0 ? (
            <Card className="p-10 text-center">
              <p className="font-medium text-gray-900">No leaderboard yet</p>
              <p className="mt-1 text-sm text-gray-500">
                {department
                  ? `Teachers in ${department} haven't reached ${LEADERBOARD_MIN_REVIEWS} reviews yet — check back soon.`
                  : `Once teachers have at least ${LEADERBOARD_MIN_REVIEWS} reviews, they'll appear here ranked by rating.`}
              </p>
            </Card>
          ) : (
            <ol className="space-y-1.5">
              {sorted.map((teacher, i) => (
                <li key={teacher.id}>
                  <Link href={`/teachers/${teacher.id}`}>
                    <Card className="flex items-center gap-3 p-3 hover:shadow-md">
                      <span
                        className={`w-6 shrink-0 text-center text-sm font-bold ${
                          i < 3 ? "text-navy" : "text-gray-400"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <Avatar name={teacher.name} photoUrl={teacher.photoUrl} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">{teacher.name}</p>
                        <p className="truncate text-xs text-gray-500">{teacher.department}</p>
                      </div>
                      <div className="hidden shrink-0 gap-3 text-center text-xs text-gray-400 sm:flex">
                        {RATING_CATEGORIES.map((c) => (
                          <span key={c} className="w-14">
                            <span className="block text-[10px] uppercase tracking-wide">
                              {RATING_CATEGORY_LABELS[c].slice(0, 4)}
                            </span>
                            <span className="font-semibold text-gray-600">
                              {teacher.byCategory[c]?.toFixed(1) ?? "—"}
                            </span>
                          </span>
                        ))}
                      </div>
                      <div className="shrink-0 text-right">
                        <StarRatingDisplay
                          value={sort === "mostReviewed" ? teacher.overall : sortValue(teacher)}
                          size="sm"
                        />
                        <p className="text-xs text-gray-500">{teacher.count} reviews</p>
                      </div>
                    </Card>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-900">Most reviewed this month</h2>
          <div className="mt-2 space-y-1.5">
            {mostReviewedThisMonth.length === 0 ? (
              <p className="text-sm text-gray-500">No reviews posted yet this month.</p>
            ) : (
              mostReviewedThisMonth.map((teacher) => (
                <Link key={teacher.id} href={`/teachers/${teacher.id}`}>
                  <Card className="flex items-center gap-2.5 p-2.5 hover:shadow-md">
                    <Avatar name={teacher.name} photoUrl={teacher.photoUrl} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
                      {teacher.name}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-navy">
                      {teacher.reviewsThisMonth} new
                    </span>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
