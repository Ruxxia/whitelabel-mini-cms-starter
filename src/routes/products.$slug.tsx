import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useProduct } from "@/lib/composables";
import { useSEO } from "@/lib/seo";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/products/$slug")({ component: ProductDetail });

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data: p, isLoading } = useProduct(slug);
  useSEO({ title: p?.name ?? "Produk", description: p?.description ?? undefined, image: p?.image_url ?? undefined });

  if (isLoading) return <SiteLayout><div className="container mx-auto p-8">Memuat...</div></SiteLayout>;
  if (!p) return <SiteLayout><div className="container mx-auto p-8">Produk tidak ditemukan.</div></SiteLayout>;

  return (
    <SiteLayout>
      <article className="container mx-auto px-4 py-10 max-w-4xl">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali ke produk
        </Link>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {p.image_url && <img src={p.image_url} alt={p.name} className="rounded-2xl w-full object-cover aspect-square" />}
          <div>
            <h1 className="text-3xl font-bold">{p.name}</h1>
            {p.price && <p className="mt-3 text-2xl font-bold text-primary">Rp {Number(p.price).toLocaleString("id-ID")}</p>}
            <p className="mt-4 text-muted-foreground">{p.description}</p>
          </div>
        </div>
      </article>
    </SiteLayout>
  );
}