import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageSections } from "@/components/PageSections";
import { useBlogPosts, useSections } from "@/lib/composables";
import { usePageSEO } from "@/lib/seo";

export const Route = createFileRoute("/blog")({ component: BlogList });

function BlogList() {
  const { data: posts } = useBlogPosts();
  const { data: sections } = useSections("blog");
  usePageSEO("blog", { title: "Blog", description: "Cerita, tips, dan inspirasi UMKM." });
  return (
    <SiteLayout>
      <PageSections pageSlug="blog" />
      <section className="container mx-auto px-4 py-12">
        {(!sections || sections.length === 0) && (
          <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
        )}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {posts?.map((p) => (
            <Link
              key={p.id}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="rounded-2xl overflow-hidden border border-border bg-card hover:-translate-y-1 transition-transform"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {p.cover_image && <img src={p.cover_image} alt={p.title} className="aspect-video w-full object-cover" />}
              <div className="p-4">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}