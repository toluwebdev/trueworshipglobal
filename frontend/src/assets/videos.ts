export type VideoItem = {
  id: string;
  title: string;
  youtubeVideoId?: string;
};

export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@woleemmanuel/videos";

/** Curated @woleemmanuel music videos — used when YouTube API fetch is unavailable */
export const curatedVideos: VideoItem[] = [
  { id: "inaoluwa", title: "INAOLUWA", youtubeVideoId: "0pG1S6kvZI8" },
  { id: "god-of-my-journey", title: "GOD OF MY JOURNEY", youtubeVideoId: "Xd_jDykXf9I" },
  { id: "enlarge-akachukwu", title: "ENLARGE / AKACHUKWU", youtubeVideoId: "0G37VVe0G3E" },
  { id: "aanu-mercy", title: "AANU (MERCY)", youtubeVideoId: "AohrveSerBA" },
  { id: "worship-medley-2", title: "WORSHIP MEDLEY VOL 2", youtubeVideoId: "W8qUWECxZZo" },
  { id: "where-you-are", title: "WHERE YOU ARE", youtubeVideoId: "cy0yAI_Ew5g" },
  { id: "deep-soaking", title: "DEEP SOAKING WORSHIP", youtubeVideoId: "7pnNuXZo3Ts" },
  { id: "river-of-life", title: "RIVER OF LIFE", youtubeVideoId: "qTqXGoV29tg" },
  { id: "doing-wonders", title: "DOING WONDERS", youtubeVideoId: "Zi9yLSoPCws" },
  { id: "yeshua", title: "YESHUA", youtubeVideoId: "6GzQbJVnsDI" },
  { id: "praise-medley", title: "PRAISE & WORSHIP MEDLEY", youtubeVideoId: "92BCPaEDc_E" },
  { id: "atofarati", title: "ATOFARATI", youtubeVideoId: "PUanBPHOjmk" },
  { id: "worship-medley-oghosa", title: "WORSHIP MEDLEY (OGHOSA)", youtubeVideoId: "O2A0uF7CJZQ" },
  { id: "smile-on-gods-face", title: "SMILE ON GOD'S FACE", youtubeVideoId: "Rpe4HpVo808" },
  { id: "joy-to-gods-heart", title: "JOY TO GOD'S HEART", youtubeVideoId: "vXOK94YGd-0" },
];

export const manualVideos = curatedVideos;

export function getVideoThumbnail(video: VideoItem) {
  if (video.youtubeVideoId) {
    return `https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`;
  }
  return `https://picsum.photos/seed/${video.id}-wole/640/360`;
}

export function getVideoUrl(video: VideoItem) {
  if (video.youtubeVideoId) {
    return `https://www.youtube.com/watch?v=${video.youtubeVideoId}`;
  }
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${video.title} Wole Emmanuel`,
  )}`;
}
