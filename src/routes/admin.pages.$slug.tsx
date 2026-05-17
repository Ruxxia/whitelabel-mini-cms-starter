import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useSections } from "@/lib/composables";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";
import { SectionRenderer, type SectionRow } from "@/components/PageSections";
import { SEOPreview } from "@/components/SEOPreview";
import { ChevronUp, ChevronDown, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { useConfirm } from "@/components/ConfirmDialog";

export const Route = createFileRoute("/admin/pages/$slug")({ component: AdminPageEditor });

const SECTION_TYPES: { type: string; label: string; defaults: Record<string, any>; only?: string[] }[] = [
  { type: "hero", label: "Hero", defaults: { eyebrow: "Selamat datang", title: "Judul utama Anda", subtitle: "Deskripsi singkat menarik", cta_label: "Lihat Produk", cta_url: "/products", cta2_label: "Hubungi", cta2_url: "/contact" } },
  { type: "page_header", label: "Header Halaman", defaults: { title: "Judul Halaman", subtitle: "Subjudul opsional" } },
  { type: "heading", label: "Heading / Sub Heading", defaults: { level: "h2", text: "Judul section", subtitle: "" } },
  { type: "features", label: "Fitur / Keunggulan", defaults: { title: "Mengapa Kami", items: [
    { icon: "Sparkles", title: "Berkualitas", desc: "Produk pilihan terbaik" },
    { icon: "Truck", title: "Pengiriman Cepat", desc: "Sampai ke rumah Anda" },
    { icon: "ShieldCheck", title: "Aman", desc: "Transaksi terlindungi" },
  ] } },
  { type: "rich_text", label: "Teks Bebas", defaults: { title: "Tentang Kami", content: "Tulis cerita Anda di sini..." } },
  { type: "cta", label: "Call To Action", defaults: { title: "Siap memulai?", subtitle: "Hubungi kami sekarang", button_label: "Kontak", button_url: "/contact" } },
  { type: "featured_products", label: "Produk Unggulan", defaults: { title: "Produk Unggulan", limit: 3 } },
  { type: "featured_blog", label: "Artikel Terbaru", defaults: { title: "Artikel Terbaru", limit: 3 } },
  { type: "featured_gallery", label: "Galeri", defaults: { title: "Galeri", limit: 6 } },
  { type: "product_split", only: ["product_detail"], label: "[Detail Product Layout] Split Screen", defaults: { back_url: "/products", back_label: "Kembali ke produk", cta_label: "Pesan via WhatsApp", cta_url: "https://wa.me/62?text=Halo%20saya%20tertarik%20{name}", cta2_label: "Hubungi Kami", cta2_url: "/contact", cta_bg: "#16a34a", cta_fg: "#ffffff", cta_new_tab: true } },
  { type: "product_classic", only: ["product_detail"], label: "[Detail Product Layout] Classic", defaults: { back_url: "/products", back_label: "Kembali ke produk", cta_label: "Pesan via WhatsApp", cta_url: "https://wa.me/62?text=Halo%20saya%20tertarik%20{name}", cta_bg: "#16a34a", cta_fg: "#ffffff", cta_new_tab: true, show_gallery: true } },
  { type: "product_magazine", only: ["product_detail"], label: "[Detail Product Layout] Magazine Hero", defaults: { back_url: "/products", back_label: "Kembali", cta_label: "Pesan Sekarang", cta_url: "https://wa.me/62?text=Halo%20saya%20tertarik%20{name}", cta_bg: "#0f172a", cta_fg: "#ffffff", cta_new_tab: true, overlay_opacity: 60 } },
  { type: "product_bento", only: ["product_detail"], label: "[Detail Product Layout] Bento Grid", defaults: { back_url: "/products", back_label: "Kembali", cta_label: "Pesan via WhatsApp", cta_url: "https://wa.me/62?text=Halo%20saya%20tertarik%20{name}", cta_bg: "#16a34a", cta_fg: "#ffffff", cta_new_tab: true, highlight1: "Kualitas terbaik", highlight2: "Pengiriman cepat", highlight3: "Garansi resmi" } },
  { type: "blog_classic", only: ["blog_detail"], label: "[Detail Blog Layout] Classic", defaults: { back_url: "/blog", back_label: "Kembali ke blog", show_excerpt: true } },
  { type: "blog_magazine", only: ["blog_detail"], label: "[Detail Blog Layout] Magazine Hero", defaults: { back_url: "/blog", back_label: "Kembali", overlay_opacity: 60 } },
  { type: "blog_split", only: ["blog_detail"], label: "[Detail Blog Layout] Split Sticky", defaults: { back_url: "/blog", back_label: "Kembali ke blog" } },
  { type: "blog_minimal", only: ["blog_detail"], label: "[Detail Blog Layout] Minimal Editorial", defaults: { back_url: "/blog", back_label: "Kembali" } },
];

const PAGE_LABELS: Record<string, string> = { home: "Beranda", products: "Produk", blog: "Blog", gallery: "Galeri", product_detail: "Template Halaman Detail Produk", blog_detail: "Template Halaman Detail Artikel" };

const MOCK_PRODUCT = {
  slug: "contoh-produk",
  name: "Contoh Produk Premium",
  price: 250000,
  description: "Ini adalah deskripsi contoh untuk produk. Pratinjau ini menggunakan data tiruan agar Anda bisa melihat tampilan layout sebelum dipublikasikan.",
  image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",
  ],
  categories: { name: "Sepatu", slug: "sepatu" },
};

const MOCK_BLOG = {
  slug: "contoh-artikel",
  title: "Contoh Judul Artikel Blog",
  excerpt: "Ringkasan singkat artikel sebagai pratinjau layout.",
  content: "Ini adalah isi konten artikel contoh. Gunakan pratinjau ini untuk melihat tampilan layout detail blog sebelum dipublikasikan.\n\nParagraf kedua untuk menunjukkan tipografi dan jarak antar paragraf.",
  cover_image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&q=80",
  published_at: new Date().toISOString(),
};

function AdminPageEditor() {
  const { slug } = Route.useParams();
  const { data: sections, refetch } = useSections(slug);
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [preview, setPreview] = useState(true);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["sections", slug] });
    refetch();
  };

  const addSection = async (type: string) => {
    const def = SECTION_TYPES.find((t) => t.type === type);
    const sort_order = (sections?.length ?? 0) + 1;
    const { error } = await supabase.from("sections").insert({ page_slug: slug, type, data: def?.defaults ?? {}, sort_order });
    if (error) return toast.error(error.message);
    toast.success("Section ditambahkan");
    invalidate();
  };

  const updateData = async (id: string, data: any) => {
    const { error } = await supabase.from("sections").update({ data }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Tersimpan");
    invalidate();
  };

  const move = async (id: string, dir: -1 | 1) => {
    if (!sections) return;
    const idx = sections.findIndex((s: any) => s.id === id);
    const swap = sections[idx + dir];
    if (!swap) return;
    const a = sections[idx];
    await supabase.from("sections").update({ sort_order: (swap as any).sort_order }).eq("id", a.id);
    await supabase.from("sections").update({ sort_order: (a as any).sort_order }).eq("id", swap.id);
    invalidate();
  };

  const remove = async (id: string) => {
    if (!(await confirm({ title: "Hapus section?", destructive: true, confirmText: "Hapus" }))) return;
    const { error } = await supabase.from("sections").delete().eq("id", id);
    if (error) return toast.error(error.message);
    invalidate();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link to="/admin/pages" className="text-sm text-muted-foreground hover:underline">← Halaman</Link>
          <h1 className="text-3xl font-bold mt-1">Edit: {PAGE_LABELS[slug] ?? slug}</h1>
        </div>
        <button onClick={() => setPreview((p) => !p)} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
          {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {preview ? "Sembunyikan preview" : "Tampilkan preview"}
        </button>
      </div>

      <SEOEditor slug={slug} sections={sections} onSaved={invalidate} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <AddSection onAdd={addSection} slug={slug} />
          {(sections ?? []).filter((s: any) => s.type !== "seo").map((s: any, i: number, arr: any[]) => (
            <SectionEditor
              key={s.id}
              section={s}
              isFirst={i === 0}
              isLast={i === arr.length - 1}
              onSave={(d) => updateData(s.id, d)}
              onMove={(dir) => move(s.id, dir)}
              onRemove={() => remove(s.id)}
            />
          ))}
          {sections && sections.filter((s: any) => s.type !== "seo").length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
              Belum ada section. Tambahkan dari menu di atas.
            </div>
          )}
        </div>

        {preview && (
          <div className="lg:sticky lg:top-6 self-start">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Preview {(slug === "product_detail" || slug === "blog_detail") && <span className="ml-1 normal-case tracking-normal">(data tiruan)</span>}
            </p>
            <div className="rounded-2xl border border-border bg-background overflow-hidden max-h-[80vh] overflow-y-auto">
              {(sections ?? []).filter((s: any) => s.type !== "seo").map((s: any) => (
                <div key={s.id} className="scale-[0.85] origin-top-left w-[117%]">
                  <SectionRenderer
                    section={s as SectionRow}
                    item={slug === "product_detail" ? MOCK_PRODUCT : slug === "blog_detail" ? MOCK_BLOG : undefined}
                  />
                </div>
              ))}
              {(!sections || sections.filter((s: any) => s.type !== "seo").length === 0) && <div className="p-8 text-sm text-muted-foreground text-center">Tidak ada konten</div>}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function SEOEditor({ slug, sections, onSaved }: { slug: string; sections: any[] | undefined; onSaved: () => void }) {
  const existing = sections?.find((s: any) => s.type === "seo");
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Record<string, any>>(existing?.data ?? {});
  // sync when sections load
  useEffectSync(existing?.id, existing?.data, setData);
  const save = async () => {
    if (existing) {
      const { error } = await supabase.from("sections").update({ data }).eq("id", existing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("sections").insert({ page_slug: slug, type: "seo", data, sort_order: -1 });
      if (error) return toast.error(error.message);
    }
    toast.success("SEO disimpan");
    onSaved();
  };
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-5 py-3 bg-muted/40 text-left">
        <span className="font-semibold text-sm">SEO & Open Graph (halaman ini)</span>
        <span className="text-xs text-muted-foreground">{open ? "Tutup" : "Buka"} • Kosongkan untuk pakai default global</span>
      </button>
      {open && (
        <div className="p-4 space-y-3">
          <Text label="Title (SEO)" value={data.title} onChange={(v) => setData({ ...data, title: v })} />
          <Text label="Description (SEO/OG)" value={data.description} onChange={(v) => setData({ ...data, description: v })} multiline />
          <div>
            <span className="text-sm font-medium">OG Image</span>
            <div className="mt-1"><ImageUpload bucket="media" value={data.image} onChange={(url) => setData({ ...data, image: url })} /></div>
          </div>
          <button onClick={save} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Simpan SEO</button>
          <div className="pt-4 border-t border-border">
            <SEOPreview title={data.title} description={data.description} image={data.image} url={typeof window !== "undefined" ? `${window.location.origin}/${slug === "home" ? "" : slug}` : undefined} />
          </div>
        </div>
      )}
    </div>
  );
}

function useEffectSync(id: string | undefined, data: any, setData: (d: any) => void) {
  // Re-init local state when the underlying section row changes/loads
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setData(data ?? {}); }, [id]);
}

function AddSection({ onAdd, slug }: { onAdd: (type: string) => void; slug: string }) {
  const available = SECTION_TYPES.filter((t) => !t.only || t.only.includes(slug));
  const [type, setType] = useState(available[0]?.type ?? SECTION_TYPES[0].type);
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-2">
      <select value={type} onChange={(e) => setType(e.target.value)} className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
        {available.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
      </select>
      <button onClick={() => onAdd(type)} className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">
        <Plus className="h-4 w-4" /> Tambah
      </button>
    </div>
  );
}

function SectionEditor({ section, isFirst, isLast, onSave, onMove, onRemove }: {
  section: any; isFirst: boolean; isLast: boolean;
  onSave: (d: any) => void; onMove: (dir: -1 | 1) => void; onRemove: () => void;
}) {
  const [data, setData] = useState<Record<string, any>>(section.data ?? {});
  const meta = SECTION_TYPES.find((t) => t.type === section.type);
  const set = (k: string, v: any) => setData({ ...data, [k]: v });

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2">
        <span className="text-sm font-semibold">{meta?.label ?? section.type}</span>
        <div className="flex items-center gap-1">
          <button disabled={isFirst} onClick={() => onMove(-1)} className="p-1.5 rounded hover:bg-muted disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
          <button disabled={isLast} onClick={() => onMove(1)} className="p-1.5 rounded hover:bg-muted disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
          <button onClick={onRemove} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {renderFields(section.type, data, set)}
        <button onClick={() => onSave(data)} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Simpan</button>
      </div>
    </div>
  );
}

function Text({ label, value, onChange, multiline }: { label: string; value: any; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {multiline ? (
        <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={4} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      ) : (
        <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      )}
    </label>
  );
}

function renderFields(type: string, data: any, set: (k: string, v: any) => void) {
  switch (type) {
    case "hero":
      return (
        <>
          <Text label="Eyebrow" value={data.eyebrow} onChange={(v) => set("eyebrow", v)} />
          <Text label="Judul" value={data.title} onChange={(v) => set("title", v)} />
          <Text label="Subjudul" value={data.subtitle} onChange={(v) => set("subtitle", v)} multiline />
          <div className="grid sm:grid-cols-2 gap-3">
            <Text label="CTA 1 - Label" value={data.cta_label} onChange={(v) => set("cta_label", v)} />
            <Text label="CTA 1 - URL" value={data.cta_url} onChange={(v) => set("cta_url", v)} />
            <Text label="CTA 2 - Label" value={data.cta2_label} onChange={(v) => set("cta2_label", v)} />
            <Text label="CTA 2 - URL" value={data.cta2_url} onChange={(v) => set("cta2_url", v)} />
          </div>
          <div>
            <span className="text-sm font-medium">Gambar latar (opsional)</span>
            <div className="mt-1"><ImageUpload bucket="media" value={data.image_url} onChange={(url) => set("image_url", url)} /></div>
          </div>
        </>
      );
    case "page_header":
      return (
        <>
          <Text label="Judul" value={data.title} onChange={(v) => set("title", v)} />
          <Text label="Subjudul" value={data.subtitle} onChange={(v) => set("subtitle", v)} multiline />
        </>
      );
    case "features": {
      const items: any[] = Array.isArray(data.items) ? data.items : [];
      const setItem = (i: number, k: string, v: string) => {
        const next = [...items]; next[i] = { ...next[i], [k]: v }; set("items", next);
      };
      return (
        <>
          <Text label="Judul Section" value={data.title} onChange={(v) => set("title", v)} />
          {items.map((it, i) => (
            <div key={i} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Item {i + 1}</span>
                <button onClick={() => set("items", items.filter((_, j) => j !== i))} className="text-xs text-destructive">Hapus</button>
              </div>
              <Text label="Icon (Sparkles, Truck, ShieldCheck, Star, Heart, Award, Zap, Phone, Mail)" value={it.icon} onChange={(v) => setItem(i, "icon", v)} />
              <Text label="Judul" value={it.title} onChange={(v) => setItem(i, "title", v)} />
              <Text label="Deskripsi" value={it.desc} onChange={(v) => setItem(i, "desc", v)} multiline />
            </div>
          ))}
          <button onClick={() => set("items", [...items, { icon: "Sparkles", title: "Item baru", desc: "" }])} className="text-sm rounded-md border border-border px-3 py-1.5">+ Tambah item</button>
        </>
      );
    }
    case "rich_text":
      return (
        <>
          <Text label="Judul" value={data.title} onChange={(v) => set("title", v)} />
          <Text label="Konten" value={data.content} onChange={(v) => set("content", v)} multiline />
        </>
      );
    case "cta":
      return (
        <>
          <Text label="Judul" value={data.title} onChange={(v) => set("title", v)} />
          <Text label="Subjudul" value={data.subtitle} onChange={(v) => set("subtitle", v)} multiline />
          <div className="grid sm:grid-cols-2 gap-3">
            <Text label="Tombol Label" value={data.button_label} onChange={(v) => set("button_label", v)} />
            <Text label="Tombol URL" value={data.button_url} onChange={(v) => set("button_url", v)} />
          </div>
        </>
      );
    case "featured_products":
    case "featured_blog":
    case "featured_gallery":
      return (
        <>
          <Text label="Judul" value={data.title} onChange={(v) => set("title", v)} />
          <label className="block">
            <span className="text-sm font-medium">Jumlah item</span>
            <input type="number" min={1} max={24} value={data.limit ?? 3} onChange={(e) => set("limit", Number(e.target.value))} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
        </>
      );
    case "heading":
      return (
        <>
          <label className="block">
            <span className="text-sm font-medium">Level</span>
            <select value={data.level ?? "h2"} onChange={(e) => set("level", e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="h1">H1 (besar)</option>
              <option value="h2">H2</option>
              <option value="h3">H3 (kecil)</option>
            </select>
          </label>
          <Text label="Teks" value={data.text} onChange={(v) => set("text", v)} />
          <Text label="Sub teks (opsional)" value={data.subtitle} onChange={(v) => set("subtitle", v)} multiline />
        </>
      );
    case "item_back_link":
      return (
        <>
          <Text label="Label" value={data.label} onChange={(v) => set("label", v)} />
          <Text label="URL" value={data.url} onChange={(v) => set("url", v)} />
        </>
      );
    case "item_image":
      return (
        <>
          <label className="block">
            <span className="text-sm font-medium">Field gambar</span>
            <select value={data.field ?? "image_url"} onChange={(e) => set("field", e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="image_url">image_url (Produk)</option>
              <option value="cover_image">cover_image (Blog)</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Rasio</span>
            <select value={data.aspect ?? "video"} onChange={(e) => set("aspect", e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="video">16:9</option>
              <option value="square">1:1</option>
              <option value="auto">Asli</option>
            </select>
          </label>
          <p className="text-xs text-muted-foreground">Gambar diambil otomatis dari data item.</p>
        </>
      );
    case "item_title":
    case "item_subtitle":
      return <p className="text-xs text-muted-foreground">Konten diambil otomatis dari data item (judul / nama / kategori).</p>;
    case "item_price":
      return <Text label="Prefix (mis. Rp)" value={data.prefix} onChange={(v) => set("prefix", v)} />;
    case "item_meta":
      return <p className="text-xs text-muted-foreground">Menampilkan tanggal terbit artikel (jika ada).</p>;
    case "item_summary":
      return (
        <>
          <Text label="Judul (opsional)" value={data.title} onChange={(v) => set("title", v)} />
          <label className="block">
            <span className="text-sm font-medium">Field</span>
            <select value={data.field ?? "excerpt"} onChange={(e) => set("field", e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="excerpt">excerpt (Blog)</option>
              <option value="description">description (Produk)</option>
            </select>
          </label>
        </>
      );
    case "item_description":
      return (
        <>
          <Text label="Judul (opsional)" value={data.title} onChange={(v) => set("title", v)} />
          <label className="block">
            <span className="text-sm font-medium">Field</span>
            <select value={data.field ?? ""} onChange={(e) => set("field", e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Otomatis (content/description)</option>
              <option value="content">content (Blog)</option>
              <option value="description">description (Produk)</option>
            </select>
          </label>
        </>
      );
    case "item_button":
      return (
        <>
          <Text label="Teks Tombol" value={data.label} onChange={(v) => set("label", v)} />
          <Text label="URL (boleh pakai {slug}, {name}, {price})" value={data.url} onChange={(v) => set("url", v)} />
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Warna Background</span>
              <div className="mt-1 flex items-center gap-2">
                <input type="color" value={data.bg_color ?? "#16a34a"} onChange={(e) => set("bg_color", e.target.value)} className="h-9 w-12 rounded border border-input bg-background" />
                <input value={data.bg_color ?? ""} onChange={(e) => set("bg_color", e.target.value)} className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Warna Teks</span>
              <div className="mt-1 flex items-center gap-2">
                <input type="color" value={data.text_color ?? "#ffffff"} onChange={(e) => set("text_color", e.target.value)} className="h-9 w-12 rounded border border-input bg-background" />
                <input value={data.text_color ?? ""} onChange={(e) => set("text_color", e.target.value)} className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium">Posisi</span>
            <select value={data.align ?? "left"} onChange={(e) => set("align", e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="left">Kiri</option>
              <option value="center">Tengah</option>
              <option value="right">Kanan</option>
            </select>
          </label>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!data.new_tab} onChange={(e) => set("new_tab", e.target.checked)} /> Buka di tab baru</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!data.full_width} onChange={(e) => set("full_width", e.target.checked)} /> Full width</label>
          </div>
        </>
      );
    case "product_split":
      return (
        <>
          <p className="text-xs text-muted-foreground">Layout siap pakai untuk halaman detail produk: gambar sticky di kiri, info & CTA di kanan. Tambahkan section ini sendiri untuk memakai layout modern, atau biarkan blok-blok individual untuk layout default.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Text label="Label Tombol Kembali" value={data.back_label} onChange={(v) => set("back_label", v)} />
            <Text label="URL Tombol Kembali" value={data.back_url} onChange={(v) => set("back_url", v)} />
            <Text label="CTA Utama - Label" value={data.cta_label} onChange={(v) => set("cta_label", v)} />
            <Text label="CTA Utama - URL ({slug}/{name}/{price})" value={data.cta_url} onChange={(v) => set("cta_url", v)} />
            <Text label="CTA Sekunder - Label" value={data.cta2_label} onChange={(v) => set("cta2_label", v)} />
            <Text label="CTA Sekunder - URL" value={data.cta2_url} onChange={(v) => set("cta2_url", v)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Warna CTA Background</span>
              <div className="mt-1 flex items-center gap-2">
                <input type="color" value={data.cta_bg ?? "#16a34a"} onChange={(e) => set("cta_bg", e.target.value)} className="h-9 w-12 rounded border border-input bg-background" />
                <input value={data.cta_bg ?? ""} onChange={(e) => set("cta_bg", e.target.value)} className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Warna CTA Teks</span>
              <div className="mt-1 flex items-center gap-2">
                <input type="color" value={data.cta_fg ?? "#ffffff"} onChange={(e) => set("cta_fg", e.target.value)} className="h-9 w-12 rounded border border-input bg-background" />
                <input value={data.cta_fg ?? ""} onChange={(e) => set("cta_fg", e.target.value)} className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!data.cta_new_tab} onChange={(e) => set("cta_new_tab", e.target.checked)} /> Buka CTA di tab baru</label>
        </>
      );
    case "product_classic":
      return (
        <>
          <p className="text-xs text-muted-foreground">Layout klasik: gambar besar di atas, info & deskripsi di bawah, dengan thumbnail galeri.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Text label="Label Tombol Kembali" value={data.back_label} onChange={(v) => set("back_label", v)} />
            <Text label="URL Tombol Kembali" value={data.back_url} onChange={(v) => set("back_url", v)} />
            <Text label="CTA - Label" value={data.cta_label} onChange={(v) => set("cta_label", v)} />
            <Text label="CTA - URL ({slug}/{name}/{price})" value={data.cta_url} onChange={(v) => set("cta_url", v)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Warna CTA Background</span>
              <div className="mt-1 flex items-center gap-2">
                <input type="color" value={data.cta_bg ?? "#16a34a"} onChange={(e) => set("cta_bg", e.target.value)} className="h-9 w-12 rounded border border-input bg-background" />
                <input value={data.cta_bg ?? ""} onChange={(e) => set("cta_bg", e.target.value)} className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Warna CTA Teks</span>
              <div className="mt-1 flex items-center gap-2">
                <input type="color" value={data.cta_fg ?? "#ffffff"} onChange={(e) => set("cta_fg", e.target.value)} className="h-9 w-12 rounded border border-input bg-background" />
                <input value={data.cta_fg ?? ""} onChange={(e) => set("cta_fg", e.target.value)} className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </label>
          </div>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!data.cta_new_tab} onChange={(e) => set("cta_new_tab", e.target.checked)} /> Buka CTA di tab baru</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={data.show_gallery !== false} onChange={(e) => set("show_gallery", e.target.checked)} /> Tampilkan galeri</label>
          </div>
        </>
      );
    case "product_magazine":
      return (
        <>
          <p className="text-xs text-muted-foreground">Layout editorial: gambar hero lebar dengan overlay judul & harga, deskripsi di bawah.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Text label="Label Tombol Kembali" value={data.back_label} onChange={(v) => set("back_label", v)} />
            <Text label="URL Tombol Kembali" value={data.back_url} onChange={(v) => set("back_url", v)} />
            <Text label="CTA - Label" value={data.cta_label} onChange={(v) => set("cta_label", v)} />
            <Text label="CTA - URL ({slug}/{name}/{price})" value={data.cta_url} onChange={(v) => set("cta_url", v)} />
          </div>
          <label className="block">
            <span className="text-sm font-medium">Opacity overlay ({data.overlay_opacity ?? 60}%)</span>
            <input type="range" min={0} max={90} value={data.overlay_opacity ?? 60} onChange={(e) => set("overlay_opacity", Number(e.target.value))} className="mt-1 w-full" />
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Warna CTA Background</span>
              <input type="color" value={data.cta_bg ?? "#0f172a"} onChange={(e) => set("cta_bg", e.target.value)} className="mt-1 h-9 w-full rounded border border-input bg-background" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Warna CTA Teks</span>
              <input type="color" value={data.cta_fg ?? "#ffffff"} onChange={(e) => set("cta_fg", e.target.value)} className="mt-1 h-9 w-full rounded border border-input bg-background" />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!data.cta_new_tab} onChange={(e) => set("cta_new_tab", e.target.checked)} /> Buka CTA di tab baru</label>
        </>
      );
    case "product_bento":
      return (
        <>
          <p className="text-xs text-muted-foreground">Layout bento grid: gambar utama, info, CTA dan highlight tersusun dalam kartu.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Text label="Label Tombol Kembali" value={data.back_label} onChange={(v) => set("back_label", v)} />
            <Text label="URL Tombol Kembali" value={data.back_url} onChange={(v) => set("back_url", v)} />
            <Text label="CTA - Label" value={data.cta_label} onChange={(v) => set("cta_label", v)} />
            <Text label="CTA - URL ({slug}/{name}/{price})" value={data.cta_url} onChange={(v) => set("cta_url", v)} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Text label="Highlight 1" value={data.highlight1} onChange={(v) => set("highlight1", v)} />
            <Text label="Highlight 2" value={data.highlight2} onChange={(v) => set("highlight2", v)} />
            <Text label="Highlight 3" value={data.highlight3} onChange={(v) => set("highlight3", v)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Warna CTA Background</span>
              <input type="color" value={data.cta_bg ?? "#16a34a"} onChange={(e) => set("cta_bg", e.target.value)} className="mt-1 h-9 w-full rounded border border-input bg-background" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Warna CTA Teks</span>
              <input type="color" value={data.cta_fg ?? "#ffffff"} onChange={(e) => set("cta_fg", e.target.value)} className="mt-1 h-9 w-full rounded border border-input bg-background" />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!data.cta_new_tab} onChange={(e) => set("cta_new_tab", e.target.checked)} /> Buka CTA di tab baru</label>
        </>
      );
    case "blog_classic":
      return (
        <>
          <p className="text-xs text-muted-foreground">Layout klasik: cover image lebar, judul & tanggal di bawah, lalu konten artikel.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Text label="Label Tombol Kembali" value={data.back_label} onChange={(v) => set("back_label", v)} />
            <Text label="URL Tombol Kembali" value={data.back_url} onChange={(v) => set("back_url", v)} />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.show_excerpt !== false} onChange={(e) => set("show_excerpt", e.target.checked)} /> Tampilkan ringkasan (excerpt)</label>
        </>
      );
    case "blog_magazine":
      return (
        <>
          <p className="text-xs text-muted-foreground">Layout editorial: cover hero penuh dengan overlay judul, konten artikel di bawah.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Text label="Label Tombol Kembali" value={data.back_label} onChange={(v) => set("back_label", v)} />
            <Text label="URL Tombol Kembali" value={data.back_url} onChange={(v) => set("back_url", v)} />
          </div>
          <label className="block">
            <span className="text-sm font-medium">Opacity overlay ({data.overlay_opacity ?? 60}%)</span>
            <input type="range" min={0} max={90} value={data.overlay_opacity ?? 60} onChange={(e) => set("overlay_opacity", Number(e.target.value))} className="mt-1 w-full" />
          </label>
        </>
      );
    case "blog_split":
      return (
        <>
          <p className="text-xs text-muted-foreground">Layout dua kolom: cover image sticky di kiri, judul & konten di kanan.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Text label="Label Tombol Kembali" value={data.back_label} onChange={(v) => set("back_label", v)} />
            <Text label="URL Tombol Kembali" value={data.back_url} onChange={(v) => set("back_url", v)} />
          </div>
        </>
      );
    case "blog_minimal":
      return (
        <>
          <p className="text-xs text-muted-foreground">Layout minimal editorial: tanpa cover image besar, fokus pada tipografi judul & konten.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Text label="Label Tombol Kembali" value={data.back_label} onChange={(v) => set("back_label", v)} />
            <Text label="URL Tombol Kembali" value={data.back_url} onChange={(v) => set("back_url", v)} />
          </div>
        </>
      );
    default:
      return null;
  }
}
