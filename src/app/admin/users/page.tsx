import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import type { UserStatus } from "@/lib/constants";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    include: { _count: { select: { reviews: true } } },
    orderBy: { createdAt: "desc" },
  });

  const data = users.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    status: u.status as UserStatus,
    reviewCount: u._count.reviews,
  }));

  return (
    <div>
      <p className="mb-6 text-sm text-navy-600">
        Suspend or ban accounts that repeatedly post abusive, off-topic, or spammy content.
        Suspended and banned users can&apos;t sign in.
      </p>
      <AdminUsersTable users={data} currentUserId={session?.user.id} />
    </div>
  );
}
