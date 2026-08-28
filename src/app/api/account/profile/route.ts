import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validation";
import { requireUser, handleApiError, ApiError } from "@/lib/apiAuth";

// Updates the bio/avatar shown on the caller's public seawolves.lol/<username>
// profile. Editing your own profile just requires being signed in with a
// claimed username — unlike posting reviews/comments, it doesn't need
// requireActivePostingUser's verified-email-and-not-suspended check.
export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    if (!user.username) {
      throw new ApiError(403, "Choose a username before setting up your profile.");
    }

    const body = await request.json().catch(() => null);
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input.");
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        bio: parsed.data.bio || null,
        image: parsed.data.image || null,
      },
      select: { bio: true, image: true },
    });

    return NextResponse.json({ ok: true, profile: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
