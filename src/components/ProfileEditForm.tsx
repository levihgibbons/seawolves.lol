"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { Avatar } from "./Avatar";
import { Button, Textarea, Input, Label, ErrorText, Card } from "./ui";

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current">
      <path
        d="M13.5 3.5l3 3L6 17l-4 1 1-4L13.5 3.5z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(initialBio);
  const [image, setImage] = useState(initialImage);
  const [newUsername, setNewUsername] = useState(username);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
      >
        <PencilIcon />
      </button>
    );
  }

  return (
    <Card className="mt-4 p-4">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar name={newUsername || username} photoUrl={image || null} size="md" />
          <div className="flex-1">
            <Label htmlFor="profile-image">Avatar URL</Label>
            <Input
              id="profile-image"
              type="url"
              placeholder="https://..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
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
          <p className="mt-1 text-xs text-gray-400">
            {cooldownActive
              ? `You can change your username again on ${cooldownDate}.`
              : "3-20 characters: letters, numbers, and underscores. You can change this once every 30 days."}
          </p>
        </div>

        <div>
          <Label htmlFor="profile-bio">Bio</Label>
          <Textarea
            id="profile-bio"
            rows={3}
            maxLength={280}
            placeholder="Tell the squad a lil about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-400">{bio.length}/280</p>
        </div>

        <ErrorText>{error}</ErrorText>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="text-xs">
            {loading ? "Saving..." : "Save"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setEditing(false)} className="text-xs">
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
