import { curatedVideos, type VideoItem } from "../src/assets/videos";

export const DEFAULT_YOUTUBE_CHANNEL_HANDLE = "woleemmanuel";

type YoutubeEnv = {
  YOUTUBE_CHANNEL_ID?: string;
  YOUTUBE_CHANNEL_HANDLE?: string;
};

const channelIdCache = new Map<string, string>();
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const FETCH_TIMEOUT_MS = 12_000;

const SKIP_TITLE =
  /full episode|unlocking the secrets|how to put a smile|ep\d+\s*["']?$/i;

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9",
        ...init?.headers,
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function decodeXml(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export function cleanVideoTitle(raw: string): string {
  let title = raw
    .replace(/\s*#\w+/g, "")
    .replace(/\s*\|\s*Official Video.*$/i, "")
    .replace(/\s*\|\s*Lyric Video.*$/i, "")
    .replace(/\s*-\s*Wole Emmanuel.*$/i, "")
    .replace(/\s*-\s*WOLE EMMANUEL.*$/i, "")
    .replace(/\s*\|\s*Wole Emmanuel.*$/i, "")
    .replace(/\s*-\s*Pst\.?\s*Wole Emmanuel.*$/i, "")
    .replace(/\s*\|\s*WORSHIP FLAMES.*$/i, "")
    .replace(/\s*feat\.[^|-]+/i, "")
    .replace(/\s*ft\.[^|-]+/i, "")
    .trim();

  if (title.length > 36) {
    const segment = title.split(/\s*[-|]\s*/)[0]?.trim();
    title = segment && segment.length >= 4 ? segment : title.slice(0, 36).trim();
  }

  if (/\s+AT\s+/i.test(title) && title.length > 28) {
    title = title.split(/\s+AT\s+/i)[0]?.trim() ?? title;
  }

  return title.toUpperCase();
}

export async function resolveChannelId(handle: string): Promise<string> {
  const normalized = handle.replace(/^@/, "").trim();
  if (!normalized) throw new Error("YouTube channel handle is empty");

  const cached = channelIdCache.get(normalized);
  if (cached) return cached;

  const res = await fetchWithTimeout(`https://www.youtube.com/@${normalized}`);
  if (!res.ok) {
    throw new Error(`Could not resolve YouTube channel @${normalized} (${res.status})`);
  }

  const html = await res.text();
  const patterns = [
    /"channelId":"(UC[^"]+)"/,
    /"externalId":"(UC[^"]+)"/,
    /channel_id=(UC[\w-]+)/,
    /"browseId":"(UC[^"]+)"/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      channelIdCache.set(normalized, match[1]);
      return match[1];
    }
  }

  throw new Error(`Could not find channel ID for @${normalized}`);
}

async function getChannelId(env: YoutubeEnv): Promise<string> {
  const explicitId = env.YOUTUBE_CHANNEL_ID?.trim();
  if (explicitId) return explicitId;

  const handle =
    env.YOUTUBE_CHANNEL_HANDLE?.trim() || DEFAULT_YOUTUBE_CHANNEL_HANDLE;
  return resolveChannelId(handle);
}

function parseVideosFromRss(xml: string, limit: number): VideoItem[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  const videos: VideoItem[] = [];

  for (const entry of entries) {
    if (videos.length >= limit) break;

    const videoId =
      entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ??
      entry.match(/<id>yt:video:([^<]+)<\/id>/)?.[1];

    const title = entry.match(/<title>([^<]+)<\/title>/)?.[1];
    if (!videoId || !title) continue;

    const raw = decodeXml(title);
    if (SKIP_TITLE.test(raw)) continue;

    videos.push({
      id: videoId,
      title: cleanVideoTitle(raw),
      youtubeVideoId: videoId,
    });
  }

  return videos;
}

async function getVideosFromRss(channelId: string, limit: number): Promise<VideoItem[]> {
  const res = await fetchWithTimeout(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
  );
  if (!res.ok) throw new Error(`RSS feed failed (${res.status})`);
  return parseVideosFromRss(await res.text(), limit);
}

async function fetchVideoIdsFromVideosTab(handle: string): Promise<string[]> {
  const res = await fetchWithTimeout(`https://www.youtube.com/@${handle}/videos`);
  if (!res.ok) throw new Error(`Could not load @${handle}/videos (${res.status})`);

  const html = await res.text();
  const seen = new Set<string>();
  const ids: string[] = [];

  for (const match of html.matchAll(/\/vi\/([a-zA-Z0-9_-]{11})\//g)) {
    if (seen.has(match[1])) continue;
    seen.add(match[1]);
    ids.push(match[1]);
  }

  return ids;
}

async function fetchVideoMeta(videoId: string) {
  const res = await fetchWithTimeout(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
  );
  if (!res.ok) return null;

  const data = (await res.json()) as { title?: string };
  if (!data.title) return null;
  return data.title;
}

async function getVideosFromVideosTab(
  handle: string,
  limit: number,
): Promise<VideoItem[]> {
  const ids = await fetchVideoIdsFromVideosTab(handle);
  const videos: VideoItem[] = [];

  for (const id of ids) {
    if (videos.length >= limit) break;

    const rawTitle = await fetchVideoMeta(id);
    if (!rawTitle || SKIP_TITLE.test(rawTitle)) continue;

    videos.push({
      id,
      title: cleanVideoTitle(rawTitle),
      youtubeVideoId: id,
    });
  }

  return videos;
}

export async function getChannelVideos(
  env: YoutubeEnv,
  limit = 12,
): Promise<VideoItem[]> {
  const handle =
    env.YOUTUBE_CHANNEL_HANDLE?.trim() || DEFAULT_YOUTUBE_CHANNEL_HANDLE;

  try {
    const channelId = await getChannelId(env);
    const rssVideos = await getVideosFromRss(channelId, limit);
    if (rssVideos.length > 0) return rssVideos;
  } catch {
    /* try videos tab */
  }

  try {
    const tabVideos = await getVideosFromVideosTab(handle, limit);
    if (tabVideos.length > 0) return tabVideos;
  } catch {
    /* use curated */
  }

  return curatedVideos.slice(0, limit);
}
