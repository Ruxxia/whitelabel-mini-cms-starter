CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin'::public.app_role, 'editor'::public.app_role)
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon, authenticated;

DROP POLICY IF EXISTS "roles admin read" ON public.user_roles;
DROP POLICY IF EXISTS "roles admin write" ON public.user_roles;

DROP POLICY IF EXISTS "products public read" ON public.products;
CREATE POLICY "products public read"
ON public.products
FOR SELECT
TO public
USING (is_published);

DROP POLICY IF EXISTS "blog public read" ON public.blog_posts;
CREATE POLICY "blog public read"
ON public.blog_posts
FOR SELECT
TO public
USING (is_published);

DROP POLICY IF EXISTS "pages public read" ON public.pages;
CREATE POLICY "pages public read"
ON public.pages
FOR SELECT
TO public
USING (is_published);