import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useMenus(location: "header" | "footer" = "header") {
  return useQuery({
    queryKey: ["menus", location],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menus")
        .select("*")
        .eq("location", location)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("is_published", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog_posts"],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      if (!posts || posts.length === 0) return [];

      const { data: profiles } = await supabase.from("profiles").select("id, email, full_name");
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

      return posts.map((p) => ({
        ...p,
        profiles: p.author_id ? profileMap.get(p.author_id) || null : null,
      }));
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog_post", slug],
    queryFn: async () => {
      const { data: post, error: postErr } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (postErr) throw postErr;
      if (!post) return null;

      if (post.author_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .eq("id", post.author_id)
          .maybeSingle();
        return {
          ...post,
          profiles: profile || null,
        };
      }
      return {
        ...post,
        profiles: null,
      };
    },
  });
}

export function useGallery() {
  return useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSections(pageSlug: string) {
  return useQuery({
    queryKey: ["sections", pageSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .eq("page_slug", pageSlug)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}