export function PageHeader({ title, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h2 className="text-xl font-semibold tracking-wide">{title}</h2>
      {action}
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const styles =
    variant === "ghost"
      ? "border border-white/30 text-white hover:border-white"
      : variant === "danger"
        ? "border border-red-400/50 text-red-300 hover:bg-red-500/10"
        : "border border-white bg-white text-black hover:bg-white/90";

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-xs tracking-wide text-white/60 uppercase">
          {label}
        </span>
      )}
      <input
        className="w-full rounded border border-white/25 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none"
        {...props}
      />
    </label>
  );
}

export function Textarea({ label, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-xs tracking-wide text-white/60 uppercase">
          {label}
        </span>
      )}
      <textarea
        className="w-full resize-y rounded border border-white/25 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none"
        {...props}
      />
    </label>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded border border-white/10 bg-neutral-900/50 p-5 ${className}`}>
      {children}
    </div>
  );
}

export function ErrorMessage({ message }) {
  if (!message) return null;
  return <p className="text-sm text-red-300">{message}</p>;
}
