"use client";

import { useMemo, useState } from "react";
import { Badge, Card, Input, Label } from "@/components/ui";
import { formatRelativeTime } from "@/lib/format";
import { ADMIN_ACTIONS } from "@/lib/auditLog";

export type AuditLogEntry = {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  detail: string | null;
  createdAt: string;
  adminEmail: string;
  adminUsername: string | null;
};

function humanizeAction(action: string) {
  const lower = action.toLowerCase().replace(/_/g, " ");
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function AdminAuditLogList({ entries }: { entries: AuditLogEntry[] }) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (actionFilter && e.action !== actionFilter) return false;
      if (!q) return true;
      return (
        (e.detail ?? "").toLowerCase().includes(q) ||
        e.adminEmail.toLowerCase().includes(q) ||
        (e.adminUsername ?? "").toLowerCase().includes(q)
      );
    });
  }, [entries, search, actionFilter]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 basis-60">
          <Label htmlFor="audit-search">Search</Label>
          <Input
            id="audit-search"
            placeholder="Search detail, admin email, or username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="basis-48">
          <Label htmlFor="audit-action">Action</Label>
          <select
            id="audit-action"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 transition-colors duration-150 focus:border-navy-800 focus:ring-1 focus:ring-surf-400"
          >
            <option value="">All actions</option>
            {ADMIN_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {humanizeAction(a)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-navy-500">No matching audit log entries.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => (
            <Card key={e.id} className="p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-navy-500">
                <span title={e.createdAt}>{formatRelativeTime(new Date(e.createdAt))}</span>
                <span>·</span>
                <Badge tone="navy">{humanizeAction(e.action)}</Badge>
                <span>·</span>
                <span>{e.adminUsername ?? e.adminEmail}</span>
                <span>·</span>
                <Badge tone="neutral">{e.targetType}</Badge>
              </div>
              {e.detail && <p className="mt-2 text-sm text-navy-800">{e.detail}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
