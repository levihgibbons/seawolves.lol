"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { USER_STATUSES, type UserStatus } from "@/lib/constants";
import { Badge, Button } from "@/components/ui";

const STATUS_TONE: Record<UserStatus, "green" | "amber" | "red"> = {
  ACTIVE: "green",
  SUSPENDED: "amber",
  BANNED: "red",
};

export function AdminUserRow({
  id,
  email,
  role,
  status,
  reviewCount,
  isSelf,
}: {
  id: string;
  email: string;
  role: string;
  status: UserStatus;
  reviewCount: number;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<UserStatus | null>(null);

  async function setStatus(next: UserStatus) {
    if (next === "BANNED" && !confirm("Ban this account? They will not be able to sign in.")) return;
    setLoading(next);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <tr className="border-b border-navy-50 last:border-0">
      <td className="px-4 py-2 text-sm text-navy-800">
        {email} {isSelf && <span className="text-xs text-navy-300">(you)</span>}
      </td>
      <td className="px-4 py-2 text-sm text-navy-500">{role}</td>
      <td className="px-4 py-2 text-sm text-navy-500">{reviewCount}</td>
      <td className="px-4 py-2">
        <Badge tone={STATUS_TONE[status]}>{status}</Badge>
      </td>
      <td className="px-4 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Link href={`/admin/users/${id}`} className="text-xs font-medium text-navy-800 hover:underline">
            View
          </Link>
          {!isSelf &&
            USER_STATUSES.filter((s) => s !== status).map((s) => (
              <Button
                key={s}
                variant={s === "ACTIVE" ? "secondary" : "outline"}
                className="text-xs"
                disabled={!!loading}
                onClick={() => setStatus(s)}
              >
                {loading === s ? "..." : s === "ACTIVE" ? "Reactivate" : s === "SUSPENDED" ? "Suspend" : "Ban"}
              </Button>
            ))}
        </div>
      </td>
    </tr>
  );
}
