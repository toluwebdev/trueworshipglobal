import { useEffect, useState } from "react";
import { api } from "../api/client";
import SendEmailModal from "../components/SendEmailModal";
import { Button, Card, ErrorMessage, PageHeader } from "../components/ui";

export default function Mailing() {
  const [subscribers, setSubscribers] = useState([]);
  const [error, setError] = useState("");
  const [mailConfigured, setMailConfigured] = useState(null);
  const [sendOpen, setSendOpen] = useState(false);

  const load = () => {
    api.mailing
      .list()
      .then(setSubscribers)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
    api.mailing
      .status()
      .then((data) => setMailConfigured(data.configured))
      .catch(() => setMailConfigured(false));
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
    <div className="max-w-3xl">
      <PageHeader
        title="Mailing list"
        action={
          <Button type="button" onClick={() => setSendOpen(true)}>
            Send email
          </Button>
        }
      />

      <ErrorMessage message={error} />

      <h3 className="mb-4 text-sm font-semibold tracking-wide text-white/80">
        Subscribers ({subscribers.length})
      </h3>
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

      <SendEmailModal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        subscriberEmails={subscribers.map((entry) => entry.email)}
        mailConfigured={mailConfigured}
      />
    </div>
  );
}
