import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageSections } from "@/components/PageSections";
import { useSettings, useSections } from "@/lib/composables";
import { usePageSEO } from "@/lib/seo";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const { data: settings } = useSettings();
  const { data: sections } = useSections("home");
  usePageSEO("home", {
    title: settings ? `${settings.site_name}${settings.tagline ? " — " + settings.tagline : ""}` : "Beranda",
    description: settings?.description ?? undefined,
  });

  return (
    <SiteLayout>
      {sections && sections.length === 0 && (
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold">{settings?.site_name ?? "Selamat datang"}</h1>
          <p className="mt-3 text-muted-foreground">Belum ada section. Tambahkan dari admin → Halaman.</p>
        </section>
      )}
      <PageSections pageSlug="home" />
    </SiteLayout>
  );
}
