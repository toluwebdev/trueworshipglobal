import { useRef, useState } from "react";
import { api } from "../api/client";
import { ErrorMessage } from "./ui";

export default function ImageUpload({
  label = "Cover image",
  value,
  onChange,
  type = "blogs",
  required = false,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const { url } = await api.uploadImage(file, type);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <span className="block text-xs tracking-wide text-white/60 uppercase">
        {label}
        {required && <span className="text-red-300"> *</span>}
      </span>

      {value ? (
        <div className="overflow-hidden rounded border border-white/15 bg-black/30">
          <img src={value} alt="" className="max-h-56 w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded border border-dashed border-white/25 bg-white/5 text-sm text-white/40">
          No image yet
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded border border-white/30 px-4 py-2 text-sm text-white transition hover:border-white disabled:opacity-50"
        >
          {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
        </button>
        {value && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => onChange("")}
            className="rounded border border-white/20 px-4 py-2 text-sm text-white/70 transition hover:border-white/50 hover:text-white disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={onPickFile}
      />

      {/* <label className="block">
        <span className="mb-1.5 block text-xs text-white/50">Or paste image URL</span>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          required={required && !value}
          className="w-full rounded border border-white/25 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none"
        />
      </label> */}

      <p className="text-xs text-white/40">JPEG, PNG, WebP, or GIF · max 5 MB</p>
      <ErrorMessage message={error} />
    </div>
  );
}
