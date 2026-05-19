import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useProducts, useBlogPosts, useGallery } from "@/lib/composables";

export const Route = createFileRoute("/admin/")({ component: AdminHome });

function AdminHome() {
  const { data: products } = useProducts();
  const { data: posts } = useBlogPosts();
  const { data: images } = useGallery();
  const stats = [
    { label: "Products", value: products?.length ?? 0, to: "/admin/products" },
    { label: "Articles", value: posts?.length ?? 0, to: "/admin/blog" },
    { label: "Gallery", value: images?.length ?? 0, to: "/admin/gallery" },
  ];
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-1">Manage all your website content here.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="rounded-2xl border border-border bg-card p-6 hover:-translate-y-0.5 transition-transform" style={{ boxShadow: "var(--shadow-card)" }}>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}