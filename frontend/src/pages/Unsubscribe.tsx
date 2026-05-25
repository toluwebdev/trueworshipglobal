import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { API_BASE } from "../lib/env";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email) {
      setStatus("error");
      setMessage("Missing email address in this link.");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    fetch(`${API_BASE}/api/mailing/unsubscribe?email=${encodeURIComponent(email)}`, {
      method: "GET",
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error((data as { error?: string }).error || "Could not unsubscribe");
        }
        if (!cancelled) {
          setStatus("done");
          setMessage((data as { message?: string }).message || "You have been unsubscribed.");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus("error");
          setMessage(err instanceof Error ? err.message : "Something went wrong.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [email]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-24 text-white">
      <div className="max-w-md text-center">
        <h1 className="font-primary text-sm tracking-[0.35em] uppercase">Mailing list</h1>
        {status === "loading" && (
          <p className="mt-6 font-lato text-base text-white/70">Processing…</p>
        )}
        {(status === "done" || status === "error") && (
          <p
            className={`mt-6 font-lato text-base leading-relaxed ${
              status === "done" ? "text-white/85" : "text-red-300"
            }`}
          >
            {message}
          </p>
        )}
        <Link
          to="/"
          className="mt-10 inline-block font-primary text-xs tracking-[0.25em] text-gold uppercase hover:text-gold-dark"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default Unsubscribe;
