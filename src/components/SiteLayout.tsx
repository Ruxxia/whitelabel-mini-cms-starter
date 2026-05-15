import { Link } from "@tanstack/react-router";
import { useSettings, useMenus } from "@/lib/composables";
import { Menu, X } from "lucide-react";
import { useState } from "react";

function hexToOklch(hex: string): string | null {
  // Pass through if already a CSS color function
  if (!hex || !hex.startsWith("#")) return hex || null;
  return hex; // browsers accept hex; CSS var supports any color
}

function ThemeStyle({ theme }: { theme: Record<string, string> | null }) {
  if (!theme) return null;
  const css = `:root{
    ${theme.primary ? `--primary:${hexToOklch(theme.primary)};` : ""}
    ${theme.primary_foreground ? `--primary-foreground:${hexToOklch(theme.primary_foreground)};` : ""}
    ${theme.accent ? `--accent:${hexToOklch(theme.accent)};` : ""}
    ${theme.background ? `--background:${hexToOklch(theme.background)};` : ""}
    ${theme.foreground ? `--foreground:${hexToOklch(theme.foreground)};` : ""}
    ${theme.muted ? `--muted:${hexToOklch(theme.muted)};` : ""}
  }`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const { data: settings } = useSettings();
  const { data: menus } = useMenus("header");
  const [open, setOpen] = useState(false);

  const theme = (settings?.theme as Record<string, string>) ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ThemeStyle theme={theme} />

      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt={settings.site_name} className="h-8 w-8 rounded" />
            ) : (
              <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center text-sm font-bold">
                {settings?.site_name?.[0] ?? "U"}
              </div>
            )}
            <span>{settings?.site_name ?? "UMKM"}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {menus?.map((m) => (
              <Link
                key={m.id}
                to={m.url}
                className="px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                activeProps={{ className: "px-3 py-2 text-sm font-medium rounded-md text-foreground bg-muted" }}
              >
                {m.label}
              </Link>
            ))}
          </nav>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2" aria-label="menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav className="md:hidden border-t border-border bg-background px-4 py-2 flex flex-col">
            {menus?.map((m) => (
              <Link
                key={m.id}
                to={m.url}
                onClick={() => setOpen(false)}
                className="py-2 text-sm font-medium text-foreground"
              >
                {m.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-muted/30 mt-12">
        <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-bold text-lg mb-2">{settings?.site_name}</h3>
            <p className="text-sm text-muted-foreground">{settings?.tagline}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Kontak</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {settings?.contact_email && <li>{settings.contact_email}</li>}
              {settings?.contact_phone && <li>{settings.contact_phone}</li>}
              {settings?.contact_address && <li>{settings.contact_address}</li>}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Navigasi</h4>
            <ul className="space-y-1 text-sm">
              {menus?.slice(0, 5).map((m) => (
                <li key={m.id}>
                  <Link to={m.url} className="text-muted-foreground hover:text-foreground">
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {settings?.site_name}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}