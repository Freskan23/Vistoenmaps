import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
}

/**
 * SEO component that updates document head tags.
 * In a real Next.js project, this would use generateMetadata.
 * For this SPA, we dynamically update the head.
 */
export default function SEOHead({ title, description, canonical, ogImage }: SEOHeadProps) {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    // Update or create OG tags
    const ogTags: Record<string, string> = {
      "og:title": title,
      "og:description": description,
      "og:type": "website",
      "og:site_name": "Visto en Maps",
    };

    if (canonical) {
      ogTags["og:url"] = canonical;

      // Update or create canonical link
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", canonical);
    }

    if (ogImage) {
      ogTags["og:image"] = ogImage;
    }

    Object.entries(ogTags).forEach(([property, content]) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    });
  }, [title, description, canonical, ogImage]);

  return null;
}
