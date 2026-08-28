// Shared HTML shell for transactional emails — kept deliberately simple
// (no images, no external CSS/fonts, everything inline) since email
// clients strip embedded stylesheets unpredictably and remote images are
// themselves a spam signal. Every send goes out as both HTML and a plain
// text alternative (see mailer.ts) — a text-only part is itself something
// spam filters check for.

const NAVY = "#003260";
const STEEL = "#4a7fa7";
const STEEL_LIGHT = "#eaf1f6";
const INK = "#111827";
const MUTED = "#6b7280";
const FAINT = "#9ca3af";
const BORDER = "#d9e3ea";

function shell(contentHtml: string): string {
  return `
<div style="background:${STEEL_LIGHT};padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:8px;border:1px solid ${BORDER};overflow:hidden;">
    <div style="background:${NAVY};padding:18px 24px;">
      <span style="color:#ffffff;font-size:17px;font-weight:700;">seawolves.lol</span>
    </div>
    <div style="padding:28px 24px;">
      ${contentHtml}
    </div>
  </div>
</div>`.trim();
}

export function renderCodeEmail({
  heading,
  intro,
  code,
  footnote,
}: {
  heading: string;
  intro: string;
  code: string;
  footnote: string;
}): { html: string; text: string } {
  const html = shell(`
    <h1 style="margin:0 0 12px;font-size:19px;line-height:1.3;color:${INK};">${heading}</h1>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:${INK};">${intro}</p>
    <div style="text-align:center;margin:0 0 24px;">
      <div style="display:inline-block;background:${STEEL_LIGHT};border-radius:8px;padding:14px 22px;font-size:30px;font-weight:700;letter-spacing:8px;color:${NAVY};font-family:ui-monospace,SFMono-Regular,Consolas,monospace;">${code}</div>
    </div>
    <p style="margin:0;font-size:12px;line-height:1.5;color:${MUTED};">${footnote}</p>
  `);

  const text = [heading, "", intro, "", `Your code: ${code}`, "", footnote].join("\n");

  return { html, text };
}

export function renderCtaEmail({
  heading,
  intro,
  ctaText,
  ctaUrl,
  footnote,
}: {
  heading: string;
  intro: string;
  ctaText: string;
  ctaUrl: string;
  footnote: string;
}): { html: string; text: string } {
  const html = shell(`
    <h1 style="margin:0 0 12px;font-size:19px;line-height:1.3;color:${INK};">${heading}</h1>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:${INK};">${intro}</p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${ctaUrl}" style="background:${NAVY};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:6px;display:inline-block;">${ctaText}</a>
    </div>
    <p style="margin:0 0 4px;font-size:12px;color:${FAINT};">Or paste this link into your browser:</p>
    <p style="margin:0 0 20px;font-size:12px;word-break:break-all;color:${STEEL};">${ctaUrl}</p>
    <p style="margin:0;font-size:12px;line-height:1.5;color:${MUTED};">${footnote}</p>
  `);

  const text = [heading, "", intro, "", ctaUrl, "", footnote].join("\n");

  return { html, text };
}
