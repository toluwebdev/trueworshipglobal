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
const MAX_EXTRA_EMAILS = 50;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseExtraEmails(body) {
  const raw = body?.extraEmails;
  const list = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(/[\s,;]+/)
      : [];
  return [
    ...new Set(
      list
        .map((entry) => String(entry).trim().toLowerCase())
        .filter((entry) => EMAIL_RE.test(entry)),
    ),
  ].slice(0, MAX_EXTRA_EMAILS);
}

function buildRecipientList(subscribers, extraEmails) {
  const recipients = [];
  const seen = new Set();

  for (const subscriber of subscribers) {
    const email = String(subscriber.email ?? "")
      .trim()
      .toLowerCase();
    if (!EMAIL_RE.test(email) || seen.has(email)) continue;
    seen.add(email);
    recipients.push({ email, name: subscriber.name });
  }

  for (const email of extraEmails) {
    if (seen.has(email)) continue;
    seen.add(email);
    recipients.push({ email, name: undefined });
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
    const testEmail = String(req.body?.testEmail ?? "").trim().toLowerCase();
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

    const extraEmails = parseExtraEmails(req.body);
    const subscribers = await Mailing.find().sort({ createdAt: -1 });
    const recipients = buildRecipientList(subscribers, extraEmails);

    if (recipients.length === 0) {
      return res.status(400).json({
        error: "Add subscribers to the list or enter at least one additional email.",
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

    const listCount = recipients.filter((r) => r.name).length;
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
          ? `Sent to ${sent} recipient${sent === 1 ? "" : "s"}${extraCount > 0 ? ` (${listCount} on list, ${extraCount} additional)` : ""}.`
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
