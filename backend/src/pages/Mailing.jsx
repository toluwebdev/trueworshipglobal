import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Button, Card, ErrorMessage, Input, PageHeader, Textarea } from "../components/ui";

export default function Mailing() {
  const [subscribers, setSubscribers] = useState([]);
  const [error, setError] = useState("");
  const [mailConfigured, setMailConfigured] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

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

  const onSend = async (options = {}) => {
    const isTest = Boolean(options.test);
    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are required.");
      return;
    }
    if (isTest && !testEmail.trim()) {
      setError("Enter an email address for the test send.");
      return;
    }
    if (!isTest && !confirm(`Send this email to ${subscribers.length} subscriber(s)?`)) {
      return;
    }

    setSending(true);
    setError("");
    setSendResult(null);
    try {
      const result = await api.mailing.send({
        subject: subject.trim(),
        message: message.trim(),
        testEmail: isTest ? testEmail.trim() : undefined,
      });
      setSendResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Mailing list" />

      <Card className="mb-8">
        <h3 className="text-sm font-semibold tracking-wide text-white">Send newsletter</h3>
        {mailConfigured === false && (
          <p className="mt-3 text-sm text-amber-300">
            SMTP is not configured on the server yet. Add SMTP_HOST, SMTP_PORT, SMTP_USER, and
            SMTP_PASS to your Vercel environment variables, then redeploy.
          </p>
        )}
        {mailConfigured === true && (
          <div className="mt-3 space-y-2 text-sm text-white/60">
            <p>
              Emails are sent from your Hostinger mailbox. Send a test first, then send to everyone
              on the list.
            </p>
            <p className="text-white/45">
              To reduce spam folder placement: in Hostinger enable SPF + DKIM for your domain, set{" "}
              <code className="text-white/70">SMTP_FROM</code> to the same address as{" "}
              <code className="text-white/70">SMTP_USER</code>, and add{" "}
              <code className="text-white/70">PUBLIC_API_URL</code> (your server URL) on Vercel.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={200}
            required
            disabled={sending}
          />
          <Textarea
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={10}
            required
            disabled={sending}
            placeholder="Write your update for the mailing list…"
          />
          <Input
            label="Test email (optional)"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={sending}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            disabled={sending || mailConfigured === false}
            onClick={() => onSend({ test: true })}
          >
            {sending ? "Sending…" : "Send test"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={sending || mailConfigured === false || subscribers.length === 0}
            onClick={() => onSend({ test: false })}
          >
            Send to all ({subscribers.length})
          </Button>
        </div>

        {sendResult && (
          <p
            className={`mt-4 text-sm ${sendResult.failed > 0 ? "text-amber-300" : "text-emerald-300"}`}
          >
            {sendResult.message}
          </p>
        )}
        <ErrorMessage message={error} />
      </Card>

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
    </div>
  );
}
