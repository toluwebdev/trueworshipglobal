import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Card, PageHeader } from "../components/ui";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.stats()
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  const items = [
    { label: "Blog posts", value: stats?.blogs, to: "/blogs" },
    { label: "Events", value: stats?.events, to: "/events" },
    { label: "Comments", value: stats?.comments, to: "/comments" },
    { label: "Mailing list", value: stats?.subscribers, to: "/mailing" },
    { label: "Likes", value: stats?.likes },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" />
      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-white/60">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold">
              {stats ? item.value ?? 0 : "—"}
            </p>
            {item.to && (
              <Link
                to={item.to}
                className="mt-4 inline-block text-xs tracking-wide text-white/70 uppercase hover:text-white"
              >
                Manage →
              </Link>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
