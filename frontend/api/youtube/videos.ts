import { DEFAULT_VIDEO_LIMIT, getChannelVideos } from "../_lib/youtube.js";

export default async function handler(
  req: { method?: string; query?: { limit?: string } },
  res: {
    status: (code: number) => { json: (body: unknown) => void };
    setHeader: (key: string, value: string) => void;
  },
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const limit = Math.min(Number(req.query?.limit) || DEFAULT_VIDEO_LIMIT, 20);
  const videos = await getChannelVideos(process.env, limit);
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  return res.status(200).json(videos);
}
