import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageSections } from "@/components/PageSections";
import { useProduct, useSections } from "@/lib/composables";
import { useSEO } from "@/lib/seo";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/products/$slug")({ component: ProductDetail });

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data: p, isLoading } = useProduct(slug);
  const { data: tplSections } = useSections("product_detail");

  const images = p ? ([p.image_url, ...(Array.isArray(p.gallery) ? (p.gallery as string[]) : [])].filter(Boolean) as string[]) : [];
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    if (images[0]) {
      setActiveImage(images[0]);
    }
  }, [p]);

  useSEO({ title: p?.name ?? "Produk", description: p?.description || undefined, image: p?.image_url || undefined });

  if (isLoading) return <SiteLayout><div className="container mx-auto p-8">Memuat...</div></SiteLayout>;
  if (!p) return <SiteLayout><div className="container mx-auto p-8">Produk tidak ditemukan.</div></SiteLayout>;

  const hasTemplate = (tplSections ?? []).filter((s: any) => s.type !== "seo").length > 0;

  return (
    <SiteLayout>
      {hasTemplate ? (
        <PageSections pageSlug="product_detail" item={p as any} />
      ) : (
        <article className="container mx-auto px-4 py-10 max-w-4xl">
          <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Kembali ke produk
          </Link>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              {activeImage && (
                <div className="overflow-hidden rounded-3xl bg-muted border border-border aspect-square relative" style={{ boxShadow: "var(--shadow-card)" }}>
                  <img
                    key={activeImage}
                    src={activeImage}
                    alt={p.name}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                </div>
              )}
              {images.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onMouseEnter={() => setActiveImage(img)}
                      onClick={() => setActiveImage(img)}
                      className={`relative aspect-square w-16 rounded-xl overflow-hidden border-2 transition duration-200 ${
                        activeImage === img ? "border-primary scale-105 shadow-md" : "border-border/60 opacity-70 hover:opacity-100 hover:scale-105"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{p.name}</h1>
              {p.price && <p className="mt-3 text-2xl font-bold text-primary">Rp {Number(p.price).toLocaleString("id-ID")}</p>}
              <div className="mt-4 prose prose-slate dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: p.description || "" }} />
            </div>
          </div>
        </article>
      )}
    </SiteLayout>
  );
}