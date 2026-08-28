import { randomBytes, randomInt, createHash } from "crypto";

// The raw token goes in the emailed link; only its hash is stored in the
// DB, so a leaked database dump can't be used to mint working
// verification/reset links.
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

// A short code for the email-first sign-up flow — shown in the email body
// and typed back in, so it has to stay human-enterable. Hashed and stored
// the same way as the long-form token above; the code's short length is
// offset by a 10-minute expiry (see start/route.ts).
export function generateCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function tokenExpiry(hoursFromNow: number): Date {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
}
