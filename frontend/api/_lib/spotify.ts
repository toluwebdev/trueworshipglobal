import fs from "node:fs/promises";
import path from "node:path";
import type { SpotifyRelease } from "../../src/lib/spotify.js";
import { SPOTIFY_ARTIST_ID } from "../../src/lib/spotify.js";

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

type ReleasesCache = {
  at: number;
  artistId: string;
  data: SpotifyRelease[];
};

const RELEASES_CACHE_MS = 30 * 60 * 1000;
const TOKEN_REFRESH_BUFFER_MS = 60_000;
const MAX_STORED = 10;
const CACHE_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "spotify-releases.json");

let tokenCache: { token: string; expiresAt: number } | null = null;
let memoryCache: ReleasesCache | null = null;
let inflight: Promise<SpotifyRelease[]> | null = null;

function apiError(message: string, status?: number) {
  const err = new Error(message) as Error & { status?: number };
  if (status) err.status = status;
  return err;
}

async function readDiskCache(artistId: string): Promise<ReleasesCache | null> {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ReleasesCache;
    if (parsed.artistId !== artistId || !Array.isArray(parsed.data)) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeDiskCache(artistId: string, data: SpotifyRelease[]) {
  const payload: ReleasesCache = { at: Date.now(), artistId, data };
  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(payload), "utf-8");
  memoryCache = payload;
}

function sliceReleases(data: SpotifyRelease[], limit: number) {
  return data.slice(0, Math.min(limit, MAX_STORED));
}

async function getAccessToken(clientId: string, clientSecret: string) {
  const now = Date.now();
  if (tokenCache && now < tokenCache.expiresAt - TOKEN_REFRESH_BUFFER_MS) {
    return tokenCache.token;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

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
    throw apiError(`Spotify authentication failed (${res.status}): ${detail}`, res.status);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };

  tokenCache = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return data.access_token;
}

async function fetchReleasesFromSpotify(
  token: string,
  artistId: string,
): Promise<SpotifyRelease[]> {
  const params = new URLSearchParams({
    include_groups: "single,album",
    limit: "10",
    market: "NG",
  });

  const res = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/albums?${params}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) {
    const detail = await res.text();
    throw apiError(
      `Failed to fetch albums from Spotify (${res.status}): ${detail}`,
      res.status,
    );
  }

  const data = (await res.json()) as { items: SpotifyAlbumItem[] };

  const seen = new Set<string>();
  return [...data.items]
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
    .slice(0, MAX_STORED)
    .map((item) => ({
      id: item.id,
      title: item.name,
      releaseDate: item.release_date,
      imageUrl: item.images[0]?.url ?? null,
      spotifyUrl: item.external_urls.spotify,
      type: item.album_type,
    }));
}

async function getStaleReleases(artistId: string, limit: number) {
  if (memoryCache?.artistId === artistId && memoryCache.data.length > 0) {
    return sliceReleases(memoryCache.data, limit);
  }
  const disk = await readDiskCache(artistId);
  if (disk?.data.length) {
    memoryCache = disk;
    return sliceReleases(disk.data, limit);
  }
  return null;
}

async function fetchFreshReleases(env: SpotifyEnv, limit: number): Promise<SpotifyRelease[]> {
  const clientId = env.SPOTIFY_CLIENT_ID;
  const clientSecret = env.SPOTIFY_CLIENT_SECRET;
  const artistId = env.SPOTIFY_ARTIST_ID ?? SPOTIFY_ARTIST_ID;

  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in environment");
  }

  const token = await getAccessToken(clientId, clientSecret);
  const data = await fetchReleasesFromSpotify(token, artistId);
  await writeDiskCache(artistId, data);
  return sliceReleases(data, limit);
}

export async function getLatestReleases(
  env: SpotifyEnv,
  limit = 5,
): Promise<SpotifyRelease[]> {
  const artistId = env.SPOTIFY_ARTIST_ID ?? SPOTIFY_ARTIST_ID;

  if (
    memoryCache?.artistId === artistId &&
    Date.now() - memoryCache.at < RELEASES_CACHE_MS
  ) {
    return sliceReleases(memoryCache.data, limit);
  }

  const disk = await readDiskCache(artistId);
  if (disk && Date.now() - disk.at < RELEASES_CACHE_MS) {
    memoryCache = disk;
    return sliceReleases(disk.data, limit);
  }

  if (inflight) {
    const data = await inflight;
    return sliceReleases(data, limit);
  }

  inflight = (async () => {
    try {
      return await fetchFreshReleases(env, MAX_STORED);
    } catch (err) {
      const stale = await getStaleReleases(artistId, MAX_STORED);
      if (stale?.length) return stale;

      const status = (err as Error & { status?: number }).status;
      if (status === 429) {
        throw apiError(
          "Spotify rate limit reached. Wait a few minutes, then refresh.",
          429,
        );
      }
      throw err;
    } finally {
      inflight = null;
    }
  })();

  const data = await inflight;
  return sliceReleases(data, limit);
}
