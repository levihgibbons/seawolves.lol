import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : null;
  if (!token) {
    return NextResponse.json({ error: "Missing verification token." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { verificationToken: hashToken(token) },
  });

  if (!user) {
    return NextResponse.json(
      { error: "That verification link is invalid or has already been used." },
      { status: 400 }
    );
  }

  if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
    return NextResponse.json(
      { error: "That verification link has expired. Request a new one from the login page." },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });

  return NextResponse.json({ ok: true });
}
