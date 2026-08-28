import { NextResponse } from "next/server";
import { auth } from "./auth";
import { prisma } from "./prisma";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError(401, "You must be signed in.");
  }
  return session.user;
}

export async function requireVerifiedUser() {
  const user = await requireUser();
  if (!user.emailVerified) {
    throw new ApiError(403, "Please verify your email before posting.");
  }
  return user;
}

// A JWT session can outlive a mid-session ban/suspension. Anything that
// writes content (posting a review/comment, voting, flagging) should call
// this instead of requireVerifiedUser so a freshly banned user is cut off
// immediately rather than at next login.
export async function requireActivePostingUser() {
  const user = await requireVerifiedUser();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.status !== "ACTIVE") {
    throw new ApiError(403, "Your account is not able to post right now.");
  }
  if (!dbUser.username) {
    throw new ApiError(403, "Choose a username before posting.");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new ApiError(403, "Admin access required.");
  }
  return user;
}

export function handleApiError(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}
