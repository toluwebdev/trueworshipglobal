import { Router } from "express";
import Mailing from "../../schema/mailingSchema.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function unsubscribeEmail(rawEmail) {
  const email = String(rawEmail ?? "")
    .trim()
    .toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, status: 400, error: "Invalid email address." };
  }

  const result = await Mailing.findOneAndDelete({ email });
  if (!result) {
    return { ok: true, status: 200, message: "You are not on our mailing list." };
  }

  return { ok: true, status: 200, message: "You have been unsubscribed." };
}

router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await Mailing.findOne({ email: normalizedEmail });
    if (existing) {
      return res.json({ ok: true, message: "Already subscribed" });
    }

    await Mailing.create({
      name: name.trim().slice(0, 120),
      email: normalizedEmail,
    });

    res.status(201).json({ ok: true });
  } catch (err) {
    if (err.code === 11000) {
      return res.json({ ok: true, message: "Already subscribed" });
    }
    res.status(400).json({ error: err.message });
  }
});

/** One-click unsubscribe (Gmail, Yahoo) — RFC 8058 */
router.post("/unsubscribe", async (req, res) => {
  try {
    const email = req.query.email ?? req.body?.email;
    const result = await unsubscribeEmail(email);
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }
    res.status(200).send("Unsubscribed");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Link in browser / email clients that use GET */
router.get("/unsubscribe", async (req, res) => {
  try {
    const email = req.query.email;
    const result = await unsubscribeEmail(email);
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }
    res.json({ ok: true, message: result.message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
