export type OgBlogPost = {
  _id: string;
  title: string;
  genre: string;
  content: string;
  imageUrl: string;
};

export type OgEvent = {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  time: string;
  location: string;
  slug?: string;
};

export type OgWorshipClass = OgEvent;

export type OgReq = {
  method?: string;
  query?: Record<string, string | undefined>;
  headers?: { host?: string; "x-forwarded-proto"?: string };
};

export type OgRes = {
  status: (code: number) => {
    setHeader: (key: string, value: string) => void;
    send: (body: string) => void;
  };
};

const DEFAULT_API = "https://trueworshipglobal-server.vercel.app";
const DEFAULT_SITE = "https://trueworshipglobal.vercel.app";

export function getApiBase(): string {
  return (process.env.VITE_API_URL || process.env.API_URL || DEFAULT_API).replace(
    /\/$/,
    "",
  );
}

export function getSiteOrigin(req: {
  headers?: { host?: string; "x-forwarded-proto"?: string };
}): string {
  const fromEnv = process.env.SITE_URL || process.env.VITE_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const host = req.headers?.host;
  const proto = req.headers?.["x-forwarded-proto"] || "https";
  if (host) return `${proto}://${host}`;

  return DEFAULT_SITE;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Safe for HTML attribute values that are URLs (do not encode & as &amp;). */
export function escapeAttrUrl(url: string): string {
  return url.replace(/"/g, "%22").replace(/</g, "%3C").replace(/>/g, "%3E");
}

export function excerpt(content: string, max = 160): string {
  const plain = content.replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trim()}…`;
}

/**
 * Build a share-preview image URL. Prefer the original Cloudinary asset (reliable for
 * Facebook/WhatsApp crawlers). Optionally apply a 1.91:1 crop when supported.
 */
export function absoluteImageUrl(imageUrl: string, siteOrigin: string): string {
  const fallback = `${siteOrigin}/android-chrome-512x512.png`;

  if (!imageUrl?.trim()) return fallback;

  const trimmed = imageUrl.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    if (trimmed.includes("res.cloudinary.com") && trimmed.includes("/upload/")) {
      // Use explicit 1200×630 crop for link previews (Open Graph recommended ratio).
      const parts = trimmed.split("/upload/");
      if (parts.length === 2) {
        const versionAndPath = parts[1];
        const hasTransform = /^v\d+\//.test(versionAndPath)
          ? false
          : /^[^/]+,/.test(versionAndPath.split("/")[0]);
        if (!hasTransform) {
          return `${parts[0]}/upload/c_fill,g_auto,w_1200,h_630,f_jpg,q_auto/${versionAndPath}`;
        }
      }
    }
    return trimmed;
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${siteOrigin}${path}`;
}

export async function fetchPublishedBlog(id: string): Promise<OgBlogPost | null> {
  const res = await fetch(`${getApiBase()}/api/blogs/${encodeURIComponent(id)}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  return res.json() as Promise<OgBlogPost>;
}

export async function fetchEvent(slug: string): Promise<OgEvent | null> {
  const res = await fetch(`${getApiBase()}/api/events/${encodeURIComponent(slug)}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  return res.json() as Promise<OgEvent>;
}

export async function fetchWorshipClass(slug: string): Promise<OgWorshipClass | null> {
  const res = await fetch(
    `${getApiBase()}/api/worship-school/${encodeURIComponent(slug)}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) return null;
  return res.json() as Promise<OgWorshipClass>;
}

export function formatEventDescription(event: OgEvent): string {
  const body = excerpt(event.description, 140);
  const d = new Date(event.date);
  const dateLabel = Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const meta = [dateLabel, event.time, event.location].filter(Boolean).join(" · ");
  if (body && meta) return `${meta} — ${body}`;
  return body || meta || "True Worship Global event";
}

export function formatClassDescription(item: OgWorshipClass): string {
  return formatEventDescription(item);
}

export function buildOgHtml(options: {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName?: string;
  ogType?: "article" | "website";
  ctaLabel?: string;
}): string {
  const title = escapeHtml(options.title);
  const description = escapeHtml(options.description);
  const image = escapeAttrUrl(options.image);
  const url = escapeAttrUrl(options.url);
  const siteName = escapeHtml(options.siteName ?? "True Worship Global");
  const imageAlt = title;
  const ogType = options.ogType ?? "article";
  const ctaLabel = escapeHtml(options.ctaLabel ?? "View on True Worship Global");

  return `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${url}" />
  <link rel="image_src" href="${image}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:site_name" content="${siteName}" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${imageAlt}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="${imageAlt}" />
</head>
<body>
  <img src="${image}" alt="${imageAlt}" width="1200" height="630" />
  <h1>${title}</h1>
  <p>${description}</p>
  <p><a href="${url}">${ctaLabel}</a></p>
</body>
</html>`;
}

export async function sendOgResponse<T extends { title: string; imageUrl: string }>(
  req: OgReq,
  res: OgRes,
  options: {
    slugParam: string;
    pagePathPrefix: string;
    fetchItem: (slug: string) => Promise<T | null>;
    getTitle: (item: T) => string;
    getDescription: (item: T) => string;
    notFoundTitle: string;
    notFoundDescription: string;
    ctaLabel?: string;
    logTag: string;
  },
): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).setHeader("Content-Type", "text/plain").send("Method not allowed");
    return;
  }

  const slug = req.query?.[options.slugParam];
  if (!slug || typeof slug !== "string") {
    res.status(400).setHeader("Content-Type", "text/plain").send("Missing slug");
    return;
  }

  const siteOrigin = getSiteOrigin(req);
  const pageUrl = `${siteOrigin}${options.pagePathPrefix}/${encodeURIComponent(slug)}`;

  try {
    const item = await options.fetchItem(slug);

    if (!item) {
      const html = buildOgHtml({
        title: options.notFoundTitle,
        description: options.notFoundDescription,
        image: absoluteImageUrl("", siteOrigin),
        url: pageUrl,
        ogType: "website",
      });
      res.status(404).setHeader("Content-Type", "text/html; charset=utf-8").send(html);
      return;
    }

    const html = buildOgHtml({
      title: options.getTitle(item),
      description: options.getDescription(item),
      image: absoluteImageUrl(item.imageUrl, siteOrigin),
      url: pageUrl,
      ogType: "website",
      ctaLabel: options.ctaLabel,
    });

    res
      .status(200)
      .setHeader("Content-Type", "text/html; charset=utf-8")
      .setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400")
      .send(html);
  } catch (err) {
    console.error(`[${options.logTag}]`, err);
    res.status(500).setHeader("Content-Type", "text/plain").send("Failed to build preview");
  }
}
