import { Router } from "express";
import WorshipSchoolClass from "../../schema/worshipSchoolClassSchema.js";
import {
  assignWorshipClassSlug,
  findWorshipClassByIdOrSlug,
} from "../../utils/findWorshipClass.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const classes = await WorshipSchoolClass.find().sort({ date: -1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const item = await findWorshipClassByIdOrSlug(req.params.slug);
    if (!item) {
      return res.status(404).json({ error: "Class not found" });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const item = new WorshipSchoolClass(req.body);
    await assignWorshipClassSlug(item);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const item = await WorshipSchoolClass.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Class not found" });
    }

    const titleChanged = req.body.title && req.body.title !== item.title;
    Object.assign(item, req.body);

    if (titleChanged || !item.slug) {
      await assignWorshipClassSlug(item);
    }

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const item = await WorshipSchoolClass.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Class not found" });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
