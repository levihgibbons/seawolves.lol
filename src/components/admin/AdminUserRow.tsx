"use client";

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
    <tr className="border-b border-gray-100 last:border-0">
      <td className="px-4 py-2 text-sm text-gray-800">
        {email} {isSelf && <span className="text-xs text-gray-400">(you)</span>}
      </td>
      <td className="px-4 py-2 text-sm text-gray-500">{role}</td>
      <td className="px-4 py-2 text-sm text-gray-500">{reviewCount}</td>
      <td className="px-4 py-2">
        <Badge tone={STATUS_TONE[status]}>{status}</Badge>
      </td>
      <td className="px-4 py-2">
        {!isSelf && (
          <div className="flex flex-wrap gap-1.5">
            {USER_STATUSES.filter((s) => s !== status).map((s) => (
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
        )}
      </td>
    </tr>
  );
}
