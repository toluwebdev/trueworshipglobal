import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CardSkeleton from "../components/CardSkeleton";
import {
  classSubtitle,
  cmsApi,
  isClassUpcoming,
  type ApiWorshipClass,
} from "../lib/api";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35 },
  }),
};

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
    <motion.div
      className="min-h-screen bg-background px-6 pb-24 pt-28 text-white md:px-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-center font-primary text-sm tracking-[0.35em] uppercase md:text-base">
          Worship School Academy
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-center font-lato text-base leading-relaxed text-white/75 md:mb-16 md:text-lg">
          Intensive, spirit-led training to awaken worshippers, refine gifts, and deepen
          intimacy with the Father.
        </p>

        {loading && (
          <section aria-label="Loading classes">
            <motion.div className="mb-8 h-3 w-24 skeleton rounded-sm md:mb-10" />
            <motion.div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} lines={1} />
              ))}
            </motion.div>
          </section>
        )}

        {error && (
          <p className="text-center font-lato text-sm text-red-300">{error}</p>
        )}

        {!loading && !error && (
          <>
            <ClassSection title="Upcoming" classes={upcoming} />
            {past.length > 0 && (
              <ClassSection title="Past" classes={past} className="mt-16 md:mt-24" />
            )}
          </>
        )}
      </motion.div>
    </motion.div>
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
  <section className={className} aria-label={title}>
    <h2 className="mb-8 font-primary text-xs tracking-[0.3em] text-white/60 uppercase md:mb-10">
      {title}
    </h2>
    {classes.length === 0 ? (
      <p className="font-lato text-sm text-white/50">
        No {title.toLowerCase()} classes right now.
      </p>
    ) : (
      <motion.div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((item, i) => (
          <ClassCard key={item._id} item={item} index={i} />
        ))}
      </motion.div>
    )}
  </section>
);

const ClassCard = ({ item, index }: { item: ApiWorshipClass; index: number }) => (
  <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible">
    <Link
      to={`/worship-school/${item._id}`}
      className="group block overflow-hidden bg-neutral-900/50 transition hover:bg-neutral-900"
    >
      <motion.div className="aspect-[4/3] overflow-hidden">
        <img
          src={item.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </motion.div>
      <motion.div className="p-5">
        <h3 className="font-primary text-sm leading-snug tracking-wide text-white uppercase">
          {item.title}
        </h3>
        <p className="mt-2 font-lato text-sm text-white/60">{classSubtitle(item)}</p>
      </motion.div>
    </Link>
  </motion.div>
);

export default WorshipSchool;
