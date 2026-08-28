// Shared between the Credentials sign-up flow (src/app/api/auth/start) and
// the Google sign-in callback (src/lib/auth.ts) — both need the same
// domain allowlist and admin-bootstrap rules applied to a brand new email.

export function isAllowedEmail(email: string): boolean {
  const allowedDomain = (process.env.ALLOWED_EMAIL_DOMAIN ?? "").toLowerCase();
  return !allowedDomain || email.endsWith(`@${allowedDomain}`);
}

export function roleForEmail(email: string): string {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email) ? "ADMIN" : "STUDENT";
}
