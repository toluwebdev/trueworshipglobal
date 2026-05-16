export type SpotifyRelease = {
  id: string;
  title: string;
  releaseDate: string;
  imageUrl: string | null;
  spotifyUrl: string;
  type: "album" | "single" | "compilation";
};

export const SPOTIFY_ARTIST_ID = "7wq2EoSyIrfTTE45GyfCC2";
export const SPOTIFY_ARTIST_URL =
  "https://open.spotify.com/artist/7wq2EoSyIrfTTE45GyfCC2";

import { manualReleases } from "../assets/music";

export async function fetchLatestReleases(
  limit = 5,
): Promise<SpotifyRelease[]> {
  const res = await fetch(`/api/spotify/releases?limit=${limit}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? "Failed to load Spotify releases",
    );
  }
  return res.json() as Promise<SpotifyRelease[]>;
}

export async function fetchLatestReleasesWithFallback(
  limit = 5,
): Promise<{ releases: SpotifyRelease[]; source: "spotify" | "manual" }> {
  try {
    const releases = await fetchLatestReleases(limit);
    return { releases, source: "spotify" };
  } catch {
    return { releases: manualReleases.slice(0, limit), source: "manual" };
  }
}
