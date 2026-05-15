import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useBlogPost } from "@/lib/composables";
import { useSEO } from "@/lib/seo";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({ component: BlogDetail });

function BlogDetail() {
  const { slug } = Route.useParams();
  const { data: p, isLoading } = useBlogPost(slug);
  useSEO({ title: p?.title ?? "Artikel", description: p?.excerpt ?? undefined, image: p?.cover_image ?? undefined });

  if (isLoading) return <SiteLayout><div className="container mx-auto p-8">Memuat...</div></SiteLayout>;
  if (!p) return <SiteLayout><div className="container mx-auto p-8">Artikel tidak ditemukan.</div></SiteLayout>;

  return (
    <SiteLayout>
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali ke blog
        </Link>
        {p.cover_image && <img src={p.cover_image} alt={p.title} className="mt-6 rounded-2xl w-full aspect-video object-cover" />}
        <h1 className="mt-6 text-4xl font-bold tracking-tight">{p.title}</h1>
        {p.published_at && (
          <p className="mt-2 text-sm text-muted-foreground">{new Date(p.published_at).toLocaleDateString("id-ID", { dateStyle: "long" })}</p>
        )}
        <div className="prose prose-slate mt-6 max-w-none whitespace-pre-wrap">{p.content}</div>
      </article>
    </SiteLayout>
  );
}