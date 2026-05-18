import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import ArticleSkeleton from "../components/ArticleSkeleton";
import { cmsApi, eventSubtitle, isEventUpcoming, type ApiEvent } from "../lib/api";

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await cmsApi.events.get(eventId);
        if (!cancelled) setEvent(data);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (!eventId) {
    return <Navigate to="/events" replace />;
  }

  if (loading) {
    return <ArticleSkeleton paragraphs={3} reserveCta />;
  }

  if (notFound || !event) {
    return <Navigate to="/events" replace />;
  }

  const isUpcoming = isEventUpcoming(event.date);
  const showRegister = isUpcoming && Boolean(event.registerUrl);
  const paragraphs = event.description.split(/\n\n+/);

  return (
    <motion.div
      className="min-h-screen bg-background pb-28 pt-28 text-white md:pb-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[21/9]">
        <img
          src={event.imageUrl}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <Link
          to="/events"
          className="mt-8 inline-block font-primary text-xs tracking-[0.25em] text-white/60 uppercase transition hover:text-white"
        >
          ← All events
        </Link>

        <p className="mt-6 font-lato text-sm text-white/60">{eventSubtitle(event)}</p>
        <h1 className="mt-3 font-primary text-xl leading-snug tracking-wide text-white uppercase md:text-2xl">
          {event.title}
        </h1>

        <div className="mt-8 space-y-5">
          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className="font-lato text-base leading-relaxed text-white/85 md:text-lg md:leading-[1.85]"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {showRegister && (
        <motion.div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-background/95 px-6 py-4 backdrop-blur-md md:px-10">
          <div className="mx-auto flex max-w-3xl justify-center">
            <a
              href={event.registerUrl}
              target={event.registerUrl.startsWith("http") ? "_blank" : undefined}
              rel={
                event.registerUrl.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              className="flex w-full max-w-md items-center justify-center border border-white bg-white px-8 py-3.5 font-primary text-sm tracking-[0.3em] text-black uppercase transition hover:bg-white/90"
            >
              Register now
            </a>
          </div>
        </motion.div>
      )}

      {!isUpcoming && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-background/95 px-6 py-4 backdrop-blur-md md:px-10">
          <p className="text-center font-primary text-xs tracking-[0.25em] text-white/50 uppercase">
            This event has ended
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default EventDetail;
