import { getChannelVideos } from "../api/_lib/youtube.ts";

const videos = await getChannelVideos({}, 15);
console.log("count", videos.length);
videos.forEach((v, i) => console.log(i + 1, v.youtubeVideoId, v.title));
