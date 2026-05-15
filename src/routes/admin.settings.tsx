import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useSettings } from "@/lib/composables";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/ImageUpload";
import { SEOPreview } from "@/components/SEOPreview";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

function AdminSettings() {
  const { data: s } = useSettings();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, any> | null>(null);
  useEffect(() => { if (s) setForm(s); }, [s]);
  if (!form) return <AdminLayout>Memuat...</AdminLayout>;
  const theme: Record<string, string> = form.theme ?? {};
  const setT = (k: string, v: string) => setForm({ ...form, theme: { ...theme, [k]: v } });
  const seo: Record<string, any> = form.seo ?? {};
  const setSeo = (k: string, v: any) => setForm({ ...form, seo: { ...seo, [k]: v } });
  const save = async () => {
    const { error } = await supabase.from("settings").update({
      site_name: form.site_name, tagline: form.tagline, description: form.description,
      logo_url: form.logo_url, contact_email: form.contact_email, contact_phone: form.contact_phone,
      contact_address: form.contact_address, theme: form.theme, seo: form.seo,
    }).eq("id", form.id);
    if (error) return toast.error(error.message);
    toast.success("Pengaturan disimpan");
    qc.invalidateQueries({ queryKey: ["settings"] });
  };
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold">Pengaturan Situs</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-semibold">Identitas</h2>
          <Field label="Nama Situs"><input value={form.site_name ?? ""} onChange={(e) => setForm({ ...form, site_name: e.target.value })} className="inp" /></Field>
          <Field label="Tagline"><input value={form.tagline ?? ""} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="inp" /></Field>
          <Field label="Deskripsi"><textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="inp" /></Field>
          <Field label="Logo"><ImageUpload bucket="media" value={form.logo_url} onChange={(url) => setForm({ ...form, logo_url: url })} /></Field>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h2 className="font-semibold">Kontak</h2>
          <Field label="Email"><input value={form.contact_email ?? ""} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="inp" /></Field>
          <Field label="Telepon"><input value={form.contact_phone ?? ""} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="inp" /></Field>
          <Field label="Alamat"><textarea value={form.contact_address ?? ""} onChange={(e) => setForm({ ...form, contact_address: e.target.value })} rows={3} className="inp" /></Field>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5 space-y-3 md:col-span-2">
          <h2 className="font-semibold">Tema (Warna)</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[["primary","Primary"],["primary_foreground","Primary text"],["accent","Accent"],["background","Background"],["foreground","Text"],["muted","Muted"]].map(([k,label]) => (
              <label key={k} className="block text-sm">
                <span className="font-medium">{label}</span>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={theme[k] ?? "#000000"} onChange={(e) => setT(k, e.target.value)} className="h-9 w-9 rounded border border-input" />
                  <input value={theme[k] ?? ""} onChange={(e) => setT(k, e.target.value)} className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm" />
                </div>
              </label>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5 space-y-3 md:col-span-2">
          <h2 className="font-semibold">SEO & Open Graph (Global)</h2>
          <p className="text-xs text-muted-foreground">Digunakan sebagai fallback untuk halaman yang tidak memiliki SEO sendiri.</p>
          <Field label="OG Title (default)"><input value={seo.og_title ?? ""} onChange={(e) => setSeo("og_title", e.target.value)} className="inp" /></Field>
          <Field label="OG Description (default)"><textarea value={seo.og_description ?? ""} onChange={(e) => setSeo("og_description", e.target.value)} rows={2} className="inp" /></Field>
          <Field label="OG Image (default)"><ImageUpload bucket="media" value={seo.og_image} onChange={(url) => setSeo("og_image", url)} /></Field>
          <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-border">
            <div>
              <h3 className="text-sm font-semibold mb-2">Preview</h3>
              <SEOPreview title={seo.og_title} description={seo.og_description} image={seo.og_image} />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Robots.txt</h3>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!seo.disallow_all} onChange={(e) => setSeo("disallow_all", e.target.checked)} />
                Blokir semua mesin pencari (Disallow: /)
              </label>
              <Field label="Baris tambahan robots.txt">
                <textarea value={seo.robots_extra ?? ""} onChange={(e) => setSeo("robots_extra", e.target.value)} rows={4} placeholder="Contoh:&#10;User-agent: Googlebot&#10;Crawl-delay: 5" className="inp font-mono text-xs" />
              </Field>
              <p className="text-xs text-muted-foreground">
                Sitemap otomatis: <a href="/api/sitemap.xml" target="_blank" rel="noreferrer" className="underline">/api/sitemap.xml</a> · Robots: <a href="/api/robots.txt" target="_blank" rel="noreferrer" className="underline">/api/robots.txt</a>
              </p>
            </div>
          </div>
        </section>
      </div>
      <button onClick={save} className="mt-6 rounded-md bg-primary text-primary-foreground px-5 py-2 font-medium">Simpan Pengaturan</button>
      <style>{`.inp{width:100%;border:1px solid var(--input);background:var(--background);border-radius:0.375rem;padding:0.5rem 0.75rem;font-size:0.875rem}`}</style>
    </AdminLayout>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-medium">{label}</span><div className="mt-1">{children}</div></label>;
}