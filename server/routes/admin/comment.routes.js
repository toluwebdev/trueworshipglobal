import { Router } from "express";
import Comment from "../../schema/CommentSchema.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const comments = await Comment.find()
      .populate("blogId", "title")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
