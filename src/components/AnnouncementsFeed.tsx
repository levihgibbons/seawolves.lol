"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Button, Input, Label, Textarea, ErrorText, Card } from "@/components/ui";
import { formatDateTimeStacked } from "@/lib/format";
import { fileToAnnouncementImageDataUrl } from "@/lib/image";

// No author field on purpose — announcements are posted anonymously as "the
// admins," not attributed to whichever admin happened to post them. (Who
// posted/edited/deleted is still tracked internally in the audit log.)
export type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

function ImagePicker({
  imageUrl,
  onChange,
  disabled,
}: {
  imageUrl: string;
  onChange: (dataUrl: string) => void;
  disabled?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setProcessing(true);
    try {
      onChange(await fileToAnnouncementImageDataUrl(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't process that image.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div>
      <Label>Image (optional)</Label>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, not a remote asset
        <img
          src={imageUrl}
          alt=""
          className="mb-2 max-h-48 w-full rounded-md border border-gray-200 object-cover"
        />
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleSelect}
        className="hidden"
        disabled={disabled || processing}
      />
      <div className="flex items-center gap-3 text-xs">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || processing}
          className="font-medium text-navy hover:underline disabled:opacity-50"
        >
          {processing ? "Processing..." : imageUrl ? "Choose a different image" : "Choose image"}
        </button>
        {imageUrl && (
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={disabled || processing}
            className="text-gray-400 hover:text-gray-600"
          >
            Remove
          </button>
        )}
      </div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

function AnnouncementComposer() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
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
        body: JSON.stringify({ title, body, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setTitle("");
      setBody("");
      setImageUrl("");
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
        <ImagePicker imageUrl={imageUrl} onChange={setImageUrl} disabled={loading} />
        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post announcement"}
        </Button>
      </form>
    </Card>
  );
}

function AnnouncementEditForm({
  announcement,
  onCancel,
  onSaved,
}: {
  announcement: AnnouncementItem;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(announcement.title);
  const [body, setBody] = useState(announcement.body);
  const [imageUrl, setImageUrl] = useState(announcement.imageUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/announcements/${announcement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4">
      <form onSubmit={submit} className="space-y-3">
        <div>
          <Label htmlFor={`edit-title-${announcement.id}`}>Title</Label>
          <Input
            id={`edit-title-${announcement.id}`}
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`edit-body-${announcement.id}`}>Message</Label>
          <Textarea
            id={`edit-body-${announcement.id}`}
            required
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <ImagePicker imageUrl={imageUrl} onChange={setImageUrl} disabled={loading} />
        <ErrorText>{error}</ErrorText>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="text-xs">
            {loading ? "Saving..." : "Save"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading} className="text-xs">
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

function AnnouncementCard({
  announcement,
  isAdmin,
}: {
  announcement: AnnouncementItem;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    if (!confirm("Delete this announcement?")) return;
    setDeleting(true);
    const res = await fetch(`/api/announcements/${announcement.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) router.refresh();
  }

  if (editing) {
    return (
      <AnnouncementEditForm
        announcement={announcement}
        onCancel={() => setEditing(false)}
        onSaved={() => {
          setEditing(false);
          router.refresh();
        }}
      />
    );
  }

  const wasEdited = announcement.updatedAt !== announcement.createdAt;
  const posted = formatDateTimeStacked(new Date(announcement.createdAt));

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-gray-900">{announcement.title}</p>
        <div className="shrink-0 text-right text-xs leading-tight text-gray-400">
          <div>{posted.date}</div>
          <div>
            {posted.time}
            {wasEdited && " · edited"}
          </div>
        </div>
      </div>
      {announcement.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, not a remote asset
        <img
          src={announcement.imageUrl}
          alt=""
          className="mt-2 max-h-96 w-full rounded-md object-cover"
        />
      )}
      <p className="mt-1.5 whitespace-pre-line text-sm text-gray-700">{announcement.body}</p>
      {isAdmin && (
        <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
          <Button variant="ghost" onClick={() => setEditing(true)} className="text-xs">
            Edit
          </Button>
          <Button variant="ghost" onClick={remove} disabled={deleting} className="text-xs">
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      )}
    </Card>
  );
}

export function AnnouncementsFeed({
  announcements,
  isAdmin,
}: {
  announcements: AnnouncementItem[];
  isAdmin: boolean;
}) {
  return (
    <div className="mt-8 space-y-4">
      {isAdmin && <AnnouncementComposer />}
      {announcements.length === 0 ? (
        <Card className="mx-auto max-w-md p-8 text-center">
          <p className="font-medium text-gray-900">No announcements yet.</p>
          <p className="mt-1.5 text-sm text-gray-500">Check back later.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}
