/*
  DESIGN: Individual Blog Post Page
  - Light hero with accent color based on super-category
  - Breadcrumb navigation
  - Numbered ranking list of businesses with call-to-action buttons
  - Related posts section
  - Schema.org Article + ItemList JSON-LD
*/

import { useMemo } from "react";
import { useParams, Link } from "wouter";
import {
  Newspaper,
  MapPin,
  Star,
  Calendar,
  Phone,
  ExternalLink,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import Breadcrumb from "@/components/Breadcrumb";
import BlogPostCard from "@/components/BlogPostCard";
import { useBlogPost, useBlogPosts } from "@/hooks/useBlogPosts";
import { getSuperCategoriaForCategoria } from "@/data/superCategorias";

/* ------------------------------------------------------------------ */
/*  Accent color helpers based on super-category                       */
/* ------------------------------------------------------------------ */
function getAccent(categoriaSlug: string) {
  const sc = getSuperCategoriaForCategoria(categoriaSlug);
  switch (sc?.slug) {
    case "servicios":
      return {
        heroBg: "from-blue-50 to-blue-100/40",
        badge: "bg-blue-100 text-blue-700",
        rank: "text-blue-500",
        pill: "bg-blue-50 text-blue-600",
        cta: "bg-blue-500 hover:bg-blue-600",
        ctaOutline:
          "border-blue-200 text-blue-600 hover:bg-blue-50",
      };
    case "salud":
      return {
        heroBg: "from-emerald-50 to-emerald-100/40",
        badge: "bg-emerald-100 text-emerald-700",
        rank: "text-emerald-500",
        pill: "bg-emerald-50 text-emerald-600",
        cta: "bg-emerald-500 hover:bg-emerald-600",
        ctaOutline:
          "border-emerald-200 text-emerald-600 hover:bg-emerald-50",
      };
    case "ocio":
      return {
        heroBg: "from-purple-50 to-purple-100/40",
        badge: "bg-purple-100 text-purple-700",
        rank: "text-purple-500",
        pill: "bg-purple-50 text-purple-600",
        cta: "bg-purple-500 hover:bg-purple-600",
        ctaOutline:
          "border-purple-200 text-purple-600 hover:bg-purple-50",
      };
    case "restaurantes":
      return {
        heroBg: "from-amber-50 to-amber-100/40",
        badge: "bg-amber-100 text-amber-700",
        rank: "text-amber-500",
        pill: "bg-amber-50 text-amber-600",
        cta: "bg-amber-500 hover:bg-amber-600",
        ctaOutline:
          "border-amber-200 text-amber-600 hover:bg-amber-50",
      };
    default:
      return {
        heroBg: "from-gray-50 to-gray-100/40",
        badge: "bg-gray-100 text-gray-700",
        rank: "text-gray-500",
        pill: "bg-gray-50 text-gray-600",
        cta: "bg-gray-500 hover:bg-gray-600",
        ctaOutline:
          "border-gray-200 text-gray-600 hover:bg-gray-50",
      };
  }
}

/* ------------------------------------------------------------------ */
/*  Star rating renderer                                               */
/* ------------------------------------------------------------------ */
function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-amber-400 text-amber-400"
        />
      ))}
      {hasHalf && (
        <span className="relative w-4 h-4">
          <Star className="absolute inset-0 w-4 h-4 text-gray-200 fill-gray-200" />
          <span className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </span>
        </span>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="w-4 h-4 text-gray-200 fill-gray-200"
        />
      ))}
    </span>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { post, loaded } = useBlogPost(slug || "");
  const { posts: allPosts } = useBlogPosts();

  const accent = post ? getAccent(post.categoria_slug) : getAccent("");

  /* ---- Related posts (same category or city, excluding current) ---- */
  const relatedPosts = useMemo(() => {
    if (!post || allPosts.length === 0) return [];
    return allPosts
      .filter(
        (p) =>
          p.slug !== post.slug &&
          (p.categoria_slug === post.categoria_slug ||
            p.ciudad_slug === post.ciudad_slug)
      )
      .slice(0, 3);
  }, [post, allPosts]);

  /* ---- Loading state ---- */
  if (!loaded) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafaf7]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            Cargando articulo...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ---- Not found state ---- */
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafaf7]">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <Newspaper className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h1 className="text-2xl font-extrabold text-foreground mb-2">
            Articulo no encontrado
          </h1>
          <p className="text-muted-foreground mb-6">
            El articulo que buscas no existe o ha sido eliminado.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Volver al blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title={`${post.titulo} | Visto en Maps`}
        description={post.extracto}
        canonical={`https://vistoenmaps.com/blog/${post.slug}`}
      />
      <Header />

      {/* Schema.org Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.titulo,
            description: post.extracto,
            datePublished: post.fecha_generado,
            dateModified: post.fecha_generado,
            author: {
              "@type": "Organization",
              name: "Visto en Maps",
              url: "https://vistoenmaps.com",
            },
            publisher: {
              "@type": "Organization",
              name: "Visto en Maps",
              url: "https://vistoenmaps.com",
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://vistoenmaps.com/blog/${post.slug}`,
            },
          }),
        }}
      />

      {/* Schema.org ItemList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: post.titulo,
            description: post.extracto,
            numberOfItems: post.negocios.length,
            itemListElement: post.negocios.map((neg, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: neg.nombre,
              url: `https://vistoenmaps.com/${neg.categoria_slug}/${neg.ciudad_slug}/${neg.barrio_slug}/${neg.slug}`,
            })),
          }),
        }}
      />

      {/* ===== HERO (light accent) ===== */}
      <section
        className={`relative overflow-hidden bg-gradient-to-b ${accent.heroBg}`}
      >
        <div className="container py-8 md:py-12">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Blog", href: "/blog" },
              { label: post.titulo },
            ]}
            variant="light"
          />

          {/* Category badge */}
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mt-2 ${accent.badge}`}
          >
            {post.categoria_nombre}
          </motion.span>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-extrabold text-foreground mt-3 max-w-3xl"
          >
            {post.titulo}
          </motion.h1>

          {/* Meta line */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {post.ciudad_nombre}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {post.fecha_generado}
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4" />
              {post.negocios.length} negocios en el ranking
            </span>
          </motion.div>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <section className="container py-10 md:py-14">
        <div className="max-w-3xl mx-auto">
          {/* Introduction */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-base text-muted-foreground leading-relaxed mb-10"
          >
            Hemos analizado las valoraciones y resenas de Google Maps para crear
            este ranking de los mejores {post.categoria_nombre.toLowerCase()} en{" "}
            {post.ciudad_nombre}. Estos son los profesionales mejor valorados
            por sus clientes.
          </motion.p>

          {/* Numbered business list */}
          <div className="space-y-6">
            {post.negocios.map((neg, index) => (
              <motion.article
                key={neg.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 md:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Rank number */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 font-extrabold text-lg ${accent.rank}`}
                  >
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Name */}
                    <Link
                      href={`/${neg.categoria_slug}/${neg.ciudad_slug}/${neg.barrio_slug}/${neg.slug}`}
                      className="font-bold text-foreground hover:text-primary transition-colors text-base md:text-lg"
                    >
                      {neg.nombre}
                    </Link>

                    {/* Rating + reviews */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <StarRating rating={neg.valoracion_media} />
                      <span className="text-sm font-semibold text-foreground">
                        {neg.valoracion_media.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({neg.num_resenas} resenas)
                      </span>
                    </div>

                    {/* Address */}
                    {neg.direccion && (
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        {neg.direccion}
                      </p>
                    )}

                    {/* Top 3 servicios_destacados */}
                    {neg.servicios_destacados &&
                      neg.servicios_destacados.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {neg.servicios_destacados.slice(0, 3).map((s, i) => (
                            <span
                              key={i}
                              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${accent.pill}`}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                    {/* CTA buttons */}
                    <div className="flex flex-wrap gap-2.5 mt-4">
                      {neg.telefono && (
                        <a
                          href={`tel:${neg.telefono}`}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3.5 py-2 rounded-lg transition-colors ${accent.cta}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Llamar
                        </a>
                      )}
                      {neg.url_google_maps && (
                        <a
                          href={neg.url_google_maps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg border transition-colors ${accent.ctaOutline}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Ver en Maps
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* ===== RELATED POSTS ===== */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-accent rounded-full" />
                <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
                  Articulos relacionados
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedPosts.map((rp, index) => (
                  <motion.div
                    key={rp.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                  >
                    <BlogPostCard post={rp} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
