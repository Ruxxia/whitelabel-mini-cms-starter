import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { RichTextEditor } from "@/components/RichTextEditor";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, LayoutTemplate } from "lucide-react";
import { useConfirm } from "@/components/ConfirmDialog";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/blog")({ component: AdminBlog });

type Form = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  is_published: boolean;
  author_id: string | null;
};

const empty: Form = { title: "", slug: "", excerpt: "", content: "", cover_image: "", is_published: false, author_id: null };

function AdminBlog() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const { user } = useAuth();
  const [editing, setEditing] = useState<Form | null>(null);

  const { data: profiles } = useQuery({
    queryKey: ["profiles_list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, email");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data } = useQuery({
    queryKey: ["admin_blog"],
    queryFn: async () => {
      const { data: posts, error: postErr } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (postErr) throw postErr;

      const { data: profilesData, error: profErr } = await supabase.from("profiles").select("id, email");
      if (profErr) {
        console.warn("[admin_blog] failed to fetch profiles", profErr);
        return posts.map((p) => ({ ...p, author_email: null }));
      }

      const profileMap = new Map(profilesData.map((p) => [p.id, p.email]));
      return posts.map((p) => ({
        ...p,
        author_email: p.author_id ? profileMap.get(p.author_id) : null,
      }));
    },
  });

  const save = async () => {
    if (!editing) return;
    const payload = {
      title: editing.title,
      slug: editing.slug || editing.title.toLowerCase().replace(/\s+/g, "-"),
      excerpt: editing.excerpt,
      content: editing.content,
      cover_image: editing.cover_image || null,
      is_published: editing.is_published,
      published_at: editing.is_published ? new Date().toISOString() : null,
      author_id: editing.author_id || null,
    };
    const res = editing.id
      ? await supabase.from("blog_posts").update(payload).eq("id", editing.id)
      : await supabase.from("blog_posts").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success("Tersimpan");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin_blog"] });
    qc.invalidateQueries({ queryKey: ["blog_posts"] });
  };

  const remove = async (id: string) => {
    if (!(await confirm({ title: "Hapus artikel?", destructive: true, confirmText: "Hapus" }))) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin_blog"] });
    qc.invalidateQueries({ queryKey: ["blog_posts"] });
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog</h1>
        <div className="flex items-center gap-2">
          <Link to="/admin/pages/$slug" params={{ slug: "blog_detail" }} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
            <LayoutTemplate className="h-4 w-4" /> Atur Halaman Detail
          </Link>
          <button onClick={() => setEditing({ ...empty, author_id: user?.id || null })} className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm">
            <Plus className="h-4 w-4" /> Tambah
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Halaman detail artikel diakses otomatis di <code>/blog/&lt;slug&gt;</code>. Gunakan "Atur Halaman Detail" untuk menyusun blok dinamis.</p>
      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Judul</th>
              <th className="p-3">Penulis</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {data?.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 text-muted-foreground">{p.author_email || "Tanpa Penulis"}</td>
                <td className="p-3">{p.is_published ? "Publik" : "Draft"}</td>
                <td className="p-3 text-right space-x-1">
                  <button onClick={() => setEditing({ id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt ?? "", content: p.content ?? "", cover_image: p.cover_image ?? "", is_published: p.is_published, author_id: p.author_id })} className="p-2 hover:bg-muted rounded-md"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(p.id)} className="p-2 hover:bg-muted rounded-md text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4 overflow-auto" onClick={() => setEditing(null)}>
          <div className="w-full max-w-2xl rounded-2xl bg-card p-6 space-y-3 my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{editing.id ? "Edit" : "Tambah"} Artikel</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>
            <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Judul" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="slug-url" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <textarea value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} rows={2} placeholder="Ringkasan" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Konten Artikel</label>
              <RichTextEditor
                value={editing.content}
                onChange={(html) => setEditing({ ...editing, content: html })}
                placeholder="Tulis konten artikel di sini..."
              />
            </div>
            <ImageUpload bucket="blog" value={editing.cover_image} onChange={(url) => setEditing({ ...editing, cover_image: url })} />
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Penulis (Author)</label>
              <select
                value={editing.author_id ?? ""}
                onChange={(e) => setEditing({ ...editing, author_id: e.target.value || null })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Tanpa Penulis</option>
                {profiles?.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.email}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
              Publikasikan
            </label>
            <button onClick={save} className="w-full rounded-md bg-primary text-primary-foreground py-2 font-medium">Simpan</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}