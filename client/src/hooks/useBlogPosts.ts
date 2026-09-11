import { useMemo } from "react";
import { useNegociosPrincipales } from "./useSupabaseNegocios";
import { generateBlogPosts, getBlogPost } from "@/lib/blogGenerator";

export function useBlogPosts() {
  const { negocios: allNegocios, loaded } = useNegociosPrincipales();
  const posts = useMemo(
    () => (loaded ? generateBlogPosts(allNegocios) : []),
    [allNegocios, loaded]
  );
  return { posts, loaded };
}

export function useBlogPost(slug: string) {
  const { negocios: allNegocios, loaded } = useNegociosPrincipales();
  const post = useMemo(
    () => (loaded ? getBlogPost(slug, allNegocios) : undefined),
    [slug, allNegocios, loaded]
  );
  return { post, loaded };
}
