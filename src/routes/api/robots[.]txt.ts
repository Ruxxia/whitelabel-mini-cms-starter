import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const { data: settings } = await supabaseAdmin.from("settings").select("seo").limit(1).maybeSingle();
        const seo = (settings?.seo ?? {}) as Record<string, any>;
        const lines: string[] = ["User-agent: *"];
        if (seo.disallow_all) {
          lines.push("Disallow: /");
        } else {
          lines.push("Allow: /");
          lines.push("Disallow: /admin");
          lines.push("Disallow: /login");
          const extra: string[] = Array.isArray(seo.robots_disallow) ? seo.robots_disallow : [];
          for (const path of extra) if (path) lines.push(`Disallow: ${path}`);
        }
        if (typeof seo.robots_extra === "string" && seo.robots_extra.trim()) {
          lines.push("", seo.robots_extra.trim());
        }
        lines.push(`Sitemap: ${origin}/api/sitemap.xml`);
        return new Response(lines.join("\n") + "\n", {
          headers: { "content-type": "text/plain", "cache-control": "public, max-age=3600" },
        });
      },
    },
  },
});