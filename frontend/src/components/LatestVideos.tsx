import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  fetchVideoListWithFallback,
  findVideoBySlug,
  getEmbedUrl,
  getPlayableVideos,
  getVideoSharePath,
  getVideoSlug,
  YOUTUBE_CHANNEL_URL,
  type VideoItem,
} from "../lib/youtube";

const VIDEO_LIMIT = 15; // must match DEFAULT_VIDEO_LIMIT in api/_lib/youtube.ts

function scrollToVideosSection() {
  requestAnimationFrame(() => {
    document.getElementById("latest-videos")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

const LatestVideos = () => {
  const { videoSlug: routeSlug } = useParams<{ videoSlug?: string }>();
  const [searchParams] = useSearchParams();
  const querySlug = searchParams.get("video");
  const videoSlug = routeSlug ?? querySlug ?? undefined;
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasScrolledToSection = useRef(false);

  const playable = getPlayableVideos(videos);

  const selectVideo = useCallback(
    (video: VideoItem, options?: { replace?: boolean; scroll?: boolean }) => {
      const id = video.youtubeVideoId;
      if (!id) return;

      setActiveId(id);
      navigate(getVideoSharePath(video), {
        replace: options?.replace ?? false,
      });

      if (options?.scroll) {
        scrollToVideosSection();
      }
    },
    [navigate],
  );

  useEffect(() => {
    if (!routeSlug && querySlug) {
      navigate(`/video/${querySlug}`, { replace: true });
    }
  }, [routeSlug, querySlug, navigate]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    hasScrolledToSection.current = false;

    fetchVideoListWithFallback(VIDEO_LIMIT)
      .then(({ videos: data }) => {
        if (cancelled) return;
        const list = getPlayableVideos(data);
        setVideos(data);

        if (list.length === 0) {
          setActiveId(null);
          return;
        }

        const fromUrl = videoSlug ? findVideoBySlug(list, videoSlug) : undefined;
        const initial = fromUrl ?? list[0];
        setActiveId(initial.youtubeVideoId ?? null);

        if (fromUrl) {
          const expectedPath = getVideoSharePath(fromUrl);
          if (window.location.pathname !== expectedPath) {
            navigate(expectedPath, { replace: true });
          }
        } else if (videoSlug) {
          navigate(getVideoSharePath(list[0]), { replace: true });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [videoSlug, navigate]);

  useEffect(() => {
    if (loading || !videoSlug || playable.length === 0 || hasScrolledToSection.current) {
      return;
    }

    const match = findVideoBySlug(playable, videoSlug);
    if (!match?.youtubeVideoId) return;

    hasScrolledToSection.current = true;
    scrollToVideosSection();
  }, [loading, videoSlug, playable]);

  return (
    <section id="latest-videos" className="bg-background px-6 py-16 text-white md:py-24">
      <motion.h2
        className="mb-10 text-center font-primary text-sm tracking-[0.35em] uppercase md:mb-14 md:text-base"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        Latest Videos
      </motion.h2>

      <motion.div
        className="mx-auto max-w-5xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="aspect-video w-full animate-pulse bg-neutral-800" />
            <motion.div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 md:mt-8 md:gap-4">
              {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-14 animate-pulse border border-gold/30 bg-neutral-800"
                />
              ))}
            </motion.div>
          </motion.div>
        ) : playable.length > 0 && activeId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="aspect-video w-full overflow-hidden bg-black">
              <iframe
                key={activeId}
                title="Latest video"
                src={getEmbedUrl(activeId)}
                className="h-full w-full"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <motion.div
              className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 md:mt-8 md:gap-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              {playable.map((video) => {
                const id = video.youtubeVideoId!;
                const isActive = id === activeId;
                const slug = getVideoSlug(video);
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => selectVideo(video, { scroll: false })}
                    title={video.title}
                    aria-current={isActive ? "true" : undefined}
                    className={`min-h-[3.25rem] border px-2 py-3 font-primary text-[10px] leading-snug tracking-[0.15em] uppercase transition sm:min-h-[3.5rem] sm:px-3 sm:py-4 sm:text-[11px] md:text-xs ${
                      isActive
                        ? "border-gold bg-gold text-black"
                        : "border-gold/70 bg-transparent text-gold hover:border-gold hover:bg-gold/15"
                    }`}
                  >
                    <span className="line-clamp-2">{video.title}</span>
                  </button>
                );
              })}
            </motion.div>
          </motion.div>
        ) : (
          <div className="py-12 text-center">
            <p className="font-primary text-sm tracking-widest text-neutral-400 uppercase">
              Videos could not be loaded
            </p>
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block font-primary text-xs tracking-[0.25em] text-gold uppercase underline hover:text-gold-dark"
            >
              Watch on YouTube →
            </a>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default LatestVideos;
