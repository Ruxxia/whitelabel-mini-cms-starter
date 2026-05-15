import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { usePageSEO } from "@/lib/seo";
import { Palette, Globe, ShoppingBag, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/services")({ component: Services });

const services = [
  { icon: Palette, title: "Branding & Tema", desc: "Atur warna, logo, dan tipografi sesuai identitas." },
  { icon: Globe, title: "Website Multi-halaman", desc: "Beranda, About, Layanan, Blog, dll lengkap." },
  { icon: ShoppingBag, title: "Katalog Produk", desc: "Tampilkan produk dengan kategori & galeri." },
  { icon: MessageSquare, title: "Manajemen Konten", desc: "Edit konten dari dashboard, real-time." },
];

function Services() {
  usePageSEO("services", { title: "Layanan Kami", description: "Layanan website builder white-label untuk UMKM." });
  return (
    <SiteLayout>
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-center">Layanan Kami</h1>
        <p className="mt-3 text-center text-muted-foreground">Solusi lengkap kehadiran digital UMKM.</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-border bg-card p-6"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <s.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}