import cover1 from "../18.jpg";
import cover2 from "../29.jpg";
import cover3 from "../38.jpg";

export type BlogPost = {
  id: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  sortDate: string;
  imageUrl: string;
  excerpt: string;
  content: string[];
};

export const blogPosts: BlogPost[] = [
  {
    id: "why-worship-matters",
    title: "Why Worship Still Matters",
    subtitle: "Reflection · Ministry",
    dateLabel: "Mar 12, 2026",
    sortDate: "2026-03-12",
    imageUrl: cover1,
    excerpt:
      "Worship is more than music — it is the posture of a heart turned toward God. Here is why we keep gathering.",
    content: [
      "In a noisy world, worship creates space to hear God again. It is not performance; it is invitation — an open door for every believer to encounter His presence.",
      "True Worship Global exists to serve that moment: simple songs, singable melodies, and atmospheres where young people can meet Jesus without pretense.",
      "When we worship together, heaven responds. Keep making room. Keep showing up. The King is worthy.",
    ],
  },
  {
    id: "inaoluwa-fire-of-god",
    title: "Inaoluwa (Fire of God)",
    subtitle: "New music · Worship",
    dateLabel: "Jan 8, 2026",
    sortDate: "2026-01-08",
    imageUrl: cover2,
    excerpt:
      "A new sound carrying fire and intimacy — written to stir hunger for more of God in every listener.",
    content: [
      "Inaoluwa speaks of God's fire — not to consume us, but to refine us. This release was birthed in prayer and tested in gatherings where worship led and burdens lifted.",
      "We believe music can preach. Every line is crafted so you can sing it back to the Father in your room, your church, or your commute.",
      "Stream it, share it with someone who needs hope today, and let the fire fall where you are.",
    ],
  },
  {
    id: "smile-on-gods-face-book",
    title: "A Book for Every Believer",
    subtitle: "Books · Devotional",
    dateLabel: "Dec 2, 2025",
    sortDate: "2025-12-02",
    imageUrl: cover3,
    excerpt:
      "How to Put a Smile on God's Face — practical devotion for a life that pleases Him daily.",
    content: [
      "This book is an answer to a simple question: what does God delight in? Across its pages you will find honest, practical teaching rooted in Scripture and years of ministry.",
      "Whether you are new in faith or leading others, my prayer is that these words strengthen your walk and deepen your joy in Jesus.",
      "Launch packages are available now on Selar. Grab a copy for yourself and one for a friend.",
    ],
  },
];

export function getBlogPost(id: string): BlogPost | undefined {
  return blogPosts.find((post) => post.id === id);
}

export function getSortedBlogPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => b.sortDate.localeCompare(a.sortDate));
}
