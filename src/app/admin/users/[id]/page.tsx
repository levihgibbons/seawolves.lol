import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminUserDetail, type AdminUserDetailData } from "@/components/admin/AdminUserDetail";
import type { ContentStatus, UserRole, UserStatus } from "@/lib/constants";

export const metadata = { title: "User Detail" };

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      reviews: { include: { teacher: true }, orderBy: { createdAt: "desc" } },
      comments: { include: { teacher: true }, orderBy: { createdAt: "desc" } },
      flagsFiled: {
        include: {
          review: { include: { teacher: true } },
          comment: { include: { teacher: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!user) notFound();

  const recentActions = await prisma.adminAction.findMany({
    where: { targetType: "USER", targetId: user.id },
    take: 20,
    orderBy: { createdAt: "desc" },
    include: { admin: { select: { email: true } } },
  });

  const data: AdminUserDetailData = {
    id: user.id,
    email: user.email,
    username: user.username,
    image: user.image,
    role: user.role as UserRole,
    status: user.status as UserStatus,
    createdAt: user.createdAt.toISOString(),
    reviews: user.reviews.map((r) => ({
      id: r.id,
      teacherId: r.teacherId,
      teacherName: r.teacher.name,
      comment: r.comment,
      status: r.status as ContentStatus,
      createdAt: r.createdAt.toISOString(),
    })),
    comments: user.comments.map((c) => ({
      id: c.id,
      teacherId: c.teacherId,
      teacherName: c.teacher.name,
      body: c.body,
      status: c.status as ContentStatus,
      createdAt: c.createdAt.toISOString(),
    })),
    flags: user.flagsFiled.map((f) => ({
      id: f.id,
      type: f.type,
      teacherName: f.review?.teacher.name ?? f.comment?.teacher.name ?? "Unknown",
      reason: f.reason,
      status: f.status,
      createdAt: f.createdAt.toISOString(),
    })),
    recentActions: recentActions.map((a) => ({
      id: a.id,
      action: a.action,
      detail: a.detail,
      createdAt: a.createdAt.toISOString(),
      adminEmail: a.admin.email,
    })),
  };

  return <AdminUserDetail user={data} isSelf={user.id === session?.user.id} />;
}
