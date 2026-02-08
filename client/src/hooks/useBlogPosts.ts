import { useMemo } from "react";
import { useAllNegocios } from "./useSupabaseNegocios";
import { generateBlogPosts, getBlogPost } from "@/lib/blogGenerator";

export function useBlogPosts() {
  const { allNegocios, loaded } = useAllNegocios();
  const posts = useMemo(
    () => (loaded ? generateBlogPosts(allNegocios) : []),
    [allNegocios, loaded]
  );
  return { posts, loaded };
}

export function useBlogPost(slug: string) {
  const { allNegocios, loaded } = useAllNegocios();
  const post = useMemo(
    () => (loaded ? getBlogPost(slug, allNegocios) : undefined),
    [slug, allNegocios, loaded]
  );
  return { post, loaded };
}
