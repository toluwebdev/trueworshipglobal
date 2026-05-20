import { Router } from "express";
import Event from "../../schema/eventSchema.js";
import { findEventByIdOrSlug } from "../../utils/findEvent.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const event = await findEventByIdOrSlug(req.params.slug);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
