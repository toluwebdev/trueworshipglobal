import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { getLatestReleases } from "./server/spotify";
import { getChannelVideos } from "./server/youtube";

function apiPlugin(): Plugin {
  return {
    name: "api-routes",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) {
          next();
          return;
        }

        const envDir = server.config.envDir || process.cwd();
        const env = loadEnv(server.config.mode, envDir, "");
        const url = new URL(req.url, "http://localhost");

        if (req.url.startsWith("/api/youtube/videos")) {
          const limit = Math.min(Number(url.searchParams.get("limit")) || 12, 20);
          const videos = await getChannelVideos(env, limit);
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "public, max-age=300");
          res.end(JSON.stringify(videos));
          return;
        }

        if (!req.url.startsWith("/api/spotify/releases")) {
          next();
          return;
        }

        const limit = Math.min(Number(url.searchParams.get("limit")) || 5, 10);

        try {
          const releases = await getLatestReleases(env, limit);
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "public, max-age=1800, stale-while-revalidate=3600");
          res.end(JSON.stringify(releases));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : "Unknown error",
            }),
          );
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiPlugin()],
});
