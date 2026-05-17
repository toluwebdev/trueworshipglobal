import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import BlogEngagement from "../components/blog/BlogEngagement";
import {
  cmsApi,
  contentParagraphs,
  formatBlogDate,
  type ApiBlog,
} from "../lib/api";

const BlogPost = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<ApiBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await cmsApi.blogs.get(postId);
        if (!cancelled) setPost(data);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  if (!postId) {
    return <Navigate to="/blog" replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pt-28 text-white/50">
        <p className="font-lato text-sm">Loading…</p>
      </div>
    );
  }

  if (notFound || !post) {
    return <Navigate to="/blog" replace />;
  }

  const paragraphs = contentParagraphs(post.content);

  return (
    <motion.div
      className="min-h-screen bg-background pb-24 pt-28 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[21/9]">
        <img src={post.imageUrl} alt="" className="h-full w-full object-cover" />
        <motion.div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <article className="mx-auto max-w-3xl px-6 md:px-10">
        <Link
          to="/blog"
          className="mt-8 inline-block font-primary text-xs tracking-[0.25em] text-white/60 uppercase transition hover:text-white"
        >
          ← All posts
        </Link>

        <p className="mt-6 font-lato text-sm text-white/60">
          {formatBlogDate(post.publishedAt, post.createdAt)} · {post.genre}
        </p>
        <h1 className="mt-3 font-primary text-xl leading-snug tracking-wide text-white uppercase md:text-2xl">
          {post.title}
        </h1>

        <div className="mt-8 space-y-5">
          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className="font-lato text-base leading-relaxed text-white/85 md:text-lg md:leading-[1.85]"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <BlogEngagement postId={post._id} postTitle={post.title} />
      </article>
    </motion.div>
  );
};

export default BlogPost;
