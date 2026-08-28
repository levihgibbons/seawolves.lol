import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import { hashToken } from "@/lib/tokens";
import { resetPasswordSchema } from "@/lib/validation";
import { claimUsername } from "@/lib/username";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { token, password, username } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { resetToken: hashToken(token) },
  });

  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return NextResponse.json(
      { error: "That reset link is invalid or has expired. Request a new one." },
      { status: 400 }
    );
  }

  // Only the "code verified, now create your account" step of the login
  // flow sends a username, and only for a user that doesn't have one yet —
  // a plain forgot-password reset never touches it.
  if (username && !user.username) {
    const error = await claimUsername(user.id, username);
    if (error) return NextResponse.json({ error }, { status: 400 });
  }

  const hashedPassword = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return NextResponse.json({ ok: true });
}
