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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

    if (!subject || subject.length > 200) {
      return res.status(400).json({ error: "Subject is required (max 200 characters)." });
    }
    if (!message || message.length > 20000) {
      return res.status(400).json({ error: "Message is required (max 20,000 characters)." });
    }

    const siteUrl = getSiteUrl();

    if (testEmail) {
      if (!EMAIL_RE.test(testEmail)) {
        return res.status(400).json({ error: "Invalid test email address." });
      }
      await sendNewsletterEmail({ to: testEmail, subject, message, siteUrl });
      return res.json({
        ok: true,
        test: true,
        sent: 1,
        failed: 0,
        message: `Test email sent to ${testEmail}`,
      });
    }

    const subscribers = await Mailing.find().sort({ createdAt: -1 });
    if (subscribers.length === 0) {
      return res.status(400).json({ error: "No subscribers on the mailing list." });
    }

    let sent = 0;
    const failures = [];

    for (const subscriber of subscribers) {
      try {
        await sendNewsletterEmail({
          to: subscriber.email,
          subject,
          message,
          siteUrl,
        });
        sent += 1;
      } catch (err) {
        failures.push({
          email: subscriber.email,
          error: err instanceof Error ? err.message : "Send failed",
        });
      }
      await sleep(SEND_DELAY_MS);
    }

    res.json({
      ok: failures.length === 0,
      sent,
      failed: failures.length,
      total: subscribers.length,
      failures: failures.slice(0, 20),
      message:
        failures.length === 0
          ? `Sent to ${sent} subscriber${sent === 1 ? "" : "s"}.`
          : `Sent to ${sent} of ${subscribers.length}. ${failures.length} failed.`,
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
