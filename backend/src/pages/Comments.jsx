import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Button, Card, PageHeader } from "../components/ui";

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    api.comments
      .list()
      .then(setComments)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await api.comments.remove(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <PageHeader title="Comments" />
      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
      <div className="space-y-4">
        {comments.map((item) => (
          <Card key={item._id}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{item.name}</p>
                {item.email && (
                  <p className="mt-0.5 text-xs text-white/60">{item.email}</p>
                )}
                <p className="mt-1 text-xs text-white/50">
                  {item.blogId?.title ? `On: ${item.blogId.title}` : "Blog removed"} ·{" "}
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
              <Button variant="danger" onClick={() => onDelete(item._id)}>
                Delete
              </Button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/80">{item.comment}</p>
          </Card>
        ))}
        {comments.length === 0 && !error && (
          <p className="text-sm text-white/50">No comments yet.</p>
        )}
      </div>
    </div>
  );
}
