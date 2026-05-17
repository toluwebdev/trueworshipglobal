import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import ImageUpload from "../components/ImageUpload";
import { Button, ErrorMessage, Input, PageHeader, Textarea } from "../components/ui";

const empty = {
  imageUrl: "",
  title: "",
  genre: "",
  content: "",
  isPublished: false,
};

export default function BlogForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.blogs
      .get(id)
      .then((blog) => {
        setForm({
          imageUrl: blog.imageUrl || "",
          title: blog.title || "",
          genre: blog.genre || "",
          content: blog.content || "",
          isPublished: Boolean(blog.isPublished),
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await api.blogs.update(id, form);
      } else {
        await api.blogs.create(form);
      }
      navigate("/blogs");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-white/60">Loading…</p>;
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title={isEdit ? "Edit blog post" : "New blog post"} />
      <form onSubmit={onSubmit} className="space-y-4">
        <ImageUpload
          label="Cover image"
          value={form.imageUrl}
          onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
          type="blogs"
          required
        />
        <Input label="Title" name="title" value={form.title} onChange={onChange} required />
        <Input label="Genre / subtitle" name="genre" value={form.genre} onChange={onChange} required />
        <Textarea
          label="Content"
          name="content"
          value={form.content}
          onChange={onChange}
          rows={12}
          required
        />
        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            name="isPublished"
            checked={form.isPublished}
            onChange={onChange}
            className="h-4 w-4"
          />
          Published
        </label>
        <ErrorMessage message={error} />
        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create post"}
          </Button>
          <Link to="/blogs">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
