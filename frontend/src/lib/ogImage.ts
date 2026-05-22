/** Absolute Open Graph image URL (1200×630 crop for Cloudinary). */
export function toAbsoluteImage(imageUrl: string, origin?: string): string {
  const siteOrigin =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "");

  if (!imageUrl?.trim()) {
    return siteOrigin ? `${siteOrigin}/android-chrome-512x512.png` : "/android-chrome-512x512.png";
  }

  const trimmed = imageUrl.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    if (trimmed.includes("res.cloudinary.com") && trimmed.includes("/upload/")) {
      const parts = trimmed.split("/upload/");
      if (parts.length === 2) {
        return `${parts[0]}/upload/c_fill,g_auto,w_1200,h_630,f_jpg,q_auto/${parts[1]}`;
      }
    }
    return trimmed;
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${siteOrigin}${path}`;
}
