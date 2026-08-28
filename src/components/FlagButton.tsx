"use client";

import { useState } from "react";
import { Button, Textarea, ErrorText } from "./ui";

export function FlagButton({ endpoint, isSignedIn }: { endpoint: string; isSignedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!isSignedIn) return null;

  if (status === "done") {
    return <span className="text-xs text-gray-500">Reported — thank you.</span>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-gray-400 hover:text-red-600"
      >
        Report
      </button>
    );
  }

  return (
    <form
      className="mt-2 w-full max-w-sm space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("loading");
        setError(null);
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Failed to report.");
          setStatus("done");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to report.");
          setStatus("idle");
        }
      }}
    >
      <label className="block text-xs font-medium text-gray-600">
        Why are you reporting this? (e.g. personal attack, off-topic, harassment)
      </label>
      <Textarea
        required
        minLength={3}
        rows={2}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="text-sm"
      />
      <ErrorText>{error}</ErrorText>
      <div className="flex gap-2">
        <Button type="submit" variant="danger" disabled={status === "loading"} className="text-xs">
          Submit report
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-xs">
          Cancel
        </Button>
      </div>
    </form>
  );
}
