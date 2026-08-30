import { prisma } from "./prisma";

// Several people can hold the ADMIN role on this site, so every mutating
// admin action gets a row here — "who removed this review / banned this
// account / promoted this user, and when" needs to be answerable after the
// fact. See src/app/admin/audit-log/page.tsx for the reader.
export const ADMIN_ACTIONS = [
  "REMOVE_REVIEW",
  "RESTORE_REVIEW",
  "REMOVE_COMMENT",
  "RESTORE_COMMENT",
  "DISMISS_REPORT",
  "SUSPEND_USER",
  "BAN_USER",
  "REACTIVATE_USER",
  "PROMOTE_ADMIN",
  "DEMOTE_ADMIN",
  "CREATE_TEACHER",
  "UPDATE_TEACHER",
  "DEACTIVATE_TEACHER",
  "REACTIVATE_TEACHER",
  "POST_ANNOUNCEMENT",
  "UPDATE_ANNOUNCEMENT",
  "DELETE_ANNOUNCEMENT",
] as const;
export type AdminActionType = (typeof ADMIN_ACTIONS)[number];

export const ADMIN_ACTION_TARGET_TYPES = [
  "REVIEW",
  "COMMENT",
  "USER",
  "TEACHER",
  "ANNOUNCEMENT",
] as const;
export type AdminActionTargetType = (typeof ADMIN_ACTION_TARGET_TYPES)[number];

// Fire-and-forget by design: a failed audit write shouldn't roll back or
// block the moderation action it's describing. Errors are swallowed after
// logging server-side rather than thrown.
export async function logAdminAction(params: {
  adminId: string;
  action: AdminActionType;
  targetType: AdminActionTargetType;
  targetId?: string | null;
  detail?: string | null;
}) {
  try {
    await prisma.adminAction.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId ?? null,
        detail: params.detail ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to write admin audit log entry", err);
  }
}
