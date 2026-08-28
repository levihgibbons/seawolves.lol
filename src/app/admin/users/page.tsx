import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminUserRow } from "@/components/admin/AdminUserRow";
import type { UserStatus } from "@/lib/constants";

export const metadata = { title: "Manage Users" };

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    include: { _count: { select: { reviews: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <p className="mb-6 text-sm text-gray-600">
        Suspend or ban accounts that repeatedly post abusive, off-topic, or spammy content.
        Suspended and banned users can&apos;t sign in.
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase text-gray-500">
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Reviews</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <AdminUserRow
                key={u.id}
                id={u.id}
                email={u.email}
                role={u.role}
                status={u.status as UserStatus}
                reviewCount={u._count.reviews}
                isSelf={u.id === session?.user.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
