import type { SpotifyRelease } from "../src/lib/spotify";
import { SPOTIFY_ARTIST_ID } from "../src/lib/spotify";

type SpotifyEnv = {
  SPOTIFY_CLIENT_ID?: string;
  SPOTIFY_CLIENT_SECRET?: string;
  SPOTIFY_ARTIST_ID?: string;
};

type SpotifyImage = { url: string; width: number; height: number };
type SpotifyAlbumItem = {
  id: string;
  name: string;
  album_type: "album" | "single" | "compilation";
  release_date: string;
  images: SpotifyImage[];
  external_urls: { spotify: string };
};

async function getAccessToken(clientId: string, clientSecret: string) {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Spotify authentication failed (${res.status}): ${detail}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function getLatestReleases(
  env: SpotifyEnv,
  limit = 5,
): Promise<SpotifyRelease[]> {
  const clientId = env.SPOTIFY_CLIENT_ID;
  const clientSecret = env.SPOTIFY_CLIENT_SECRET;
  const artistId = env.SPOTIFY_ARTIST_ID ?? SPOTIFY_ARTIST_ID;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in environment",
    );
  }

  const token = await getAccessToken(clientId, clientSecret);

  const params = new URLSearchParams({
    include_groups: "single,album",
    limit: "10",
    market: "NG",
  });

  const res = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/albums?${params}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Failed to fetch albums from Spotify (${res.status}): ${detail}`);
  }

  const data = (await res.json()) as { items: SpotifyAlbumItem[] };

  const seen = new Set<string>();
  const sorted = [...data.items]
    .sort(
      (a, b) =>
        new Date(b.release_date).getTime() - new Date(a.release_date).getTime(),
    )
    .filter((item) => {
      const key = item.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);

  return sorted.map((item) => ({
    id: item.id,
    title: item.name,
    releaseDate: item.release_date,
    imageUrl: item.images[0]?.url ?? null,
    spotifyUrl: item.external_urls.spotify,
    type: item.album_type,
  }));
}
