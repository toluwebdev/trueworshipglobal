import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import ArticleSkeleton from "../components/ArticleSkeleton";
import DetailEndedBar from "../components/DetailEndedBar";
import DetailRegisterBar from "../components/DetailRegisterBar";
import InViewSection from "../components/InViewSection";
import { InViewItem, InViewStagger } from "../components/InViewStagger";
import {
  classSubtitle,
  cmsApi,
  getWorshipClassPath,
  getWorshipClassSlug,
  isClassUpcoming,
  type ApiWorshipClass,
} from "../lib/api";

const WorshipSchoolDetail = () => {
  const { classSlug } = useParams<{ classSlug: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ApiWorshipClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!classSlug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await cmsApi.worshipSchool.get(classSlug);
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
  }, [classSlug]);

  useEffect(() => {
    if (!item || !classSlug) return;
    const canonical = getWorshipClassSlug(item);
    if (classSlug !== canonical) {
      navigate(getWorshipClassPath(item), { replace: true });
    }
  }, [item, classSlug, navigate]);

  if (!classSlug) {
    return <Navigate to="/worship-school" replace />;
  }

  if (loading) {
    return <ArticleSkeleton paragraphs={3} reserveCta />;
  }

  if (notFound || !item) {
    return <Navigate to="/worship-school" replace />;
  }

  const showRegister = isClassUpcoming(item.date) && Boolean(item.registerUrl);
  const paragraphs = item.description.split(/\n\n+/);

  return (
    <div className="min-h-screen bg-background pb-28 pt-28 text-white md:pb-32">
      <InViewSection as="div" className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[21/9]">
        <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </InViewSection>

      <div className="mx-auto max-w-3xl px-6 md:px-10">
        {showRegister ? (
          <DetailRegisterBar
            backTo="/worship-school"
            backLabel="All classes"
            registerUrl={item.registerUrl}
            ctaLabel="Enroll now"
          />
        ) : (
          <DetailEndedBar
            backTo="/worship-school"
            backLabel="All classes"
            endedMessage="This class has ended"
          />
        )}

        <InViewSection as="div" className="mt-6">
          <p className="font-lato text-sm text-white/60">{classSubtitle(item)}</p>
          <h1 className="mt-3 font-primary text-xl leading-snug tracking-wide text-white uppercase md:text-2xl">
            {item.title}
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

export default WorshipSchoolDetail;
