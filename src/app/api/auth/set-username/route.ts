import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setUsernameSchema } from "@/lib/validation";
import { claimUsername } from "@/lib/username";
import { requireUser, handleApiError, ApiError } from "@/lib/apiAuth";

// Used by /choose-username — the gate an already-authenticated user (most
// often a Google sign-in, which never passes through a form) hits when
// they don't have a username yet. See src/proxy.ts for the redirect.
export async function POST(request: Request) {
  try {
    const sessionUser = await requireUser();
    const body = await request.json().catch(() => null);
    const parsed = setUsernameSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid username.");
    }

    const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
    if (!user) throw new ApiError(401, "You must be signed in.");
    if (user.username) throw new ApiError(400, "You already have a username.");

    const error = await claimUsername(user.id, parsed.data.username);
    if (error) throw new ApiError(400, error);

    return NextResponse.json({ ok: true, username: parsed.data.username });
  } catch (err) {
    return handleApiError(err);
  }
}
