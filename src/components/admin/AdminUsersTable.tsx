"use client";

import { useMemo, useState } from "react";
import { AdminUserRow } from "@/components/admin/AdminUserRow";
import { Input, Label } from "@/components/ui";
import { USER_STATUSES, type UserStatus } from "@/lib/constants";

export type AdminUserListItem = {
  id: string;
  email: string;
  role: string;
  status: UserStatus;
  reviewCount: number;
};

export function AdminUsersTable({
  users,
  currentUserId,
}: {
  users: AdminUserListItem[];
  currentUserId?: string;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (statusFilter && u.status !== statusFilter) return false;
      if (!q) return true;
      return u.email.toLowerCase().includes(q);
    });
  }, [users, search, statusFilter]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 basis-60">
          <Label htmlFor="user-search">Search</Label>
          <Input
            id="user-search"
            placeholder="Search by email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="basis-48">
          <Label htmlFor="user-status-filter">Status</Label>
          <select
            id="user-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | "")}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors duration-150 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
          >
            <option value="">All statuses</option>
            {USER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">No matching users.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase text-gray-500">
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Reviews</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <AdminUserRow
                  key={u.id}
                  id={u.id}
                  email={u.email}
                  role={u.role}
                  status={u.status}
                  reviewCount={u.reviewCount}
                  isSelf={u.id === currentUserId}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
