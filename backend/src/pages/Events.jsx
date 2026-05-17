import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Button, Card, PageHeader } from "../components/ui";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    api.events
      .list()
      .then(setEvents)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      await api.events.remove(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Events"
        action={
          <Link to="/events/new">
            <Button>New event</Button>
          </Link>
        }
      />
      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event._id} className="flex flex-wrap gap-4 md:flex-nowrap">
            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt=""
                className="h-24 w-full rounded object-cover md:h-28 md:w-40"
              />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-medium">{event.title}</h3>
              <p className="mt-1 text-sm text-white/60">
                {new Date(event.date).toLocaleDateString()} · {event.time} · {event.location}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/events/${event._id}/edit`}>
                  <Button variant="ghost">Edit</Button>
                </Link>
                <Button variant="danger" onClick={() => onDelete(event._id)}>
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {events.length === 0 && !error && (
          <p className="text-sm text-white/50">No events yet.</p>
        )}
      </div>
    </div>
  );
}
