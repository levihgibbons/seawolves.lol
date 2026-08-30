"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Button, Input, Label, Textarea, ErrorText, Card, EmptyState, cx } from "@/components/ui";
import { formatDateTimeStacked } from "@/lib/format";
import { fileToAnnouncementImageDataUrl } from "@/lib/image";
import { ImageIcon, MegaphoneIcon, PencilIcon, TrashIcon } from "@/components/icons";

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
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, not a remote asset
        <img
          src={imageUrl}
          alt=""
          className="mb-2.5 max-h-56 w-full rounded-2xl border border-navy-100 object-cover"
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
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || processing}
          className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-3.5 py-1.5 text-xs font-bold text-navy-600 transition duration-200 hover:bg-navy-100 disabled:opacity-50"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          {processing ? "Processing…" : imageUrl ? "Replace image" : "Add image"}
        </button>
        {imageUrl && (
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={disabled || processing}
            className="rounded-full px-2.5 py-1.5 text-xs font-bold text-navy-300 transition hover:bg-rose-50 hover:text-rose-600"
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
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-2 border-b border-navy-100 bg-navy-50/50 px-5 py-3.5">
        <MegaphoneIcon className="h-4 w-4 text-surf-500" />
        <h2 className="font-display text-base font-extrabold tracking-tight text-navy-900">
          New announcement
        </h2>
      </div>
      <form onSubmit={submit} className="space-y-4 p-5">
        <div>
          <Label htmlFor="ann-title">Title</Label>
          <Input
            id="ann-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's going on?"
          />
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
          {loading ? "Posting…" : "Post"}
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
    <Card className="p-5">
      <form onSubmit={submit} className="space-y-4">
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
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
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
  index,
}: {
  announcement: AnnouncementItem;
  isAdmin: boolean;
  index: number;
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
    <article
      className="animate-fade-up rounded-card border border-navy-100/80 bg-white p-5 shadow-soft transition duration-300 hover:shadow-lift"
      style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
    >
      <header className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-navy-800 text-surf-300">
          <MegaphoneIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-extrabold leading-snug tracking-tight text-navy-900">
            {announcement.title}
          </h2>
          <p className="mt-0.5 text-xs font-medium text-navy-300">
            {posted.date} · {posted.time}
            {wasEdited && " · edited"}
          </p>
        </div>
      </header>

      {announcement.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, not a remote asset
        <img
          src={announcement.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="mt-4 max-h-96 w-full rounded-2xl object-cover"
        />
      )}

      <p className="mt-3 whitespace-pre-line text-[0.9rem] leading-relaxed text-navy-700">
        {announcement.body}
      </p>

      {isAdmin && (
        <div className="mt-4 flex gap-1.5 border-t border-navy-50 pt-3.5">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold text-navy-400 transition duration-200 hover:bg-navy-50 hover:text-navy-700"
          >
            <PencilIcon className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={deleting}
            className={cx(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold text-navy-300 transition duration-200 hover:bg-rose-50 hover:text-rose-600",
              deleting && "opacity-50"
            )}
          >
            <TrashIcon className="h-3.5 w-3.5" />
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      )}
    </article>
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
    <div className="space-y-4">
      {isAdmin && <AnnouncementComposer />}
      {announcements.length === 0 ? (
        <EmptyState icon={<MegaphoneIcon className="h-6 w-6" />} title="Nothing announced yet" />
      ) : (
        announcements.map((a, i) => (
          <AnnouncementCard key={a.id} announcement={a} isAdmin={isAdmin} index={i} />
        ))
      )}
    </div>
  );
}
