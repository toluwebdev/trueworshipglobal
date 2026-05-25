import { Router } from "express";
import Mailing from "../../schema/mailingSchema.js";
import {
  getSiteUrl,
  isMailConfigured,
  sendNewsletterEmail,
} from "../../utils/mail.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SEND_DELAY_MS = 250;
const MAX_EXTRA_RECIPIENTS = 50;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

function parseExtraRecipients(body) {
  const raw = body?.extraRecipients ?? body?.extraEmails;
  const items = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(/[\s,;]+/) : [];
  const recipients = [];

  for (const item of items) {
    if (typeof item === "string") {
      const email = normalizeEmail(item);
      if (EMAIL_RE.test(email)) {
        recipients.push({ email, name: undefined });
      }
      continue;
    }
    if (item && typeof item === "object" && typeof item.email === "string") {
      const email = normalizeEmail(item.email);
      const name = String(item.name ?? "").trim() || undefined;
      if (EMAIL_RE.test(email)) {
        recipients.push({ email, name });
      }
    }
  }

  const seen = new Set();
  return recipients
    .filter((entry) => {
      if (seen.has(entry.email)) return false;
      seen.add(entry.email);
      return true;
    })
    .slice(0, MAX_EXTRA_RECIPIENTS);
}

function buildRecipientList(subscribers, extraRecipients, includeMailingList) {
  const recipients = [];
  const seen = new Set();

  if (includeMailingList) {
    for (const subscriber of subscribers) {
      const email = normalizeEmail(subscriber.email);
      if (!EMAIL_RE.test(email) || seen.has(email)) continue;
      seen.add(email);
      recipients.push({
        email,
        name: String(subscriber.name ?? "").trim() || undefined,
      });
    }
  }

  for (const extra of extraRecipients) {
    if (seen.has(extra.email)) continue;
    seen.add(extra.email);
    recipients.push({ email: extra.email, name: extra.name });
  }

  return recipients;
}

router.get("/", async (_req, res) => {
  try {
    const subscribers = await Mailing.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/status", (_req, res) => {
  res.json({ configured: isMailConfigured() });
});

router.post("/send", async (req, res) => {
  try {
    if (!isMailConfigured()) {
      return res.status(503).json({
        error: "Email is not configured. Add SMTP settings to the server environment.",
      });
    }

    const subject = String(req.body?.subject ?? "").trim();
    const message = String(req.body?.message ?? "").trim();
    const testEmail = normalizeEmail(req.body?.testEmail);
    const images = Array.isArray(req.body?.images)
      ? req.body.images
          .filter((u) => typeof u === "string" && u.startsWith("https://"))
          .slice(0, 10)
      : [];

    if (!subject || subject.length > 200) {
      return res.status(400).json({ error: "Subject is required (max 200 characters)." });
    }
    if (!message && images.length === 0) {
      return res.status(400).json({ error: "Add a message or at least one image." });
    }
    if (message.length > 20000) {
      return res.status(400).json({ error: "Message is too long (max 20,000 characters)." });
    }

    const siteUrl = getSiteUrl();

    if (testEmail) {
      if (!EMAIL_RE.test(testEmail)) {
        return res.status(400).json({ error: "Invalid test email address." });
      }
      await sendNewsletterEmail({
        to: testEmail,
        subject,
        message,
        siteUrl,
        images,
        recipientName: String(req.body?.testName ?? "").trim() || undefined,
      });
      return res.json({
        ok: true,
        test: true,
        sent: 1,
        failed: 0,
        message: `Test email sent to ${testEmail}`,
      });
    }

    const includeMailingList = req.body?.includeMailingList !== false;
    const extraRecipients = parseExtraRecipients(req.body);
    const subscribers = await Mailing.find().sort({ createdAt: -1 });
    const recipients = buildRecipientList(subscribers, extraRecipients, includeMailingList);

    if (recipients.length === 0) {
      return res.status(400).json({
        error: "Select the mailing list and/or add at least one other recipient.",
      });
    }

    let sent = 0;
    const failures = [];

    for (const recipient of recipients) {
      try {
        await sendNewsletterEmail({
          to: recipient.email,
          subject,
          message,
          siteUrl,
          images,
          recipientName: recipient.name,
        });
        sent += 1;
      } catch (err) {
        failures.push({
          email: recipient.email,
          error: err instanceof Error ? err.message : "Send failed",
        });
      }
      await sleep(SEND_DELAY_MS);
    }

    const subscriberEmails = new Set(
      subscribers.map((s) => normalizeEmail(s.email)).filter((e) => EMAIL_RE.test(e)),
    );
    const listCount = recipients.filter((r) => subscriberEmails.has(r.email)).length;
    const extraCount = recipients.length - listCount;

    res.json({
      ok: failures.length === 0,
      sent,
      failed: failures.length,
      total: recipients.length,
      listCount,
      extraCount,
      failures: failures.slice(0, 20),
      message:
        failures.length === 0
          ? `Sent to ${sent} recipient${sent === 1 ? "" : "s"}${extraCount > 0 ? ` (${listCount} on list, ${extraCount} other)` : ""}.`
          : `Sent to ${sent} of ${recipients.length}. ${failures.length} failed.`,
    });
  } catch (err) {
    console.error("[mailing/send]", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Could not send newsletter",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const entry = await Mailing.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ error: "Subscriber not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
