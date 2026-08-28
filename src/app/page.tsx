import Link from "next/link";
import { getTeachersWithRatings } from "@/lib/teacherQueries";
import { prisma } from "@/lib/prisma";
import { LEADERBOARD_MIN_REVIEWS } from "@/lib/constants";
import { TeacherCard } from "@/components/TeacherCard";
import { Avatar } from "@/components/Avatar";
import { StarRatingDisplay } from "@/components/StarRating";
import { Button, Card } from "@/components/ui";
import { SearchBar } from "@/components/SearchBar";
import { formatRelativeTime } from "@/lib/format";
import { reviewOverall } from "@/lib/ratings";

export default async function HomePage() {
  const teachers = await getTeachersWithRatings();

  const topRated = teachers
    .filter((t) => t.reviewCount >= LEADERBOARD_MIN_REVIEWS && t.overall !== null)
    .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
    .slice(0, 4);

  const totalReviews = teachers.reduce((sum, t) => sum + t.reviewCount, 0);
  const departmentCount = new Set(teachers.map((t) => t.department)).size;

  const recentReviews = await prisma.review.findMany({
    where: { status: "VISIBLE" },
    include: { teacher: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div>
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[3fr_2fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-steel">
                Pacifica Christian High School
              </p>
              <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
                Don&apos;t get stuck with a rough schedule.
              </h1>
              <p className="mt-3 text-base text-gray-600">
                The real tea on every teacher — clarity, fairness, workload, vibes. Written by
                Seawolves, for Seawolves. No cap, just honest reviews before you pick your classes.
              </p>
              <div className="mt-5 max-w-lg">
                <SearchBar placeholder="Search by teacher name or subject..." />
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/teachers">
                  <Button>View Roster</Button>
                </Link>
                <Link href="/leaderboard">
                  <Button variant="outline">View leaderboard</Button>
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 border-t border-gray-100 pt-4 text-sm text-gray-500">
                <span>
                  <strong className="text-navy">{teachers.length}</strong> teachers
                </span>
                <span>
                  <strong className="text-navy">{totalReviews}</strong> review
                  {totalReviews === 1 ? "" : "s"}
                </span>
                <span>
                  <strong className="text-navy">{departmentCount}</strong> departments
                </span>
              </div>
            </div>

            <Card className="divide-y divide-gray-100 p-0">
              <div className="flex items-center justify-between px-4 py-2.5">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Recent reviews
                </h2>
                <Link href="/leaderboard" className="text-xs font-medium text-navy hover:underline">
                  Leaderboard →
                </Link>
              </div>
              {recentReviews.length === 0 ? (
                <p className="px-4 py-6 text-sm text-gray-500">
                  No reviews yet — be the first to post one.
                </p>
              ) : (
                recentReviews.map((review) => {
                  const overall = reviewOverall(review);
                  return (
                    <Link
                      key={review.id}
                      href={`/teachers/${review.teacherId}`}
                      className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-gray-50"
                    >
                      <Avatar name={review.teacher.name} photoUrl={review.teacher.photoUrl} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {review.teacher.name}
                          </p>
                          <span className="shrink-0 text-xs text-gray-400">
                            {formatRelativeTime(review.createdAt)}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <StarRatingDisplay value={overall} size="sm" showValue={false} />
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{review.comment}</p>
                      </div>
                    </Link>
                  );
                })
              )}
            </Card>
          </div>
        </div>
      </section>

      {topRated.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Top rated this year</h2>
            <Link href="/leaderboard" className="text-sm font-medium text-navy hover:underline">
              Full leaderboard →
            </Link>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topRated.map((teacher, i) => (
              <div
                key={teacher.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
              >
                <TeacherCard teacher={teacher} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <h2 className="text-lg font-semibold text-gray-900">How it works</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-3">
            <div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
                1
              </div>
              <p className="mt-2 font-medium text-gray-900">Sign up (yes, for real)</p>
              <p className="mt-1 text-sm text-gray-600">
                We know, an account. But it&apos;s the only thing standing between this site and
                total chaos. Your name stays yours — nobody sees it, ever.
              </p>
            </div>
            <div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
                2
              </div>
              <p className="mt-2 font-medium text-gray-900">Spill on your teachers</p>
              <p className="mt-1 text-sm text-gray-600">
                Rate clarity, fairness, workload, and vibes. Then actually say what happened —
                &ldquo;worst teacher fr&rdquo; doesn&apos;t count as a review.
              </p>
            </div>
            <div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
                3
              </div>
              <p className="mt-2 font-medium text-gray-900">Look out for the squad</p>
              <p className="mt-1 text-sm text-gray-600">
                Upvote what&apos;s actually useful, report what&apos;s unhinged. A real human reads
                every report — no bots running this show.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
