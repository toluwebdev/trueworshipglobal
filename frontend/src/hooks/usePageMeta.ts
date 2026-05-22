import { useEffect } from "react";

type PageMeta = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
};

function upsertMeta(
  attribute: "name" | "property",
  key: string,
  content: string | undefined,
) {
  if (!content) return;
  const selector = `meta[${attribute}="${key}"]`;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attribute, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

const DEFAULT_TITLE = "True Worship Global";

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    const prevTitle = document.title;
    if (meta.title) {
      document.title = meta.title;
      upsertMeta("property", "og:title", meta.title);
      upsertMeta("name", "twitter:title", meta.title);
    }
    if (meta.description) {
      upsertMeta("name", "description", meta.description);
      upsertMeta("property", "og:description", meta.description);
      upsertMeta("name", "twitter:description", meta.description);
    }
    if (meta.image) {
      upsertMeta("property", "og:image", meta.image);
      upsertMeta("property", "og:image:secure_url", meta.image);
      upsertMeta("name", "twitter:image", meta.image);
      upsertMeta("name", "twitter:card", "summary_large_image");
    }
    if (meta.url) {
      upsertMeta("property", "og:url", meta.url);
    }

    return () => {
      document.title = prevTitle;
    };
  }, [meta.title, meta.description, meta.image, meta.url]);
}

export { DEFAULT_TITLE };
