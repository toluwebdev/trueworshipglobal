import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Button, Card, PageHeader } from "../components/ui";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    api.blogs
      .list()
      .then(setBlogs)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await api.blogs.remove(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Blogs"
        action={
          <Link to="/blogs/new">
            <Button>New post</Button>
          </Link>
        }
      />
      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
      <div className="space-y-4">
        {blogs.map((blog) => (
          <Card key={blog._id} className="flex flex-wrap gap-4 md:flex-nowrap">
            {blog.imageUrl && (
              <img
                src={blog.imageUrl}
                alt=""
                className="h-24 w-full rounded object-cover md:h-28 md:w-40"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium">{blog.title}</h3>
                  <p className="mt-1 text-sm text-white/60">{blog.genre}</p>
                </div>
                <span
                  className={`text-xs tracking-wide uppercase ${
                    blog.isPublished ? "text-green-400" : "text-white/40"
                  }`}
                >
                  {blog.isPublished ? "Published" : "Draft"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/blogs/${blog._id}/edit`}>
                  <Button variant="ghost">Edit</Button>
                </Link>
                <Button variant="danger" onClick={() => onDelete(blog._id)}>
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {blogs.length === 0 && !error && (
          <p className="text-sm text-white/50">No blog posts yet.</p>
        )}
      </div>
    </div>
  );
}
