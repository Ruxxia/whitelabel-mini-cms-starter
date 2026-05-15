# CMS Website

Website CMS dinamis berbasis **TanStack Start**, **React 19**, **Tailwind CSS v4**, dan **Supabase** sebagai backend (Postgres + Auth + Storage). Bisa di-deploy ke **Cloudflare Workers**, **Vercel**, atau platform lain yang mendukung Node/Edge runtime.

## Fitur

- **Halaman dinamis** — kelola halaman dari menu admin (Beranda, Produk, Blog, Galeri, dan halaman custom dari menu).
- **Menu reorderable** — atur urutan menu navigasi langsung dari panel admin.
- **Section builder** — tambah/edit/hapus konten per halaman lewat sections.
- **Produk, Blog, Galeri** — modul CRUD lengkap dengan upload gambar.
- **SEO & Open Graph** — pengaturan global di Settings + override per halaman, dengan fallback otomatis.
- **SEO Preview** — preview real-time tampilan Google, Facebook, dan Twitter/X.
- **Sitemap & robots.txt dinamis** — `/api/sitemap.xml` dan `/api/robots.txt` otomatis dari database.
- **Autentikasi admin** — login terproteksi untuk akses panel `/admin`. User pertama otomatis menjadi admin.
- **File storage** — upload gambar via Supabase Storage.

## Tech Stack

- **Framework**: TanStack Start v1 (SSR, file-based routing)
- **UI**: React 19, Tailwind CSS v4, shadcn/ui, Radix UI, Lucide icons
- **State / Data**: TanStack Query, React Hook Form, Zod
- **Backend**: Supabase (Postgres, Auth, Storage)
- **Build**: Vite 7

---

## 1. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Di **Project Settings → API**, catat:
   - `Project URL`
   - `anon` / `publishable` key
   - `service_role` key (rahasia, hanya untuk server)
3. Jalankan migrasi database:
   - Install Supabase CLI: `npm i -g supabase`
   - Login: `supabase login`
   - Link project: `supabase link --project-ref <project-ref>`
   - Push migrasi: `supabase db push`
4. Buat **Storage Buckets** (public): `media`, `products`, `gallery`, `blog`.
5. (Opsional) Aktifkan provider auth tambahan (Google, dll) di **Authentication → Providers**.

### Environment Variables

Buat file `.env` di root project:

```env
# Client (terlihat di browser)
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
VITE_SUPABASE_PROJECT_ID=<project-ref>

# Server (rahasia)
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

> ⚠️ Jangan pernah commit `SUPABASE_SERVICE_ROLE_KEY` ke repo public.

---

## 2. Menjalankan Lokal

```bash
bun install         # atau: npm install / pnpm install
bun run dev
```

Buka `http://localhost:5173`. Daftar user pertama di `/login` — akun tersebut otomatis jadi admin. Panel admin: `/admin`.

### Scripts

- `bun run dev` — development server
- `bun run build` — production build
- `bun run preview` — preview hasil build
- `bun run lint` — eslint
- `bun run format` — prettier

---

## 3. Deploy ke Cloudflare Workers

Project sudah ter-konfigurasi untuk Cloudflare Workers (`wrangler.jsonc` + `@cloudflare/vite-plugin`).

1. Install Wrangler: `npm i -g wrangler`
2. Login: `wrangler login`
3. Set secrets di Cloudflare:
   ```bash
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_PUBLISHABLE_KEY
   wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   ```
4. Build & deploy:
   ```bash
   bun run build
   wrangler deploy
   ```
5. Tambahkan `VITE_*` di `wrangler.jsonc` pada `vars` (publishable values OK di config) atau via build env.

> Cloudflare Workers menggunakan `nodejs_compat` flag (sudah aktif di `wrangler.jsonc`). Hindari package Node-only.

---

## 4. Deploy ke Vercel

1. Push repo ke GitHub/GitLab/Bitbucket.
2. Import project di [vercel.com/new](https://vercel.com/new).
3. **Build Command**: `bun run build` (atau `npm run build`).
4. **Output**: biarkan default — TanStack Start + Vite akan menghasilkan SSR build yang dideteksi otomatis oleh Vercel.
5. Tambahkan **Environment Variables** di Project Settings → Environment Variables (sesuai daftar di section Setup Supabase di atas), untuk Production, Preview, dan Development.
6. Deploy.

> Untuk target Vercel (Node runtime), kamu mungkin perlu mengganti adapter Vite dari `@cloudflare/vite-plugin` ke konfigurasi Node default. Jika men-deploy ke Vercel, hapus/komentar plugin Cloudflare di `vite.config.ts` dan `wrangler.jsonc` tidak digunakan.

---

## Struktur Folder

```
src/
  routes/          # File-based routing (TanStack Start)
    admin.*        # Panel admin
    api/           # Server routes (sitemap, robots)
  components/      # Komponen UI & layout
  lib/             # Helpers (auth, seo, storage)
  integrations/    # Supabase client
supabase/          # Konfigurasi & migrasi backend
```

## Endpoint Publik

- `/api/sitemap.xml` — sitemap otomatis dari halaman, produk, blog, dan menu custom.
- `/api/robots.txt` — robots.txt yang dapat dikonfigurasi dari Settings.

## SEO

Setiap halaman mengikuti urutan prioritas metadata:

1. SEO per-halaman (admin → Halaman → Edit → SEO).
2. Default route bawaan.
3. Global OG (admin → Pengaturan → SEO & Open Graph).
4. Site identity (nama situs / logo).

## Lisensi

MIT.
