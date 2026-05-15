import { Link } from "@tanstack/react-router";
import { useSections, useProducts, useBlogPosts, useGallery } from "@/lib/composables";
import { ArrowRight, Sparkles, Truck, ShieldCheck, Star, Heart, Award, Zap, Phone, Mail } from "lucide-react";

const ICONS: Record<string, any> = { Sparkles, Truck, ShieldCheck, Star, Heart, Award, Zap, Phone, Mail };

export type SectionRow = {
  id: string;
  type: string;
  data: Record<string, any>;
  sort_order: number;
};

export function PageSections({ pageSlug }: { pageSlug: string }) {
  const { data: sections } = useSections(pageSlug);
  if (!sections || sections.length === 0) return null;
  return (
    <>
      {sections
        .filter((s: any) => s.type !== "seo")
        .map((s) => (
          <SectionRenderer key={s.id} section={s as unknown as SectionRow} />
        ))}
    </>
  );
}

export function SectionRenderer({ section }: { section: SectionRow }) {
  const d = section.data ?? {};
  switch (section.type) {
    case "hero":
      return (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-90" style={{ background: d.background ?? "var(--gradient-hero)" }} />
          {d.image_url && (
            <img src={d.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          )}
          <div className="relative container mx-auto px-4 py-24 md:py-32 text-primary-foreground">
            <div className="max-w-2xl">
              {d.eyebrow && (
                <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" /> {d.eyebrow}
                </span>
              )}
              <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight">{d.title}</h1>
              {d.subtitle && <p className="mt-4 text-lg opacity-90">{d.subtitle}</p>}
              <div className="mt-8 flex flex-wrap gap-3">
                {d.cta_label && d.cta_url && (
                  <a href={d.cta_url} className="inline-flex items-center gap-2 rounded-md bg-primary-foreground text-primary px-5 py-3 font-semibold hover:opacity-90 transition">
                    {d.cta_label} <ArrowRight className="h-4 w-4" />
                  </a>
                )}
                {d.cta2_label && d.cta2_url && (
                  <a href={d.cta2_url} className="inline-flex items-center rounded-md border border-primary-foreground/30 px-5 py-3 font-semibold hover:bg-primary-foreground/10 transition">
                    {d.cta2_label}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    case "page_header":
      return (
        <section className="container mx-auto px-4 pt-12 pb-4">
          <h1 className="text-4xl font-bold tracking-tight">{d.title}</h1>
          {d.subtitle && <p className="mt-2 text-muted-foreground max-w-2xl">{d.subtitle}</p>}
        </section>
      );
    case "features": {
      const items: any[] = Array.isArray(d.items) ? d.items : [];
      return (
        <section className="container mx-auto px-4 py-16">
          {d.title && <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{d.title}</h2>}
          <div className="grid gap-6 md:grid-cols-3">
            {items.map((it, i) => {
              const Icon = ICONS[it.icon] ?? Sparkles;
              return (
                <div key={i} className="rounded-2xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                  <Icon className="h-8 w-8 text-primary" />
                  <h3 className="mt-3 font-semibold">{it.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      );
    }
    case "rich_text":
      return (
        <section className="container mx-auto px-4 py-12 max-w-3xl">
          {d.title && <h2 className="text-2xl md:text-3xl font-bold mb-4">{d.title}</h2>}
          <div className="prose prose-slate max-w-none whitespace-pre-wrap text-foreground/90">{d.content}</div>
        </section>
      );
    case "cta":
      return (
        <section className="container mx-auto px-4 py-16">
          <div className="rounded-3xl p-10 md:p-14 text-center text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
            <h2 className="text-3xl md:text-4xl font-bold">{d.title}</h2>
            {d.subtitle && <p className="mt-3 opacity-90 max-w-xl mx-auto">{d.subtitle}</p>}
            {d.button_label && d.button_url && (
              <a href={d.button_url} className="inline-flex items-center gap-2 mt-6 rounded-md bg-primary-foreground text-primary px-5 py-3 font-semibold">
                {d.button_label} <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </section>
      );
    case "featured_products":
      return <FeaturedProducts title={d.title ?? "Produk Unggulan"} limit={Number(d.limit ?? 3)} />;
    case "featured_blog":
      return <FeaturedBlog title={d.title ?? "Artikel Terbaru"} limit={Number(d.limit ?? 3)} />;
    case "featured_gallery":
      return <FeaturedGallery title={d.title ?? "Galeri"} limit={Number(d.limit ?? 6)} />;
    default:
      return null;
  }
}

function FeaturedProducts({ title, limit }: { title: string; limit: number }) {
  const { data: products } = useProducts();
  const items = (products ?? []).slice(0, limit);
  if (items.length === 0) return null;
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        <Link to="/products" className="text-sm font-medium text-primary hover:underline">Lihat semua →</Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Link key={p.id} to="/products/$slug" params={{ slug: p.slug }} className="group rounded-2xl overflow-hidden border border-border bg-card hover:-translate-y-1 transition-transform" style={{ boxShadow: "var(--shadow-card)" }}>
            {p.image_url && (
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{p.description}</p>
              {p.price && <p className="mt-2 font-bold text-primary">Rp {Number(p.price).toLocaleString("id-ID")}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedBlog({ title, limit }: { title: string; limit: number }) {
  const { data: posts } = useBlogPosts();
  const items = (posts ?? []).slice(0, limit);
  if (items.length === 0) return null;
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        <Link to="/blog" className="text-sm font-medium text-primary hover:underline">Lihat semua →</Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((p) => (
          <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="rounded-2xl overflow-hidden border border-border bg-card hover:-translate-y-1 transition-transform" style={{ boxShadow: "var(--shadow-card)" }}>
            {p.cover_image && <img src={p.cover_image} alt={p.title} className="aspect-video w-full object-cover" />}
            <div className="p-4">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{p.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedGallery({ title, limit }: { title: string; limit: number }) {
  const { data: images } = useGallery();
  const items = (images ?? []).slice(0, limit);
  if (items.length === 0) return null;
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        <Link to="/gallery" className="text-sm font-medium text-primary hover:underline">Lihat semua →</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((img) => (
          <figure key={img.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <img src={img.image_url} alt={img.title ?? ""} className="w-full aspect-square object-cover" />
            {img.caption && <figcaption className="p-3 text-sm text-muted-foreground">{img.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  );
}