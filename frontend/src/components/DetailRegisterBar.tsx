import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

type DetailRegisterBarProps = {
  backTo: string;
  backLabel: string;
  registerUrl: string;
  ctaLabel: string;
};

function externalLinkProps(url: string) {
  const isExternal = url.startsWith("http");
  return {
    target: isExternal ? ("_blank" as const) : undefined,
    rel: isExternal ? "noopener noreferrer" : undefined,
  };
}

const DetailRegisterBar = ({
  backTo,
  backLabel,
  registerUrl,
  ctaLabel,
}: DetailRegisterBarProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [showFixedCta, setShowFixedCta] = useState(false);
  const linkProps = externalLinkProps(registerUrl);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowFixedCta(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="mt-8 flex items-center justify-between gap-4">
        <Link
          to={backTo}
          className="font-primary text-xs tracking-[0.25em] text-white/60 uppercase transition hover:text-white"
        >
          ← {backLabel}
        </Link>
        <a
          href={registerUrl}
          {...linkProps}
          className="shrink-0 border border-white bg-white px-5 py-2.5 font-primary text-xs tracking-[0.25em] text-black uppercase transition hover:bg-white/90"
        >
          {ctaLabel}
        </a>
      </div>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />

      <AnimatePresence>
        {showFixedCta && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-background/95 px-6 py-4 backdrop-blur-md md:px-10"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="mx-auto flex max-w-3xl justify-center">
              <a
                href={registerUrl}
                {...linkProps}
                className="flex w-full max-w-md items-center justify-center border border-white bg-white px-8 py-3.5 font-primary text-sm tracking-[0.3em] text-black uppercase transition hover:bg-white/90"
              >
                {ctaLabel}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DetailRegisterBar;
