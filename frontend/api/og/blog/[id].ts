import {
  absoluteImageUrl,
  buildOgHtml,
  excerpt,
  fetchPublishedBlog,
  getSiteOrigin,
} from "../../_lib/og-html.js";

type Req = {
  method?: string;
  query?: { id?: string };
  headers?: { host?: string; "x-forwarded-proto"?: string };
};

type Res = {
  status: (code: number) => {
    setHeader: (key: string, value: string) => void;
    send: (body: string) => void;
  };
};

export default async function handler(req: Req, res: Res) {
  if (req.method !== "GET") {
    res.status(405).setHeader("Content-Type", "text/plain").send("Method not allowed");
    return;
  }

  const id = req.query?.id;
  if (!id || typeof id !== "string") {
    res.status(400).setHeader("Content-Type", "text/plain").send("Missing blog id");
    return;
  }

  const siteOrigin = getSiteOrigin(req);
  const pageUrl = `${siteOrigin}/blog/${id}`;

  try {
    const post = await fetchPublishedBlog(id);

    if (!post) {
      const html = buildOgHtml({
        title: "Post not found — True Worship Global",
        description: "This blog post could not be found.",
        image: absoluteImageUrl("", siteOrigin),
        url: pageUrl,
      });
      res.status(404).setHeader("Content-Type", "text/html; charset=utf-8").send(html);
      return;
    }

    const title = `${post.title} — True Worship Global`;
    const description = excerpt(post.content) || post.genre || "True Worship Global blog";
    const image = absoluteImageUrl(post.imageUrl, siteOrigin);

    const html = buildOgHtml({
      title,
      description,
      image,
      url: pageUrl,
      redirectUrl: pageUrl,
    });

    res
      .status(200)
      .setHeader("Content-Type", "text/html; charset=utf-8")
      .setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400")
      .send(html);
  } catch (err) {
    console.error("[og/blog]", err);
    res.status(500).setHeader("Content-Type", "text/plain").send("Failed to build preview");
  }
}
