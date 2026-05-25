import nodemailer from "nodemailer";

function resolveSmtpUser() {
  const raw = process.env.SMTP_USER?.trim() ?? "";
  if (!raw) return "";
  if (raw.includes("@")) return raw;
  return `hello@${raw}`;
}

function getMailConfig() {
  const host = process.env.SMTP_HOST?.trim() || "smtp.hostinger.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = resolveSmtpUser();
  const pass = process.env.SMTP_PASS?.trim() ?? "";
  const fromEmail = process.env.SMTP_FROM?.trim() || user;
  const fromName = process.env.SMTP_FROM_NAME?.trim() || "True Worship Global";
  const secure =
    process.env.SMTP_SECURE !== "false" && (port === 465 || process.env.SMTP_SECURE === "true");

  return { host, port, user, pass, fromEmail, fromName, secure };
}

export function isMailConfigured() {
  const { user, pass, fromEmail } = getMailConfig();
  return Boolean(user && pass && fromEmail);
}

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { host, port, user, pass, secure } = getMailConfig();
  if (!user || !pass) {
    throw new Error("Email is not configured. Set SMTP_USER and SMTP_PASS on the server.");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildNewsletterHtml({ subject, message, siteUrl }) {
  const safeSubject = escapeHtml(subject);
  const bodyHtml = escapeHtml(message).replace(/\n/g, "<br />");
  const origin = siteUrl || "https://trueworshipglobal.com";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#141414;border:1px solid #2a2a2a;">
          <tr>
            <td style="padding:28px 32px 8px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#c9a227;">
              True Worship Global
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 24px;font-size:22px;line-height:1.35;color:#ffffff;">
              ${safeSubject}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;font-size:16px;line-height:1.75;color:#e8e8e8;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;font-size:13px;line-height:1.6;color:#888888;">
              You are receiving this because you joined our mailing list at
              <a href="${origin}" style="color:#c9a227;">${origin}</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendNewsletterEmail({ to, subject, message, siteUrl }) {
  const { fromEmail, fromName } = getMailConfig();
  const transport = getTransporter();
  const html = buildNewsletterHtml({ subject, message, siteUrl });
  const text = message;

  await transport.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
    replyTo: process.env.SMTP_REPLY_TO?.trim() || fromEmail,
  });
}

export async function verifyMailConnection() {
  const transport = getTransporter();
  await transport.verify();
}
