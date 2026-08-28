"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Badge } from "@/components/ui";

export type QueueItem = {
  key: string;
  source: "report" | "auto";
  flagId?: string;
  targetType: "REVIEW" | "COMMENT";
  targetId: string;
  teacherName: string;
  teacherId: string;
  authorId: string;
  authorEmail: string;
  contentPreview: string;
  reason: string;
  reporterEmail?: string;
  createdAt: string;
};

function QueueRow({ item }: { item: QueueItem }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"remove" | "dismiss" | "suspend" | null>(null);
  const [resolved, setResolved] = useState(false);

  async function moderate(action: "REMOVE" | "DISMISS") {
    setLoading(action === "REMOVE" ? "remove" : "dismiss");
    const res = await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: item.source,
        flagId: item.flagId,
        targetType: item.targetType,
        targetId: item.targetId,
        action,
      }),
    });
    setLoading(null);
    if (res.ok) {
      setResolved(true);
      router.refresh();
    }
  }

  async function suspendAuthor() {
    if (!confirm(`Suspend the account behind this ${item.targetType.toLowerCase()}?`)) return;
    setLoading("suspend");
    await fetch(`/api/admin/users/${item.authorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SUSPENDED" }),
    });
    setLoading(null);
    router.refresh();
  }

  if (resolved) return null;

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <Badge tone={item.source === "report" ? "amber" : "neutral"}>
          {item.source === "report" ? "User report" : "Auto-flagged"}
        </Badge>
        <Badge tone="neutral">{item.targetType === "REVIEW" ? "Review" : "Comment"}</Badge>
        <span>on {item.teacherName}</span>
        <span>·</span>
        <span>{new Date(item.createdAt).toLocaleString()}</span>
      </div>

      <p className="mt-2 whitespace-pre-line text-sm text-gray-800">{item.contentPreview}</p>

      <div className="mt-2 rounded-md bg-gray-50 p-2 text-xs text-gray-600">
        <p>
          <strong>Author (internal only):</strong> {item.authorEmail}
        </p>
        {item.reporterEmail && (
          <p>
            <strong>Reported by:</strong> {item.reporterEmail}
          </p>
        )}
        <p>
          <strong>Reason:</strong> {item.reason}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="danger" className="text-xs" disabled={!!loading} onClick={() => moderate("REMOVE")}>
          {loading === "remove" ? "Removing..." : "Remove content"}
        </Button>
        <Button variant="outline" className="text-xs" disabled={!!loading} onClick={() => moderate("DISMISS")}>
          {loading === "dismiss" ? "Dismissing..." : "Dismiss"}
        </Button>
        <Button variant="ghost" className="text-xs" disabled={!!loading} onClick={suspendAuthor}>
          {loading === "suspend" ? "Suspending..." : "Suspend author"}
        </Button>
      </div>
    </Card>
  );
}

export function AdminModerationQueue({ items }: { items: QueueItem[] }) {
  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-500">The queue is empty. Nice work.</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <QueueRow key={item.key} item={item} />
      ))}
    </div>
  );
}
