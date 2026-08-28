import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCode, hashToken } from "@/lib/tokens";
import { sendVerificationCodeEmail } from "@/lib/mailer";
import { isAllowedEmail, roleForEmail } from "@/lib/accountPolicy";
import { startSchema } from "@/lib/validation";

// Entry point for the unified "just enter your email" flow: tells the
// client which step comes next, without ever saying outright whether an
// email is registered (mirrors the login form's existing generic-error
// policy — see src/lib/auth.ts).
//   - "password"    an account with a password exists — show the password field
//   - "google-only" a verified, password-less account exists — point at Google
//   - "code"        new email (or an abandoned, never-finished signup) —
//                    a fresh 6-digit code was just emailed

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = startSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const { email } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing?.hashedPassword) {
    return NextResponse.json({ mode: "password" });
  }

  if (existing?.emailVerified) {
    return NextResponse.json({ mode: "google-only" });
  }

  // No account, or a pending signup (code sent, never completed) — both
  // get a fresh code, unless one was already sent moments ago.
  const lastSentAt = existing?.verificationTokenExpiry
    ? existing.verificationTokenExpiry.getTime() - CODE_TTL_MS
    : 0;
  if (Date.now() - lastSentAt < RESEND_COOLDOWN_MS) {
    return NextResponse.json({ mode: "code" });
  }

  if (!existing && !isAllowedEmail(email)) {
    const allowedDomain = (process.env.ALLOWED_EMAIL_DOMAIN ?? "").toLowerCase();
    return NextResponse.json(
      { error: `Sign-up is restricted to @${allowedDomain} email addresses.` },
      { status: 400 }
    );
  }

  const code = generateCode();
  const verificationTokenExpiry = new Date(Date.now() + CODE_TTL_MS);

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { verificationToken: hashToken(code), verificationTokenExpiry },
    });
  } else {
    await prisma.user.create({
      data: {
        email,
        role: roleForEmail(email),
        verificationToken: hashToken(code),
        verificationTokenExpiry,
      },
    });
  }

  await sendVerificationCodeEmail(email, code);
  return NextResponse.json({ mode: "code" });
}
