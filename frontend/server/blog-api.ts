import type { IncomingMessage, ServerResponse } from "node:http";
import { addComment, adjustLikes, getEngagement } from "./blog-store";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function validatePostId(postId: string | null): postId is string {
  return Boolean(postId && /^[a-z0-9-]{2,80}$/.test(postId));
}

export async function handleBlogEngagementApi(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
): Promise<boolean> {
  if (!url.pathname.startsWith("/api/blog/engagement")) {
    return false;
  }

  const postId = url.searchParams.get("postId");

  if (!validatePostId(postId)) {
    sendJson(res, 400, { error: "Invalid or missing postId" });
    return true;
  }

  if (req.method === "GET") {
    try {
      const engagement = await getEngagement(postId);
      res.setHeader("Cache-Control", "no-store");
      sendJson(res, 200, engagement);
    } catch (err) {
      sendJson(res, 500, {
        error: err instanceof Error ? err.message : "Failed to load engagement",
      });
    }
    return true;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return true;
  }

  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw || "{}") as {
      action?: string;
      name?: string;
      text?: string;
      delta?: number;
    };

    if (body.action === "like") {
      const delta = body.delta === -1 ? -1 : 1;
      const engagement = await adjustLikes(postId, delta);
      sendJson(res, 200, engagement);
      return true;
    }

    if (body.action === "comment") {
      const name = body.name?.trim() ?? "";
      const text = body.text?.trim() ?? "";

      if (name.length < 2 || name.length > 60) {
        sendJson(res, 400, { error: "Name must be 2–60 characters" });
        return true;
      }
      if (text.length < 3 || text.length > 1000) {
        sendJson(res, 400, { error: "Comment must be 3–1000 characters" });
        return true;
      }

      const engagement = await addComment(postId, name, text);
      sendJson(res, 200, engagement);
      return true;
    }

    sendJson(res, 400, { error: "Unknown action" });
  } catch (err) {
    sendJson(res, 500, {
      error: err instanceof Error ? err.message : "Request failed",
    });
  }

  return true;
}
