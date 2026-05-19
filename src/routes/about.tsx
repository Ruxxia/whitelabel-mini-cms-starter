import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useSettings } from "@/lib/composables";
import { usePageSEO } from "@/lib/seo";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  const { data: s } = useSettings();
  usePageSEO("about", { title: `About — ${s?.site_name ?? ""}`, description: s?.description ?? undefined });
  return (
    <SiteLayout>
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight">About {s?.site_name}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{s?.tagline}</p>
        <div className="prose prose-slate mt-8 max-w-none">
          <p>{s?.description}</p>
          <p>
            We believe that local businesses deserve a professional digital presence. With this
            white-label platform, you can manage all your website content without any coding required.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}