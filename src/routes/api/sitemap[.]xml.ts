import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const [{ data: products }, { data: posts }, { data: menus }] = await Promise.all([
          supabaseAdmin.from("products").select("slug,updated_at").eq("is_published", true),
          supabaseAdmin.from("blog_posts").select("slug,updated_at").eq("is_published", true),
          supabaseAdmin.from("menus").select("url"),
        ]);
        const norm = (u: string) => (u ?? "").replace(/^\/+|\/+$/g, "");
        const set = new Set<string>([
          "", "about", "services", "products", "gallery", "blog", "contact",
          ...(menus ?? []).map((m) => norm(m.url)),
          ...(products ?? []).map((p) => `products/${p.slug}`),
          ...(posts ?? []).map((p) => `blog/${p.slug}`),
        ]);
        const urls = Array.from(set);
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${origin}/${u}</loc></url>`).join("\n")}
</urlset>`;
        return new Response(xml, { headers: { "content-type": "application/xml", "cache-control": "public, max-age=3600" } });
      },
    },
  },
});