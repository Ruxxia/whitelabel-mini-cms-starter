import { useSettings } from "@/lib/composables";

export function SEOPreview({
  title,
  description,
  image,
  url,
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}) {
  const { data: settings } = useSettings();
  const finalTitle = title || (settings?.seo as any)?.og_title || settings?.site_name || "Page Title";
  const finalDesc = description || (settings?.seo as any)?.og_description || settings?.description || "Page description will appear here.";
  const finalImage = image || (settings?.seo as any)?.og_image || settings?.logo_url;
  const displayUrl = url || (typeof window !== "undefined" ? window.location.origin : "https://example.com");
  const host = (() => { try { return new URL(displayUrl).host; } catch { return displayUrl; } })();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Google Search</p>
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="text-xs text-muted-foreground truncate">{host}</div>
          <div className="text-[#1a0dab] dark:text-blue-400 text-lg leading-snug truncate hover:underline cursor-pointer">{finalTitle}</div>
          <div className="text-sm text-muted-foreground line-clamp-2">{finalDesc}</div>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Facebook / Open Graph</p>
        <div className="rounded-lg border border-border bg-background overflow-hidden max-w-md">
          {finalImage ? (
            <div className="aspect-[1.91/1] bg-muted">
              <img src={finalImage} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="aspect-[1.91/1] bg-muted grid place-items-center text-xs text-muted-foreground">No OG image</div>
          )}
          <div className="p-3 bg-muted/40">
            <div className="text-[11px] uppercase text-muted-foreground truncate">{host}</div>
            <div className="text-sm font-semibold line-clamp-2">{finalTitle}</div>
            <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{finalDesc}</div>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Twitter / X Card</p>
        <div className="rounded-2xl border border-border bg-background overflow-hidden max-w-md">
          {finalImage && (
            <div className="aspect-[2/1] bg-muted">
              <img src={finalImage} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="px-3 py-2">
            <div className="text-sm font-semibold line-clamp-1">{finalTitle}</div>
            <div className="text-xs text-muted-foreground line-clamp-2">{finalDesc}</div>
            <div className="text-xs text-muted-foreground mt-1">🔗 {host}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
