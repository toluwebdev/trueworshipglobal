const DEFAULT_API = "https://trueworshipglobal-server.vercel.app";

/** Backend API origin (no trailing slash). Override with VITE_API_URL in frontend/.env */
export const API_BASE = (
  import.meta.env.VITE_API_URL || DEFAULT_API
).replace(/\/$/, "");
