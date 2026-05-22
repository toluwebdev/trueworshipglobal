export type OgBlogPost = {
  _id: string;
  title: string;
  genre: string;
  content: string;
  imageUrl: string;
};

const DEFAULT_API = "https://trueworshipglobal-server.vercel.app";

export function getApiBase(): string {
  return (process.env.VITE_API_URL || process.env.API_URL || DEFAULT_API).replace(
    /\/$/,
    "",
  );
}

export function getSiteOrigin(req: { headers?: { host?: string; "x-forwarded-proto"?: string } }): string {
  const fromEnv = process.env.SITE_URL || process.env.VITE_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const host = req.headers?.host;
  const proto = req.headers?.["x-forwarded-proto"] || "https";
  if (host) return `${proto}://${host}`;

  return "https://trueworshipglobal.com";
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function excerpt(content: string, max = 160): string {
  const plain = content.replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trim()}…`;
}

export function absoluteImageUrl(imageUrl: string, siteOrigin: string): string {
  if (!imageUrl) return `${siteOrigin}/android-chrome-512x512.png`;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    if (imageUrl.includes("res.cloudinary.com") && imageUrl.includes("/upload/")) {
      return imageUrl.replace("/upload/", "/upload/w_1200,h_630,c_fill,q_auto,f_auto/");
    }
    return imageUrl;
  }
  const path = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${siteOrigin}${path}`;
}

export async function fetchPublishedBlog(id: string): Promise<OgBlogPost | null> {
  const res = await fetch(`${getApiBase()}/api/blogs/${encodeURIComponent(id)}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  return res.json() as Promise<OgBlogPost>;
}

export function buildOgHtml(options: {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName?: string;
  redirectUrl?: string;
}): string {
  const title = escapeHtml(options.title);
  const description = escapeHtml(options.description);
  const image = escapeHtml(options.image);
  const url = escapeHtml(options.url);
  const siteName = escapeHtml(options.siteName ?? "True Worship Global");
  const redirect = options.redirectUrl ? escapeHtml(options.redirectUrl) : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="${siteName}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${url}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  ${redirect ? `<meta http-equiv="refresh" content="0;url=${redirect}" />` : ""}
  <link rel="canonical" href="${url}" />
</head>
<body>
  <p><a href="${url}">${title}</a></p>
</body>
</html>`;
}
