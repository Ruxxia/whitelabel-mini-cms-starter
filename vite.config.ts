import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";
import path from "node:path";

// Skip Cloudflare plugin if deploying to Vercel (detected via DEPLOY_TARGET or standard VERCEL env var).
const useCloudflare =
  (process.env.DEPLOY_TARGET ?? "cloudflare") === "cloudflare" && !process.env.VERCEL;

export default defineConfig(({ command }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart(useCloudflare ? { server: { entry: "server" } } : undefined),
    viteReact(),
    ...(useCloudflare && command === "build"
      ? [cloudflare({ viteEnvironment: { name: "ssr" } })]
      : []),
  ],
}));
