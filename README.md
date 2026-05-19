# CMS Website

A dynamic CMS website powered by **TanStack Start**, **React 19**, **Tailwind CSS v4**, and **Supabase** as the backend (Postgres + Auth + Storage). It can be deployed to **Cloudflare Workers**, **Vercel**, or other platforms that support Node/Edge runtimes.

## Features

- **Dynamic pages** — manage pages from the admin panel (Home, Products, Blog, Gallery, and custom pages from the menu).
- **Reorderable menu** — manage the order of the navigation menu directly from the admin panel.
- **Section builder** — add/edit/delete content per page using sections.
- **Products, Blog, Gallery** — complete CRUD modules with image upload support.
- **SEO & Open Graph** — global settings + per-page override, with automatic fallbacks.
- **SEO Preview** — real-time preview of how the site appears on Google, Facebook, and Twitter/X.
- **Dynamic sitemap & robots.txt** — automatic `/api/sitemap.xml` and `/api/robots.txt` generated from the database.
- **Admin authentication** — protected login to access the `/admin` panel. The first registered user automatically becomes the admin.
- **File storage** — upload images via Supabase Storage.

## Tech Stack

- **Framework**: TanStack Start v1 (SSR, file-based routing)
- **UI**: React 19, Tailwind CSS v4, shadcn/ui, Radix UI, Lucide icons
- **State / Data**: TanStack Query, React Hook Form, Zod
- **Backend**: Supabase (Postgres, Auth, Storage)
- **Build**: Vite 7

---

## 1. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, note down:
   - `Project URL`
   - `anon` / `publishable` key
   - `service_role` key (secret, server-only)
3. Run database migrations:
   - Install Supabase CLI: `npm i -g supabase`
   - Log in: `supabase login`
   - Link project: `supabase link --project-ref <project-ref>`
   - Push migrations: `supabase db push`
4. Create public **Storage Buckets**: `media`, `products`, `gallery`, `blog`.
5. (Optional) Enable additional auth providers (Google, etc.) in **Authentication → Providers**.

### Environment Variables

Create a `.env` file in the project root:

```env
# Client (visible in browser)
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
VITE_SUPABASE_PROJECT_ID=<project-ref>

# Server (secret)
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

> ⚠️ Never commit `SUPABASE_SERVICE_ROLE_KEY` to a public repository.

---

## 2. Running Locally

```bash
bun install         # or: npm install / pnpm install
bun run dev
```

Open `http://localhost:5173`. Register the first user at `/login` — this account automatically becomes the admin. Admin panel: `/admin`.

### Scripts

- `bun run dev` — development server
- `bun run build` — production build
- `bun run preview` — preview build output
- `bun run lint` — eslint
- `bun run format` — prettier

---

## 3. Deploying to Cloudflare Workers

The project is pre-configured for Cloudflare Workers (`wrangler.jsonc` + `@cloudflare/vite-plugin`).

1. Install Wrangler: `npm i -g wrangler`
2. Login: `wrangler login`
3. Set secrets on Cloudflare:
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
5. Add `VITE_*` variables to `wrangler.jsonc` under `vars` (publishable values are fine in config) or via the build environment.

> Cloudflare Workers uses the `nodejs_compat` flag (already enabled in `wrangler.jsonc`). Avoid packages that are Node-only.

---

## 4. Deploying to Vercel

1. Push your repository to GitHub/GitLab/Bitbucket.
2. Import the project on [vercel.com/new](https://vercel.com/new).
3. **Build Command**: `bun run build` (or `npm run build`).
4. **Output**: leave as default — TanStack Start + Vite will produce an SSR build that is automatically detected by Vercel.
5. Add the **Environment Variables** in Project Settings → Environment Variables (as listed in the Setup Supabase section above) for Production, Preview, and Development.
6. Deploy.

> For Vercel target (Node runtime), you might need to change the Vite adapter from `@cloudflare/vite-plugin` to the default Node configuration. If deploying to Vercel, remove/comment out the Cloudflare plugin in `vite.config.ts` and `wrangler.jsonc` is not used.

---

## Directory Structure

```
src/
  routes/          # File-based routing (TanStack Start)
    admin.*        # Admin panel
    api/           # Server routes (sitemap, robots)
  components/      # UI components & layouts
  lib/             # Helpers (auth, seo, storage)
  integrations/    # Supabase client
supabase/          # Backend configuration & migrations
```

## Public Endpoints

- `/api/sitemap.xml` — dynamic sitemap generated from pages, products, blog, and custom menus.
- `/api/robots.txt` — configurable robots.txt based on Settings.

## SEO

Each page follows this metadata priority order:

1. Per-page SEO (admin → Pages → Edit → SEO).
2. Built-in default route fallback.
3. Global OG (admin → Settings → SEO & Open Graph).
4. Site identity (site name / logo).

## License

MIT.
