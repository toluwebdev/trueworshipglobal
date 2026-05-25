import nodemailer from "nodemailer";

function resolveSmtpUser() {
  const raw = process.env.SMTP_USER?.trim() ?? "";
  if (!raw) return "";
  if (raw.includes("@")) return raw;
  return `hello@${raw}`;
}

function getFromDomain(fromEmail) {
  const at = fromEmail.lastIndexOf("@");
  return at > 0 ? fromEmail.slice(at + 1) : "";
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

export function getPublicApiBase() {
  const explicit = process.env.PUBLIC_API_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "";
}

export function getSiteUrl() {
  return (process.env.SITE_URL || process.env.FRONTEND_URL || "").replace(/\/$/, "");
}

export function isMailConfigured() {
  const { user, pass, fromEmail } = getMailConfig();
  return Boolean(user && pass && fromEmail);
}

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { host, port, user, pass, secure, fromEmail } = getMailConfig();
  if (!user || !pass) {
    throw new Error("Email is not configured. Set SMTP_USER and SMTP_PASS on the server.");
  }

  if (fromEmail.toLowerCase() !== user.toLowerCase()) {
    console.warn(
      "[mail] SMTP_FROM should match SMTP_USER for better deliverability (SPF/DKIM alignment).",
    );
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { minVersion: "TLSv1.2" },
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

export function buildUnsubscribeUrls(toEmail) {
  const apiBase = getPublicApiBase();
  const siteUrl = getSiteUrl();
  const encoded = encodeURIComponent(toEmail);
  const oneClick = apiBase
    ? `${apiBase}/api/mailing/unsubscribe?email=${encoded}`
    : siteUrl
      ? `${siteUrl}/unsubscribe?email=${encoded}`
      : "";
  const webPage = siteUrl ? `${siteUrl}/unsubscribe?email=${encoded}` : oneClick;
  return { oneClick, webPage, encoded };
}

export function buildNewsletterPlainText({ subject, message, siteUrl, toEmail, fromEmail }) {
  const { webPage, oneClick } = buildUnsubscribeUrls(toEmail);
  const origin = siteUrl || getSiteUrl() || "https://trueworshipglobal.com";
  const lines = [
    "TRUE WORSHIP GLOBAL",
    "",
    subject,
    "",
    message,
    "",
    "---",
    `You subscribed at ${origin}.`,
  ];
  if (webPage) {
    lines.push(`Unsubscribe: ${webPage}`);
  }
  if (oneClick && oneClick !== webPage) {
    lines.push(`One-click unsubscribe: ${oneClick}`);
  }
  lines.push("", `Reply to this email (${fromEmail}) if you need help.`);
  return lines.join("\n");
}

export function buildNewsletterHtml({ subject, message, siteUrl, toEmail, fromEmail }) {
  const safeSubject = escapeHtml(subject);
  const bodyHtml = escapeHtml(message).replace(/\n/g, "<br />");
  const origin = siteUrl || getSiteUrl() || "https://trueworshipglobal.com";
  const { webPage } = buildUnsubscribeUrls(toEmail);
  const safeFrom = escapeHtml(fromEmail);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;color:#222222;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #e5e5e5;">
          <tr>
            <td style="padding:24px 28px 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#8a7340;">
              True Worship Global
            </td>
          </tr>
          <tr>
            <td style="padding:4px 28px 16px;font-size:20px;line-height:1.4;color:#111111;font-weight:bold;">
              ${safeSubject}
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;font-size:15px;line-height:1.65;color:#333333;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;font-size:14px;line-height:1.5;">
              <a href="${origin}" style="color:#8a7340;">Visit our website</a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 24px;font-size:12px;line-height:1.6;color:#666666;border-top:1px solid #eeeeee;">
              You received this because you joined our mailing list at ${escapeHtml(origin)}.<br />
              ${webPage ? `<a href="${webPage}" style="color:#666666;">Unsubscribe</a> · ` : ""}
              <a href="mailto:${safeFrom}" style="color:#666666;">Contact ${safeFrom}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildListHeaders(toEmail, fromEmail) {
  const { oneClick, webPage } = buildUnsubscribeUrls(toEmail);
  const domain = getFromDomain(fromEmail);
  const headers = {};

  if (oneClick) {
    const mailto = `mailto:${fromEmail}?subject=${encodeURIComponent("Unsubscribe")}`;
    headers["List-Unsubscribe"] = webPage
      ? `<${oneClick}>, <${mailto}>`
      : `<${oneClick}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  if (domain) {
    headers["List-ID"] = `<mailing.${domain}>`;
  }

  return headers;
}

export async function sendNewsletterEmail({ to, subject, message, siteUrl }) {
  const { fromEmail, fromName, user } = getMailConfig();
  const transport = getTransporter();
  const origin = siteUrl || getSiteUrl();
  const html = buildNewsletterHtml({
    subject,
    message,
    siteUrl: origin,
    toEmail: to,
    fromEmail,
  });
  const text = buildNewsletterPlainText({
    subject,
    message,
    siteUrl: origin,
    toEmail: to,
    fromEmail,
  });
  const headers = buildListHeaders(to, fromEmail);
  const domain = getFromDomain(fromEmail);

  await transport.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
    replyTo: process.env.SMTP_REPLY_TO?.trim() || fromEmail,
    envelope: {
      from: user || fromEmail,
      to,
    },
    headers,
    messageId: domain
      ? `<${Date.now()}.${Math.random().toString(36).slice(2)}@mailing.${domain}>`
      : undefined,
  });
}

export async function verifyMailConnection() {
  const transport = getTransporter();
  await transport.verify();
}
