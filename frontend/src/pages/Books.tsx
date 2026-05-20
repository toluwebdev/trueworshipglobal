import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import InViewSection from "../components/InViewSection";
import {
  fetchStoreBooksWithFallback,
  SELAR_STORE_URL,
  type BookItem,
} from "../lib/selar";
import { cardReveal, VIEWPORT } from "../lib/motion";

const Books = () => {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromFallback, setFromFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchStoreBooksWithFallback()
      .then(({ books: data, fromFallback: fallback }) => {
        if (cancelled) return;
        setBooks(data);
        setFromFallback(fallback);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background px-6 pb-24 pt-28 md:px-10">
      <div className="mx-auto max-w-7xl">
        <InViewSection as="div" className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-14">
          <h1 className="font-primary text-sm tracking-[0.35em] text-white uppercase md:text-base">
            Books
          </h1>
          <a
            href={SELAR_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-primary text-sm tracking-widest text-white/60 uppercase transition hover:text-white"
          >
            View on Selar →
          </a>
        </InViewSection>

        {fromFallback && !loading && (
          <InViewSection as="p" className="mb-8 font-lato text-sm text-white/50">
            Showing saved listings — live store sync will resume shortly.
          </InViewSection>
        )}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-neutral-800" />
                  <div className="mt-4 h-4 w-3/4 bg-neutral-800" />
                  <div className="mt-2 h-3 w-1/3 bg-neutral-800" />
                </div>
              ))
            : books.map((book, i) => (
                <motion.a
                  key={book.id}
                  href={book.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  custom={i}
                  variants={cardReveal}
                  initial="hidden"
                  whileInView="visible"
                  viewport={VIEWPORT}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
                    {book.imageUrl ? (
                      <img
                        src={book.imageUrl}
                        alt={book.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-primary text-xs text-neutral-500">
                        No cover
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/25" />
                  </div>
                  <h2 className="mt-4 font-primary text-sm leading-snug tracking-wide text-white uppercase">
                    {book.name}
                  </h2>
                  <p className="mt-2 font-lato text-sm text-white/70">{book.priceLabel}</p>
                  {book.excerpt ? (
                    <p className="mt-3 line-clamp-3 font-lato text-sm leading-relaxed text-white/55">
                      {book.excerpt}
                    </p>
                  ) : null}
                  <span className="mt-4 font-primary text-xs tracking-[0.25em] text-white/80 uppercase transition group-hover:text-white">
                    Buy on Selar →
                  </span>
                </motion.a>
              ))}
        </div>
      </div>
    </div>
  );
};

export default Books;
