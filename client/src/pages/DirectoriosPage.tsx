/*
  DESIGN: Directorio de Directorios — Zona Premium + Estandar
  - Hero with dramatic dark gradient + wave separator
  - Premium zone with highlighted cards
  - Standard directories grid
  - Filter by category tabs (modern pill style)
  - Social media section
  - Warm off-white page background
*/

import { useState } from "react";
import { Link } from "wouter";
import {
  Globe,
  Star,
  ExternalLink,
  Check,
  Crown,
  Search,
  BookOpen,
  Briefcase,
  Home as HomeIcon,
  Users,
  MapPin,
  Shield,
  BadgeCheck,
  Filter,
  ArrowRight,
} from "lucide-react";
import {
  directorios,
  directoriosPremium,
  directoriosEstandar,
  directoriosSocial,
  categoriaDirectorio,
  type CategoriaDirectorio,
  type Directorio,
} from "@/data/directorios";
import Breadcrumb from "@/components/Breadcrumb";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";

const categoryIcons: Record<string, React.ReactNode> = {
  general: <Globe className="w-4 h-4" />,
  resenas: <Star className="w-4 h-4" />,
  servicios: <Briefcase className="w-4 h-4" />,
  reformas: <HomeIcon className="w-4 h-4" />,
  b2b: <Briefcase className="w-4 h-4" />,
  social: <Users className="w-4 h-4" />,
  regional: <MapPin className="w-4 h-4" />,
};

const alcanceLabels: Record<string, string> = {
  local: "Local",
  regional: "Regional",
  nacional: "Nacional",
  europeo: "Europa",
  internacional: "Internacional",
  global: "Global",
};

function DirectorioCard({
  dir,
  featured = false,
}: {
  dir: Directorio;
  featured?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35 }}
    >
      <Link href={`/directorios/${dir.slug}`} className="block h-full">
        <div
          className={`group relative h-full bg-card border rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
            featured
              ? "border-accent/30 shadow-md hover:shadow-xl ring-1 ring-accent/10"
              : "border-border/60 shadow-sm hover:shadow-lg"
          }`}
        >
          {/* Premium badge */}
          {featured && (
            <div className="absolute -top-2.5 right-4 flex items-center gap-1 bg-accent text-accent-foreground text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
              <Crown className="w-3 h-3" />
              Premium
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  featured
                    ? "bg-accent/10 group-hover:bg-accent/20"
                    : "bg-primary/10 group-hover:bg-primary/20"
                }`}
              >
                <Globe
                  className={`w-5 h-5 ${
                    featured ? "text-accent" : "text-primary"
                  }`}
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  {dir.nombre}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {dir.dominio}
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-1" />
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
            {dir.descripcion}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {dir.gratis ? (
              <span className="flex items-center gap-1 text-[11px] bg-green-500/10 text-green-700 dark:text-green-400 font-semibold px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" />
                Gratis
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-full">
                <Crown className="w-3 h-3" />
                De pago
              </span>
            )}
            {dir.permiteResenas && (
              <span className="flex items-center gap-1 text-[11px] bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3" />
                Resenas
              </span>
            )}
            <span className="text-[11px] bg-secondary text-secondary-foreground font-medium px-2 py-0.5 rounded-full">
              {alcanceLabels[dir.alcance] || dir.alcance}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {categoryIcons[dir.categoria]}
              <span>{categoriaDirectorio[dir.categoria]}</span>
            </div>
            <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              Ver ficha <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function DirectoriosPage() {
  const [activeFilter, setActiveFilter] = useState<"todos" | CategoriaDirectorio>("todos");

  const allCategories = Object.keys(categoriaDirectorio) as CategoriaDirectorio[];

  const filteredPremium =
    activeFilter === "todos"
      ? directoriosPremium
      : directoriosPremium.filter((d) => d.categoria === activeFilter);

  const filteredEstandar =
    activeFilter === "todos"
      ? directoriosEstandar
      : directoriosEstandar.filter((d) => d.categoria === activeFilter);

  const filteredSocial =
    activeFilter === "todos"
      ? directoriosSocial
      : directoriosSocial.filter((d) => d.categoria === activeFilter);

  const totalCount =
    activeFilter === "todos"
      ? directorios.length
      : directorios.filter((d) => d.categoria === activeFilter).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title="Directorios de negocios en Espana | Visto en Maps"
        description={`Los ${directorios.length} mejores directorios para dar de alta tu negocio en Espana. Directorios premium, gratuitos y plataformas de resenas verificadas.`}
        canonical="https://vistoenmaps.com/directorios"
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
                name: "Directorios",
                item: "https://vistoenmaps.com/directorios",
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
            name: "Directorios de negocios en Espana",
            description: `${directorios.length} directorios verificados para dar de alta tu negocio`,
            numberOfItems: directorios.length,
            itemListElement: directorios.map((d, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: d.nombre,
              url: d.url,
            })),
          }),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#142d45]">
        {/* Ambient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] bg-indigo-500/8 rounded-full blur-[100px]" />
          <div className="absolute -bottom-32 -left-20 w-[400px] h-[400px] bg-cyan-400/8 rounded-full blur-[100px]" />
          <div className="absolute top-10 right-1/3 w-[200px] h-[200px] bg-purple-500/6 rounded-full blur-[80px]" />
        </div>

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative container py-14 md:py-20">
          <Breadcrumb items={[{ label: "Directorios" }]} variant="dark" />
          <div className="flex items-center gap-5 mt-3">
            <div className="w-14 h-14 bg-white/[0.08] backdrop-blur-sm border border-white/[0.06] rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
              <BookOpen className="w-7 h-7 text-sky-300" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold text-white tracking-tight leading-tight">
                Directorios de negocios
              </h1>
              <p className="text-sky-200/60 mt-1.5 text-base md:text-lg">
                {directorios.length} directorios verificados donde dar de alta
                tu negocio en Espana
              </p>
            </div>
          </div>
        </div>

        {/* Wave SVG separator */}
        <div className="absolute bottom-0 left-0 w-full leading-[0] overflow-hidden">
          <svg
            className="relative block w-full h-[40px] md:h-[56px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              fill="#fafaf7"
              opacity=".3"
            />
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              fill="#fafaf7"
              opacity=".5"
            />
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              fill="#fafaf7"
            />
          </svg>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="relative border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fafaf7] via-white/60 to-[#fafaf7]" />
        <div className="relative container py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl flex items-center justify-center ring-1 ring-primary/10">
                <BadgeCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">
                  Verificados
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-[220px] mx-auto">
                  Todos los directorios han sido revisados y verificados
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl flex items-center justify-center ring-1 ring-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">
                  SEO Local
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-[220px] mx-auto">
                  Mejora tu posicionamiento en Google con citaciones NAP
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl flex items-center justify-center ring-1 ring-primary/10">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">
                  Mas visibilidad
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-[220px] mx-auto">
                  Aparece en mas resultados de busqueda y gana clientes
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container pt-10 pb-2">
        <div className="flex items-center gap-2 mb-5">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
            Filtrar por
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter("todos")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeFilter === "todos"
                ? "bg-gradient-to-r from-[#0f2035] to-[#1a3a5c] text-white shadow-md shadow-primary/20"
                : "bg-white text-muted-foreground border border-border/60 hover:border-primary/30 hover:text-foreground hover:shadow-sm"
            }`}
          >
            Todos ({directorios.length})
          </button>
          {allCategories.map((cat) => {
            const count = directorios.filter(
              (d) => d.categoria === cat
            ).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilter === cat
                    ? "bg-gradient-to-r from-[#0f2035] to-[#1a3a5c] text-white shadow-md shadow-primary/20"
                    : "bg-white text-muted-foreground border border-border/60 hover:border-primary/30 hover:text-foreground hover:shadow-sm"
                }`}
              >
                {categoryIcons[cat]}
                {categoriaDirectorio[cat]} ({count})
              </button>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Mostrando {totalCount}{" "}
          {totalCount === 1 ? "directorio" : "directorios"}
        </p>
      </section>

      {/* Premium Section */}
      {filteredPremium.length > 0 && (
        <section className="container py-8">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold text-foreground">
              Directorios Premium
            </h2>
            <span className="text-xs bg-accent/10 text-accent font-bold px-2.5 py-1 rounded-full">
              Recomendados
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-6 -mt-4">
            Los directorios mas importantes para mejorar la visibilidad de tu
            negocio
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPremium
              .sort((a, b) => b.popularidad - a.popularidad)
              .map((dir) => (
                <DirectorioCard key={dir.slug} dir={dir} featured />
              ))}
          </div>
        </section>
      )}

      {/* Standard Directories */}
      {filteredEstandar.length > 0 && (
        <section className="container py-8">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Directorios Estandar
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6 -mt-4">
            Directorios gratuitos y plataformas complementarias para ampliar tu
            presencia online
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEstandar
              .sort((a, b) => b.popularidad - a.popularidad)
              .map((dir) => (
                <DirectorioCard key={dir.slug} dir={dir} />
              ))}
          </div>
        </section>
      )}

      {/* Social Media */}
      {filteredSocial.length > 0 && (
        <section className="container py-8 pb-12">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Redes Sociales
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6 -mt-4">
            Plataformas sociales imprescindibles para cualquier negocio local
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSocial
              .sort((a, b) => b.popularidad - a.popularidad)
              .map((dir) => (
                <DirectorioCard key={dir.slug} dir={dir} />
              ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fafaf7] via-white/40 to-[#fafaf7]" />
        <div className="relative container py-14 md:py-20">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-3">
              Tu negocio aparece en estos directorios?
            </h2>
            <p className="text-muted-foreground mb-6">
              Dar de alta tu negocio en directorios locales mejora tu
              posicionamiento en Google y genera mas clientes potenciales.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contacto">
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0f2035] to-[#1a3a5c] text-white font-semibold px-6 py-3 rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer">
                  Solicitar alta en directorios
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <Link href="/">
                <span className="inline-flex items-center gap-2 bg-white text-foreground border border-border/60 font-semibold px-6 py-3 rounded-full hover:border-primary/30 hover:shadow-sm transition-all duration-300 cursor-pointer">
                  Ver profesionales
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
