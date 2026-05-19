import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useMenus } from "@/lib/composables";
import { FileText, ShoppingBag, Newspaper, Image as ImageIcon, Plus, ExternalLink, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useConfirm } from "@/components/ConfirmDialog";

export const Route = createFileRoute("/admin/pages/")({ component: AdminPages });

const BUILTIN: Record<string, { label: string; desc: string; icon: any }> = {
  home: { label: "Home", desc: "Main page (hero, features, etc.)", icon: FileText },
  products: { label: "Products", desc: "Section on the product catalog page", icon: ShoppingBag },
  blog: { label: "Blog", desc: "Section on the article list page", icon: Newspaper },
  gallery: { label: "Gallery", desc: "Section on the gallery page", icon: ImageIcon },
};

function urlToSlug(url: string): string {
  if (!url) return "home";
  if (url === "/" || url === "") return "home";
  // only handle internal single-segment URLs
  if (!url.startsWith("/")) return "home";
  return url.replace(/^\/+/, "").replace(/\/+$/, "").split("/")[0] || "home";
}

function AdminPages() {
  const { data: headerMenus } = useMenus("header");
  const { data: footerMenus } = useMenus("footer");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const all = [...(headerMenus ?? []), ...(footerMenus ?? [])];
  const seen = new Set<string>();
  const menuPages = all
    .map((m) => ({ id: m.id as string, slug: urlToSlug(m.url), label: m.label, url: m.url }))
    .filter((p) => {
      if (seen.has(p.slug)) return false;
      seen.add(p.slug);
      return true;
    });

  // Ensure built-ins always show up even if not in menu
  const builtinSlugs = Object.keys(BUILTIN);
  builtinSlugs.forEach((s) => {
    if (!seen.has(s)) {
      menuPages.push({ id: "", slug: s, label: BUILTIN[s].label, url: s === "home" ? "/" : `/${s}` });
      seen.add(s);
    }
  });

  const addMenu = async () => {
    if (!newLabel.trim() || !newUrl.trim()) return toast.error("Fill in label & url");
    const url = newUrl.startsWith("/") ? newUrl : `/${newUrl}`;
    const next = (headerMenus?.length ?? 0) + 1;
    const { error } = await supabase.from("menus").insert({ label: newLabel, url, location: "header", sort_order: next });
    if (error) return toast.error(error.message);
    toast.success("Page added to menu");
    setNewLabel(""); setNewUrl("");
    qc.invalidateQueries({ queryKey: ["menus", "header"] });
    navigate({ to: "/admin/pages/$slug", params: { slug: urlToSlug(url) } });
  };

  const removePage = async (e: React.MouseEvent, id: string, slug: string, label: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (slug === "home") return toast.error("Home page cannot be deleted");
    const ok = await confirm({
      title: `Delete page "${label}"?`,
      description: "The menu entry and all sections on this page will be deleted.",
      destructive: true,
      confirmText: "Delete",
    });
    if (!ok) return;
    if (id) {
      const { error: mErr } = await supabase.from("menus").delete().eq("id", id);
      if (mErr) return toast.error(mErr.message);
    }
    await supabase.from("sections").delete().eq("page_slug", slug);
    toast.success("Page deleted");
    qc.invalidateQueries({ queryKey: ["menus", "header"] });
    qc.invalidateQueries({ queryKey: ["menus", "footer"] });
    qc.invalidateQueries({ queryKey: ["admin_menus"] });
    qc.invalidateQueries({ queryKey: ["sections", slug] });
  };

  return (
    <AdminLayout>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="text-muted-foreground mt-1">List of pages following the navigation menu. Manage sections on each page.</p>
        </div>
        <Link to="/admin/menus" className="text-sm text-primary hover:underline">Manage Menu →</Link>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-semibold mb-2 flex items-center gap-2"><Plus className="h-4 w-4" /> Add new page</p>
        <div className="flex flex-wrap gap-2">
          <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Label (e.g. Services)" className="flex-1 min-w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="/url (e.g. /services)" className="flex-1 min-w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <button onClick={addMenu} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Add</button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">New pages automatically appear in the header menu and content can be added immediately.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {menuPages.map((p) => {
          const b = BUILTIN[p.slug];
          const Icon = b?.icon ?? FileText;
          const canDelete = p.slug !== "home";
          return (
            <div key={p.slug} className="relative">
              <Link
                to="/admin/pages/$slug"
                params={{ slug: p.slug }}
                className="block rounded-2xl border border-border bg-card p-5 hover:-translate-y-0.5 transition-transform"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-start justify-between">
                  <Icon className="h-6 w-6 text-primary" />
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><ExternalLink className="h-3 w-3" />{p.url}</span>
                </div>
                <h3 className="mt-3 font-semibold">{p.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{b?.desc ?? "Manage sections/content for this page."}</p>
              </Link>
              {canDelete && (
                <button
                  onClick={(e) => removePage(e, p.id, p.slug, p.label)}
                  className="absolute bottom-3 right-3 p-2 rounded-md text-destructive hover:bg-destructive/10"
                  aria-label="Delete page"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}