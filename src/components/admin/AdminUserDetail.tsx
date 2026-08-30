"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Badge, Button, Card } from "@/components/ui";
import { formatRelativeTime } from "@/lib/format";
import { USER_STATUSES, type ContentStatus, type UserRole, type UserStatus } from "@/lib/constants";

export type AdminUserDetailData = {
  id: string;
  email: string;
  username: string | null;
  image: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  reviews: {
    id: string;
    teacherId: string;
    teacherName: string;
    comment: string;
    status: ContentStatus;
    createdAt: string;
  }[];
  comments: {
    id: string;
    teacherId: string;
    teacherName: string;
    body: string;
    status: ContentStatus;
    createdAt: string;
  }[];
  flags: {
    id: string;
    type: string;
    teacherName: string;
    reason: string;
    status: string;
    createdAt: string;
  }[];
  recentActions: {
    id: string;
    action: string;
    detail: string | null;
    createdAt: string;
    adminEmail: string;
  }[];
};

// Same tone convention as AdminUserRow's STATUS_TONE.
const STATUS_TONE: Record<UserStatus, "green" | "amber" | "red"> = {
  ACTIVE: "green",
  SUSPENDED: "amber",
  BANNED: "red",
};

const FLAG_STATUS_TONE: Record<string, "amber" | "green" | "neutral"> = {
  PENDING: "amber",
  RESOLVED: "green",
  DISMISSED: "neutral",
};

function humanizeAction(action: string) {
  const lower = action.toLowerCase().replace(/_/g, " ");
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function ContentRow({
  kind,
  id,
  teacherId,
  teacherName,
  preview,
  status,
  createdAt,
}: {
  kind: "review" | "comment";
  id: string;
  teacherId: string;
  teacherName: string;
  preview: string;
  status: ContentStatus;
  createdAt: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleStatus() {
    setLoading(true);
    const next: ContentStatus = status === "REMOVED" ? "VISIBLE" : "REMOVED";
    await fetch(`/api/admin/${kind === "review" ? "reviews" : "comments"}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/teachers/${teacherId}`}
          className="text-sm font-medium text-navy-900 hover:underline"
        >
          {teacherName}
        </Link>
        <Badge tone={status === "REMOVED" ? "red" : "green"}>{status}</Badge>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-navy-600">{preview}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-navy-300">{formatRelativeTime(new Date(createdAt))}</span>
        <Button
          variant={status === "REMOVED" ? "secondary" : "outline"}
          className="text-xs"
          disabled={loading}
          onClick={toggleStatus}
        >
          {loading ? "..." : status === "REMOVED" ? "Restore" : "Remove"}
        </Button>
      </div>
    </Card>
  );
}

export function AdminUserDetail({ user, isSelf }: { user: AdminUserDetailData; isSelf: boolean }) {
  const router = useRouter();
  const [statusLoading, setStatusLoading] = useState<UserStatus | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  async function setStatus(next: UserStatus) {
    if (next === "BANNED" && !confirm("Ban this account? They will not be able to sign in.")) return;
    setStatusLoading(next);
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setStatusLoading(null);
    router.refresh();
  }

  async function toggleRole() {
    const nextRole: UserRole = user.role === "ADMIN" ? "STUDENT" : "ADMIN";
    const message =
      nextRole === "ADMIN"
        ? `Give ${user.email} admin access?`
        : `Remove admin access from ${user.email}?`;
    if (!confirm(message)) return;
    setRoleLoading(true);
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    setRoleLoading(false);
    router.refresh();
  }

  return (
    <div>
      <Card className="p-5">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={user.username ?? user.email} photoUrl={user.image} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-navy-900">{user.email}</h1>
              {isSelf && <span className="text-xs text-navy-300">(you)</span>}
            </div>
            <p className="mt-0.5 text-sm text-navy-500">
              {user.username ? `@${user.username}` : "No username set"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone={user.role === "ADMIN" ? "navy" : "neutral"}>{user.role}</Badge>
              <Badge tone={STATUS_TONE[user.status]}>{user.status}</Badge>
              <span className="text-xs text-navy-300">
                Joined {formatRelativeTime(new Date(user.createdAt))}
              </span>
            </div>
          </div>
        </div>

        {isSelf ? (
          <p className="mt-4 border-t border-navy-50 pt-3 text-sm text-navy-300">
            You can&apos;t moderate your own account from here.
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-navy-50 pt-3">
            <div className="flex flex-wrap gap-1.5">
              {USER_STATUSES.filter((s) => s !== user.status).map((s) => (
                <Button
                  key={s}
                  variant={s === "ACTIVE" ? "secondary" : "outline"}
                  className="text-xs"
                  disabled={!!statusLoading}
                  onClick={() => setStatus(s)}
                >
                  {statusLoading === s
                    ? "..."
                    : s === "ACTIVE"
                      ? "Reactivate"
                      : s === "SUSPENDED"
                        ? "Suspend"
                        : "Ban"}
                </Button>
              ))}
            </div>
            <Button variant="outline" className="text-xs" disabled={roleLoading} onClick={toggleRole}>
              {roleLoading ? "..." : user.role === "ADMIN" ? "Remove admin" : "Promote to admin"}
            </Button>
          </div>
        )}
      </Card>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-navy-900">Reviews ({user.reviews.length})</h2>
        {user.reviews.length === 0 ? (
          <p className="mt-2 text-sm text-navy-500">No reviews posted.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {user.reviews.map((r) => (
              <ContentRow
                key={r.id}
                kind="review"
                id={r.id}
                teacherId={r.teacherId}
                teacherName={r.teacherName}
                preview={r.comment}
                status={r.status}
                createdAt={r.createdAt}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-navy-900">Comments ({user.comments.length})</h2>
        {user.comments.length === 0 ? (
          <p className="mt-2 text-sm text-navy-500">No comments posted.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {user.comments.map((c) => (
              <ContentRow
                key={c.id}
                kind="comment"
                id={c.id}
                teacherId={c.teacherId}
                teacherName={c.teacherName}
                preview={c.body}
                status={c.status}
                createdAt={c.createdAt}
              />
            ))}
          </div>
        )}
      </div>

      {user.flags.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-navy-900">Flags filed ({user.flags.length})</h2>
          <div className="mt-3 space-y-2">
            {user.flags.map((f) => (
              <Card key={f.id} className="p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2 text-xs text-navy-500">
                  <Badge tone="neutral">{f.type}</Badge>
                  <span>on {f.teacherName}</span>
                  <span>·</span>
                  <Badge tone={FLAG_STATUS_TONE[f.status] ?? "neutral"}>{f.status}</Badge>
                  <span>·</span>
                  <span>{formatRelativeTime(new Date(f.createdAt))}</span>
                </div>
                <p className="mt-1 text-navy-700">{f.reason}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {user.recentActions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-navy-900">Recent admin actions on this account</h2>
          <div className="mt-3 space-y-2">
            {user.recentActions.map((a) => (
              <Card key={a.id} className="p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2 text-xs text-navy-500">
                  <Badge tone="navy">{humanizeAction(a.action)}</Badge>
                  <span>by {a.adminEmail}</span>
                  <span>·</span>
                  <span>{formatRelativeTime(new Date(a.createdAt))}</span>
                </div>
                {a.detail && <p className="mt-1 text-navy-700">{a.detail}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
