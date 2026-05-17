import { Router } from "express";
import Blog from "../../schema/BlogSchema.js";
import Event from "../../schema/eventSchema.js";
import Comment from "../../schema/CommentSchema.js";
import Mailing from "../../schema/mailingSchema.js";
import Like from "../../schema/likeSchema.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [blogs, events, comments, subscribers, likes] = await Promise.all([
      Blog.countDocuments(),
      Event.countDocuments(),
      Comment.countDocuments(),
      Mailing.countDocuments(),
      Like.countDocuments(),
    ]);

    res.json({ blogs, events, comments, subscribers, likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
