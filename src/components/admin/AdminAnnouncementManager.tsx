"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Input, Label, Textarea, ErrorText, Card } from "@/components/ui";
import { formatRelativeTime } from "@/lib/format";

export type AdminAnnouncement = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  authorUsername: string | null;
};

function PostAnnouncementForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setTitle("");
      setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold text-gray-900">Post an announcement</h2>
      <p className="mt-1 text-xs text-gray-500">
        Goes out to everyone via the bell icon in the header.
      </p>
      <form onSubmit={submit} className="mt-3 space-y-3">
        <div>
          <Label htmlFor="ann-title">Title</Label>
          <Input id="ann-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="ann-body">Message</Label>
          <Textarea
            id="ann-body"
            required
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post announcement"}
        </Button>
      </form>
    </Card>
  );
}

function AnnouncementRow({ announcement }: { announcement: AdminAnnouncement }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!confirm("Delete this announcement?")) return;
    setLoading(true);
    const res = await fetch(`/api/announcements/${announcement.id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-gray-900">{announcement.title}</p>
          <p className="mt-0.5 whitespace-pre-line text-sm text-gray-600">{announcement.body}</p>
          <p className="mt-1.5 text-xs text-gray-400">
            {formatRelativeTime(new Date(announcement.createdAt))}
            {announcement.authorUsername && ` · @${announcement.authorUsername}`}
          </p>
        </div>
        <Button variant="ghost" onClick={remove} disabled={loading} className="shrink-0 text-xs">
          Delete
        </Button>
      </div>
    </Card>
  );
}

export function AdminAnnouncementManager({
  announcements,
}: {
  announcements: AdminAnnouncement[];
}) {
  return (
    <div className="space-y-4">
      <PostAnnouncementForm />
      <div className="space-y-1.5">
        {announcements.length === 0 ? (
          <p className="text-sm text-gray-500">No announcements yet.</p>
        ) : (
          announcements.map((a) => <AnnouncementRow key={a.id} announcement={a} />)
        )}
      </div>
    </div>
  );
}
