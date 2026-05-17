import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cmsApi, eventSubtitle, isEventUpcoming, type ApiEvent } from "../lib/api";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35 },
  }),
};

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
    <motion.div
      className="min-h-screen bg-background px-6 pb-24 pt-28 text-white md:px-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-12 text-center font-primary text-sm tracking-[0.35em] uppercase md:mb-16 md:text-base">
          Events
        </h1>

        {loading && (
          <p className="text-center font-lato text-sm text-white/50">Loading events…</p>
        )}

        {error && (
          <p className="text-center font-lato text-sm text-red-300">{error}</p>
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
    </motion.div>
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
  <section className={className} aria-label={title}>
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
  </section>
);

const EventCard = ({ event, index }: { event: ApiEvent; index: number }) => (
  <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible">
    <Link
      to={`/events/${event._id}`}
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
