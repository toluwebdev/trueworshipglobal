import { addComment, adjustLikes, getEngagement } from "../../server/blog-store";

type Req = {
  method?: string;
  query?: { postId?: string };
  body?: { action?: string; name?: string; email?: string; text?: string; delta?: number };
};

type Res = {
  status: (code: number) => { json: (body: unknown) => void };
  setHeader: (key: string, value: string) => void;
};

function validatePostId(postId: string | undefined): postId is string {
  return Boolean(postId && /^[a-z0-9-]{2,80}$/.test(postId));
}

export default async function handler(req: Req, res: Res) {
  const postId = req.query?.postId;

  if (!validatePostId(postId)) {
    return res.status(400).json({ error: "Invalid or missing postId" });
  }

  if (req.method === "GET") {
    try {
      const engagement = await getEngagement(postId);
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json(engagement);
    } catch (err) {
      return res.status(500).json({
        error: err instanceof Error ? err.message : "Failed to load engagement",
      });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body ?? {};

  try {
    if (body.action === "like") {
      const delta = body.delta === -1 ? -1 : 1;
      const engagement = await adjustLikes(postId, delta);
      return res.status(200).json(engagement);
    }

    if (body.action === "comment") {
      const name = body.name?.trim() ?? "";
      const email = body.email?.trim() ?? "";
      const text = body.text?.trim() ?? "";

      if (name.length < 2 || name.length > 60) {
        return res.status(400).json({ error: "Name must be 2–60 characters" });
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email address" });
      }
      if (text.length < 3 || text.length > 1000) {
        return res.status(400).json({ error: "Comment must be 3–1000 characters" });
      }

      const engagement = await addComment(postId, name, email, text);
      return res.status(200).json(engagement);
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Request failed",
    });
  }
}
