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

export default router;
