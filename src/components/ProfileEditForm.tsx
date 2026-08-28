"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Avatar } from "./Avatar";
import { Button, Textarea, Input, Label, ErrorText, Card } from "./ui";

export function ProfileEditForm({
  username,
  initialBio,
  initialImage,
}: {
  username: string;
  initialBio: string;
  initialImage: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(initialBio);
  const [image, setImage] = useState(initialImage);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
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
      <Button variant="outline" onClick={() => setEditing(true)} className="text-xs">
        Edit profile
      </Button>
    );
  }

  return (
    <Card className="mt-3 p-4">
      <form onSubmit={submit} className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar name={username} photoUrl={image || null} size="md" />
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
