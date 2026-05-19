import { getChannelVideos } from "../_lib/youtube.js";

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

  const limit = Math.min(Number(req.query?.limit) || 15, 20);
  const videos = await getChannelVideos(process.env, limit);
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  return res.status(200).json(videos);
}
