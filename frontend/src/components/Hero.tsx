import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

type SlideCta = {
  label: string;
  href: string;
  external?: boolean;
};

type HeroSlide = {
  id: number;
  image: string;
  alt: string;
  ctas?: SlideCta[];
  heading?: string;
};

const slides: HeroSlide[] = [
  {
    id: 1,
    image: "https://picsum.photos/seed/pste-hero-1/1920/1080",
    alt: "Hero slide 1",
    ctas: [{ label: "Presave", href: "#" }],
  },
  {
    id: 2,
    image: "https://picsum.photos/seed/pste-hero-2/1920/1080",
    alt: "Hero slide 2",
    ctas: [{ label: "Become a Fan", href: "#footer" }],
  },
  {
    id: 3,
    image: "https://picsum.photos/seed/pste-hero-3/1920/1080",
    alt: "Hero slide 3",
    heading:
      "LightOut is a social impact platform for teenage students across high schools in Nigeria",
    ctas: [
      { label: "Donate", href: "#" },
      { label: "Get Tickets", href: "#" },
    ],
  },
];

const AUTOPLAY_MS = 5000;

const slideVariants = {
  enter: { opacity: 0, scale: 1.05 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.02 },
};

const contentVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

const Hero = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback(
    (index: number) => {
      setActive((current) => {
        const next = (index + slides.length) % slides.length;
        setDirection(next > current || (current === slides.length - 1 && next === 0) ? 1 : -1);
        return next;
      });
    },
    [],
  );

  const next = useCallback(() => {
    setDirection(1);
    setActive((i) => (i + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setActive((i) => (i - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setActive((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  const slide = slides[active];

  return (
    <section
      className="relative h-[85vh] w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={slide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <motion.img
            src={slide.image}
            alt={slide.alt}
            className="h-full w-full object-cover"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-black/45" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col items-center"
          >
            {slide.heading ? (
              <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
                <h1 className="font-primary text-2xl leading-snug tracking-wide md:text-4xl">
                  {slide.heading}
                </h1>
                {slide.ctas && (
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    {slide.ctas.map((cta, i) => (
                      <HeroButton key={cta.label} {...cta} delay={i * 0.1} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              slide.ctas?.map((cta, i) => (
                <HeroButton key={cta.label} {...cta} delay={i * 0.1} />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        onClick={prev}
        className="absolute top-1/2 left-4 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-black/30 p-2 text-white backdrop-blur-sm md:left-8"
        aria-label="Previous slide"
        whileHover={{ scale: 1.08, backgroundColor: "rgba(0,0,0,0.5)" }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronIcon direction="left" />
      </motion.button>
      <motion.button
        type="button"
        onClick={next}
        className="absolute top-1/2 right-4 z-20 -translate-y-1/2 rounded-full border border-white/30 bg-black/30 p-2 text-white backdrop-blur-sm md:right-8"
        aria-label="Next slide"
        whileHover={{ scale: 1.08, backgroundColor: "rgba(0,0,0,0.5)" }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronIcon direction="right" />
      </motion.button>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <motion.button
            key={s.id}
            type="button"
            onClick={() => goTo(i)}
            className={`h-2 rounded-full ${
              i === active ? "bg-white" : "bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === active}
            animate={{ width: i === active ? 32 : 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        ))}
      </div>
    </section>
  );
};

const HeroButton = ({
  label,
  href,
  external,
  delay = 0,
}: SlideCta & { delay?: number }) => (
  <motion.a
    href={href}
    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    className="inline-flex items-center gap-2 rounded border border-white/80 bg-transparent px-6 py-2.5 font-primary text-sm uppercase tracking-widest text-white"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 + delay, duration: 0.4 }}
    whileHover={{ scale: 1.03, backgroundColor: "#fff", color: "#000" }}
    whileTap={{ scale: 0.98 }}
  >
    <PlusIcon />
    {label}
  </motion.a>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path
      d="M9.16663 9.16675V4.16675H10.8333V9.16675H15.8333V10.8334H10.8333V15.8334H9.16663V10.8334H4.16663V9.16675H9.16663Z"
      fill="currentColor"
    />
  </svg>
);

const ChevronIcon = ({ direction }: { direction: "left" | "right" }) => (
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

export default Hero;
