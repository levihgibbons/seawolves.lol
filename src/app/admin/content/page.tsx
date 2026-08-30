import { prisma } from "@/lib/prisma";
import { AdminContentBrowser } from "@/components/admin/AdminContentBrowser";
import type { ContentStatus } from "@/lib/constants";

export const metadata = { title: "Content" };

export default async function AdminContentPage() {
  const [reviews, comments] = await Promise.all([
    prisma.review.findMany({
      include: { teacher: true, user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.comment.findMany({
      include: { teacher: true, user: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const reviewData = reviews.map((r) => ({
    id: r.id,
    teacherId: r.teacherId,
    teacherName: r.teacher.name,
    authorId: r.userId,
    authorEmail: r.user.email,
    body: r.comment,
    status: r.status as ContentStatus,
    createdAt: r.createdAt.toISOString(),
    clarity: r.clarity,
    fairness: r.fairness,
    workload: r.workload,
    approachability: r.approachability,
  }));

  const commentData = comments.map((c) => ({
    id: c.id,
    teacherId: c.teacherId,
    teacherName: c.teacher.name,
    authorId: c.userId,
    authorEmail: c.user.email,
    body: c.body,
    status: c.status as ContentStatus,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div>
      <p className="mb-6 text-sm text-navy-600">
        Every review and comment on the site, visible or removed — not just what&apos;s been
        flagged. Search across teachers, authors, and content, and remove or restore anything
        directly.
      </p>
      <AdminContentBrowser reviews={reviewData} comments={commentData} />
    </div>
  );
}
