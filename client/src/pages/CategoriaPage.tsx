/*
  DESIGN: Cartografía Urbana — Categoría Hub
  - Lists cities where this category has businesses
  - Vibrant hero with gradient background, ambient glows, dot grid & wave separator
  - City cards with per-card color accents and hover effects
*/

import { Link, useParams } from "wouter";
import { MapPin, ArrowRight, Building2 } from "lucide-react";
import { getCategoria } from "@/data";
import { useAllNegocios, useAllCiudades, filterByCiudad } from "@/hooks/useSupabaseNegocios";
import CategoryIcon from "@/components/CategoryIcon";
import Breadcrumb from "@/components/Breadcrumb";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "./NotFound";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

// Color accents per city card for visual variety
const cardColors = [
  { bg: "from-amber-500/20 to-orange-500/10", border: "border-amber-500/20", hover: "hover:border-amber-500/40 hover:shadow-amber-500/10" },
  { bg: "from-blue-500/20 to-cyan-500/10", border: "border-blue-500/20", hover: "hover:border-blue-500/40 hover:shadow-blue-500/10" },
  { bg: "from-yellow-500/20 to-amber-500/10", border: "border-yellow-500/20", hover: "hover:border-yellow-500/40 hover:shadow-yellow-500/10" },
  { bg: "from-purple-500/20 to-pink-500/10", border: "border-purple-500/20", hover: "hover:border-purple-500/40 hover:shadow-purple-500/10" },
  { bg: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-500/20", hover: "hover:border-emerald-500/40 hover:shadow-emerald-500/10" },
  { bg: "from-rose-500/20 to-red-500/10", border: "border-rose-500/20", hover: "hover:border-rose-500/40 hover:shadow-rose-500/10" },
];

export default function CategoriaPage() {
  const { categoria } = useParams<{ categoria: string }>();
  const cat = getCategoria(categoria);
  const { allNegocios } = useAllNegocios();
  const { allCiudades } = useAllCiudades();

  if (!cat) return <NotFound />;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title={`${cat.nombre} en España | Visto en Maps`}
        description={`Encuentra ${cat.nombre.toLowerCase()} profesionales en toda España. ${cat.descripcion}`}
        canonical={`https://vistoenmaps.com/${cat.slug}`}
      />
      <Header />

      {/* Schema.org JSON-LD */}
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
                name: cat.nombre,
                item: `https://vistoenmaps.com/${cat.slug}`,
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${cat.nombre} en España`,
            description: cat.descripcion,
            itemListElement: allCiudades.map((ciudad, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: `${cat.nombre} en ${ciudad.nombre}`,
              url: `https://vistoenmaps.com/${cat.slug}/${ciudad.slug}`,
            })),
          }),
        }}
      />

      {/* ===== CATEGORY HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Vibrant gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#142d45]" />

        {/* Ambient light orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 right-[10%] w-[300px] h-[300px] bg-accent/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] bg-cyan-500/8 rounded-full blur-[100px]" />
        </div>

        {/* Subtle dot grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Category background image (if exists) */}
        {cat.imagen && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10"
              style={{ backgroundImage: `url(${cat.imagen})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#0a1628]/90 to-[#0a1628]/70" />
          </>
        )}

        <div className="relative container py-12 md:py-16">
          <Breadcrumb
            items={[{ label: cat.nombre }]}
            variant="dark"
          />
          <div className="flex items-center gap-5 mt-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10"
            >
              <CategoryIcon iconName={cat.icono} className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl md:text-4xl font-extrabold text-white"
              >
                {cat.nombre}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-accent">
                  en España
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-white/50 mt-1"
              >
                {cat.descripcion}
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

      {/* ===== CITIES GRID ===== */}
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
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Ciudades</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Selecciona una ciudad
            </h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allCiudades.map((ciudad, index) => {
            const negociosCount = filterByCiudad(allNegocios, cat.slug, ciudad.slug).length;
            const color = cardColors[index % cardColors.length];
            return (
              <motion.div
                key={ciudad.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Link href={`/${cat.slug}/${ciudad.slug}`}>
                  <div className={`group relative bg-white border ${color.border} shadow-sm ${color.hover} hover:shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer`}>
                    {/* Subtle gradient bg on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${color.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                    {/* City image */}
                    <div className="relative">
                      {ciudad.imagen ? (
                        <div className="h-36 overflow-hidden">
                          <img
                            src={ciudad.imagen}
                            alt={`${cat.nombre} en ${ciudad.nombre}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="h-36 bg-gradient-to-br from-primary/5 to-primary/15 flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-primary/20" />
                        </div>
                      )}
                    </div>

                    <div className="relative p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                            {ciudad.nombre}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {ciudad.comunidad_autonoma}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {negociosCount > 0 && (
                            <span className="text-xs bg-accent/10 text-accent font-bold px-2 py-1 rounded-full">
                              {negociosCount} {negociosCount === 1 ? "negocio" : "negocios"}
                            </span>
                          )}
                          <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      {/* Hover reveal text */}
                      <div className="flex items-center gap-1 text-sm font-semibold text-accent mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                        Ver barrios
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
