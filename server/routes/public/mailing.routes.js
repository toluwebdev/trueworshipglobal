import { Router } from "express";
import Mailing from "../../schema/mailingSchema.js";

const router = Router();

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

export default router;
