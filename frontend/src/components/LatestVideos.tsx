import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  fetchVideoListWithFallback,
  getEmbedUrl,
  getPlayableVideos,
  YOUTUBE_CHANNEL_URL,
  type VideoItem,
} from "../lib/youtube";

const VIDEO_LIMIT = 12;

const LatestVideos = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const playable = getPlayableVideos(videos);

  useEffect(() => {
    let cancelled = false;
    fetchVideoListWithFallback(VIDEO_LIMIT)
      .then(({ videos: data }) => {
        if (cancelled) return;
        setVideos(data);
        setActiveId(getPlayableVideos(data)[0]?.youtubeVideoId ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-[#1a1a1a] px-6 py-16 text-white md:py-24">
      <motion.h2
        className="mb-10 text-center font-primary text-sm tracking-[0.35em] uppercase md:mb-14 md:text-base"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        Latest Videos
      </motion.h2>

      <div className="mx-auto max-w-5xl">
        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="aspect-video w-full animate-pulse bg-neutral-800" />
            <motion.div
              className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 md:mt-8 md:gap-4"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-14 animate-pulse border border-neutral-700 bg-neutral-800"
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
                return (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => setActiveId(id)}
                    title={video.title}
                    className={`min-h-[3.25rem] border px-2 py-3 font-primary text-[10px] leading-snug tracking-[0.15em] uppercase transition sm:min-h-[3.5rem] sm:px-3 sm:py-4 sm:text-[11px] md:text-xs ${
                      isActive
                        ? "border-white bg-white text-black"
                        : "border-white bg-transparent text-white hover:bg-white/10"
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
              className="mt-6 inline-block font-primary text-xs tracking-[0.25em] text-white uppercase underline"
            >
              Watch on YouTube →
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestVideos;
