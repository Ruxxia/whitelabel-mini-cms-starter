# Brainstorming Session: TanStack Start Nested Routing Fix

## Understanding Summary
* **Goal:** Fix the navigation bug where visitors are not navigated to the product detail page (`/products/$slug`) or blog detail page (`/blog/$slug`) when clicking on items from lists.
* **Root Cause:** The parent layout routes `src/routes/products.tsx` and `src/routes/blog.tsx` contain duplicates of the listing views and do not render the required TanStack Router `<Outlet />` component, blocking child route mounting.
* **Target Users:** Visitors and admins using the CMS catalog.
* **Explicit Non-Goals:** Restyling pages, changing queries, or database schemas.

## Assumptions
* `products.index.tsx` and `blog.index.tsx` already contain the full correct page components for their respective index listings.
* Refactoring the parent routes `products.tsx` and `blog.tsx` to group-only routes rendering `<Outlet />` is the cleanest fix.

## Decision Log
* **Decision:** Refactor `products.tsx` and `blog.tsx` to render `<Outlet />`.
* **Alternatives Considered:** Flat sibling routing suffix (`products_.$slug.tsx`).
* **Why Chosen:** Minimal code changes, perfect alignment with TanStack Router conventions, and leaves layout wrapper extensibility open.

---

# Brainstorming Session 2: Product Multi-Image Gallery Upgrade

## Understanding Summary
* **Goal:** Enable store managers to add up to 5 images per product (1 Cover Image + up to 4 Gallery Images) in the admin panel and showcase them interactively on the public product page.
* **Key Components:**
  1. **Admin:** A premium `<MultiImageUpload>` component with a 5-slot grid.
  2. **Public:** An interactive Image Viewer with thumbnail crossfade switching in default and PageBuilder views.
* **Data Flow:** First slot maps to `image_url` (cover); slots 2-5 map to the `gallery` JSON array.

## Assumptions & Constraints
* The Supabase database already contains a `gallery` JSON column, which defaults to `[]`.
* Max limit is strictly enforced to 5 images to keep layouts balanced and high-performance.
* Backwards compatibility is maintained for items lacking gallery assets.

## Decision Log
* **Decision:** Approach 1 (Unified Multi-Image Grid with interactive frontend state switching).
* **Why Chosen:** Premium, space-efficient, interactive UX with zero risk of database schema corruption or migration downtime.
