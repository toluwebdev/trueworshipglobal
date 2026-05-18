type CardSkeletonProps = {
  /** Number of body lines under the title */
  lines?: number;
  /** Tailwind aspect ratio class for the image area */
  aspect?: string;
};

const CardSkeleton = ({ lines = 2, aspect = "aspect-[4/3]" }: CardSkeletonProps) => (
  <div className="overflow-hidden bg-neutral-900/50">
    <div className={`${aspect} skeleton`} />
    <div className="space-y-3 p-5">
      <div className="skeleton h-3 w-1/3 rounded-sm" />
      <div className="skeleton h-4 w-4/5 rounded-sm" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton h-3 rounded-sm ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  </div>
);

export default CardSkeleton;
