import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken, hashToken, tokenExpiry } from "@/lib/tokens";
import { verifyCodeSchema } from "@/lib/validation";

// On success, hands back a short-lived reset token — the same mechanism
// the forgot-password flow uses — which the client immediately submits to
// the existing /api/auth/reset-password route to set the account's first
// password. Reusing that route means there's exactly one place that
// writes hashedPassword from a token.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = verifyCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
  }
  const { email, code } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (
    !user ||
    !user.verificationToken ||
    user.verificationToken !== hashToken(code) ||
    !user.verificationTokenExpiry ||
    user.verificationTokenExpiry < new Date()
  ) {
    return NextResponse.json({ error: "That code is incorrect or has expired." }, { status: 400 });
  }

  const resetToken = generateToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
      verificationTokenExpiry: null,
      resetToken: hashToken(resetToken),
      resetTokenExpiry: tokenExpiry(0.25), // 15 minutes to finish choosing a password
    },
  });

  return NextResponse.json({ token: resetToken });
}
