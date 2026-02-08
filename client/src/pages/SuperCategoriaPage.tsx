/*
  DESIGN: Directorio — Super-Categoría Hub
  - Displays all child categories belonging to a super-category
  - Dark gradient hero with ambient orbs, dot grid, and wave separator
  - Category cards grid with stagger animations and color accents
  - Schema.org BreadcrumbList for SEO
*/

import { Link, useParams } from "wouter";
import { ArrowRight, Clock } from "lucide-react";
import { getSuperCategoria, categorias, negocios } from "@/data";
import CategoryIcon from "@/components/CategoryIcon";
import Breadcrumb from "@/components/Breadcrumb";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "./NotFound";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

// Color accents per child category card for visual variety
const catColors = [
  { bg: "from-amber-500/20 to-orange-500/10", icon: "text-amber-500", border: "border-amber-500/20", hover: "hover:border-amber-500/40 hover:shadow-amber-500/10" },
  { bg: "from-blue-500/20 to-cyan-500/10", icon: "text-blue-500", border: "border-blue-500/20", hover: "hover:border-blue-500/40 hover:shadow-blue-500/10" },
  { bg: "from-yellow-500/20 to-amber-500/10", icon: "text-yellow-600", border: "border-yellow-500/20", hover: "hover:border-yellow-500/40 hover:shadow-yellow-500/10" },
  { bg: "from-purple-500/20 to-pink-500/10", icon: "text-purple-500", border: "border-purple-500/20", hover: "hover:border-purple-500/40 hover:shadow-purple-500/10" },
  { bg: "from-emerald-500/20 to-teal-500/10", icon: "text-emerald-500", border: "border-emerald-500/20", hover: "hover:border-emerald-500/40 hover:shadow-emerald-500/10" },
  { bg: "from-rose-500/20 to-red-500/10", icon: "text-rose-500", border: "border-rose-500/20", hover: "hover:border-rose-500/40 hover:shadow-rose-500/10" },
];

export default function SuperCategoriaPage() {
  const { superCategoria: superCatSlug } = useParams<{ superCategoria: string }>();
  const superCat = getSuperCategoria(superCatSlug);

  if (!superCat) return <NotFound />;

  // Resolve child categories from static data
  const childCategorias = categorias.filter((c) =>
    superCat.categorias.includes(c.slug)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title={`${superCat.nombre} — Directorio | Visto en Maps`}
        description={`Explora categorías de ${superCat.nombre.toLowerCase()}: ${childCategorias.map((c) => c.nombre.toLowerCase()).join(", ")}. ${superCat.descripcion}`}
        canonical={`https://vistoenmaps.com/directorio/${superCat.slug}`}
      />
      <Header />

      {/* Schema.org BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Inicio",
                item: "https://vistoenmaps.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Directorio",
                item: "https://vistoenmaps.com/directorio",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: superCat.nombre,
                item: `https://vistoenmaps.com/directorio/${superCat.slug}`,
              },
            ],
          }),
        }}
      />

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#142d45]" />

        {/* Ambient light orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 right-[10%] w-[300px] h-[300px] bg-accent/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] bg-cyan-500/8 rounded-full blur-[100px]" />
          <div className="absolute top-[30%] left-[50%] w-[200px] h-[200px] bg-purple-500/6 rounded-full blur-[80px]" />
        </div>

        {/* Subtle dot grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative container py-12 md:py-16">
          <Breadcrumb
            items={[
              { label: "Directorio", href: "/" },
              { label: superCat.nombre },
            ]}
            variant="dark"
          />

          <div className="flex items-center gap-5 mt-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10"
            >
              <CategoryIcon iconName={superCat.icono} className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl md:text-4xl font-extrabold text-white"
              >
                {superCat.nombre}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-white/50 mt-1"
              >
                {superCat.descripcion}
              </motion.p>
            </div>
          </div>
        </div>

        {/* Bottom wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 60V20C240 45 480 0 720 20C960 40 1200 10 1440 30V60H0Z" fill="#fafaf7" />
          </svg>
        </div>
      </section>

      {/* ===== CHILD CATEGORIES GRID ===== */}
      <section className="container py-10 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-accent rounded-full" />
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Categorías</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Explora {superCat.nombre.toLowerCase()}
            </h2>
            <p className="text-muted-foreground mt-1">
              Encuentra profesionales por tipo de servicio
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {childCategorias.map((cat, index) => {
            const color = catColors[index % catColors.length];
            const negociosCount = negocios.filter(
              (n) => n.categoria_slug === cat.slug
            ).length;

            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Link href={`/${cat.slug}`}>
                  <div
                    className={`group relative bg-white border ${color.border} shadow-sm ${color.hover} hover:shadow-xl rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden`}
                  >
                    {/* Subtle gradient bg on hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${color.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />

                    <div className="relative">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${color.bg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
                        >
                          <CategoryIcon
                            iconName={cat.icono}
                            className={`w-6 h-6 ${color.icon}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                              {cat.nombre}
                            </h3>
                            {negociosCount === 0 && (
                              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-400 text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5">
                                <Clock className="w-3 h-3" />
                                Próximamente
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mt-1">
                            {cat.descripcion}
                          </p>
                        </div>
                      </div>

                      {/* Business count badge */}
                      {negociosCount > 0 && (
                        <div className="mt-3">
                          <span className="text-xs bg-accent/10 text-accent font-bold px-2.5 py-1 rounded-full">
                            {negociosCount}{" "}
                            {negociosCount === 1 ? "profesional" : "profesionales"}
                          </span>
                        </div>
                      )}

                      {/* "Ver profesionales" hover link */}
                      <div className="flex items-center gap-1 text-sm font-semibold text-accent mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                        Ver profesionales
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
