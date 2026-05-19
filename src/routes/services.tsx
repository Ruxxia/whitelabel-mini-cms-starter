import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { usePageSEO } from "@/lib/seo";
import { Palette, Globe, ShoppingBag, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/services")({ component: Services });

const services = [
  { icon: Palette, title: "Branding & Themes", desc: "Customize colors, logos, and typography to fit your identity." },
  { icon: Globe, title: "Multi-page Website", desc: "Complete Home, About, Services, Blog, etc." },
  { icon: ShoppingBag, title: "Product Catalog", desc: "Display products with categories & galleries." },
  { icon: MessageSquare, title: "Content Management", desc: "Edit content directly from the dashboard in real-time." },
];

function Services() {
  usePageSEO("services", { title: "Our Services", description: "White-label website builder services for local businesses." });
  return (
    <SiteLayout>
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-center">Our Services</h1>
        <p className="mt-3 text-center text-muted-foreground">A complete solution for your local business digital presence.</p>
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