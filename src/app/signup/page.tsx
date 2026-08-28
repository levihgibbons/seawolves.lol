"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button, Input, Label, ErrorText, Card } from "@/components/ui";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm px-4 py-12 sm:px-6">
        <Card className="p-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">Check your inbox</h1>
          <p className="mt-2 text-sm text-gray-600">
            We sent a verification link to <strong>{email}</strong>. You can sign in right away,
            but you&apos;ll need to verify your email before posting a review or comment.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            (No email provider is configured yet — the verification link was logged to the server
            console instead.)
          </p>
          <Link href="/login" className="mt-4 inline-block text-sm font-medium text-navy hover:underline">
            Go to sign in →
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
      <p className="mt-1 text-sm text-gray-600">Join the conversation on RateMySeawolf.</p>
      <Card className="mt-6 p-6">
        <GoogleSignInButton callbackUrl="/" />
        <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          or
          <div className="h-px flex-1 bg-gray-200" />
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name (optional, never shown publicly)</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
          <div>
            <Label htmlFor="email">School email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-gray-400">At least 8 characters.</p>
          </div>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-navy hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
