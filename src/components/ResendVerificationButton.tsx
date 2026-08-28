"use client";

import { useState } from "react";
import { Button } from "./ui";

export function ResendVerificationButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  if (status === "done") {
    return <p className="text-sm text-green-700">Verification email sent — check the server console.</p>;
  }

  return (
    <Button
      variant="secondary"
      disabled={status === "loading"}
      onClick={async () => {
        setStatus("loading");
        await fetch("/api/auth/resend-verification", { method: "POST" });
        setStatus("done");
      }}
    >
      {status === "loading" ? "Sending..." : "Resend verification email"}
    </Button>
  );
}
