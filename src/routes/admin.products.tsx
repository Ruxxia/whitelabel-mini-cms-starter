import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { RichTextEditor } from "@/components/RichTextEditor";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, LayoutTemplate } from "lucide-react";
import { useConfirm } from "@/components/ConfirmDialog";

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

type ProductForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  image_url: string;
  gallery: string[];
  is_published: boolean;
};

const empty: ProductForm = { name: "", slug: "", description: "", price: "", image_url: "", gallery: [], is_published: true };

function AdminProducts() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [editing, setEditing] = useState<ProductForm | null>(null);

  const { data } = useQuery({
    queryKey: ["admin_products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const save = async () => {
    if (!editing) return;
    const payload = {
      name: editing.name,
      slug: editing.slug || editing.name.toLowerCase().replace(/\s+/g, "-"),
      description: editing.description,
      price: editing.price ? Number(editing.price) : null,
      image_url: editing.image_url || null,
      gallery: editing.gallery || [],
      is_published: editing.is_published,
    };
    const res = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success("Tersimpan");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin_products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const remove = async (id: string) => {
    if (!(await confirm({ title: "Hapus produk?", description: "Tindakan ini tidak dapat dibatalkan.", destructive: true, confirmText: "Hapus" }))) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Dihapus");
    qc.invalidateQueries({ queryKey: ["admin_products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Produk</h1>
        <div className="flex items-center gap-2">
          <Link to="/admin/pages/$slug" params={{ slug: "product_detail" }} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
            <LayoutTemplate className="h-4 w-4" /> Atur Halaman Detail
          </Link>
          <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm">
            <Plus className="h-4 w-4" /> Tambah
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Halaman detail produk diakses otomatis di <code>/products/&lt;slug&gt;</code>. Gunakan "Atur Halaman Detail" untuk menyusun blok yang menampilkan data produk secara dinamis.</p>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Nama</th>
              <th className="p-3">Harga</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {data?.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">{p.price ? `Rp ${Number(p.price).toLocaleString("id-ID")}` : "-"}</td>
                <td className="p-3">{p.is_published ? "Publik" : "Draft"}</td>
                <td className="p-3 text-right space-x-1">
                  <button onClick={() => setEditing({ id: p.id, name: p.name, slug: p.slug, description: p.description ?? "", price: p.price?.toString() ?? "", image_url: p.image_url ?? "", gallery: Array.isArray(p.gallery) ? (p.gallery as string[]) : [], is_published: p.is_published })} className="p-2 hover:bg-muted rounded-md"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(p.id)} className="p-2 hover:bg-muted rounded-md text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{editing.id ? "Edit" : "Tambah"} Produk</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>
            <Field label="Nama"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input" /></Field>
            <Field label="Slug"><input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="otomatis dari nama" className="input" /></Field>
            <Field label="Deskripsi">
              <RichTextEditor
                value={editing.description}
                onChange={(html) => setEditing({ ...editing, description: html })}
              />
            </Field>
            <Field label="Harga (IDR)"><input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className="input" /></Field>
            <Field label="Gambar Produk (Maks 5)">
              <MultiImageUpload
                bucket="products"
                values={[editing.image_url, ...(editing.gallery || [])].filter(Boolean)}
                onChange={(urls) => {
                  const image_url = urls[0] || "";
                  const gallery = urls.slice(1);
                  setEditing({ ...editing, image_url, gallery });
                }}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
              Publikasikan
            </label>
            <button onClick={save} className="w-full rounded-md bg-primary text-primary-foreground py-2 font-medium">Simpan</button>
          </div>
        </div>
      )}

      <style>{`.input{width:100%;border:1px solid var(--input);background:var(--background);border-radius:0.375rem;padding:0.5rem 0.75rem;font-size:0.875rem}`}</style>
    </AdminLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}