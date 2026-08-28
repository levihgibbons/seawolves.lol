import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken, hashToken, tokenExpiry } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { forgotPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond with the same message whether or not the account
  // exists, so this endpoint can't be used to enumerate registered
  // emails.
  if (user) {
    const rawToken = generateToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashToken(rawToken),
        resetTokenExpiry: tokenExpiry(1),
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(email, resetUrl);
  }

  return NextResponse.json({ ok: true });
}
