import { prisma } from "@/lib/prisma";
import { computeRatingBreakdown } from "@/lib/ratings";
import { TeacherCard } from "@/components/TeacherCard";
import { PageHero, PageContent } from "@/components/PageHero";
import { EmptyState } from "@/components/ui";
import { GhostIcon } from "@/components/icons";

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
    <div>
      <PageHero
        eyebrow="Gone, not deleted"
        icon={<GhostIcon className="h-3.5 w-3.5" />}
        title="The Fallen"
      />

      <PageContent>
        {departed.length === 0 ? (
          <EmptyState
            icon={<GhostIcon className="h-6 w-6" />}
            title="Nobody's fallen yet"
            action={{ href: "/teachers", label: "Browse the roster" }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {departed.map((teacher, i) => {
              const breakdown = computeRatingBreakdown(teacher.reviews);
              return (
                <div
                  key={teacher.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(i * 35, 400)}ms` }}
                >
                  <TeacherCard
                    muted
                    teacher={{
                      id: teacher.id,
                      name: teacher.name,
                      department: teacher.department,
                      isFaculty: teacher.isFaculty,
                      photoUrl: teacher.photoUrl,
                      overall: breakdown.overall,
                      reviewCount: teacher._count.reviews,
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </PageContent>
    </div>
  );
}
