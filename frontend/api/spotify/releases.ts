import { getLatestReleases } from "../../server/spotify";

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

  const limit = Math.min(Number(req.query?.limit) || 5, 10);

  try {
    const releases = await getLatestReleases(process.env, limit);
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    return res.status(200).json(releases);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
