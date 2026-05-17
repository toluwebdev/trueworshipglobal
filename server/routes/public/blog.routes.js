import { Router } from "express";
import Comment from "../../schema/CommentSchema.js";
import Like from "../../schema/likeSchema.js";
import Blog from "../../schema/BlogSchema.js";

const router = Router();

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
      comments: comments.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        text: c.comment,
        createdAt: c.createdAt,
      })),
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
      comments: comments.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        text: c.comment,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/comments", async (req, res) => {
  try {
    const { name, comment } = req.body;
    if (!name?.trim() || !comment?.trim()) {
      return res.status(400).json({ error: "Name and comment are required" });
    }

    const blog = await Blog.findOne({ _id: req.params.id, isPublished: true });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    await Comment.create({
      blogId: blog._id,
      name: name.trim().slice(0, 60),
      comment: comment.trim().slice(0, 1000),
    });

    const [likes, comments] = await Promise.all([
      Like.countDocuments({ blogId: blog._id }),
      Comment.find({ blogId: blog._id }).sort({ createdAt: -1 }),
    ]);

    res.status(201).json({
      likes,
      comments: comments.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        text: c.comment,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
