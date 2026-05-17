import "dotenv/config";
import cors from "cors";
import dns from "node:dns";
import express from "express";

import connectDB from "./config/database.js";
import { requireAdmin } from "./middleware/auth.js";
import authRoutes from "./routes/auth.routes.js";
import blogAdminRoutes from "./routes/admin/blog.routes.js";
import commentAdminRoutes from "./routes/admin/comment.routes.js";
import eventAdminRoutes from "./routes/admin/event.routes.js";
import mailingAdminRoutes from "./routes/admin/mailing.routes.js";
import statsAdminRoutes from "./routes/admin/stats.routes.js";
import uploadAdminRoutes from "./routes/admin/upload.routes.js";
import publicBlogRoutes from "./routes/public/blog.routes.js";
import publicEventRoutes from "./routes/public/event.routes.js";
import publicMailingRoutes from "./routes/public/mailing.routes.js";

// Helps Atlas SRV lookups on networks with flaky default DNS (Windows).
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const PORT = process.env.PORT || 5000;

const localhostOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const extraOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (localhostOrigin.test(origin)) return true;
  if (extraOrigins.includes(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    if (hostname.endsWith(".vercel.app")) return true;
  } catch {
    // ignore invalid origin
  }
  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);

app.use("/api/blogs", publicBlogRoutes);
app.use("/api/events", publicEventRoutes);
app.use("/api/mailing", publicMailingRoutes);

app.use("/api/admin/blogs", requireAdmin, blogAdminRoutes);
app.use("/api/admin/events", requireAdmin, eventAdminRoutes);
app.use("/api/admin/comments", requireAdmin, commentAdminRoutes);
app.use("/api/admin/mailing", requireAdmin, mailingAdminRoutes);
app.use("/api/admin/stats", requireAdmin, statsAdminRoutes);
app.use("/api/admin/upload", requireAdmin, uploadAdminRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
