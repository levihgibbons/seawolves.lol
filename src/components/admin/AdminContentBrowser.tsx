"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CONTENT_STATUSES, type ContentStatus } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";
import { Badge, Button, Card, Input, Label } from "@/components/ui";

export type AdminContentReview = {
  id: string;
  teacherId: string;
  teacherName: string;
  authorId: string;
  authorEmail: string;
  body: string;
  status: ContentStatus;
  createdAt: string;
  clarity: number;
  fairness: number;
  workload: number | null;
  approachability: number;
};

export type AdminContentComment = {
  id: string;
  teacherId: string;
  teacherName: string;
  authorId: string;
  authorEmail: string;
  body: string;
  status: ContentStatus;
  createdAt: string;
};

const STATUS_TONE: Record<ContentStatus, "green" | "red"> = {
  VISIBLE: "green",
  REMOVED: "red",
};

const PREVIEW_LENGTH = 160;

function preview(body: string) {
  const trimmed = body.trim();
  return trimmed.length > PREVIEW_LENGTH ? `${trimmed.slice(0, PREVIEW_LENGTH)}…` : trimmed;
}

function averageRating(review: AdminContentReview) {
  const scores = [review.clarity, review.fairness, review.approachability];
  if (review.workload != null) scores.push(review.workload);
  return (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1);
}

function ContentRow({
  kind,
  item,
}: {
  kind: "REVIEW" | "COMMENT";
  item: AdminContentReview | AdminContentComment;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleStatus() {
    const next: ContentStatus = item.status === "VISIBLE" ? "REMOVED" : "VISIBLE";
    setLoading(true);
    const endpoint = kind === "REVIEW" ? "/api/admin/reviews" : "/api/admin/comments";
    const res = await fetch(`${endpoint}/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <Badge tone="neutral">{kind === "REVIEW" ? "Review" : "Comment"}</Badge>
        <span>on {item.teacherName}</span>
        {kind === "REVIEW" && (
          <>
            <span>·</span>
            <span>{averageRating(item as AdminContentReview)} avg</span>
          </>
        )}
        <span>·</span>
        <span title={item.createdAt}>{formatRelativeTime(new Date(item.createdAt))}</span>
        <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge>
      </div>

      <p className="mt-2 whitespace-pre-line text-sm text-gray-800">{preview(item.body)}</p>

      <p className="mt-2 text-xs text-gray-500">
        <strong>Author:</strong> {item.authorEmail}
      </p>

      <div className="mt-3">
        <Button
          variant={item.status === "VISIBLE" ? "danger" : "secondary"}
          className="text-xs"
          disabled={loading}
          onClick={toggleStatus}
        >
          {loading ? "..." : item.status === "VISIBLE" ? "Remove" : "Restore"}
        </Button>
      </div>
    </Card>
  );
}

export function AdminContentBrowser({
  reviews,
  comments,
}: {
  reviews: AdminContentReview[];
  comments: AdminContentComment[];
}) {
  const [tab, setTab] = useState<"REVIEW" | "COMMENT">("REVIEW");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "">("");

  const filteredReviews = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.teacherName.toLowerCase().includes(q) ||
        r.authorEmail.toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q)
      );
    });
  }, [reviews, search, statusFilter]);

  const filteredComments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return comments.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.teacherName.toLowerCase().includes(q) ||
        c.authorEmail.toLowerCase().includes(q) ||
        c.body.toLowerCase().includes(q)
      );
    });
  }, [comments, search, statusFilter]);

  const active = tab === "REVIEW" ? filteredReviews : filteredComments;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1 border-b border-gray-200">
        {(
          [
            ["REVIEW", `Reviews (${reviews.length})`],
            ["COMMENT", `Comments (${comments.length})`],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            aria-current={tab === value ? "page" : undefined}
            className={`rounded-t-md border-b-2 px-3 py-2 text-sm font-medium transition-colors duration-150 ${
              tab === value
                ? "border-navy text-navy"
                : "border-transparent text-gray-600 hover:border-navy hover:text-navy"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 basis-60">
          <Label htmlFor="content-search">Search</Label>
          <Input
            id="content-search"
            placeholder="Search teacher, author email, or content"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="basis-40">
          <Label htmlFor="content-status">Status</Label>
          <select
            id="content-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ContentStatus | "")}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors duration-150 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
          >
            <option value="">All</option>
            {CONTENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "VISIBLE" ? "Visible" : "Removed"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {active.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">No matching content.</p>
      ) : (
        <div className="space-y-2">
          {tab === "REVIEW"
            ? filteredReviews.map((r) => <ContentRow key={r.id} kind="REVIEW" item={r} />)
            : filteredComments.map((c) => <ContentRow key={c.id} kind="COMMENT" item={c} />)}
        </div>
      )}
    </div>
  );
}
