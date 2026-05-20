import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CardSkeleton from "../components/CardSkeleton";
import InViewSection from "../components/InViewSection";
import { cmsApi, eventSubtitle, getEventPath, isEventUpcoming, type ApiEvent } from "../lib/api";
import { cardReveal, VIEWPORT } from "../lib/motion";

const Events = () => {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await cmsApi.events.list();
        if (!cancelled) setEvents(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load events");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { upcoming, past } = useMemo(() => {
    const up: ApiEvent[] = [];
    const pa: ApiEvent[] = [];
    for (const event of events) {
      if (isEventUpcoming(event.date)) up.push(event);
      else pa.push(event);
    }
    return { upcoming: up, past: pa };
  }, [events]);

  return (
    <div className="min-h-screen bg-background px-6 pb-24 pt-28 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <InViewSection as="div" className="mb-12 text-center md:mb-16">
          <h1 className="font-primary text-sm tracking-[0.35em] uppercase md:text-base">
            Events
          </h1>
        </InViewSection>

        {loading && (
          <section aria-label="Loading events">
            <div className="mb-8 h-3 w-24 skeleton rounded-sm md:mb-10" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} lines={1} />
              ))}
            </div>
          </section>
        )}

        {error && (
          <InViewSection as="p" className="text-center font-lato text-sm text-red-300">
            {error}
          </InViewSection>
        )}

        {!loading && !error && (
          <>
            <EventSection title="Upcoming" events={upcoming} />
            {past.length > 0 && (
              <EventSection title="Past" events={past} className="mt-16 md:mt-24" />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const EventSection = ({
  title,
  events,
  className = "",
}: {
  title: string;
  events: ApiEvent[];
  className?: string;
}) => (
  <InViewSection as="section" className={className} aria-label={title}>
    <h2 className="mb-8 font-primary text-xs tracking-[0.3em] text-white/60 uppercase md:mb-10">
      {title}
    </h2>
    {events.length === 0 ? (
      <p className="font-lato text-sm text-white/50">No {title.toLowerCase()} events right now.</p>
    ) : (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event, i) => (
          <EventCard key={event._id} event={event} index={i} />
        ))}
      </div>
    )}
  </InViewSection>
);

const EventCard = ({ event, index }: { event: ApiEvent; index: number }) => (
  <motion.div
    custom={index}
    variants={cardReveal}
    initial="hidden"
    whileInView="visible"
    viewport={VIEWPORT}
  >
    <Link
      to={getEventPath(event)}
      className="group block overflow-hidden bg-neutral-900/50 transition hover:bg-neutral-900"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={event.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5">
        <h3 className="font-primary text-sm leading-snug tracking-wide text-white uppercase">
          {event.title}
        </h3>
        <p className="mt-2 font-lato text-sm text-white/60">{eventSubtitle(event)}</p>
      </div>
    </Link>
  </motion.div>
);

export default Events;
