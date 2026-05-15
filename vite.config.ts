import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";
import path from "node:path";

// Set DEPLOY_TARGET=vercel (or anything non-cloudflare) to skip the Cloudflare plugin.
const useCloudflare = (process.env.DEPLOY_TARGET ?? "cloudflare") === "cloudflare";

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
    tanstackStart({ server: { entry: "server" } }),
    viteReact(),
    ...(useCloudflare && command === "build"
      ? [cloudflare({ viteEnvironment: { name: "ssr" } })]
      : []),
  ],
}));
