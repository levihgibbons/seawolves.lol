"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { Button, Input, Label, ErrorText } from "@/components/ui";

export function ChooseUsernameForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const { update } = useSession();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      await update({ username: data.username });
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          required
          autoFocus
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9_]+"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          placeholder="seawolf24"
        />
        <p className="mt-1.5 text-xs text-navy-400">
          3–20 characters: letters, numbers and underscores.
        </p>
      </div>
      <ErrorText>{error}</ErrorText>
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={loading || username.trim().length < 3}
      >
        {loading ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
