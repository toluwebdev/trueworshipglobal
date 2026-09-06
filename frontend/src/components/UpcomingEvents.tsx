import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import InViewSection from "../components/InViewSection";
import {
  cmsApi,
  eventSubtitle,
  getEventPath,
  isEventUpcoming,
  type ApiEvent,
} from "../lib/api";
import { cardReveal, VIEWPORT } from "../lib/motion";

// Helper to format the weekday and full date
const formatEventDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long", // Displays "Monday", "Tuesday", etc.
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const UpcomingEvents = () => {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await cmsApi.events.list();
        if (!cancelled) setEvents(data);
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const latestEvent = useMemo(() => {
    const upcoming = events
      .filter((event) => isEventUpcoming(event.date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return upcoming[0] || null;
  }, [events]);

  if (error) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen w-full bg-background text-white">
      {loading && <></>}

      {!loading && latestEvent && (
        <InViewSection as="section" aria-label="Next Event" className="w-full">
          <motion.div
            variants={cardReveal}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            style={{ backgroundImage: `url(${latestEvent.imageUrl})` }}
            className="relative flex min-h-screen w-full items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-28 md:px-12"
          >
            {/* Dark Overlay for contrast and readability */}
            <div className="absolute inset-0 bg-black/65" />

            {/* Content Container */}
            <div className="relative z-10 mx-auto max-w-5xl w-full text-left">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <p className="font-primary text-xs tracking-[0.35em] text-white/70 uppercase">
                  Next Event
                </p>
                <span className="text-white/40">•</span>
                {/* Formatted Weekday & Date */}
                <p className="font-primary text-xs tracking-widest text-amber-400 uppercase">
                  {formatEventDate(latestEvent.date)}
                </p>
              </div>

              <Link
                to={getEventPath(latestEvent)}
                className="group block space-y-4"
              >
                <h1 className="font-primary text-3xl tracking-wide text-white uppercase transition group-hover:text-white/80 md:text-5xl lg:text-6xl">
                  {latestEvent.title}
                </h1>
                <p className="font-lato text-base text-white/80 md:text-xl">
                  {eventSubtitle(latestEvent)}
                </p>
                <div className="pt-4">
                  <span className="inline-flex items-center gap-2 font-primary text-xs tracking-widest text-white uppercase underline decoration-white/30 underline-offset-8 transition group-hover:decoration-white">
                    View Details →
                  </span>
                </div>
              </Link>
            </div>
          </motion.div>
        </InViewSection>
      )}
    </div>
  );
};

export default UpcomingEvents;
