const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const res = await fetch("https://www.youtube.com/@woleemmanuel/videos", {
  headers: { "User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9" },
});
console.log("status", res.status);
const html = await res.text();

function parseVideos(html, limit = 12) {
  const seen = new Set();
  const videos = [];

  for (const match of html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)) {
    const id = match[1];
    if (seen.has(id)) continue;

    const idx = match.index ?? html.indexOf(`"videoId":"${id}"`);
    const chunk = html.slice(idx, idx + 5000);

    const title =
      chunk.match(/"content":"([^"\\]{3,120})","style":"VERTICAL/)?.[1]?.replace(
        /\\u0026/g,
        "&",
      ) ??
      chunk.match(/"text":"([^"\\]{3,120})"\}\],"accessibility":/)?.[1]?.replace(
        /\\u0026/g,
        "&",
      ) ??
      chunk.match(/"simpleText":"([^"\\]{3,120})"/)?.[1]?.replace(/\\u0026/g, "&");

    if (!title || /keyboard|playback|general/i.test(title)) continue;

    seen.add(id);
    videos.push({ id, title });
    if (videos.length >= limit) break;
  }

  return videos;
}

const videos = parseVideos(html, 12);
console.log("parsed", videos.length);
videos.forEach((v) => console.log(v.id, "|", v.title));
