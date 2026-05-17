import { Router } from "express";
import Blog from "../../schema/BlogSchema.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { imageUrl, title, genre, content, isPublished } = req.body;
    const blog = await Blog.create({
      imageUrl,
      title,
      genre,
      content,
      isPublished: Boolean(isPublished),
      publishedAt: isPublished ? new Date() : null,
    });
    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const existing = await Blog.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Blog not found" });

    const { imageUrl, title, genre, content, isPublished } = req.body;
    const nextPublished = Boolean(isPublished);

    existing.imageUrl = imageUrl ?? existing.imageUrl;
    existing.title = title ?? existing.title;
    existing.genre = genre ?? existing.genre;
    existing.content = content ?? existing.content;
    existing.isPublished = nextPublished;
    if (nextPublished && !existing.publishedAt) {
      existing.publishedAt = new Date();
    }
    if (!nextPublished) {
      existing.publishedAt = null;
    }

    await existing.save();
    res.json(existing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
