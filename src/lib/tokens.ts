import { randomBytes, createHash } from "crypto";

// The raw token goes in the emailed link; only its hash is stored in the
// DB, so a leaked database dump can't be used to mint working
// verification/reset links.
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function tokenExpiry(hoursFromNow: number): Date {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
}
