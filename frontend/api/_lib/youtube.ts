import { curatedVideos, type VideoItem } from "../../src/assets/videos.js";

export const DEFAULT_YOUTUBE_CHANNEL_HANDLE = "woleemmanuel";
export const CHANNEL_VIDEOS_URL = "https://www.youtube.com/@woleemmanuel/videos";

type YoutubeEnv = {
  YOUTUBE_CHANNEL_HANDLE?: string;
};

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const FETCH_TIMEOUT_MS = 20_000;
const CACHE_MS = 10 * 60 * 1000;

const SKIP_TITLE =
  /full episode|unlocking the secrets|how to put a smile|ep\d+\s*["']?$/i;

let videoCache: { at: number; videos: VideoItem[] } | null = null;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

export function cleanVideoTitle(raw: string): string {
  let title = raw
    .replace(/\\u0026/g, "&")
    .replace(/\\"/g, '"')
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

function parseVideosFromVideosPage(html: string, limit: number): VideoItem[] {
  const seen = new Set<string>();
  const videos: VideoItem[] = [];

  for (const match of html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)) {
    const id = match[1];
    if (seen.has(id)) continue;

    const idx = match.index ?? html.indexOf(`"videoId":"${id}"`);
    const chunk = html.slice(idx, idx + 6000);

    const rawTitle =
      chunk.match(/"content":"([^"\\]{3,120})","style":"VERTICAL/)?.[1] ??
      chunk.match(/"text":"([^"\\]{3,120})"\}\],"accessibility":/)?.[1] ??
      chunk.match(/"simpleText":"([^"\\]{3,120})"/)?.[1];

    if (!rawTitle) continue;

    const decoded = rawTitle.replace(/\\u0026/g, "&").replace(/\\"/g, '"');
    if (/keyboard|playback|spherical|general/i.test(decoded)) continue;
    if (SKIP_TITLE.test(decoded)) continue;

    seen.add(id);
    videos.push({
      id,
      title: cleanVideoTitle(decoded),
      youtubeVideoId: id,
    });

    if (videos.length >= limit) break;
  }

  return videos;
}

async function fetchFromVideosTab(limit: number): Promise<VideoItem[]> {
  const res = await fetchWithTimeout(CHANNEL_VIDEOS_URL);
  if (!res.ok) {
    throw new Error(`Could not load ${CHANNEL_VIDEOS_URL} (${res.status})`);
  }
  const videos = parseVideosFromVideosPage(await res.text(), limit);
  if (videos.length === 0) {
    throw new Error("No videos parsed from @woleemmanuel/videos");
  }
  return videos;
}

export async function getChannelVideos(
  _env: YoutubeEnv,
  limit = 12,
): Promise<VideoItem[]> {
  const now = Date.now();
  if (videoCache && now - videoCache.at < CACHE_MS) {
    return videoCache.videos.slice(0, limit);
  }

  try {
    const videos = await fetchFromVideosTab(limit);
    videoCache = { at: now, videos };
    return videos;
  } catch {
    return curatedVideos.slice(0, limit);
  }
}
