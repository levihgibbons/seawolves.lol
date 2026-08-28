"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button, Card, ErrorText } from "@/components/ui";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    if (!token) return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification failed.");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12 sm:px-6">
      <Card className="p-6 text-center">
        {!token ? (
          <>
            <h1 className="text-xl font-bold text-gray-900">Missing verification link</h1>
            <p className="mt-2 text-sm text-gray-600">
              Open the verification link from your email, or request a new one from your account
              page.
            </p>
          </>
        ) : status === "done" ? (
          <>
            <h1 className="text-xl font-bold text-gray-900">Email verified</h1>
            <p className="mt-2 text-sm text-gray-600">
              You&apos;re all set — you can now post reviews and comments.
            </p>
            <Link href="/teachers" className="mt-4 inline-block text-sm font-medium text-navy hover:underline">
              View Roster →
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-gray-900">Confirm your email</h1>
            <p className="mt-2 text-sm text-gray-600">
              Click below to confirm this is you. We ask for a click (rather than verifying
              automatically) so an email scanner or link-preview bot can&apos;t silently use up
              your one-time link.
            </p>
            <ErrorText>{error}</ErrorText>
            <Button className="mt-4" onClick={confirm} disabled={status === "loading"}>
              {status === "loading" ? "Verifying..." : "Verify my email"}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
