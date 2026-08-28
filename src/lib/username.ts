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
