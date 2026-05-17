import { Router } from "express";
import Mailing from "../../schema/mailingSchema.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const subscribers = await Mailing.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
