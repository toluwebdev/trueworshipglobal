import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import ArticleSkeleton from "../components/ArticleSkeleton";
import BlogEngagement from "../components/blog/BlogEngagement";
import BlogRegisterCta from "../components/blog/BlogRegisterCta";
import InViewSection from "../components/InViewSection";
import { InViewItem, InViewStagger } from "../components/InViewStagger";
import { usePageMeta } from "../hooks/usePageMeta";
import { getPostShareUrl } from "../lib/blog";
import {
  blogExcerpt,
  cmsApi,
  contentParagraphs,
  formatBlogDate,
  type ApiBlog,
} from "../lib/api";
import { toAbsoluteImage } from "../lib/ogImage";

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

  usePageMeta({
    title: post ? `${post.title} — True Worship Global` : undefined,
    description: post ? blogExcerpt(post.content) || post.genre : undefined,
    image: post ? toAbsoluteImage(post.imageUrl) : undefined,
    url: post ? getPostShareUrl(post._id) : undefined,
  });

  if (!postId) {
    return <Navigate to="/blog" replace />;
  }

  if (loading) {
    return <ArticleSkeleton paragraphs={4} />;
  }

  if (notFound || !post) {
    return <Navigate to="/blog" replace />;
  }

  const paragraphs = contentParagraphs(post.content);

  return (
    <div className="min-h-screen bg-background pb-24 pt-28 text-white">
      <InViewSection as="div" className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[21/9]">
        <img src={post.imageUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </InViewSection>

      <article className="mx-auto max-w-3xl px-6 md:px-10">
        <InViewSection as="div" className="mt-8">
          <Link
            to="/blog"
            className="inline-block font-primary text-xs tracking-[0.25em] text-white/60 uppercase transition hover:text-white"
          >
            ← All posts
          </Link>

          <p className="mt-6 font-lato text-sm text-white/60">
            {formatBlogDate(post.publishedAt, post.createdAt)} · {post.genre}
          </p>
          <h1 className="mt-3 font-primary text-xl leading-snug tracking-wide text-white uppercase md:text-2xl">
            {post.title}
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

        {post.registerUrl?.trim() ? (
          <InViewSection as="div">
            <BlogRegisterCta registerUrl={post.registerUrl.trim()} />
          </InViewSection>
        ) : null}

        <InViewSection as="div" className="mt-12">
          <BlogEngagement postId={post._id} postTitle={post.title} />
        </InViewSection>
      </article>
    </div>
  );
};

export default BlogPost;
