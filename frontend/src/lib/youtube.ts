import {
  curatedVideos,
  manualVideos,
  YOUTUBE_CHANNEL_URL,
  type VideoItem,
} from "../assets/videos";

export { YOUTUBE_CHANNEL_URL, curatedVideos };
export type { VideoItem };

export async function fetchVideoList(limit = 12): Promise<VideoItem[]> {
  try {
    const res = await fetch(`/api/youtube/videos?limit=${limit}`);
    if (!res.ok) throw new Error("YouTube API error");
    const data = (await res.json()) as VideoItem[];
    if (getPlayableVideos(data).length > 0) return data;
    throw new Error("No playable videos");
  } catch {
    return curatedVideos.slice(0, limit);
  }
}

export async function fetchVideoListWithFallback(
  limit = 12,
): Promise<{ videos: VideoItem[]; source: "youtube" | "curated" }> {
  try {
    const res = await fetch(`/api/youtube/videos?limit=${limit}`);
    if (!res.ok) throw new Error("YouTube API error");
    const videos = (await res.json()) as VideoItem[];
    if (getPlayableVideos(videos).length > 0) {
      return { videos, source: "youtube" };
    }
  } catch {
    /* curated */
  }
  return { videos: manualVideos.slice(0, limit), source: "curated" };
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
