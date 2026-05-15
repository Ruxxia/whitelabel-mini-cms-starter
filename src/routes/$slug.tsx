import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageSections } from "@/components/PageSections";
import { useSections } from "@/lib/composables";
import { usePageSEO } from "@/lib/seo";

export const Route = createFileRoute("/$slug")({ component: DynamicPage });

function DynamicPage() {
  const { slug } = Route.useParams();
  const { data: sections, isLoading } = useSections(slug);
  usePageSEO(slug, { title: slug.charAt(0).toUpperCase() + slug.slice(1) });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">Memuat...</div>
      </SiteLayout>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <SiteLayout>
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold capitalize">{slug}</h1>
          <p className="mt-3 text-muted-foreground">Halaman ini belum memiliki konten. Tambahkan section dari Admin → Halaman.</p>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageSections pageSlug={slug} />
    </SiteLayout>
  );
}
