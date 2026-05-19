import { Router } from "express";
import Blog from "../../schema/BlogSchema.js";
import Event from "../../schema/eventSchema.js";
import WorshipSchoolClass from "../../schema/worshipSchoolClassSchema.js";
import Comment from "../../schema/CommentSchema.js";
import Mailing from "../../schema/mailingSchema.js";
import Like from "../../schema/likeSchema.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [blogs, events, worshipSchoolClasses, comments, subscribers, likes] =
      await Promise.all([
        Blog.countDocuments(),
        Event.countDocuments(),
        WorshipSchoolClass.countDocuments(),
        Comment.countDocuments(),
        Mailing.countDocuments(),
        Like.countDocuments(),
      ]);

    res.json({ blogs, events, worshipSchoolClasses, comments, subscribers, likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
