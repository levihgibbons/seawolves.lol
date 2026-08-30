import { prisma } from "@/lib/prisma";
import { AdminTeacherManager } from "@/components/admin/AdminTeacherManager";

export const metadata = { title: "Teachers" };

export default async function AdminTeachersPage() {
  const teachers = await prisma.teacher.findMany({
    include: { _count: { select: { reviews: true } } },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  const data = teachers.map((t) => ({
    id: t.id,
    name: t.name,
    department: t.department,
    isFaculty: t.isFaculty,
    photoUrl: t.photoUrl,
    active: t.active,
    reviewCount: t._count.reviews,
  }));

  return (
    <div>
      <p className="mb-6 text-sm text-navy-600">
        The faculty roster changes yearly — add, edit, or remove teachers here without a
        redeploy. Moving someone to The Fallen hides them from the active roster and closes them
        to new reviews, but their page and existing reviews stay up; you can restore them anytime.
        Uncheck &ldquo;Classroom teacher&rdquo; for non-teaching staff so they don&apos;t get a
        workload rating.
      </p>
      <AdminTeacherManager teachers={data} />
    </div>
  );
}
