import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSections, useProducts, useBlogPosts, useGallery } from "@/lib/composables";
import { ArrowRight, ArrowLeft, Sparkles, Truck, ShieldCheck, Star, Heart, Award, Zap, Phone, Mail } from "lucide-react";
import { stripHtml } from "@/lib/utils";

const ICONS: Record<string, any> = { Sparkles, Truck, ShieldCheck, Star, Heart, Award, Zap, Phone, Mail };

function ProductClassicGallery({ mainImage, gallery, title }: { mainImage?: string; gallery?: any; title: string }) {
  const images = [mainImage, ...(Array.isArray(gallery) ? (gallery as string[]) : [])].filter(Boolean) as string[];
  const [activeImage, setActiveImage] = useState(images[0] || "");

  if (images.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      <div className="overflow-hidden rounded-3xl bg-muted aspect-[16/10] relative animate-fade-in" style={{ boxShadow: "var(--shadow-card)" }}>
        <img key={activeImage} src={activeImage} alt={title} className="w-full h-full object-cover transition-opacity duration-300" />
      </div>
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((g, i) => (
            <button
              key={i}
              onMouseEnter={() => setActiveImage(g)}
              onClick={() => setActiveImage(g)}
              className={`relative aspect-square w-16 sm:w-20 rounded-xl overflow-hidden border-2 transition duration-200 ${
                activeImage === g ? "border-primary scale-105 shadow-md" : "border-border/60 opacity-70 hover:opacity-100 hover:scale-105"
              }`}
            >
              <img src={g} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export type SectionRow = {
  id: string;
  type: string;
  data: Record<string, any>;
  sort_order: number;
};

export function PageSections({ pageSlug, item }: { pageSlug: string; item?: Record<string, any> | null }) {
  const { data: sections } = useSections(pageSlug);
  if (!sections || sections.length === 0) return null;
  return (
    <>
      {sections
        .filter((s: any) => s.type !== "seo")
        .map((s) => (
          <SectionRenderer key={s.id} section={s as unknown as SectionRow} item={item} />
        ))}
    </>
  );
}

export function SectionRenderer({ section, item }: { section: SectionRow; item?: Record<string, any> | null }) {
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
      return <FeaturedProducts title={d.title ?? "Featured Products"} limit={Number(d.limit ?? 3)} />;
    case "featured_blog":
      return <FeaturedBlog title={d.title ?? "Latest Articles"} limit={Number(d.limit ?? 3)} />;
    case "featured_gallery":
      return <FeaturedGallery title={d.title ?? "Gallery"} limit={Number(d.limit ?? 6)} />;
    case "item_back_link": {
      const url = d.url ?? "/";
      const label = d.label ?? "Back";
      return (
        <div className="container mx-auto px-4 pt-8">
          <a href={url} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {label}
          </a>
        </div>
      );
    }
    case "item_image": {
      const src = item?.[d.field || "image_url"] ?? item?.cover_image ?? item?.image_url;
      if (!src) return null;
      const aspect = d.aspect ?? "video";
      const aspectCls = aspect === "square" ? "aspect-square" : aspect === "auto" ? "" : "aspect-video";
      return (
        <section className="container mx-auto px-4 py-6 max-w-4xl">
          <img src={src} alt={item?.name ?? item?.title ?? ""} className={`rounded-2xl w-full object-cover ${aspectCls}`} />
        </section>
      );
    }
    case "item_title": {
      const key = d.field || (item?.name !== undefined ? "name" : "title");
      const text = item?.[key] ?? "";
      if (!text) return null;
      return (
        <section className="container mx-auto px-4 pt-8 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{text}</h1>
        </section>
      );
    }
    case "item_subtitle": {
      const text = item?.[d.field || "tagline"] ?? item?.categories?.name ?? "";
      if (!text) return null;
      return (
        <section className="container mx-auto px-4 pt-2 max-w-3xl">
          <p className="text-muted-foreground">{text}</p>
        </section>
      );
    }
    case "item_price": {
      if (item?.price == null) return null;
      return (
        <section className="container mx-auto px-4 pt-3 max-w-3xl">
          <p className="text-2xl font-bold text-primary">
            {d.prefix ?? "$"} {Number(item.price).toLocaleString("en-US")}
          </p>
        </section>
      );
    }
    case "item_meta": {
      const date = item?.published_at;
      if (!date) return null;
      return (
        <section className="container mx-auto px-4 pt-2 max-w-3xl">
          <p className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString("en-US", { dateStyle: "long" })}
          </p>
        </section>
      );
    }
    case "item_summary": {
      const text = item?.[d.field || "excerpt"] ?? item?.description ?? "";
      if (!text) return null;
      return (
        <section className="container mx-auto px-4 py-4 max-w-3xl">
          {d.title && <h2 className="text-lg font-semibold mb-2">{d.title}</h2>}
          <p className="text-lg text-muted-foreground leading-relaxed">{text}</p>
        </section>
      );
    }
    case "item_description": {
      const key = d.field || (item?.content !== undefined ? "content" : "description");
      const text = item?.[key] ?? "";
      if (!text) return null;
      return (
        <section className="container mx-auto px-4 py-6 max-w-3xl">
          {d.title && <h2 className="text-2xl font-bold mb-3">{d.title}</h2>}
          <div className="prose prose-slate dark:prose-invert max-w-none text-foreground/90" dangerouslySetInnerHTML={{ __html: text }} />
        </section>
      );
    }
    case "heading": {
      const level = d.level ?? "h2";
      const cls = level === "h1" ? "text-4xl font-bold" : level === "h3" ? "text-xl font-semibold" : "text-2xl md:text-3xl font-bold";
      return (
        <section className="container mx-auto px-4 pt-8 pb-2 max-w-3xl">
          {level === "h1" ? <h1 className={cls}>{d.text}</h1> : level === "h3" ? <h3 className={cls}>{d.text}</h3> : <h2 className={cls}>{d.text}</h2>}
          {d.subtitle && <p className="mt-2 text-muted-foreground">{d.subtitle}</p>}
        </section>
      );
    }
    case "item_button": {
      const label = d.label ?? "Click here";
      const rawUrl: string = d.url ?? "#";
      const url = rawUrl
        .replace(/\{slug\}/g, item?.slug ?? "")
        .replace(/\{name\}/g, encodeURIComponent(item?.name ?? item?.title ?? ""))
        .replace(/\{price\}/g, String(item?.price ?? ""));
      const bg = d.bg_color || "var(--primary)";
      const fg = d.text_color || "var(--primary-foreground)";
      const align = d.align ?? "left";
      const alignCls = align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start";
      const full = d.full_width ? "w-full justify-center" : "";
      return (
        <section className="container mx-auto px-4 py-4 max-w-3xl">
          <div className={`flex ${alignCls}`}>
            <a
              href={url}
              target={d.new_tab ? "_blank" : undefined}
              rel={d.new_tab ? "noopener noreferrer" : undefined}
              className={`inline-flex items-center gap-2 rounded-sm px-5 py-3 font-semibold hover:opacity-90 transition ${full}`}
              style={{ background: bg, color: fg }}
            >
              {label}
            </a>
          </div>
        </section>
      );
    }
    case "product_split": {
      const img = item?.[d.image_field || "image_url"] ?? item?.cover_image ?? item?.image_url;
      const title = item?.name ?? item?.title ?? "";
      const subtitle = item?.categories?.name ?? item?.tagline ?? "";
      const desc = item?.description ?? item?.excerpt ?? item?.content ?? "";
      const price = item?.price;
      const backUrl = d.back_url ?? "/products";
      const backLabel = d.back_label ?? "Back to products";
      const ctaLabel = d.cta_label ?? "Order Now";
      const rawCta: string = d.cta_url ?? "/contact";
      const ctaUrl = rawCta
        .replace(/\{slug\}/g, item?.slug ?? "")
        .replace(/\{name\}/g, encodeURIComponent(title))
        .replace(/\{price\}/g, String(price ?? ""));
      const cta2Label = d.cta2_label;
      const cta2Url = (d.cta2_url ?? "")
        .replace(/\{slug\}/g, item?.slug ?? "")
        .replace(/\{name\}/g, encodeURIComponent(title));
      const ctaBg = d.cta_bg || "var(--primary)";
      const ctaFg = d.cta_fg || "var(--primary-foreground)";
      return (
        <section className="container mx-auto px-4 py-10">
          <a href={backUrl} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> {backLabel}
          </a>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-24">
              {img ? (
                <div className="overflow-hidden rounded-3xl bg-muted" style={{ boxShadow: "var(--shadow-card)" }}>
                  <img src={img} alt={title} className="w-full aspect-square object-cover" />
                </div>
              ) : (
                <div className="aspect-square rounded-3xl bg-muted" />
              )}
              {Array.isArray(item?.gallery) && item.gallery.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {item.gallery.slice(0, 4).map((g: string, i: number) => (
                    <img key={i} src={g} alt="" className="aspect-square w-full rounded-xl object-cover border border-border" />
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-6">
              {subtitle && <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{subtitle}</span>}
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">{title}</h1>
              {price != null && (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">${Number(price).toLocaleString("en-US")}</span>
                </div>
              )}
              {desc && <div className="text-base text-muted-foreground leading-relaxed prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: desc }} />}
              <div className="flex flex-wrap gap-3 pt-2">
                {ctaLabel && (
                  <a href={ctaUrl} target={d.cta_new_tab ? "_blank" : undefined} rel={d.cta_new_tab ? "noopener noreferrer" : undefined}
                     className="inline-flex items-center gap-2 rounded-sm px-6 py-3 font-semibold hover:opacity-90 transition"
                     style={{ background: ctaBg, color: ctaFg }}>
                    {ctaLabel} <ArrowRight className="h-4 w-4" />
                  </a>
                )}
                {cta2Label && (
                  <a href={cta2Url} className="inline-flex items-center rounded-sm border border-border px-6 py-3 font-semibold hover:bg-muted transition">
                    {cta2Label}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    }
    case "product_classic": {
      const img = item?.image_url ?? item?.cover_image;
      const title = item?.name ?? item?.title ?? "";
      const subtitle = item?.categories?.name ?? item?.tagline ?? "";
      const desc = item?.description ?? item?.excerpt ?? "";
      const price = item?.price;
      const backUrl = d.back_url ?? "/products";
      const backLabel = d.back_label ?? "Back";
      const ctaUrl = (d.cta_url ?? "/contact")
        .replace(/\{slug\}/g, item?.slug ?? "")
        .replace(/\{name\}/g, encodeURIComponent(title))
        .replace(/\{price\}/g, String(price ?? ""));
      const ctaBg = d.cta_bg || "var(--primary)";
      const ctaFg = d.cta_fg || "var(--primary-foreground)";
      return (
        <section className="container mx-auto px-4 py-10 max-w-5xl">
          <a href={backUrl} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> {backLabel}
          </a>
          {d.show_gallery !== false ? (
            <ProductClassicGallery mainImage={img} gallery={item?.gallery} title={title} />
          ) : (
            img && (
              <div className="overflow-hidden rounded-3xl bg-muted mb-8" style={{ boxShadow: "var(--shadow-card)" }}>
                <img src={img} alt={title} className="w-full aspect-[16/10] object-cover" />
              </div>
            )
          )}
          <div className="max-w-3xl">
            {subtitle && <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">{subtitle}</p>}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
            {price != null && <p className="mt-4 text-3xl font-bold text-primary">${Number(price).toLocaleString("en-US")}</p>}
            {desc && <div className="mt-6 text-base text-muted-foreground leading-relaxed prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: desc }} />}
            {d.cta_label && (
              <a href={ctaUrl} target={d.cta_new_tab ? "_blank" : undefined} rel={d.cta_new_tab ? "noopener noreferrer" : undefined}
                 className="mt-8 inline-flex items-center gap-2 rounded-sm px-6 py-3 font-semibold hover:opacity-90 transition"
                 style={{ background: ctaBg, color: ctaFg }}>
                {d.cta_label} <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </section>
      );
    }
    case "product_magazine": {
      const img = item?.image_url ?? item?.cover_image;
      const title = item?.name ?? item?.title ?? "";
      const subtitle = item?.categories?.name ?? item?.tagline ?? "";
      const desc = item?.description ?? item?.excerpt ?? "";
      const price = item?.price;
      const backUrl = d.back_url ?? "/products";
      const backLabel = d.back_label ?? "Back";
      const ctaUrl = (d.cta_url ?? "/contact")
        .replace(/\{slug\}/g, item?.slug ?? "")
        .replace(/\{name\}/g, encodeURIComponent(title))
        .replace(/\{price\}/g, String(price ?? ""));
      const ctaBg = d.cta_bg || "#0f172a";
      const ctaFg = d.cta_fg || "#ffffff";
      const overlay = Number(d.overlay_opacity ?? 60) / 100;
      return (
        <>
          <section className="relative">
            {img && <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover" />}
            <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(0,0,0,${overlay * 0.6}) 0%, rgba(0,0,0,${overlay}) 100%)` }} />
            <div className="relative container mx-auto px-4 py-24 md:py-40 text-white">
              <a href={backUrl} className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mb-6">
                <ArrowLeft className="h-4 w-4" /> {backLabel}
              </a>
              <div className="max-w-3xl">
                {subtitle && <span className="inline-flex items-center rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-medium">{subtitle}</span>}
                <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight leading-tight">{title}</h1>
                {price != null && <p className="mt-4 text-3xl font-bold">${Number(price).toLocaleString("en-US")}</p>}
              </div>
            </div>
          </section>
          <section className="container mx-auto px-4 py-12 max-w-3xl">
            {desc && <div className="text-lg text-foreground/90 leading-relaxed prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: desc }} />}
            {d.cta_label && (
              <a href={ctaUrl} target={d.cta_new_tab ? "_blank" : undefined} rel={d.cta_new_tab ? "noopener noreferrer" : undefined}
                 className="mt-8 inline-flex items-center gap-2 rounded-sm px-6 py-3 font-semibold hover:opacity-90 transition"
                 style={{ background: ctaBg, color: ctaFg }}>
                {d.cta_label} <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </section>
        </>
      );
    }
    case "product_bento": {
      const img = item?.image_url ?? item?.cover_image;
      const title = item?.name ?? item?.title ?? "";
      const subtitle = item?.categories?.name ?? item?.tagline ?? "";
      const desc = item?.description ?? item?.excerpt ?? "";
      const price = item?.price;
      const backUrl = d.back_url ?? "/products";
      const backLabel = d.back_label ?? "Back";
      const ctaUrl = (d.cta_url ?? "/contact")
        .replace(/\{slug\}/g, item?.slug ?? "")
        .replace(/\{name\}/g, encodeURIComponent(title))
        .replace(/\{price\}/g, String(price ?? ""));
      const ctaBg = d.cta_bg || "var(--primary)";
      const ctaFg = d.cta_fg || "var(--primary-foreground)";
      const highlights = [d.highlight1, d.highlight2, d.highlight3].filter(Boolean);
      return (
        <section className="container mx-auto px-4 py-10">
          <a href={backUrl} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> {backLabel}
          </a>
          <div className="grid gap-4 md:grid-cols-3 md:grid-rows-[auto_auto_auto]">
            <div className="md:col-span-2 md:row-span-2 overflow-hidden rounded-3xl bg-muted" style={{ boxShadow: "var(--shadow-card)" }}>
              {img ? <img src={img} alt={title} className="w-full h-full object-cover min-h-[300px]" /> : <div className="w-full h-full min-h-[300px]" />}
            </div>
            <div className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between">
              {subtitle && <span className="text-xs uppercase tracking-wider text-muted-foreground">{subtitle}</span>}
              <h1 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
              {price != null && <p className="mt-3 text-2xl font-bold text-primary">${Number(price).toLocaleString("en-US")}</p>}
            </div>
            <div className="rounded-3xl p-6 flex flex-col justify-between" style={{ background: ctaBg, color: ctaFg }}>
              <p className="text-sm opacity-90">Interested in this product?</p>
              {d.cta_label && (
                <a href={ctaUrl} target={d.cta_new_tab ? "_blank" : undefined} rel={d.cta_new_tab ? "noopener noreferrer" : undefined}
                   className="mt-4 inline-flex items-center justify-center gap-2 rounded-sm bg-white/15 backdrop-blur px-4 py-3 font-semibold hover:bg-white/25 transition">
                  {d.cta_label} <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </div>
            {desc && (
              <div className="md:col-span-2 rounded-3xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <div className="text-sm text-muted-foreground leading-relaxed prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: desc }} />
              </div>
            )}
            {highlights.length > 0 && (
              <div className="rounded-3xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-3">Highlights</h3>
                <ul className="space-y-2 text-sm">
                  {highlights.map((h: string, i: number) => (
                    <li key={i} className="flex items-start gap-2"><Sparkles className="h-4 w-4 text-primary mt-0.5" /> {h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      );
    }
    case "blog_classic": {
      const img = item?.cover_image ?? item?.image_url;
      const title = item?.title ?? item?.name ?? "";
      const date = item?.published_at;
      const excerpt = item?.excerpt;
      const content = item?.content ?? item?.description ?? "";
      const backUrl = d.back_url ?? "/blog";
      const backLabel = d.back_label ?? "Back to blog";
      return (
        <article className="container mx-auto px-4 py-10 max-w-3xl">
          <a href={backUrl} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {backLabel}
          </a>
          {img && <img src={img} alt={title} className="mt-6 rounded-2xl w-full aspect-video object-cover" style={{ boxShadow: "var(--shadow-card)" }} />}
          <h1 className="mt-8 text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
          {(date || item?.profiles?.email) && (
            <p className="mt-3 text-sm text-muted-foreground flex flex-wrap gap-2 items-center">
              {date && <span>{new Date(date).toLocaleDateString("en-US", { dateStyle: "long" })}</span>}
              {date && item?.profiles?.email && <span className="opacity-55">•</span>}
              {item?.profiles?.email && (
                <span>By: <span className="font-medium text-foreground">{item.profiles.email}</span></span>
              )}
            </p>
          )}
          {d.show_excerpt !== false && excerpt && <p className="mt-5 text-lg text-muted-foreground leading-relaxed">{excerpt}</p>}
          {content && <div className="prose prose-slate dark:prose-invert mt-8 max-w-none text-foreground/90" dangerouslySetInnerHTML={{ __html: content }} />}
        </article>
      );
    }
    case "blog_magazine": {
      const img = item?.cover_image ?? item?.image_url;
      const title = item?.title ?? item?.name ?? "";
      const date = item?.published_at;
      const excerpt = item?.excerpt;
      const content = item?.content ?? item?.description ?? "";
      const backUrl = d.back_url ?? "/blog";
      const backLabel = d.back_label ?? "Back";
      const overlay = Number(d.overlay_opacity ?? 60) / 100;
      return (
        <>
          <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-end overflow-hidden">
            {img && <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover" />}
            <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(0,0,0,${overlay * 0.4}) 0%, rgba(0,0,0,${overlay}) 100%)` }} />
            <div className="relative container mx-auto px-4 py-16 md:py-24 text-white">
              <a href={backUrl} className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mb-6">
                <ArrowLeft className="h-4 w-4" /> {backLabel}
              </a>
              <div className="max-w-3xl">
                {(date || item?.profiles?.email) && (
                  <div className="flex flex-wrap gap-2 items-center text-xs font-medium text-white/95">
                    {date && <span className="rounded-full bg-white/10 backdrop-blur px-3 py-1">{new Date(date).toLocaleDateString("en-US", { dateStyle: "long" })}</span>}
                    {item?.profiles?.email && <span className="rounded-full bg-white/10 backdrop-blur px-3 py-1">By: {item.profiles.email}</span>}
                  </div>
                )}
                <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight leading-tight">{title}</h1>
                {excerpt && <p className="mt-4 text-lg md:text-xl opacity-90 max-w-2xl">{excerpt}</p>}
              </div>
            </div>
          </section>
          {content && (
            <section className="container mx-auto px-4 py-12 max-w-3xl">
              <div className="prose prose-slate prose-lg dark:prose-invert max-w-none text-foreground/90" dangerouslySetInnerHTML={{ __html: content }} />
            </section>
          )}
        </>
      );
    }
    case "blog_split": {
      const img = item?.cover_image ?? item?.image_url;
      const title = item?.title ?? item?.name ?? "";
      const date = item?.published_at;
      const excerpt = item?.excerpt;
      const content = item?.content ?? item?.description ?? "";
      const backUrl = d.back_url ?? "/blog";
      const backLabel = d.back_label ?? "Back to blog";
      return (
        <section className="container mx-auto px-4 py-10">
          <a href={backUrl} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> {backLabel}
          </a>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-24">
              {img ? (
                <div className="overflow-hidden rounded-3xl bg-muted" style={{ boxShadow: "var(--shadow-card)" }}>
                  <img src={img} alt={title} className="w-full aspect-[4/5] object-cover" />
                </div>
              ) : (
                <div className="aspect-[4/5] rounded-3xl bg-muted" />
              )}
              {(date || item?.profiles?.email) && (
                <p className="mt-4 text-sm text-muted-foreground flex flex-wrap gap-2 items-center">
                  {date && <span>{new Date(date).toLocaleDateString("en-US", { dateStyle: "long" })}</span>}
                  {date && item?.profiles?.email && <span className="opacity-55">•</span>}
                  {item?.profiles?.email && (
                    <span>By: <span className="font-medium text-foreground">{item.profiles.email}</span></span>
                  )}
                </p>
              )}
              {excerpt && <p className="mt-3 text-base text-muted-foreground leading-relaxed">{excerpt}</p>}
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">{title}</h1>
              {content && <div className="prose prose-slate dark:prose-invert max-w-none text-foreground/90" dangerouslySetInnerHTML={{ __html: content }} />}
            </div>
          </div>
        </section>
      );
    }
    case "blog_minimal": {
      const title = item?.title ?? item?.name ?? "";
      const date = item?.published_at;
      const excerpt = item?.excerpt;
      const content = item?.content ?? item?.description ?? "";
      const backUrl = d.back_url ?? "/blog";
      const backLabel = d.back_label ?? "Back";
      return (
        <article className="container mx-auto px-4 py-16 max-w-2xl">
          <a href={backUrl} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {backLabel}
          </a>
          <div className="mt-12 text-center">
            {(date || item?.profiles?.email) && (
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex flex-wrap gap-2 items-center justify-center">
                {date && <span>{new Date(date).toLocaleDateString("en-US", { dateStyle: "long" })}</span>}
                {date && item?.profiles?.email && <span className="opacity-55">•</span>}
                {item?.profiles?.email && <span>By: {item.profiles.email}</span>}
              </p>
            )}
            <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight leading-tight">{title}</h1>
            {excerpt && <p className="mt-6 text-lg text-muted-foreground italic leading-relaxed">{excerpt}</p>}
          </div>
          <div className="mt-12 h-px bg-border" />
          {content && <div className="prose prose-slate dark:prose-invert mt-12 max-w-none text-foreground/90" dangerouslySetInnerHTML={{ __html: content }} />}
        </article>
      );
    }
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
        <Link to="/products" className="text-sm font-medium text-primary hover:underline">View all →</Link>
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
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{stripHtml(p.description || "")}</p>
              {p.price && <p className="mt-2 font-bold text-primary">${Number(p.price).toLocaleString("en-US")}</p>}
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
        <Link to="/blog" className="text-sm font-medium text-primary hover:underline">View all →</Link>
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
        <Link to="/gallery" className="text-sm font-medium text-primary hover:underline">View all →</Link>
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