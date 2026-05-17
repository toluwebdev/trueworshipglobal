import { API_BASE } from "./env";

export type BlogComment = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
};

export type PostEngagement = {
  likes: number;
  comments: BlogComment[];
  liked?: boolean;
};

const LIKED_KEY = (postId: string) => `twg-blog-liked-${postId}`;
const VISITOR_KEY = "twg-visitor-id";

export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return `v-${Date.now()}`;
  }
}

export function getLikedLocally(postId: string): boolean {
  try {
    return localStorage.getItem(LIKED_KEY(postId)) === "1";
  } catch {
    return false;
  }
}

export function setLikedLocally(postId: string, liked: boolean): void {
  try {
    if (liked) localStorage.setItem(LIKED_KEY(postId), "1");
    else localStorage.removeItem(LIKED_KEY(postId));
  } catch {
    // ignore
  }
}

export async function fetchEngagement(postId: string): Promise<PostEngagement> {
  const res = await fetch(
    `${API_BASE}/api/blogs/${encodeURIComponent(postId)}/engagement`,
  );

  const body = (await res.json().catch(() => ({}))) as PostEngagement & { error?: string };
  if (!res.ok) {
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return body;
}

export async function toggleLikeApi(postId: string): Promise<PostEngagement> {
  const res = await fetch(`${API_BASE}/api/blogs/${encodeURIComponent(postId)}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorId: getVisitorId() }),
  });

  const data = (await res.json().catch(() => ({}))) as PostEngagement & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Like failed (${res.status})`);
  }
  return data;
}

export async function postCommentApi(
  postId: string,
  name: string,
  text: string,
): Promise<PostEngagement> {
  const res = await fetch(`${API_BASE}/api/blogs/${encodeURIComponent(postId)}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, comment: text }),
  });

  const data = (await res.json().catch(() => ({}))) as PostEngagement & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Comment failed (${res.status})`);
  }
  return data;
}

export function getPostShareUrl(postId: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/blog/${postId}`;
  }
  return `/blog/${postId}`;
}

export function getShareLinks(url: string, title: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return {
    twitter: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    whatsapp: `https://wa.me/?text=${t}%20${u}`,
  };
}
