"use client";

import { useState } from "react";
import { Button, Textarea, ErrorText, cx, META_ACTION } from "./ui";
import { FlagIcon } from "./icons";

export function FlagButton({ endpoint, isSignedIn }: { endpoint: string; isSignedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!isSignedIn) return null;

  if (status === "done") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
        Reported — thanks
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cx(META_ACTION, "text-navy-300 hover:bg-rose-50 hover:text-rose-600")}
      >
        <FlagIcon className="h-3.5 w-3.5" />
        Report
      </button>
    );
  }

  return (
    <form
      className="mt-2 w-full max-w-md animate-scale-in space-y-2.5 rounded-2xl border border-navy-100 bg-navy-50/50 p-3.5"
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
      <label className="block text-xs font-bold text-navy-600">What&apos;s wrong with this?</label>
      <Textarea
        required
        minLength={3}
        rows={2}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Personal attack, off-topic, harassment…"
      />
      <ErrorText>{error}</ErrorText>
      <div className="flex gap-2">
        <Button type="submit" variant="danger" size="sm" disabled={status === "loading"}>
          {status === "loading" ? "Sending…" : "Send report"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
