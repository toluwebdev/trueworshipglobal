import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CardSkeleton from "../components/CardSkeleton";
import {
  blogExcerpt,
  cmsApi,
  formatBlogDate,
  type ApiBlog,
} from "../lib/api";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35 },
  }),
};

const Blog = () => {
  const [posts, setPosts] = useState<ApiBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await cmsApi.blogs.list();
        if (!cancelled) setPosts(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load posts");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.div
      className="min-h-screen bg-background px-6 pb-24 pt-28 text-white md:px-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div className="mx-auto max-w-7xl">
        <h1 className="mb-12 text-center font-primary text-sm tracking-[0.35em] uppercase md:mb-16 md:text-base">
          Blog
        </h1>

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} lines={2} />
            ))}
          </div>
        )}

        {error && (
          <p className="text-center font-lato text-sm text-red-300">{error}</p>
        )}

        {!loading && !error && posts.length === 0 && (
          <p className="text-center font-lato text-sm text-white/50">
            No published posts yet. Check back soon.
          </p>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <BlogCard key={post._id} post={post} index={i} />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const BlogCard = ({ post, index }: { post: ApiBlog; index: number }) => (
  <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible">
    <Link
      to={`/blog/${post._id}`}
      className="group block overflow-hidden bg-neutral-900/50 transition hover:bg-neutral-900"
    >
      <motion.div className="aspect-[4/3] overflow-hidden">
        <img
          src={post.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </motion.div>
      <div className="p-5">
        <p className="font-lato text-xs text-white/50">
          {formatBlogDate(post.publishedAt, post.createdAt)}
        </p>
        <h2 className="mt-2 font-primary text-sm leading-snug tracking-wide text-white uppercase">
          {post.title}
        </h2>
        <p className="mt-2 font-lato text-sm text-white/60">{post.genre}</p>
        <p className="mt-3 line-clamp-2 font-lato text-sm leading-relaxed text-white/50">
          {blogExcerpt(post.content)}
        </p>
      </div>
    </Link>
  </motion.div>
);

export default Blog;
