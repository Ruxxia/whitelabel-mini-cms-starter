import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useSettings } from "@/lib/composables";
import { usePageSEO } from "@/lib/seo";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
  const { data: s } = useSettings();
  usePageSEO("contact", { title: "Kontak Kami", description: "Hubungi kami untuk pertanyaan dan pemesanan." });
  return (
    <SiteLayout>
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight">Kontak</h1>
        <p className="mt-2 text-muted-foreground">Kami siap membantu Anda.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {s?.contact_email && (
            <div className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <Mail className="h-6 w-6 text-primary" />
              <p className="mt-2 font-medium">Email</p>
              <a href={`mailto:${s.contact_email}`} className="text-sm text-muted-foreground">{s.contact_email}</a>
            </div>
          )}
          {s?.contact_phone && (
            <div className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <Phone className="h-6 w-6 text-primary" />
              <p className="mt-2 font-medium">Telepon</p>
              <a href={`tel:${s.contact_phone}`} className="text-sm text-muted-foreground">{s.contact_phone}</a>
            </div>
          )}
          {s?.contact_address && (
            <div className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <MapPin className="h-6 w-6 text-primary" />
              <p className="mt-2 font-medium">Alamat</p>
              <p className="text-sm text-muted-foreground">{s.contact_address}</p>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}