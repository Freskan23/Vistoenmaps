import { useEffect } from "react";

const DEFAULT_OG_IMAGE = "https://vistoenmaps.com/icon-512.png";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

export default function SEOHead({ title, description, canonical, ogImage, ogType }: SEOHeadProps) {
  useEffect(() => {
    document.title = title;

    setMeta("name", "description", description);

    const image = ogImage || DEFAULT_OG_IMAGE;

    const ogTags: Record<string, string> = {
      "og:title": title,
      "og:description": description,
      "og:type": ogType || "website",
      "og:site_name": "Visto en Maps",
      "og:locale": "es_ES",
      "og:image": image,
    };

    if (canonical) {
      ogTags["og:url"] = canonical;

      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", canonical);
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

    setMeta("name", "twitter:card", ogImage ? "summary_large_image" : "summary");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);
  }, [title, description, canonical, ogImage, ogType]);

  return null;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
