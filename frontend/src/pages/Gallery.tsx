import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { galleryImages, type GalleryImage } from "../assets/gallery";
import InViewSection from "../components/InViewSection";
import { cardReveal, VIEWPORT_TIGHT } from "../lib/motion";

const Gallery = () => {
  const [active, setActive] = useState<GalleryImage | null>(null);

  const activeIndex = active
    ? galleryImages.findIndex((img) => img.id === active.id)
    : -1;

  const goPrev = useCallback(() => {
    if (galleryImages.length === 0) return;
    const index =
      activeIndex < 0
        ? galleryImages.length - 1
        : (activeIndex - 1 + galleryImages.length) % galleryImages.length;
    setActive(galleryImages[index]);
  }, [activeIndex]);

  const goNext = useCallback(() => {
    if (galleryImages.length === 0) return;
    const index = activeIndex < 0 ? 0 : (activeIndex + 1) % galleryImages.length;
    setActive(galleryImages[index]);
  }, [activeIndex]);

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape") setActive(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, goPrev, goNext]);

  return (
    <div className="min-h-screen bg-background px-6 pb-24 pt-28 md:px-10">
      <InViewSection as="div" className="mb-10 text-center md:mb-14">
        <h1 className="font-primary text-sm tracking-[0.35em] uppercase md:text-base">
          Gallery
        </h1>
      </InViewSection>

      <InViewSection
        as="div"
        className="mx-auto max-w-7xl columns-2 gap-3 sm:columns-3 md:gap-4 lg:columns-4"
      >
        {galleryImages.map((image, i) => (
          <motion.button
            key={image.id}
            type="button"
            custom={i}
            variants={cardReveal}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_TIGHT}
            className="group relative mb-3 block w-full break-inside-avoid overflow-hidden bg-neutral-900 md:mb-4"
            onClick={() => setActive(image)}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full transition duration-500 group-hover:scale-[1.02]"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/25" />
          </motion.button>
        ))}
      </InViewSection>

      <AnimatePresence>
        {active && activeIndex >= 0 && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
          >
            <button
              type="button"
              className="absolute top-6 right-6 z-10 font-primary text-sm tracking-widest text-white uppercase"
              onClick={() => setActive(null)}
            >
              Close
            </button>

            <p className="absolute top-6 left-6 z-10 font-primary text-xs tracking-[0.25em] text-white/70 uppercase">
              {activeIndex + 1} / {galleryImages.length}
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/40 p-3 text-white backdrop-blur-sm transition hover:bg-black/60 md:left-8"
              aria-label="Previous image"
            >
              <ChevronIcon direction="left" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full border border-white/30 bg-black/40 p-3 text-white backdrop-blur-sm transition hover:bg-black/60 md:right-8"
              aria-label="Next image"
            >
              <ChevronIcon direction="right" />
            </button>

            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={active.id}
                src={active.src}
                alt={active.alt}
                className="max-h-[85vh] max-w-[calc(100%-6rem)] object-contain md:max-w-[calc(100%-10rem)]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              />
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ChevronIcon = ({ direction }: { direction: "left" | "right" }) => (
  <svg
    width="22"
    height="22"
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

export default Gallery;
