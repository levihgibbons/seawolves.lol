// Email transport: Resend when RESEND_API_KEY is set, otherwise falls back
// to logging the message (including the clickable link) to the server
// console — so local dev works with zero setup, and production sends real
// mail once the env vars below are configured.
//
// EMAIL_FROM must be on a domain verified with Resend (Settings > Domains
// in their dashboard, which asks for a few DNS records — SPF/DKIM — to add
// wherever the domain's DNS lives).

import { Resend } from "resend";
import { renderEmail } from "./emailTemplates";

type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

async function deliver(mail: Mail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    const divider = "=".repeat(60);
    console.log(
      `\n${divider}\n[dev email stub] would send email\nTo: ${mail.to}\nSubject: ${mail.subject}\n\n${mail.text}\n${divider}\n`
    );
    return;
  }

  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM ?? "RateMySeawolf <onboarding@resend.dev>";
  const { error } = await resend.emails.send({
    from,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });
  if (error) {
    throw new Error(`Failed to send email via Resend: ${error.message}`);
  }
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  const { html, text } = renderEmail({
    heading: "Welcome to RateMySeawolf!",
    intro: "Confirm your email address to start posting reviews.",
    ctaText: "Verify email",
    ctaUrl: verifyUrl,
    footnote: "This link expires in 24 hours. If you didn't create this account, you can ignore this email.",
  });
  await deliver({ to, subject: "Verify your RateMySeawolf account", html, text });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const { html, text } = renderEmail({
    heading: "Reset your password",
    intro: "We received a request to reset your RateMySeawolf password.",
    ctaText: "Reset password",
    ctaUrl: resetUrl,
    footnote:
      "This link expires in 1 hour. If you didn't request this, you can ignore this email — your password won't change.",
  });
  await deliver({ to, subject: "Reset your RateMySeawolf password", html, text });
}
