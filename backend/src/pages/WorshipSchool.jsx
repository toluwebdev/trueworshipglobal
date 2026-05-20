import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Button, Card, PageHeader } from "../components/ui";

export default function WorshipSchool() {
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    api.worshipSchool
      .list()
      .then(setClasses)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    if (!confirm("Delete this class?")) return;
    try {
      await api.worshipSchool.remove(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Worship School"
        action={
          <Link to="/worship-school/new">
            <Button>New class</Button>
          </Link>
        }
      />
      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
      <div className="space-y-4">
        {classes.map((item) => (
          <Card key={item._id} className="flex flex-wrap gap-4 md:flex-nowrap">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt=""
                className="h-24 w-full rounded object-cover md:h-28 md:w-40"
              />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-medium">{item.title}</h3>
              <p className="mt-1 text-sm text-white/60">
                {new Date(item.date).toLocaleDateString()} · {item.time} · {item.location}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/worship-school/${item._id}/edit`}>
                  <Button variant="ghost">Edit</Button>
                </Link>
                <Button variant="danger" onClick={() => onDelete(item._id)}>
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {classes.length === 0 && !error && (
          <p className="text-sm text-white/50">No classes yet.</p>
        )}
      </div>
    </div>
  );
}
