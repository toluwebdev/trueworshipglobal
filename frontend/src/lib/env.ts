/** Backend API origin (no trailing slash). Set VITE_API_URL in frontend/.env */
export const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
