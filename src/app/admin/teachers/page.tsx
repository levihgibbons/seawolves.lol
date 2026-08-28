import { prisma } from "@/lib/prisma";
import { AdminTeacherManager } from "@/components/admin/AdminTeacherManager";

export const metadata = { title: "Manage Teachers" };

export default async function AdminTeachersPage() {
  const teachers = await prisma.teacher.findMany({
    include: { _count: { select: { reviews: true } } },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  const data = teachers.map((t) => ({
    id: t.id,
    name: t.name,
    department: t.department,
    photoUrl: t.photoUrl,
    active: t.active,
    reviewCount: t._count.reviews,
  }));

  return (
    <div>
      <p className="mb-6 text-sm text-gray-600">
        The faculty roster changes yearly — add, edit, or remove teachers here without a
        redeploy. Removing a teacher hides them from public listings but keeps their historical
        reviews intact; you can restore them anytime.
      </p>
      <AdminTeacherManager teachers={data} />
    </div>
  );
}
