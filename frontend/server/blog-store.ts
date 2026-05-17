import fs from "node:fs/promises";
import path from "node:path";

export type BlogComment = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
};

export type PostEngagement = {
  likes: number;
  comments: BlogComment[];
};

type EngagementStore = Record<string, PostEngagement>;

const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "blog-engagement.json");
const TMP_FILE = path.join("/tmp", "twg-blog-engagement.json");

async function readStore(): Promise<EngagementStore> {
  for (const file of [CACHE_FILE, TMP_FILE]) {
    try {
      const raw = await fs.readFile(file, "utf-8");
      const parsed = JSON.parse(raw) as EngagementStore;
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // try next path
    }
  }
  return {};
}

async function writeStore(store: EngagementStore): Promise<void> {
  const payload = JSON.stringify(store, null, 2);
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(CACHE_FILE, payload, "utf-8");
    return;
  } catch {
    // fall through to tmp on read-only fs (e.g. some serverless)
  }
  try {
    await fs.writeFile(TMP_FILE, payload, "utf-8");
  } catch (err) {
    console.warn("[blog-store] failed to persist engagement:", err);
  }
}

function defaultEngagement(): PostEngagement {
  return { likes: 0, comments: [] };
}

export async function getEngagement(postId: string): Promise<PostEngagement> {
  const store = await readStore();
  return store[postId] ?? defaultEngagement();
}

export async function addComment(
  postId: string,
  name: string,
  text: string,
): Promise<PostEngagement> {
  const store = await readStore();
  const current = store[postId] ?? defaultEngagement();
  const comment: BlogComment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: name.trim(),
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  const next: PostEngagement = {
    ...current,
    comments: [comment, ...current.comments].slice(0, 200),
  };
  store[postId] = next;
  await writeStore(store);
  return next;
}

export async function adjustLikes(
  postId: string,
  delta: 1 | -1,
): Promise<PostEngagement> {
  const store = await readStore();
  const current = store[postId] ?? defaultEngagement();
  const next: PostEngagement = {
    ...current,
    likes: Math.max(0, current.likes + delta),
  };
  store[postId] = next;
  await writeStore(store);
  return next;
}
