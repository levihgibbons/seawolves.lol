import { prisma } from "./prisma";

// Case-insensitive uniqueness check ("Levi" and "levi" are the same
// username) backed by a case-sensitive DB unique constraint as a race-safe
// fallback. Returns an error message, or null on success.
export async function claimUsername(userId: string, username: string): Promise<string | null> {
  const taken = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" }, NOT: { id: userId } },
  });
  if (taken) return "That username is taken.";

  try {
    await prisma.user.update({ where: { id: userId }, data: { username } });
  } catch {
    return "That username is taken.";
  }
  return null;
}

export const USERNAME_CHANGE_COOLDOWN_DAYS = 30;

// Null usernameChangedAt means the user has never changed their username
// (post-onboarding) — free to change right away.
export function usernameChangeAvailableAt(usernameChangedAt: Date | null): Date | null {
  if (!usernameChangedAt) return null;
  const next = new Date(usernameChangedAt);
  next.setUTCDate(next.getUTCDate() + USERNAME_CHANGE_COOLDOWN_DAYS);
  return next;
}

// Used by PATCH /api/account/profile once a user already has a username —
// unlike claimUsername (first-time onboarding), this stamps
// usernameChangedAt, starting the 30-day cooldown. Caller is responsible
// for checking usernameChangeAvailableAt() first.
export async function changeUsername(userId: string, username: string): Promise<string | null> {
  const taken = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" }, NOT: { id: userId } },
  });
  if (taken) return "That username is taken.";

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { username, usernameChangedAt: new Date() },
    });
  } catch {
    return "That username is taken.";
  }
  return null;
}
