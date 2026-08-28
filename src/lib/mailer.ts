// Email transport: Resend when RESEND_API_KEY is set, otherwise falls back
// to logging the message (including the clickable link) to the server
// console — so local dev works with zero setup, and production sends real
// mail once the env vars below are configured.
//
// EMAIL_FROM must be on a domain verified with Resend (Settings > Domains
// in their dashboard, which asks for a few DNS records — SPF/DKIM — to add
// wherever the domain's DNS lives).

import { Resend } from "resend";

type Mail = {
  to: string;
  subject: string;
  body: string;
};

async function deliver(mail: Mail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    const divider = "=".repeat(60);
    console.log(
      `\n${divider}\n[dev email stub] would send email\nTo: ${mail.to}\nSubject: ${mail.subject}\n\n${mail.body}\n${divider}\n`
    );
    return;
  }

  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM ?? "RateMySeawolf <onboarding@resend.dev>";
  const { error } = await resend.emails.send({
    from,
    to: mail.to,
    subject: mail.subject,
    text: mail.body,
  });
  if (error) {
    throw new Error(`Failed to send email via Resend: ${error.message}`);
  }
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  await deliver({
    to,
    subject: "Verify your RateMySeawolf account",
    body: [
      "Welcome to RateMySeawolf!",
      "",
      "Confirm your email address to start posting reviews:",
      verifyUrl,
      "",
      "This link expires in 24 hours. If you didn't create this account, you can ignore this email.",
    ].join("\n"),
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await deliver({
    to,
    subject: "Reset your RateMySeawolf password",
    body: [
      "We received a request to reset your RateMySeawolf password.",
      "",
      resetUrl,
      "",
      "This link expires in 1 hour. If you didn't request this, you can ignore this email — your password won't change.",
    ].join("\n"),
  });
}
