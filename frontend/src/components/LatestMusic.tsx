import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  fetchLatestReleases,
  SPOTIFY_ARTIST_URL,
  type SpotifyRelease,
} from "../lib/spotify";

const RELEASE_LIMIT = 10;

const cardVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.4 },
  }),
};

const LatestMusic = () => {
  const [releases, setReleases] = useState<SpotifyRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    fetchLatestReleases(RELEASE_LIMIT)
      .then((data) => {
        if (!cancelled) {
          setReleases(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setReleases([]);
          setError(
            err instanceof Error ? err.message : "Failed to load Spotify releases",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-white px-6 py-16 md:px-10 md:py-24">
      <motion.div
        className="mx-auto max-w-7xl"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-secondary text-4xl uppercase tracking-tight text-neutral-900 md:text-5xl">
            Latest Music
          </h2>
          <a
            href={SPOTIFY_ARTIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-primary text-sm uppercase tracking-widest text-neutral-500 transition hover:text-neutral-900"
          >
            View on Spotify →
          </a>
        </div>

        {error ? (
          <motion.div className="rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-10 text-center">
            <p className="font-primary text-sm text-neutral-600">{error}</p>
            <a
              href={SPOTIFY_ARTIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block font-primary text-sm uppercase tracking-widest text-neutral-900 underline"
            >
              Open on Spotify →
            </a>
          </motion.div>
        ) : (
        <motion.div className="relative">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute top-1/2 left-0 z-10 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-200 bg-white p-2 shadow-md transition hover:bg-neutral-50 md:flex"
            aria-label="Scroll music left"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute top-1/2 right-0 z-10 hidden translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-200 bg-white p-2 shadow-md transition hover:bg-neutral-50 md:flex"
            aria-label="Scroll music right"
          >
            <Chevron direction="right" />
          </button>

          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] md:gap-6 [&::-webkit-scrollbar]:hidden"
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[min(85vw,280px)] shrink-0 snap-start animate-pulse md:w-[320px]"
                  >
                    <div className="aspect-square rounded bg-neutral-200" />
                    <div className="mt-3 h-4 w-2/3 rounded bg-neutral-200" />
                  </div>
                ))
              : releases.map((release, i) => (
                  <motion.a
                    key={release.id}
                    href={release.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-40px" }}
                    className="group w-[min(85vw,280px)] shrink-0 snap-start md:w-[320px]"
                  >
                    <div className="relative aspect-square overflow-hidden rounded bg-neutral-100">
                      {release.imageUrl ? (
                        <img
                          src={release.imageUrl}
                          alt={release.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-neutral-200 font-primary text-xs text-neutral-500">
                          No art
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 transition group-hover:opacity-100" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                        <span className="flex h-14 w-14 scale-95 items-center justify-center rounded-full border border-white/50 bg-white/20 text-white shadow-lg backdrop-blur-xl transition group-hover:scale-110 group-hover:bg-white/30">
                          <PlayIcon />
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 font-primary text-sm uppercase tracking-wide text-neutral-900">
                      {release.title}
                    </p>
                  </motion.a>
                ))}
          </div>
        </motion.div>
        )}
      </motion.div>
    </section>
  );
};

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8 5v14l11-7z" />
  </svg>
);

const Chevron = ({ direction }: { direction: "left" | "right" }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden
  >
    {direction === "left" ? (
      <path d="M15 6l-6 6 6 6" />
    ) : (
      <path d="M9 6l6 6-6 6" />
    )}
  </svg>
);

export default LatestMusic;
