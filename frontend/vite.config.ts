import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { getLatestReleases } from "./api/_lib/spotify";
import { getStoreProducts } from "./api/_lib/selar";
import { getChannelVideos } from "./api/_lib/youtube";

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

        if (req.url.startsWith("/api/selar/products")) {
          try {
            const products = await getStoreProducts(env);
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Cache-Control", "public, max-age=1800, stale-while-revalidate=3600");
            res.end(JSON.stringify(products));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error: err instanceof Error ? err.message : "Unknown error",
              }),
            );
          }
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_URL || "https://trueworshipglobal-server.vercel.app";

  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    server: {
      // Fallback when VITE_API_URL is empty — relative /api/* hits the Express server
      proxy: {
        "/api/blogs": { target: apiTarget, changeOrigin: true },
        "/api/events": { target: apiTarget, changeOrigin: true },
        "/api/mailing": { target: apiTarget, changeOrigin: true },
      },
    },
  };
});
