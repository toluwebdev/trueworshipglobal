import { useRef, useState } from "react";
import { api } from "../api/client";
import { Button, ErrorMessage, Input, Textarea } from "./ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
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
  const [includeMailingList, setIncludeMailingList] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [additionalRecipients, setAdditionalRecipients] = useState([]);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sendResult, setSendResult] = useState(null);
  const fileInputRef = useRef(null);

  const listEmails = [
    ...new Set(
      subscriberEmails
        .map(normalizeEmail)
        .filter((email) => EMAIL_RE.test(email)),
    ),
  ];

  const listSet = new Set(listEmails);
  const uniqueAdditional = additionalRecipients.filter(
    (entry, index, arr) =>
      arr.findIndex((item) => item.email === entry.email) === index,
  );

  const listCount = includeMailingList ? listEmails.length : 0;
  const extraOnly = uniqueAdditional.filter((entry) => !listSet.has(entry.email));
  const recipientCount = listCount + extraOnly.length;

  const resetForm = () => {
    setSubject("");
    setMessage("");
    setTestEmail("");
    setIncludeMailingList(true);
    setNewEmail("");
    setNewName("");
    setAdditionalRecipients([]);
    setImages([]);
    setError("");
    setSendResult(null);
  };

  const resetAndClose = () => {
    resetForm();
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

  const addRecipient = () => {
    const email = normalizeEmail(newEmail);
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (additionalRecipients.some((entry) => entry.email === email)) {
      setError("That email is already added.");
      return;
    }
    const name = newName.trim();
    setAdditionalRecipients((prev) => [...prev, { email, name: name || undefined }]);
    setNewEmail("");
    setNewName("");
    setError("");
  };

  const removeRecipient = (email) => {
    setAdditionalRecipients((prev) => prev.filter((entry) => entry.email !== email));
  };

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
      setError("Turn on the mailing list and/or add at least one other recipient.");
      return;
    }

    if (!isTest) {
      const parts = [];
      if (listCount > 0) parts.push(`${listCount} from mailing list`);
      if (extraOnly.length > 0) parts.push(`${extraOnly.length} other`);
      if (!confirm(`Send to ${parts.join(" + ")} (${recipientCount} total)?`)) {
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
        testEmail: isTest ? normalizeEmail(testEmail) : undefined,
        includeMailingList: isTest ? true : includeMailingList,
        extraRecipients: isTest
          ? []
          : extraOnly.map((entry) => ({
              email: entry.email,
              name: entry.name,
            })),
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

  if (!open) return null;

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
            rows={6}
            disabled={sending || uploading}
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

          <div className="rounded border border-white/15 p-4">
            <p className="mb-3 text-sm font-medium text-white">Who receives this?</p>

            <label className="mb-4 flex cursor-pointer items-center gap-3 text-sm text-white/90">
              <input
                type="checkbox"
                checked={includeMailingList}
                onChange={(e) => setIncludeMailingList(e.target.checked)}
                disabled={sending || listEmails.length === 0}
                className="h-4 w-4 accent-amber-600"
              />
              <span>
                Mailing list ({listEmails.length})
                {listEmails.length === 0 && (
                  <span className="text-white/50"> — no subscribers yet</span>
                )}
              </span>
            </label>

            <p className="mb-2 text-xs tracking-wide text-white/60 uppercase">
              Other people (not on the list)
            </p>
            <div className="flex flex-wrap gap-2">
              <Input
                label="Email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={sending}
                className="min-w-[140px] flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRecipient();
                  }
                }}
              />
              <Input
                label="Name (optional)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={sending}
                className="min-w-[120px] flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRecipient();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              className="mt-2"
              disabled={sending || !newEmail.trim()}
              onClick={addRecipient}
            >
              Add recipient
            </Button>

            {uniqueAdditional.length > 0 && (
              <ul className="mt-4 space-y-2">
                {uniqueAdditional.map((entry) => (
                  <li
                    key={entry.email}
                    className="flex items-center justify-between gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  >
                    <span>
                      {entry.name ? (
                        <>
                          <span className="font-medium">{entry.name}</span>
                          <span className="text-white/50"> · {entry.email}</span>
                        </>
                      ) : (
                        entry.email
                      )}
                      {listSet.has(entry.email) && includeMailingList && (
                        <span className="ml-2 text-xs text-amber-300/90">(on list — won’t duplicate)</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeRecipient(entry.email)}
                      className="shrink-0 text-xs text-white/50 hover:text-white"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Input
            label="Test email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Optional — send one test first"
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
            Send ({recipientCount})
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
