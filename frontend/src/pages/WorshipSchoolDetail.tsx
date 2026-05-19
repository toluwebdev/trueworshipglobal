import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import ArticleSkeleton from "../components/ArticleSkeleton";
import {
  classSubtitle,
  cmsApi,
  isClassUpcoming,
  type ApiWorshipClass,
} from "../lib/api";

const WorshipSchoolDetail = () => {
  const { classId } = useParams<{ classId: string }>();
  const [item, setItem] = useState<ApiWorshipClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!classId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await cmsApi.worshipSchool.get(classId);
        if (!cancelled) setItem(data);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [classId]);

  if (!classId) {
    return <Navigate to="/worship-school" replace />;
  }

  if (loading) {
    return <ArticleSkeleton paragraphs={3} reserveCta />;
  }

  if (notFound || !item) {
    return <Navigate to="/worship-school" replace />;
  }

  const isUpcoming = isClassUpcoming(item.date);
  const showRegister = isUpcoming && Boolean(item.registerUrl);
  const paragraphs = item.description.split(/\n\n+/);

  return (
    <motion.div
      className="min-h-screen bg-background pb-28 pt-28 text-white md:pb-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[21/9]">
        <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
        <motion.div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </motion.div>

      <motion.div className="mx-auto max-w-3xl px-6 md:px-10">
        <Link
          to="/worship-school"
          className="mt-8 inline-block font-primary text-xs tracking-[0.25em] text-white/60 uppercase transition hover:text-white"
        >
          ← All classes
        </Link>

        <p className="mt-6 font-lato text-sm text-white/60">{classSubtitle(item)}</p>
        <h1 className="mt-3 font-primary text-xl leading-snug tracking-wide text-white uppercase md:text-2xl">
          {item.title}
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

      {showRegister && (
        <motion.div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-background/95 px-6 py-4 backdrop-blur-md md:px-10">
          <motion.div className="mx-auto flex max-w-3xl justify-center">
            <a
              href={item.registerUrl}
              target={item.registerUrl.startsWith("http") ? "_blank" : undefined}
              rel={
                item.registerUrl.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              className="flex w-full max-w-md items-center justify-center border border-white bg-white px-8 py-3.5 font-primary text-sm tracking-[0.3em] text-black uppercase transition hover:bg-white/90"
            >
              Enroll now
            </a>
          </motion.div>
        </motion.div>
      )}

      {!isUpcoming && (
        <motion.div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-background/95 px-6 py-4 backdrop-blur-md md:px-10">
          <p className="text-center font-primary text-xs tracking-[0.25em] text-white/50 uppercase">
            This class has ended
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WorshipSchoolDetail;
