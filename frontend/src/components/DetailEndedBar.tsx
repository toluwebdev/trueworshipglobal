import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

type DetailEndedBarProps = {
  backTo: string;
  backLabel: string;
  endedMessage: string;
};

const DetailEndedBar = ({ backTo, backLabel, endedMessage }: DetailEndedBarProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [showFixedBar, setShowFixedBar] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowFixedBar(!entry.isIntersecting),
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
        <p className="shrink-0 font-primary text-xs tracking-[0.2em] text-white/50 uppercase">
          {endedMessage}
        </p>
      </div>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />

      {showFixedBar && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-background/95 px-6 py-4 backdrop-blur-md md:px-10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-center font-primary text-xs tracking-[0.25em] text-white/50 uppercase">
            {endedMessage}
          </p>
        </motion.div>
      )}
    </>
  );
};

export default DetailEndedBar;
