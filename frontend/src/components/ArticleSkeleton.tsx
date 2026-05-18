type ArticleSkeletonProps = {
  /** Number of paragraph blocks under the title */
  paragraphs?: number;
  /** Reserve space for a sticky CTA bar (used on event detail) */
  reserveCta?: boolean;
};

const ArticleSkeleton = ({ paragraphs = 4, reserveCta = false }: ArticleSkeletonProps) => (
  <div
    className={`min-h-screen bg-background pt-28 text-white ${
      reserveCta ? "pb-28 md:pb-32" : "pb-24"
    }`}
  >
    <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[21/9]">
      <div className="skeleton h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
    </div>

    <div className="mx-auto max-w-3xl px-6 md:px-10">
      <div className="skeleton mt-8 h-3 w-24 rounded-sm" />

      <div className="skeleton mt-6 h-3 w-1/3 rounded-sm" />
      <div className="mt-4 space-y-3">
        <div className="skeleton h-6 w-5/6 rounded-sm md:h-7" />
        <div className="skeleton h-6 w-2/3 rounded-sm md:h-7" />
      </div>

      <div className="mt-10 space-y-5">
        {Array.from({ length: paragraphs }).map((_, i) => (
          <ParagraphLines key={i} />
        ))}
      </div>
    </div>
  </div>
);

const ParagraphLines = () => (
  <div className="space-y-2.5">
    <div className="skeleton h-3 w-full rounded-sm" />
    <div className="skeleton h-3 w-[97%] rounded-sm" />
    <div className="skeleton h-3 w-[92%] rounded-sm" />
    <div className="skeleton h-3 w-3/5 rounded-sm" />
  </div>
);

export default ArticleSkeleton;
