import { Router } from "express";
import Comment from "../../schema/CommentSchema.js";
import Like from "../../schema/likeSchema.js";
import Blog from "../../schema/BlogSchema.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapComment(c) {
  return {
    id: c._id.toString(),
    name: c.name,
    email: c.email,
    text: c.comment,
    createdAt: c.createdAt,
  };
}

router.get("/", async (_req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true }).sort({ publishedAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, isPublished: true });
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/engagement", async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, isPublished: true });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const [likes, comments] = await Promise.all([
      Like.countDocuments({ blogId: blog._id }),
      Comment.find({ blogId: blog._id }).sort({ createdAt: -1 }),
    ]);

    res.json({
      likes,
      comments: comments.map(mapComment),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/like", async (req, res) => {
  try {
    const { visitorId } = req.body;
    if (!visitorId || typeof visitorId !== "string") {
      return res.status(400).json({ error: "visitorId is required" });
    }

    const blog = await Blog.findOne({ _id: req.params.id, isPublished: true });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const existing = await Like.findOne({ blogId: blog._id, visitorId });
    if (existing) {
      await existing.deleteOne();
    } else {
      await Like.create({ blogId: blog._id, visitorId });
    }

    const [likes, comments] = await Promise.all([
      Like.countDocuments({ blogId: blog._id }),
      Comment.find({ blogId: blog._id }).sort({ createdAt: -1 }),
    ]);

    res.json({
      likes,
      liked: !existing,
      comments: comments.map(mapComment),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/comments", async (req, res) => {
  try {
    const { name, email, comment } = req.body;
    const trimmedName = name?.trim() ?? "";
    const trimmedEmail = email?.trim() ?? "";
    const trimmedComment = comment?.trim() ?? "";

    if (!trimmedName || !trimmedEmail || !trimmedComment) {
      return res.status(400).json({ error: "Name, email, and comment are required" });
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    const blog = await Blog.findOne({ _id: req.params.id, isPublished: true });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    await Comment.create({
      blogId: blog._id,
      name: trimmedName.slice(0, 60),
      email: trimmedEmail.slice(0, 120),
      comment: trimmedComment.slice(0, 1000),
    });

    const [likes, comments] = await Promise.all([
      Like.countDocuments({ blogId: blog._id }),
      Comment.find({ blogId: blog._id }).sort({ createdAt: -1 }),
    ]);

    res.status(201).json({
      likes,
      comments: comments.map(mapComment),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
