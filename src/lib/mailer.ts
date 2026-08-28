// STUB email transport.
//
// No real email provider (Resend, Postmark, SES, ...) is wired up. Instead
// of sending mail, every function here logs the message — including the
// clickable link — to the server console. This is enough to develop and
// demo the full verification / password-reset flow locally.
//
// Before launch: implement `deliver()` using a real provider's SDK/API,
// gated on RESEND_API_KEY (or equivalent) being set. Everything that calls
// sendVerificationEmail / sendPasswordResetEmail elsewhere in the app can
// stay unchanged.

type Mail = {
  to: string;
  subject: string;
  body: string;
};

async function deliver(mail: Mail): Promise<void> {
  const divider = "=".repeat(60);
  console.log(
    `\n${divider}\n[dev email stub] would send email\nTo: ${mail.to}\nSubject: ${mail.subject}\n\n${mail.body}\n${divider}\n`
  );
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
