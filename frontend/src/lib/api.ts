import { API_BASE } from "./env";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || `Request failed (${res.status})`,
    );
  }
  return data as T;
}

export type ApiBlog = {
  _id: string;
  imageUrl: string;
  title: string;
  genre: string;
  content: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  registerUrl?: string;
};

export type ApiEvent = {
  _id: string;
  slug?: string;
  title: string;
  description: string;
  imageUrl: string;
  registerUrl: string;
  date: string;
  time: string;
  location: string;
};

export type ApiWorshipClass = ApiEvent;

export const cmsApi = {
  blogs: {
    list: () => request<ApiBlog[]>("/api/blogs"),
    get: (id: string) => request<ApiBlog>(`/api/blogs/${id}`),
  },
  events: {
    list: () => request<ApiEvent[]>("/api/events"),
    get: (slug: string) => request<ApiEvent>(`/api/events/${encodeURIComponent(slug)}`),
  },
  worshipSchool: {
    list: () => request<ApiWorshipClass[]>("/api/worship-school"),
    get: (slug: string) =>
      request<ApiWorshipClass>(`/api/worship-school/${encodeURIComponent(slug)}`),
  },
  mailing: {
    subscribe: (name: string, email: string) =>
      request<{ ok: boolean; message?: string }>("/api/mailing", {
        method: "POST",
        body: JSON.stringify({ name, email }),
      }),
  },
};

export function formatBlogDate(publishedAt: string | null, createdAt?: string): string {
  const raw = publishedAt || createdAt;
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function blogExcerpt(content: string, max = 160): string {
  const plain = content.replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trim()}…`;
}

export function contentParagraphs(content: string): string[] {
  return content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function classSubtitle(item: ApiWorshipClass): string {
  return eventSubtitle(item);
}

export function isClassUpcoming(date: string): boolean {
  return isEventUpcoming(date);
}

export function eventSubtitle(event: ApiEvent): string {
  const d = new Date(event.date);
  const dateLabel = Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
  const parts = [dateLabel, event.time, event.location].filter(Boolean);
  return parts.join(" · ");
}

export function isEventUpcoming(date: string): boolean {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d >= today;
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function getEventSlug(event: ApiEvent): string {
  return event.slug || slugifyTitle(event.title);
}

export function getEventPath(event: ApiEvent): string {
  return `/events/${getEventSlug(event)}`;
}

export function getWorshipClassSlug(item: ApiWorshipClass): string {
  return item.slug || slugifyTitle(item.title);
}

export function getWorshipClassPath(item: ApiWorshipClass): string {
  return `/worship-school/${getWorshipClassSlug(item)}`;
}
