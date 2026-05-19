import {
  curatedVideos,
  YOUTUBE_CHANNEL_URL,
  type VideoItem,
} from "../assets/videos";

export { YOUTUBE_CHANNEL_URL, curatedVideos };
export type { VideoItem };

export type VideoListResponse = {
  videos: VideoItem[];
  source: "youtube" | "curated";
};

export async function fetchVideoListWithFallback(
  limit = 15,
): Promise<VideoListResponse> {
  try {
    const res = await fetch(`/api/youtube/videos?limit=${limit}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("YouTube API error");

    const videos = (await res.json()) as VideoItem[];
    const playable = videos.filter((v) => v.youtubeVideoId);

    if (playable.length > 0) {
      return { videos: playable, source: "youtube" };
    }
  } catch {
    /* fallback below */
  }

  return {
    videos: curatedVideos.slice(0, limit),
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
