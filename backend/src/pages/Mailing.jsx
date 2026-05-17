import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Button, Card, PageHeader } from "../components/ui";

export default function Mailing() {
  const [subscribers, setSubscribers] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    api.mailing
      .list()
      .then(setSubscribers)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    if (!confirm("Remove this subscriber?")) return;
    try {
      await api.mailing.remove(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <PageHeader title="Mailing list" />
      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
      <div className="space-y-3">
        {subscribers.map((entry) => (
          <Card key={entry._id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">{entry.name}</p>
              <p className="mt-1 text-sm text-white/60">{entry.email}</p>
              <p className="mt-1 text-xs text-white/40">
                {new Date(entry.createdAt).toLocaleString()}
              </p>
            </div>
            <Button variant="danger" onClick={() => onDelete(entry._id)}>
              Remove
            </Button>
          </Card>
        ))}
        {subscribers.length === 0 && !error && (
          <p className="text-sm text-white/50">No subscribers yet.</p>
        )}
      </div>
    </div>
  );
}
