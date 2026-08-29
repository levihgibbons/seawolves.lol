import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { computeRatingBreakdown } from "@/lib/ratings";
import { Avatar } from "@/components/Avatar";
import { StarRatingDisplay } from "@/components/StarRating";
import { Card } from "@/components/ui";

export const metadata = { title: "The Fallen" };

export default async function TheFallenPage() {
  const departed = await prisma.teacher.findMany({
    where: { active: false },
    include: {
      reviews: {
        where: { status: "VISIBLE" },
        select: { clarity: true, fairness: true, workload: true, approachability: true },
      },
      _count: { select: { reviews: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">The Fallen</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-gray-600">
          Teachers and staff who&apos;ve left Pacifica, whether they moved on, retired, or got let
          go. Nothing here disappears — every review lives on forever.
        </p>
      </div>

      {departed.length === 0 ? (
        <Card className="mx-auto mt-8 max-w-md p-8 text-center">
          <p className="font-medium text-gray-900">Nobody&apos;s fallen. Yet.</p>
          <p className="mt-1.5 text-sm text-gray-500">
            When someone leaves Pacifica, admins move them here from the roster — their page and
            reviews stay put, just marked as gone. Check back later.
          </p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departed.map((teacher, i) => {
            const breakdown = computeRatingBreakdown(teacher.reviews);
            return (
              <Link
                key={teacher.id}
                href={`/teachers/${teacher.id}`}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
              >
                <Card className="flex h-full flex-col gap-2 p-3 opacity-90 grayscale transition duration-200 hover:opacity-100 hover:grayscale-0 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={teacher.name} photoUrl={teacher.photoUrl} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{teacher.name}</p>
                      <p className="truncate text-xs text-gray-500">{teacher.department}</p>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-2">
                    <StarRatingDisplay value={breakdown.overall} size="sm" />
                    <span className="text-xs text-gray-500">
                      {teacher._count.reviews} review{teacher._count.reviews === 1 ? "" : "s"}
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
