import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth, useIsAdmin } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, ShoppingBag, Newspaper, Image as ImageIcon, Settings, Menu as MenuIcon, LogOut, FileText } from "lucide-react";
import { useEffect } from "react";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/pages", label: "Halaman", icon: FileText },
  { to: "/admin/products", label: "Produk", icon: ShoppingBag },
  { to: "/admin/blog", label: "Blog", icon: Newspaper },
  { to: "/admin/gallery", label: "Galeri", icon: ImageIcon },
  { to: "/admin/menus", label: "Menu", icon: MenuIcon },
  { to: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: isAdmin, isLoading: rolesLoading } = useIsAdmin(user?.id);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || rolesLoading) return <div className="p-8">Memuat...</div>;
  if (!user) return null;
  if (!isAdmin) return <div className="p-8">Anda tidak memiliki akses admin.</div>;

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <Link to="/" className="font-bold">← Kembali ke situs</Link>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {items.map((it) => {
            const active = path === it.to || (it.to !== "/admin" && path.startsWith(it.to));
            return (
              <Link key={it.to} to={it.to} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={logout} className="m-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </aside>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}