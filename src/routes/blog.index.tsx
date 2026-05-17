import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageSections } from "@/components/PageSections";
import { useBlogPosts, useSections } from "@/lib/composables";
import { usePageSEO } from "@/lib/seo";

export const Route = createFileRoute("/blog/")({ component: BlogList });

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
        <div className={`mt-8 grid gap-6 md:grid-cols-3 ${(posts?.length ?? 0) > 10 ? "max-h-[80vh] overflow-y-auto pr-2" : ""}`}>
          {posts?.map((p) => (
            <Link
              key={p.id}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="flex flex-col h-full rounded-2xl overflow-hidden border border-border bg-card hover:-translate-y-1 transition-transform"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {p.cover_image && <img src={p.cover_image} alt={p.title} className="aspect-video w-full object-cover" />}
              <div className="p-4 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="font-semibold line-clamp-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{p.excerpt}</p>
                </div>
                {p.profiles?.email && (
                  <p className="mt-3 text-xs text-muted-foreground/80 flex items-center gap-1 border-t border-border/50 pt-2">
                    <span>Oleh:</span>
                    <span className="font-medium text-foreground/90">{p.profiles.email}</span>
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}