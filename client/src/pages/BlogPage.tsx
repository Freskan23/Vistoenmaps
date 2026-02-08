/*
  DESIGN: Blog Listing Page
  - Dark gradient hero with Newspaper icon, title, and description
  - Category and city filter pills
  - Responsive grid of BlogPostCards
  - Schema.org Blog JSON-LD
*/

import { useState, useMemo } from "react";
import { Newspaper } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import BlogPostCard from "@/components/BlogPostCard";
import { useBlogPosts } from "@/hooks/useBlogPosts";

/* ------------------------------------------------------------------ */
/*  Skeleton card for loading state                                    */
/* ------------------------------------------------------------------ */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border/50 animate-pulse">
      <div className="h-1 w-full bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-24 bg-gray-200 rounded-full" />
        <div className="h-5 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-100 rounded" />
        <div className="h-4 w-2/3 bg-gray-100 rounded" />
        <div className="flex gap-3 mt-2">
          <div className="h-3 w-16 bg-gray-100 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  const { posts, loaded } = useBlogPosts();
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [selectedCiudad, setSelectedCiudad] = useState<string | null>(null);

  /* ---- Unique filter values ---- */
  const uniqueCategorias = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of posts) {
      if (!map.has(p.categoria_slug)) {
        map.set(p.categoria_slug, p.categoria_nombre);
      }
    }
    return Array.from(map.entries()); // [slug, nombre]
  }, [posts]);

  const uniqueCiudades = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of posts) {
      if (!map.has(p.ciudad_slug)) {
        map.set(p.ciudad_slug, p.ciudad_nombre);
      }
    }
    return Array.from(map.entries());
  }, [posts]);

  /* ---- Filtered posts ---- */
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (selectedCategoria && p.categoria_slug !== selectedCategoria) return false;
      if (selectedCiudad && p.ciudad_slug !== selectedCiudad) return false;
      return true;
    });
  }, [posts, selectedCategoria, selectedCiudad]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title="Blog | Visto en Maps"
        description="Rankings y guias de los mejores profesionales en tu ciudad. Descubre los negocios mejor valorados en Google Maps."
        canonical="https://vistoenmaps.com/blog"
      />
      <Header />

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Blog | Visto en Maps",
            description:
              "Rankings y guias de los mejores profesionales en tu ciudad.",
            url: "https://vistoenmaps.com/blog",
            publisher: {
              "@type": "Organization",
              name: "Visto en Maps",
              url: "https://vistoenmaps.com",
            },
          }),
        }}
      />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#142d45]" />

        {/* Ambient light orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 right-[10%] w-[300px] h-[300px] bg-accent/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] bg-cyan-500/8 rounded-full blur-[100px]" />
        </div>

        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative container py-14 md:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-5 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10"
          >
            <Newspaper className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-extrabold text-white"
          >
            Los mejores de cada ciudad
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-white/50 mt-2 max-w-lg mx-auto"
          >
            Rankings basados en reseñas reales de Google Maps. No pagamos por posiciones, no aceptamos publicidad.
          </motion.p>
        </div>

        {/* Bottom wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path
              d="M0 60V20C240 45 480 0 720 20C960 40 1200 10 1440 30V60H0Z"
              fill="#fafaf7"
            />
          </svg>
        </div>
      </section>

      {/* ===== FILTER SECTION ===== */}
      <section className="container pt-8 pb-2">
        {/* Category filters */}
        <div className="mb-4">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-3">
            Categoria:
          </span>
          <div className="inline-flex flex-wrap gap-2 mt-1">
            <button
              onClick={() => setSelectedCategoria(null)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                selectedCategoria === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              Todos
            </button>
            {uniqueCategorias.map(([slug, nombre]) => (
              <button
                key={slug}
                onClick={() =>
                  setSelectedCategoria(slug === selectedCategoria ? null : slug)
                }
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  selectedCategoria === slug
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {nombre}
              </button>
            ))}
          </div>
        </div>

        {/* City filters */}
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-3">
            Ciudad:
          </span>
          <div className="inline-flex flex-wrap gap-2 mt-1">
            <button
              onClick={() => setSelectedCiudad(null)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                selectedCiudad === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              Todas
            </button>
            {uniqueCiudades.map(([slug, nombre]) => (
              <button
                key={slug}
                onClick={() =>
                  setSelectedCiudad(slug === selectedCiudad ? null : slug)
                }
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  selectedCiudad === slug
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {nombre}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POSTS GRID ===== */}
      <section className="container py-8 flex-1">
        {!loaded ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No hay articulos disponibles
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
              >
                <BlogPostCard post={post} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
