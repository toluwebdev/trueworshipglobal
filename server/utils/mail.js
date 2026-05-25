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

function escapeAttrUrl(url) {
  return url.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
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

function emailImageUrl(url) {
  const trimmed = url.trim();
  if (trimmed.includes("res.cloudinary.com") && trimmed.includes("/upload/")) {
    const parts = trimmed.split("/upload/");
    if (parts.length === 2) {
      return `${parts[0]}/upload/w_560,c_limit,f_auto,q_auto/${parts[1]}`;
    }
  }
  return trimmed;
}

function buildImagesHtml(images = []) {
  const safe = images.filter((u) => typeof u === "string" && u.startsWith("https://"));
  if (safe.length === 0) return "";

  return safe
    .map((url) => {
      const src = escapeAttrUrl(emailImageUrl(url));
      return `<p style="margin:16px 0;"><img src="${src}" alt="" style="max-width:100%;height:auto;display:block;" /></p>`;
    })
    .join("");
}

function greetingLine(recipientName) {
  const name = String(recipientName ?? "").trim();
  if (!name) return "";
  const first = name.split(/\s+/)[0];
  return first ? `Hi ${first},\n\n` : "";
}

function useBulkListHeaders() {
  return process.env.MAIL_USE_LIST_HEADERS === "true";
}

export function buildNewsletterPlainText({
  message,
  siteUrl,
  toEmail,
  fromEmail,
  images = [],
  recipientName,
}) {
  const { webPage } = buildUnsubscribeUrls(toEmail);
  const origin = siteUrl || getSiteUrl() || "https://trueworshipglobal.com";
  const lines = [greetingLine(recipientName) + message, ""];
  const safeImages = images.filter((u) => typeof u === "string" && u.startsWith("https://"));
  if (safeImages.length > 0) {
    safeImages.forEach((url) => lines.push(url));
    lines.push("");
  }
  lines.push(origin);
  if (webPage) {
    lines.push(`Unsubscribe: ${webPage}`);
  }
  lines.push(`Reply to ${fromEmail}`);
  return lines.join("\n");
}

export function buildNewsletterHtml({
  message,
  siteUrl,
  toEmail,
  fromEmail,
  images = [],
  recipientName,
}) {
  const bodyHtml = escapeHtml(message).replace(/\n/g, "<br />");
  const imagesHtml = buildImagesHtml(images);
  const origin = siteUrl || getSiteUrl() || "https://trueworshipglobal.com";
  const { webPage } = buildUnsubscribeUrls(toEmail);
  const safeFrom = escapeHtml(fromEmail);
  const name = String(recipientName ?? "").trim();
  const first = name ? name.split(/\s+/)[0] : "";
  const greeting = first
    ? `<p style="margin:0 0 16px;">Hi ${escapeHtml(first)},</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:16px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.55;color:#222;">
  ${greeting}
  <p style="margin:0 0 16px;">${bodyHtml}</p>
  ${imagesHtml}
  <p style="margin:24px 0 0;font-size:13px;color:#666;">
    <a href="${escapeAttrUrl(origin)}" style="color:#666;">${escapeHtml(origin)}</a><br />
    ${webPage ? `<a href="${escapeAttrUrl(webPage)}" style="color:#666;">Unsubscribe</a><br />` : ""}
    <a href="mailto:${safeFrom}" style="color:#666;">${safeFrom}</a>
  </p>
</body>
</html>`;
}

function buildListHeaders(toEmail, fromEmail) {
  if (!useBulkListHeaders()) return {};

  const { oneClick, webPage } = buildUnsubscribeUrls(toEmail);
  const headers = {};

  if (oneClick) {
    const mailto = `mailto:${fromEmail}?subject=${encodeURIComponent("Unsubscribe")}`;
    headers["List-Unsubscribe"] = webPage
      ? `<${oneClick}>, <${mailto}>`
      : `<${oneClick}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  return headers;
}

export async function sendNewsletterEmail({
  to,
  subject,
  message,
  siteUrl,
  images = [],
  recipientName,
}) {
  const { fromEmail, fromName, user } = getMailConfig();
  const transport = getTransporter();
  const origin = siteUrl || getSiteUrl();
  const safeImages = images.filter((u) => typeof u === "string" && u.startsWith("https://"));
  const text = buildNewsletterPlainText({
    message,
    siteUrl: origin,
    toEmail: to,
    fromEmail,
    images: safeImages,
    recipientName,
  });
  const headers = buildListHeaders(to, fromEmail);

  const mail = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
    replyTo: process.env.SMTP_REPLY_TO?.trim() || fromEmail,
    envelope: {
      from: user || fromEmail,
      to,
    },
    headers,
  };

  if (safeImages.length > 0) {
    mail.html = buildNewsletterHtml({
      message,
      siteUrl: origin,
      toEmail: to,
      fromEmail,
      images: safeImages,
      recipientName,
    });
  }

  await transport.sendMail(mail);
}

export async function verifyMailConnection() {
  const transport = getTransporter();
  await transport.verify();
}
