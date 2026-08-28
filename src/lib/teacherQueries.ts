import { prisma } from "./prisma";
import { computeRatingBreakdown } from "./ratings";

export async function getTeachersWithRatings() {
  const teachers = await prisma.teacher.findMany({
    where: { active: true },
    include: {
      reviews: {
        where: { status: "VISIBLE" },
        select: { clarity: true, fairness: true, workload: true, approachability: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return teachers.map((teacher) => {
    const breakdown = computeRatingBreakdown(teacher.reviews);
    return {
      id: teacher.id,
      name: teacher.name,
      department: teacher.department,
      isFaculty: teacher.isFaculty,
      photoUrl: teacher.photoUrl,
      overall: breakdown.overall,
      reviewCount: breakdown.count,
      byCategory: breakdown.byCategory,
    };
  });
}

export type TeacherWithRatings = Awaited<ReturnType<typeof getTeachersWithRatings>>[number];
