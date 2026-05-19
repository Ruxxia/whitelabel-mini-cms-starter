import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useGallery } from "@/lib/composables";
import { usePageSEO } from "@/lib/seo";

export const Route = createFileRoute("/gallery")({ component: Gallery });

function Gallery() {
  const { data: images } = useGallery();
  usePageSEO("gallery", { title: "Gallery", description: "Photo gallery of our activities and products." });
  return (
    <SiteLayout>
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold tracking-tight">Gallery</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images?.map((img) => (
            <figure key={img.id} className="overflow-hidden rounded-2xl border border-border bg-card group">
              <img src={img.image_url} alt={img.title ?? ""} className="w-full aspect-square object-cover group-hover:scale-105 transition" />
              {img.caption && <figcaption className="p-3 text-sm text-muted-foreground">{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}