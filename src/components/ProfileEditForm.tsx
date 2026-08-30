"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Avatar } from "./Avatar";
import { Button, Textarea, Input, Label, ErrorText, cx } from "./ui";
import { fileToAvatarDataUrl } from "@/lib/image";
import { ImageIcon, PencilIcon } from "./icons";

export function ProfileEditForm({
  username,
  initialBio,
  initialImage,
  usernameChangeAvailableAt,
}: {
  username: string;
  initialBio: string;
  initialImage: string;
  // ISO date string for when the user can next change their username, or
  // null if they're free to change it right now.
  usernameChangeAvailableAt: string | null;
}) {
  const router = useRouter();
  const { update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(initialBio);
  const [image, setImage] = useState(initialImage);
  const [newUsername, setNewUsername] = useState(username);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingPhoto, setProcessingPhoto] = useState(false);

  const cooldownActive = usernameChangeAvailableAt
    ? new Date(usernameChangeAvailableAt) > new Date()
    : false;
  const cooldownDate = usernameChangeAvailableAt
    ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(
        new Date(usernameChangeAvailableAt)
      )
    : null;

  function startEditing() {
    setBio(initialBio);
    setImage(initialImage);
    setNewUsername(username);
    setError(null);
    setEditing(true);
  }

  async function handlePhotoSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setError(null);
    setProcessingPhoto(true);
    try {
      setImage(await fileToAvatarDataUrl(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't process that image.");
    } finally {
      setProcessingPhoto(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const trimmedUsername = newUsername.trim();
      const usernameChanged = !cooldownActive && trimmedUsername !== username;
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          image,
          ...(usernameChanged ? { username: trimmedUsername } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      if (usernameChanged) await update({ username: trimmedUsername });
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={startEditing}
        aria-label="Edit profile"
        className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-3.5 py-1.5 text-xs font-bold text-navy-600 transition duration-200 hover:-translate-y-0.5 hover:bg-navy-100 hover:shadow-soft active:scale-95"
      >
        <PencilIcon className="h-3.5 w-3.5" />
        Edit
      </button>
    );
  }

  return (
    <div className="mt-5 rounded-2xl border border-navy-100 bg-navy-50/40 p-4 sm:p-5">
      <form onSubmit={submit} className="space-y-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={processingPhoto}
            aria-label="Change profile picture"
            className="group relative shrink-0 rounded-full"
          >
            <Avatar name={newUsername || username} photoUrl={image || null} size="md" />
            <span
              className={cx(
                "absolute inset-0 flex items-center justify-center rounded-full bg-navy-950/50 text-white transition duration-200",
                processingPhoto ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              <ImageIcon className="h-4 w-4" />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={processingPhoto}
              className="rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-navy-600 ring-1 ring-inset ring-navy-100 transition hover:bg-navy-50 disabled:opacity-50"
            >
              {processingPhoto ? "Processing…" : "Change photo"}
            </button>
            {image && (
              <button
                type="button"
                onClick={() => setImage("")}
                className="rounded-full px-2.5 py-1.5 text-xs font-bold text-navy-300 transition hover:bg-rose-50 hover:text-rose-600"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="profile-username">Username</Label>
          <Input
            id="profile-username"
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
            value={newUsername}
            disabled={cooldownActive}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-navy-400">
            {cooldownActive
              ? `You can change this again on ${cooldownDate}.`
              : "Letters, numbers and underscores. Changeable once every 30 days."}
          </p>
        </div>

        <div>
          <Label htmlFor="profile-bio">Bio</Label>
          <Textarea
            id="profile-bio"
            rows={3}
            maxLength={280}
            placeholder="Say something about yourself."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <p className="mt-1.5 text-right text-xs font-semibold tabular-nums text-navy-300">
            {bio.length}/280
          </p>
        </div>

        <ErrorText>{error}</ErrorText>

        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={loading || processingPhoto}>
            {loading ? "Saving…" : "Save"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
