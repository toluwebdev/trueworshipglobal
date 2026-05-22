import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import ArticleSkeleton from "../components/ArticleSkeleton";
import DetailEndedBar from "../components/DetailEndedBar";
import DetailRegisterBar from "../components/DetailRegisterBar";
import InViewSection from "../components/InViewSection";
import { InViewItem, InViewStagger } from "../components/InViewStagger";
import { usePageMeta } from "../hooks/usePageMeta";
import {
  cmsApi,
  eventSubtitle,
  getEventPath,
  getEventSlug,
  isEventUpcoming,
  type ApiEvent,
} from "../lib/api";
import { toAbsoluteImage } from "../lib/ogImage";

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

  usePageMeta({
    title: event ? `${event.title} — True Worship Global` : undefined,
    description: event
      ? `${eventSubtitle(event)} — ${event.description.replace(/\s+/g, " ").trim().slice(0, 140)}`
      : undefined,
    image: event ? toAbsoluteImage(event.imageUrl) : undefined,
    url: event
      ? `${typeof window !== "undefined" ? window.location.origin : ""}${getEventPath(event)}`
      : undefined,
  });

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
    <div className="min-h-screen bg-background pb-28 pt-28 text-white md:pb-32">
      <InViewSection as="div" className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[21/9]">
        <img src={event.imageUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </InViewSection>

      <div className="mx-auto max-w-3xl px-6 md:px-10">
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

        <InViewSection as="div" className="mt-6">
          <p className="font-lato text-sm text-white/60">{eventSubtitle(event)}</p>
          <h1 className="mt-3 font-primary text-xl leading-snug tracking-wide text-white uppercase md:text-2xl">
            {event.title}
          </h1>
        </InViewSection>

        <InViewStagger className="mt-8 space-y-5">
          {paragraphs.map((paragraph, i) => (
            <InViewItem key={i}>
              <p className="font-lato text-base leading-relaxed text-white/85 md:text-lg md:leading-[1.85]">
                {paragraph}
              </p>
            </InViewItem>
          ))}
        </InViewStagger>
      </div>
    </div>
  );
};

export default EventDetail;
