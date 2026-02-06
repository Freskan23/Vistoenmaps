/*
  DESIGN: Directorio de Directorios — Zona Premium + Estándar
  - Hero with gradient
  - Premium zone with highlighted cards
  - Standard directories grid
  - Filter by category tabs
  - Social media section
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
      <a
        href={dir.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
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
                Reseñas
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
              Visitar <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </a>
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
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Directorios de negocios en España | Visto en Maps"
        description={`Los ${directorios.length} mejores directorios para dar de alta tu negocio en España. Directorios premium, gratuitos y plataformas de reseñas verificadas.`}
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
            name: "Directorios de negocios en España",
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
      <section className="relative overflow-hidden bg-primary">
        {/* Ambient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-primary-foreground/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative container py-12 md:py-16">
          <Breadcrumb items={[{ label: "Directorios" }]} variant="dark" />
          <div className="flex items-center gap-5 mt-2">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                Directorios de negocios
              </h1>
              <p className="text-white/70 mt-1">
                {directorios.length} directorios verificados donde dar de alta
                tu negocio en España
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="border-b border-border/40 bg-secondary/30">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <BadgeCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">
                  Verificados
                </p>
                <p className="text-xs text-muted-foreground">
                  Todos los directorios han sido revisados y verificados
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">
                  SEO Local
                </p>
                <p className="text-xs text-muted-foreground">
                  Mejora tu posicionamiento en Google con citaciones NAP
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">
                  Más visibilidad
                </p>
                <p className="text-xs text-muted-foreground">
                  Aparece en más resultados de búsqueda y gana clientes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container pt-8 pb-2">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Filtrar por:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter("todos")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === "todos"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
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
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
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
            Los directorios más importantes para mejorar la visibilidad de tu
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
              Directorios Estándar
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
      <section className="bg-gradient-to-b from-background via-secondary/30 to-background">
        <div className="container py-14 md:py-20">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-3">
              ¿Tu negocio aparece en estos directorios?
            </h2>
            <p className="text-muted-foreground mb-6">
              Dar de alta tu negocio en directorios locales mejora tu
              posicionamiento en Google y genera más clientes potenciales.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contacto">
                <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity cursor-pointer">
                  Solicitar alta en directorios
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <Link href="/">
                <span className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-semibold px-6 py-3 rounded-full hover:bg-secondary/80 transition-colors cursor-pointer">
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
