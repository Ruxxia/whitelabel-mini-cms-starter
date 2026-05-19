
-- =========================================
-- ROLES
-- =========================================
create type public.app_role as enum ('admin', 'editor', 'user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(_user_id, 'admin') or public.has_role(_user_id, 'editor')
$$;

-- Auto-create profile + first user is admin
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  user_count int;
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email));

  select count(*) into user_count from auth.users;
  if user_count = 1 then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at helper
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- =========================================
-- SETTINGS (one row site config + theme + SEO)
-- =========================================
create table public.settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'My UMKM',
  tagline text,
  description text,
  logo_url text,
  favicon_url text,
  contact_email text,
  contact_phone text,
  contact_address text,
  social jsonb not null default '{}'::jsonb,
  theme jsonb not null default '{
    "primary":"#2563eb",
    "primary_foreground":"#ffffff",
    "accent":"#f59e0b",
    "background":"#ffffff",
    "foreground":"#0f172a",
    "muted":"#f1f5f9",
    "font":"Inter"
  }'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  domain text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;
create trigger settings_touch before update on public.settings for each row execute function public.touch_updated_at();

-- =========================================
-- MENUS
-- =========================================
create table public.menus (
  id uuid primary key default gen_random_uuid(),
  location text not null default 'header',  -- header | footer
  label text not null,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.menus enable row level security;
create index menus_location_idx on public.menus(location, sort_order);

-- =========================================
-- CATEGORIES
-- =========================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;

-- =========================================
-- PRODUCTS
-- =========================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12,2),
  currency text not null default 'IDR',
  image_url text,
  gallery jsonb not null default '[]'::jsonb,
  category_id uuid references public.categories(id) on delete set null,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
create index products_published_idx on public.products(is_published, sort_order);
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

-- =========================================
-- BLOG
-- =========================================
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image text,
  author_id uuid references auth.users(id) on delete set null,
  is_published boolean not null default false,
  published_at timestamptz,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.blog_posts enable row level security;
create index blog_posts_published_idx on public.blog_posts(is_published, published_at desc);
create trigger blog_touch before update on public.blog_posts for each row execute function public.touch_updated_at();

-- =========================================
-- GALLERY
-- =========================================
create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.gallery_images enable row level security;

-- =========================================
-- PAGES (custom pages) + SECTIONS (editable blocks)
-- =========================================
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  is_published boolean not null default true,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.pages enable row level security;
create trigger pages_touch before update on public.pages for each row execute function public.touch_updated_at();

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.pages(id) on delete cascade,
  page_slug text,             -- alternative: target a built-in page like 'home','about'
  type text not null,         -- hero | text | features | cta | gallery | testimonial | rich
  data jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.sections enable row level security;
create index sections_page_idx on public.sections(page_id, sort_order);
create index sections_slug_idx on public.sections(page_slug, sort_order);
create trigger sections_touch before update on public.sections for each row execute function public.touch_updated_at();

-- =========================================
-- RLS POLICIES
-- =========================================
-- profiles: user reads own; admin reads all; user updates own
create policy "profiles self read" on public.profiles for select using (auth.uid() = id);
create policy "profiles admin read" on public.profiles for select using (public.is_admin(auth.uid()));
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

-- user_roles: user reads own; admin reads/writes all
create policy "roles self read" on public.user_roles for select using (auth.uid() = user_id);
create policy "roles admin read" on public.user_roles for select using (public.has_role(auth.uid(), 'admin'));
create policy "roles admin write" on public.user_roles for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- public read tables
create policy "settings public read" on public.settings for select using (true);
create policy "settings admin write" on public.settings for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "menus public read" on public.menus for select using (true);
create policy "menus admin write" on public.menus for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "categories public read" on public.categories for select using (true);
create policy "categories admin write" on public.categories for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "products public read" on public.products for select using (is_published or public.is_admin(auth.uid()));
create policy "products admin write" on public.products for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "blog public read" on public.blog_posts for select using (is_published or public.is_admin(auth.uid()));
create policy "blog admin write" on public.blog_posts for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "gallery public read" on public.gallery_images for select using (true);
create policy "gallery admin write" on public.gallery_images for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "pages public read" on public.pages for select using (is_published or public.is_admin(auth.uid()));
create policy "pages admin write" on public.pages for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "sections public read" on public.sections for select using (true);
create policy "sections admin write" on public.sections for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- =========================================
-- STORAGE BUCKETS
-- =========================================
insert into storage.buckets (id, name, public) values
  ('media','media', true),
  ('products','products', true),
  ('gallery','gallery', true),
  ('blog','blog', true)
on conflict (id) do nothing;

-- public read for all 4 buckets; admins can write
create policy "public read storage"
on storage.objects for select
using (bucket_id in ('media','products','gallery','blog'));

create policy "admin write storage"
on storage.objects for all
using (bucket_id in ('media','products','gallery','blog') and public.is_admin(auth.uid()))
with check (bucket_id in ('media','products','gallery','blog') and public.is_admin(auth.uid()));

-- =========================================
-- SEED DATA
-- =========================================
insert into public.settings (site_name, tagline, description, contact_email, contact_phone, contact_address, social)
values (
  'Local Artisan Store',
  'Quality local products for every family',
  'We provide a wide range of selected local products with the best quality and affordable prices.',
  'hello@localshop.example',
  '+1 (555) 123-4567',
  '123 Liberty Street, Cityville',
  '{"instagram":"https://instagram.com/","whatsapp":"https://wa.me/15551234567","facebook":"https://facebook.com/"}'::jsonb
);

insert into public.menus (location, label, url, sort_order) values
  ('header','Home','/',1),
  ('header','About','/about',2),
  ('header','Services','/services',3),
  ('header','Products','/products',4),
  ('header','Gallery','/gallery',5),
  ('header','Blog','/blog',6),
  ('header','Contact','/contact',7);

insert into public.categories (name, slug, description) values
  ('Food','food','Various local delicacies'),
  ('Crafts','crafts','Handmade local crafts'),
  ('Fashion','fashion','Clothing and accessories');

insert into public.products (name, slug, description, price, image_url, sort_order) values
  ('Premium Cassava Chips','premium-cassava-chips','Crispy, savory, made from selected cassava.', 25000, 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800', 1),
  ('Pandan Woven Bag','woven-bag','Handmade woven bag made from pandan leaves.', 175000, 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800', 2),
  ('Classic Hand-Drawn Batik','hand-drawn-batik','Classic hand-drawn batik pattern, premium quality.', 450000, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800', 3);

insert into public.blog_posts (title, slug, excerpt, content, cover_image, is_published, published_at, tags) values
  ('How Local Businesses Go Digital','how-local-businesses-go-digital','How digitalization helps local businesses grow rapidly.', 'Full blog content goes here...', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200', true, now(), array['local','digital']);

insert into public.gallery_images (title, image_url, sort_order) values
  ('Local Workshop','https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200',1),
  ('Production','https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=1200',2),
  ('Exhibition','https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200',3);

