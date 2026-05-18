import { getStoreProducts } from "../_lib/selar.js";

export default async function handler(
  req: { method?: string },
  res: {
    status: (code: number) => { json: (body: unknown) => void };
    setHeader: (key: string, value: string) => void;
  },
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const products = await getStoreProducts(process.env);
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to load Selar products",
    });
  }
}
