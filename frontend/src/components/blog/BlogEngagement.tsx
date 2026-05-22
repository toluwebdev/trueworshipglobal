import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  fetchEngagement,
  getLikedLocally,
  getPostShareUrl,
  getShareLinks,
  postCommentApi,
  setLikedLocally,
  toggleLikeApi,
  type BlogComment,
  type PostEngagement,
} from "../../lib/blog";

type BlogEngagementProps = {
  postId: string;
  postTitle: string;
};

const BlogEngagement = ({ postId, postTitle }: BlogEngagementProps) => {
  const [engagement, setEngagement] = useState<PostEngagement>({ likes: 0, comments: [] });
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likeBusy, setLikeBusy] = useState(false);
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");

  const shareUrl = getPostShareUrl(postId);
  const shareLinks = getShareLinks(shareUrl, postTitle);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEngagement(postId);
      setEngagement(data);
      setCommentError(null);
    } catch {
      setEngagement({ likes: 0, comments: [] });
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    setLiked(getLikedLocally(postId));
    load();
  }, [postId, load]);

  const onLike = async () => {
    if (likeBusy) return;
    setLikeBusy(true);
    const nextLiked = !liked;

    setLiked(nextLiked);
    setLikedLocally(postId, nextLiked);
    setEngagement((prev) => ({
      ...prev,
      likes: Math.max(0, prev.likes + (nextLiked ? 1 : -1)),
    }));

    try {
      const data = await toggleLikeApi(postId);
      setEngagement(data);
      const serverLiked = data.liked ?? nextLiked;
      setLiked(serverLiked);
      setLikedLocally(postId, serverLiked);
    } catch {
      setLiked(!nextLiked);
      setLikedLocally(postId, !nextLiked);
      await load();
    } finally {
      setLikeBusy(false);
    }
  };

  const onComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (commentBusy) return;
    setCommentBusy(true);
    setCommentError(null);

    try {
      const data = await postCommentApi(postId, name, email, text);
      setEngagement(data);
      setName("");
      setEmail("");
      setText("");
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : "Could not post comment");
    } finally {
      setCommentBusy(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareNotice("Link copied");
    } catch {
      setShareNotice("Copy this link: " + shareUrl);
    }
    window.setTimeout(() => setShareNotice(null), 2500);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: postTitle, url: shareUrl });
        return;
      } catch {
        // user cancelled or failed
      }
    }
    await copyLink();
  };

  return (
    <section className="mt-14 border-t border-white/15 pt-10" aria-label="Post engagement">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onLike}
          disabled={likeBusy || loading}
          className={`inline-flex items-center gap-2 border px-4 py-2 font-primary text-xs tracking-[0.2em] uppercase transition disabled:opacity-50 ${
            liked
              ? "border-white bg-white text-black"
              : "border-white/40 text-white hover:border-white"
          }`}
          aria-pressed={liked}
        >
          <HeartIcon filled={liked} />
          {loading ? "—" : engagement.likes} {engagement.likes === 1 ? "Like" : "Likes"}
        </button>

        <button
          type="button"
          onClick={nativeShare}
          className="inline-flex items-center gap-2 border border-white/40 px-4 py-2 font-primary text-xs tracking-[0.2em] text-white uppercase transition hover:border-white"
        >
          <ShareIcon />
          Share
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <ShareLink href={shareLinks.twitter} label="X / Twitter" />
        <ShareLink href={shareLinks.facebook} label="Facebook" />
        <ShareLink href={shareLinks.whatsapp} label="WhatsApp" />
        <button
          type="button"
          onClick={copyLink}
          className="font-primary text-xs tracking-[0.15em] text-white/60 uppercase underline-offset-2 hover:text-white hover:underline"
        >
          Copy link
        </button>
      </div>
      {shareNotice && (
        <p className="mt-2 font-lato text-sm text-white/60">{shareNotice}</p>
      )}

      <form onSubmit={onComment} className="mt-10 space-y-4">
        <h3 className="font-primary text-xs tracking-[0.3em] text-white/70 uppercase">
          Comments ({engagement.comments.length})
        </h3>
        <label className="block">
          <span className="sr-only">Name</span>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={60}
            placeholder="Your name"
            className="w-full border border-white/35 bg-transparent px-4 py-3 font-lato text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="sr-only">Email</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={120}
            autoComplete="email"
            placeholder="Your email"
            className="w-full border border-white/35 bg-transparent px-4 py-3 font-lato text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="sr-only">Comment</span>
          <textarea
            name="comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            maxLength={1000}
            rows={4}
            placeholder="Write a comment…"
            className="w-full resize-y border border-white/35 bg-transparent px-4 py-3 font-lato text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none"
          />
        </label>
        {commentError && (
          <p className="font-lato text-sm text-red-300">{commentError}</p>
        )}
        <button
          type="submit"
          disabled={commentBusy}
          className="inline-flex min-w-[140px] items-center justify-center border border-white/80 px-6 py-2.5 font-primary text-sm tracking-[0.25em] text-white uppercase transition hover:bg-white hover:text-black disabled:opacity-50"
        >
          {commentBusy ? "Posting…" : "Post comment"}
        </button>
      </form>

      <ul className="mt-10 space-y-6">
        {engagement.comments.length === 0 && !loading && (
          <li className="font-lato text-sm text-white/50">Be the first to comment.</li>
        )}
        {engagement.comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </ul>
    </section>
  );
};

const CommentItem = ({ comment }: { comment: BlogComment }) => {
  const date = new Date(comment.createdAt);
  const label = Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  return (
    <li className="border-b border-white/10 pb-6 last:border-0">
      <p className="font-primary text-xs tracking-[0.15em] text-white uppercase">
        {comment.name}
      </p>
      {label && (
        <p className="mt-1 font-lato text-xs text-white/40">{label}</p>
      )}
      <p className="mt-3 font-lato text-sm leading-relaxed text-white/80">{comment.text}</p>
    </li>
  );
};

const ShareLink = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="font-primary text-xs tracking-[0.15em] text-white/60 uppercase underline-offset-2 hover:text-white hover:underline"
  >
    {label}
  </a>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} aria-hidden>
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
    />
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v14" />
  </svg>
);

export default BlogEngagement;
