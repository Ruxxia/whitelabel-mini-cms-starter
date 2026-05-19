import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageSections } from "@/components/PageSections";
import { useProducts, useSections } from "@/lib/composables";
import { usePageSEO } from "@/lib/seo";
import { stripHtml } from "@/lib/utils";

export const Route = createFileRoute("/products/")({ component: Products });

function Products() {
  const { data: products, isLoading } = useProducts();
  const { data: sections } = useSections("products");
  usePageSEO("products", { title: "Our Products", description: "Catalog of our premier local products." });

  return (
    <SiteLayout>
      <PageSections pageSlug="products" />
      <section className="container mx-auto px-4 py-12">
        {(!sections || sections.length === 0) && (
          <>
            <h1 className="text-4xl font-bold tracking-tight">Products</h1>
            <p className="mt-2 text-muted-foreground">The best product selections for you.</p>
          </>
        )}

        {isLoading ? (
          <p className="mt-8 text-muted-foreground">Loading...</p>
        ) : (
          <div className={`mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${(products?.length ?? 0) > 10 ? "max-h-[80vh] overflow-y-auto pr-2" : ""}`}>
            {products?.map((p) => (
              <Link
                key={p.id}
                to="/products/$slug"
                params={{ slug: p.slug }}
                className="group rounded-2xl overflow-hidden border border-border bg-card hover:-translate-y-1 transition-transform"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {p.image_url && (
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{stripHtml(p.description || "")}</p>
                  {p.price && (
                    <p className="mt-2 font-bold text-primary">
                      ${Number(p.price).toLocaleString("en-US")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}