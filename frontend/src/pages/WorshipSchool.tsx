import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import worshipSchoolHero from "../assets/worshipSchool.jpeg";
import CardSkeleton from "../components/CardSkeleton";
import InViewSection from "../components/InViewSection";
import { InViewItem, InViewStagger } from "../components/InViewStagger";
import {
  classSubtitle,
  cmsApi,
  getWorshipClassPath,
  isClassUpcoming,
  type ApiWorshipClass,
} from "../lib/api";
import { cardReveal, VIEWPORT } from "../lib/motion";

const WorshipSchool = () => {
  const [classes, setClasses] = useState<ApiWorshipClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await cmsApi.worshipSchool.list();
        if (!cancelled) setClasses(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load classes");
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
    const up: ApiWorshipClass[] = [];
    const pa: ApiWorshipClass[] = [];
    for (const item of classes) {
      if (isClassUpcoming(item.date)) up.push(item);
      else pa.push(item);
    }
    return { upcoming: up, past: pa };
  }, [classes]);

  return (
    <div className="min-h-screen bg-background pb-24 text-white">
      <header className="relative flex min-h-[42vh] items-end overflow-hidden md:min-h-[50vh]">
        <img
          src={worshipSchoolHero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-background/55" />
        <div
          className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"
          aria-hidden
        />
        <InViewSection
          as="div"
          className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-12 pt-32 md:px-10 md:pb-16 md:pt-36"
        >
          <InViewStagger className="space-y-4">
            <InViewItem>
              <h1 className="font-primary text-sm tracking-[0.35em] uppercase md:text-base">
                Worship School
              </h1>
            </InViewItem>
            <InViewItem>
              <p className="max-w-2xl font-lato text-base leading-relaxed text-white/85 md:text-lg md:leading-relaxed">
                Intensive, spirit-led training to awaken worshippers, refine gifts, and deepen
                intimacy with the Father.
              </p>
            </InViewItem>
          </InViewStagger>
        </InViewSection>
      </header>

      <div className="mx-auto max-w-7xl px-6 pt-12 md:px-10 md:pt-16">
        {loading && (
          <section aria-label="Loading classes">
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
            <ClassSection title="Upcoming" classes={upcoming} />
            {past.length > 0 && (
              <ClassSection title="Past" classes={past} className="mt-16 md:mt-24" />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const ClassSection = ({
  title,
  classes,
  className = "",
}: {
  title: string;
  classes: ApiWorshipClass[];
  className?: string;
}) => (
  <InViewSection as="section" className={className} aria-label={title}>
    <h2 className="mb-8 font-primary text-xs tracking-[0.3em] text-white/60 uppercase md:mb-10">
      {title}
    </h2>
    {classes.length === 0 ? (
      <p className="font-lato text-sm text-white/50">
        No {title.toLowerCase()} classes right now.
      </p>
    ) : (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((item, i) => (
          <ClassCard key={item._id} item={item} index={i} />
        ))}
      </div>
    )}
  </InViewSection>
);

const ClassCard = ({ item, index }: { item: ApiWorshipClass; index: number }) => (
  <motion.div
    custom={index}
    variants={cardReveal}
    initial="hidden"
    whileInView="visible"
    viewport={VIEWPORT}
  >
    <Link
      to={getWorshipClassPath(item)}
      className="group block overflow-hidden bg-neutral-900/50 transition hover:bg-neutral-900"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={item.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5">
        <h3 className="font-primary text-sm leading-snug tracking-wide text-white uppercase">
          {item.title}
        </h3>
        <p className="mt-2 font-lato text-sm text-white/60">{classSubtitle(item)}</p>
      </div>
    </Link>
  </motion.div>
);

export default WorshipSchool;
