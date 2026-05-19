import { curatedVideos, type VideoItem } from "../../src/assets/videos.js";

export const DEFAULT_YOUTUBE_CHANNEL_HANDLE = "woleemmanuel";
export const CHANNEL_VIDEOS_URL = "https://www.youtube.com/@woleemmanuel/videos";

export const DEFAULT_VIDEO_LIMIT = 15;

type YoutubeEnv = {
  YOUTUBE_CHANNEL_HANDLE?: string;
};

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const FETCH_TIMEOUT_MS = 20_000;
const CACHE_MS = 10 * 60 * 1000;

const SKIP_TITLE =
  /full episode|unlocking the secrets|how to put a smile|ep\d+\s*["']?$/i;

const DURATION_TITLE =
  /^\d+\s*(minutes?|seconds?|hours?)\b/i;

const curatedTitleById = new Map(
  curatedVideos
    .filter((v): v is VideoItem & { youtubeVideoId: string } => Boolean(v.youtubeVideoId))
    .map((v) => [v.youtubeVideoId, v.title]),
);

let videoCache: { at: number; limit: number; videos: VideoItem[] } | null = null;

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
    .replace(/\\n/g, " ")
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
    .replace(/\s*-\s*YouTube$/i, "")
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

function isDurationTitle(title: string): boolean {
  return DURATION_TITLE.test(title.trim());
}

function isUnusableTitle(title: string): boolean {
  if (title.length < 3) return true;
  if (isDurationTitle(title)) return true;
  if (/keyboard|playback|spherical|general|sort by/i.test(title)) return true;
  if (SKIP_TITLE.test(title)) return true;
  return false;
}

function resolveVideoTitle(id: string, rawTitle: string | null): string {
  const curated = curatedTitleById.get(id);
  if (rawTitle && !isUnusableTitle(rawTitle)) {
    return cleanVideoTitle(rawTitle);
  }
  if (curated) return curated;
  if (rawTitle) return cleanVideoTitle(rawTitle);
  return `VIDEO ${id.slice(0, 6).toUpperCase()}`;
}

function decodeRawTitle(raw: string): string {
  return raw.replace(/\\u0026/g, "&").replace(/\\"/g, '"').replace(/\\n/g, " ");
}

function extractTitleFromChunk(chunk: string): string | null {
  const patterns = [
    /"content":"([^"\\]{3,150})","style":"VERTICAL/,
    /"text":"([^"\\]{3,150})"\}\],"accessibility":/,
    /"simpleText":"([^"\\]{3,150})"/,
    /"title":\{"runs":\[\{"text":"([^"\\]{3,150})"/,
    /"accessibilityData":\{"label":"([^"\\]{3,150})"/,
    /"ariaLabel":"([^"\\]{3,150})"/,
    /"label":"([^"\\]{3,150})"/,
  ];

  for (const pattern of patterns) {
    const match = chunk.match(pattern);
    if (!match?.[1]) continue;
    const decoded = decodeRawTitle(match[1]);
    if (decoded.length < 3) continue;
    if (isUnusableTitle(decoded)) continue;
    return decoded;
  }

  return null;
}

function parseVideosFromVideosPage(html: string, limit: number): VideoItem[] {
  const seen = new Set<string>();
  const videos: VideoItem[] = [];
  const maxIdsToScan = Math.max(limit * 4, 40);

  for (const match of html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)) {
    if (seen.size >= maxIdsToScan) break;

    const id = match[1];
    if (seen.has(id)) continue;
    seen.add(id);

    const idx = match.index ?? html.indexOf(`"videoId":"${id}"`);
    const chunk = html.slice(Math.max(0, idx - 2500), idx + 10000);
    const rawTitle = extractTitleFromChunk(chunk);

    videos.push({
      id,
      title: resolveVideoTitle(id, rawTitle),
      youtubeVideoId: id,
    });

    if (videos.length >= limit) break;
  }

  return videos.slice(0, limit);
}

function mergeWithCurated(fetched: VideoItem[], limit: number): VideoItem[] {
  const seen = new Set(fetched.map((v) => v.youtubeVideoId));
  const merged = [...fetched];

  for (const video of curatedVideos) {
    if (merged.length >= limit) break;
    if (!video.youtubeVideoId || seen.has(video.youtubeVideoId)) continue;
    seen.add(video.youtubeVideoId);
    merged.push(video);
  }

  return merged.slice(0, limit);
}

async function fetchFromVideosTab(limit: number): Promise<VideoItem[]> {
  const res = await fetchWithTimeout(CHANNEL_VIDEOS_URL);
  if (!res.ok) {
    throw new Error(`Could not load ${CHANNEL_VIDEOS_URL} (${res.status})`);
  }
  const parsed = parseVideosFromVideosPage(await res.text(), limit);
  const videos = mergeWithCurated(parsed, limit);
  if (videos.length === 0) {
    throw new Error("No videos parsed from @woleemmanuel/videos");
  }
  return videos;
}

export async function getChannelVideos(
  _env: YoutubeEnv,
  limit = DEFAULT_VIDEO_LIMIT,
): Promise<VideoItem[]> {
  const now = Date.now();
  if (
    videoCache &&
    now - videoCache.at < CACHE_MS &&
    videoCache.limit >= limit &&
    videoCache.videos.length >= limit
  ) {
    return videoCache.videos.slice(0, limit);
  }

  try {
    const videos = await fetchFromVideosTab(limit);
    videoCache = { at: now, limit, videos };
    return videos;
  } catch {
    return curatedVideos.slice(0, limit);
  }
}
