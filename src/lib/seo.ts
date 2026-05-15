import { useEffect } from "react";
import { useSettings, useSections } from "@/lib/composables";

export function useSEO(opts: { title?: string; description?: string; image?: string }) {
  useEffect(() => {
    if (opts.title) document.title = opts.title;
    const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    if (opts.description) {
      setMeta("description", opts.description);
      setMeta("og:description", opts.description, "property");
    }
    if (opts.title) setMeta("og:title", opts.title, "property");
    if (opts.image) setMeta("og:image", opts.image, "property");
  }, [opts.title, opts.description, opts.image]);
}

/**
 * Resolve SEO/OG for a page with fallbacks:
 *   per-page (sections row type='seo') → defaults → global settings.seo / settings
 */
export function usePageSEO(slug: string, defaults?: { title?: string; description?: string; image?: string }) {
  const { data: settings } = useSettings();
  const { data: sections } = useSections(slug);
  const pageSeo = (sections?.find((s: any) => s.type === "seo")?.data ?? {}) as Record<string, any>;
  const globalSeo = (settings?.seo ?? {}) as Record<string, any>;

  const title =
    pageSeo.title ||
    defaults?.title ||
    globalSeo.og_title ||
    (settings?.site_name ? `${settings.site_name}${settings.tagline ? " — " + settings.tagline : ""}` : undefined);
  const description =
    pageSeo.description ||
    defaults?.description ||
    globalSeo.og_description ||
    settings?.description ||
    undefined;
  const image =
    pageSeo.image ||
    defaults?.image ||
    globalSeo.og_image ||
    settings?.logo_url ||
    undefined;

  useSEO({ title, description, image });
}