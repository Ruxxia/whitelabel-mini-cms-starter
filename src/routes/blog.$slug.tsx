import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageSections } from "@/components/PageSections";
import { useBlogPost, useSections } from "@/lib/composables";
import { useSEO } from "@/lib/seo";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({ component: BlogDetail });

function BlogDetail() {
  const { slug } = Route.useParams();
  const { data: p, isLoading } = useBlogPost(slug);
  const { data: tplSections } = useSections("blog_detail");
  useSEO({ title: p?.title ?? "Artikel", description: p?.excerpt ?? undefined, image: p?.cover_image ?? undefined });

  if (isLoading) return <SiteLayout><div className="container mx-auto p-8">Memuat...</div></SiteLayout>;
  if (!p) return <SiteLayout><div className="container mx-auto p-8">Artikel tidak ditemukan.</div></SiteLayout>;

  const hasTemplate = (tplSections ?? []).filter((s: any) => s.type !== "seo").length > 0;

  return (
    <SiteLayout>
      {hasTemplate ? (
        <PageSections pageSlug="blog_detail" item={p as any} />
      ) : (
        <article className="container mx-auto px-4 py-10 max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Kembali ke blog
          </Link>
          {p.cover_image && <img src={p.cover_image} alt={p.title} className="mt-6 rounded-2xl w-full aspect-video object-cover" />}
          <h1 className="mt-6 text-4xl font-bold tracking-tight">{p.title}</h1>
          {(p.published_at || p.profiles?.email) && (
            <p className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-2 items-center">
              {p.published_at && <span>{new Date(p.published_at).toLocaleDateString("id-ID", { dateStyle: "long" })}</span>}
              {p.published_at && p.profiles?.email && <span className="opacity-55">•</span>}
              {p.profiles?.email && (
                <span>Oleh: <span className="font-medium text-foreground">{p.profiles.email}</span></span>
              )}
            </p>
          )}
          <div className="prose prose-slate dark:prose-invert mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: p.content || "" }} />
        </article>
      )}
    </SiteLayout>
  );
}