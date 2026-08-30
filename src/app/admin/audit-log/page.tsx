import { prisma } from "@/lib/prisma";
import { AdminAuditLogList } from "@/components/admin/AdminAuditLogList";

export const metadata = { title: "Audit log" };

export default async function AdminAuditLogPage() {
  const actions = await prisma.adminAction.findMany({
    take: 150,
    orderBy: { createdAt: "desc" },
    include: { admin: { select: { email: true, username: true } } },
  });

  const entries = actions.map((a) => ({
    id: a.id,
    action: a.action,
    targetType: a.targetType,
    targetId: a.targetId,
    detail: a.detail,
    createdAt: a.createdAt.toISOString(),
    adminEmail: a.admin.email,
    adminUsername: a.admin.username,
  }));

  return (
    <div>
      <p className="mb-6 text-sm text-navy-600">
        A record of moderation and admin actions across the site — who removed a review, banned an
        account, promoted an admin, and so on — so multiple admins can stay accountable to each
        other. Most recent first, capped to the last 150 actions.
      </p>
      <AdminAuditLogList entries={entries} />
    </div>
  );
}
