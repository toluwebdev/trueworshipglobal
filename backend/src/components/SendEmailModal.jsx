import { useMemo, useRef, useState } from "react";
import { api } from "../api/client";
import { Button, ErrorMessage, Input, Textarea } from "./ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseExtraEmailsInput(input) {
  return [
    ...new Set(
      String(input)
        .split(/[\s,;]+/)
        .map((entry) => entry.trim().toLowerCase())
        .filter((entry) => EMAIL_RE.test(entry)),
    ),
  ];
}

export default function SendEmailModal({
  open,
  onClose,
  subscriberEmails = [],
  mailConfigured,
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [extraEmailsInput, setExtraEmailsInput] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sendResult, setSendResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const resetAndClose = () => {
    setSubject("");
    setMessage("");
    setTestEmail("");
    setExtraEmailsInput("");
    setImages([]);
    setError("");
    setSendResult(null);
    onClose();
  };

  const onPickImages = async (e) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    if (images.length + files.length > 10) {
      setError("You can attach up to 10 images per email.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of files) {
        const { url } = await api.uploadImage(file, "mailing");
        uploaded.push(url);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url) => {
    setImages((prev) => prev.filter((item) => item !== url));
  };

  const listEmails = useMemo(
    () =>
      [
        ...new Set(
          subscriberEmails
            .map((entry) => String(entry).trim().toLowerCase())
            .filter((entry) => EMAIL_RE.test(entry)),
        ),
      ],
    [subscriberEmails],
  );

  const extraEmails = useMemo(() => {
    const parsed = parseExtraEmailsInput(extraEmailsInput);
    const listSet = new Set(listEmails);
    return parsed.filter((email) => !listSet.has(email));
  }, [extraEmailsInput, listEmails]);

  const recipientCount = listEmails.length + extraEmails.length;

  const onSend = async (options = {}) => {
    const isTest = Boolean(options.test);
    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }
    if (!message.trim() && images.length === 0) {
      setError("Add a message or at least one image.");
      return;
    }
    if (isTest && !testEmail.trim()) {
      setError("Enter an email for the test send.");
      return;
    }
    if (!isTest && recipientCount === 0) {
      setError("Add subscribers to the list or enter at least one additional email.");
      return;
    }
    if (!isTest) {
      const parts = [];
      if (listEmails.length > 0) {
        parts.push(`${listEmails.length} on the mailing list`);
      }
      if (extraEmails.length > 0) {
        parts.push(`${extraEmails.length} additional`);
      }
      if (!confirm(`Send this email to ${parts.join(" + ")} (${recipientCount} total)?`)) {
        return;
      }
    }

    setSending(true);
    setError("");
    setSendResult(null);
    try {
      const result = await api.mailing.send({
        subject: subject.trim(),
        message: message.trim(),
        images,
        testEmail: isTest ? testEmail.trim() : undefined,
        extraEmails: isTest ? undefined : extraEmails,
      });
      setSendResult(result);
      if (!isTest && result.failed === 0) {
        setTimeout(resetAndClose, 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-email-title"
      onClick={resetAndClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded border border-white/15 bg-neutral-950 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h3 id="send-email-title" className="text-lg font-semibold tracking-wide text-white">
            Send email
          </h3>
          <button
            type="button"
            onClick={resetAndClose}
            className="text-sm text-white/50 transition hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {mailConfigured === false && (
          <p className="mb-4 text-sm text-amber-300">
            Email is not configured on the server. Add SMTP settings in Vercel, then try again.
          </p>
        )}

        <div className="space-y-4">
          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={200}
            disabled={sending || uploading}
          />
          <Textarea
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            disabled={sending || uploading}
            placeholder="Write like a personal note (e.g. “Hi, we wanted to share…”). Avoid words like “sale” or “offer”."
          />

          <div>
            <span className="mb-2 block text-xs tracking-wide text-white/60 uppercase">
              Images
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={onPickImages}
            />
            <Button
              type="button"
              variant="ghost"
              disabled={sending || uploading || images.length >= 10}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? "Uploading…" : "Add images"}
            </Button>
            {images.length > 0 && (
              <ul className="mt-4 grid grid-cols-2 gap-3">
                {images.map((url) => (
                  <li key={url} className="relative overflow-hidden rounded border border-white/15">
                    <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute top-1 right-1 rounded bg-black/70 px-2 py-0.5 text-xs text-white"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Textarea
            label="Additional recipients (optional)"
            value={extraEmailsInput}
            onChange={(e) => setExtraEmailsInput(e.target.value)}
            rows={3}
            disabled={sending || uploading}
            placeholder="People not on the list — one email per line, or separated by commas"
          />
          {extraEmails.length > 0 && (
            <p className="-mt-2 text-xs text-white/50">
              {extraEmails.length} additional address{extraEmails.length === 1 ? "" : "es"} will
              receive this send.
            </p>
          )}

          <Input
            label="Test email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Send a test first (optional)"
            disabled={sending || uploading}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            disabled={sending || uploading || mailConfigured === false}
            onClick={() => onSend({ test: true })}
          >
            {sending ? "Sending…" : "Send test"}
          </Button>
          <Button
            type="button"
            disabled={sending || uploading || mailConfigured === false || recipientCount === 0}
            onClick={() => onSend({ test: false })}
          >
            Send to all ({recipientCount})
          </Button>
          <Button type="button" variant="ghost" onClick={resetAndClose} disabled={sending}>
            Cancel
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
      </div>
    </div>
  );
}
