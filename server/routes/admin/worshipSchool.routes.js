import { Router } from "express";
import WorshipSchoolClass from "../../schema/worshipSchoolClassSchema.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const classes = await WorshipSchoolClass.find().sort({ date: -1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await WorshipSchoolClass.findById(req.params.id);
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
    const item = await WorshipSchoolClass.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const item = await WorshipSchoolClass.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ error: "Class not found" });
    }
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
