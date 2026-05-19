import {
  curatedVideos,
  YOUTUBE_CHANNEL_URL,
  type VideoItem,
} from "../assets/videos";

export { YOUTUBE_CHANNEL_URL, curatedVideos };
export type { VideoItem };

const curatedByYtId = new Map(
  curatedVideos
    .filter((v): v is VideoItem & { youtubeVideoId: string } => Boolean(v.youtubeVideoId))
    .map((v) => [v.youtubeVideoId, v]),
);

const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

export function slugifyVideoTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function getVideoSlug(video: VideoItem): string {
  if (!YOUTUBE_ID_RE.test(video.id)) return video.id;
  const curated = video.youtubeVideoId && curatedByYtId.get(video.youtubeVideoId);
  if (curated) return curated.id;
  return slugifyVideoTitle(video.title);
}

export function findVideoBySlug(videos: VideoItem[], slug: string): VideoItem | undefined {
  const normalized = slug.toLowerCase();
  return videos.find((video) => getVideoSlug(video) === normalized);
}

export function getVideoSharePath(video: VideoItem): string {
  return `/video/${getVideoSlug(video)}`;
}

export function normalizeVideoList(videos: VideoItem[]): VideoItem[] {
  return videos.map((video) => {
    const curated = video.youtubeVideoId && curatedByYtId.get(video.youtubeVideoId);
    if (curated) {
      return { ...video, id: curated.id, title: curated.title };
    }
    if (YOUTUBE_ID_RE.test(video.id)) {
      return { ...video, id: slugifyVideoTitle(video.title) };
    }
    return video;
  });
}

export type VideoListResponse = {
  videos: VideoItem[];
  source: "youtube" | "curated";
};

function padVideosToLimit(videos: VideoItem[], limit: number): VideoItem[] {
  const seen = new Set(videos.map((v) => v.youtubeVideoId).filter(Boolean));
  const merged = [...videos];

  for (const video of curatedVideos) {
    if (merged.length >= limit) break;
    if (!video.youtubeVideoId || seen.has(video.youtubeVideoId)) continue;
    seen.add(video.youtubeVideoId);
    merged.push(video);
  }

  return normalizeVideoList(merged.slice(0, limit));
}

export async function fetchVideoListWithFallback(
  limit = 15,
): Promise<VideoListResponse> {
  try {
    const res = await fetch(`/api/youtube/videos?limit=${limit}&_=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("YouTube API error");

    const videos = (await res.json()) as VideoItem[];
    const playable = videos.filter((v) => v.youtubeVideoId);

    if (playable.length > 0) {
      return {
        videos: padVideosToLimit(playable, limit),
        source: "youtube",
      };
    }
  } catch {
    /* fallback below */
  }

  return {
    videos: normalizeVideoList(curatedVideos.slice(0, limit)),
    source: "curated",
  };
}

export function getPlayableVideos(videos: VideoItem[]) {
  return videos.filter((v) => v.youtubeVideoId);
}

export function getEmbedUrl(videoId: string, autoplay = false) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    ...(autoplay ? { autoplay: "1" } : {}),
  });
  return `https://www.youtube.com/embed/${videoId}?${params}`;
}
