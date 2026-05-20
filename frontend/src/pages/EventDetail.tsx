import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import ArticleSkeleton from "../components/ArticleSkeleton";
import DetailEndedBar from "../components/DetailEndedBar";
import DetailRegisterBar from "../components/DetailRegisterBar";
import { cmsApi, eventSubtitle, getEventPath, getEventSlug, isEventUpcoming, type ApiEvent } from "../lib/api";

const EventDetail = () => {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!eventSlug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await cmsApi.events.get(eventSlug);
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
  }, [eventSlug]);

  useEffect(() => {
    if (!event || !eventSlug) return;
    const canonical = getEventSlug(event);
    if (eventSlug !== canonical) {
      navigate(getEventPath(event), { replace: true });
    }
  }, [event, eventSlug, navigate]);

  if (!eventSlug) {
    return <Navigate to="/events" replace />;
  }

  if (loading) {
    return <ArticleSkeleton paragraphs={3} reserveCta />;
  }

  if (notFound || !event) {
    return <Navigate to="/events" replace />;
  }

  const showRegister = isEventUpcoming(event.date) && Boolean(event.registerUrl);
  const paragraphs = event.description.split(/\n\n+/);

  return (
    <motion.div
      className="min-h-screen bg-background pb-28 pt-28 text-white md:pb-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[21/9]">
        <img src={event.imageUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <motion.div className="mx-auto max-w-3xl px-6 md:px-10">
        {showRegister ? (
          <DetailRegisterBar
            backTo="/events"
            backLabel="All events"
            registerUrl={event.registerUrl}
            ctaLabel="Register now"
          />
        ) : (
          <DetailEndedBar
            backTo="/events"
            backLabel="All events"
            endedMessage="This event has ended"
          />
        )}

        <p className="mt-6 font-lato text-sm text-white/60">{eventSubtitle(event)}</p>
        <h1 className="mt-3 font-primary text-xl leading-snug tracking-wide text-white uppercase md:text-2xl">
          {event.title}
        </h1>

        <motion.div className="mt-8 space-y-5">
          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className="font-lato text-base leading-relaxed text-white/85 md:text-lg md:leading-[1.85]"
            >
              {paragraph}
            </p>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EventDetail;
