/*
  DESIGN: Cartografía Urbana — Barrio Page
  - Lists businesses in a specific neighborhood
  - Business cards with ratings, phone, maps CTA
  - Filters, sorting, pagination
  - Schema.org JSON-LD for each business
*/

import { useState, useMemo } from "react";
import { useParams } from "wouter";
import { MapPin, ArrowUpDown, Star } from "lucide-react";
import {
  getCategoria,
  getCiudad,
  getBarrio,
  getNegociosByBarrio,
} from "@/data";
import Breadcrumb from "@/components/Breadcrumb";
import NegocioCard from "@/components/NegocioCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "./NotFound";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

type SortOption = "rating" | "reviews" | "name";

export default function BarrioPage() {
  const { categoria, ciudad, barrio } = useParams<{
    categoria: string;
    ciudad: string;
    barrio: string;
  }>();

  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [minRating, setMinRating] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const cat = getCategoria(categoria);
  const ciu = getCiudad(ciudad);
  const bar = getBarrio(barrio, ciudad);

  if (!cat || !ciu || !bar) return <NotFound />;

  const negociosData = getNegociosByBarrio(cat.slug, ciu.slug, bar.slug);

  const filtered = useMemo(() => {
    let list = negociosData.filter((n) => n.valoracion_media >= minRating);

    list.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.valoracion_media - a.valoracion_media;
        case "reviews":
          return b.num_resenas - a.num_resenas;
        case "name":
          return a.nombre.localeCompare(b.nombre, "es");
        default:
          return 0;
      }
    });

    return list;
  }, [negociosData, sortBy, minRating]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Schema.org JSON-LD
  const schemaData = negociosData.map((n) => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: n.nombre,
    address: {
      "@type": "PostalAddress",
      streetAddress: n.direccion,
      addressLocality: ciu.nombre,
      addressRegion: ciu.comunidad_autonoma,
      addressCountry: "ES",
    },
    telephone: n.telefono,
    geo: {
      "@type": "GeoCoordinates",
      latitude: n.coordenadas.lat,
      longitude: n.coordenadas.lng,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: n.valoracion_media,
      reviewCount: n.num_resenas,
    },
    openingHours: n.horario,
    url: n.url_google_maps,
  }));

  // Breadcrumb schema
  const breadcrumbSchema = {
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
      {
        "@type": "ListItem",
        position: 3,
        name: ciu.nombre,
        item: `https://vistoenmaps.com/${cat.slug}/${ciu.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: bar.nombre,
        item: `https://vistoenmaps.com/${cat.slug}/${ciu.slug}/${bar.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={`${cat.nombre} en ${bar.nombre}, ${ciu.nombre} | Visto en Maps`}
        description={`${negociosData.length} ${cat.nombre.toLowerCase()} en ${bar.nombre}, ${ciu.nombre}. Teléfonos, horarios, valoraciones y dirección. Verificados en Google Maps.`}
        canonical={`https://vistoenmaps.com/${cat.slug}/${ciu.slug}/${bar.slug}`}
      />
      <Header />

      {/* Inject Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Barrio Hero */}
      <section className="bg-primary">
        <div className="container py-10 md:py-14">
          <Breadcrumb
            items={[
              { label: cat.nombre, href: `/${cat.slug}` },
              { label: ciu.nombre, href: `/${cat.slug}/${ciu.slug}` },
              { label: bar.nombre },
            ]}
            variant="dark"
          />
          <div className="mt-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              {cat.nombre} en {bar.nombre}, {ciu.nombre}
            </h1>
            <p className="text-white/70 mt-2">
              {negociosData.length}{" "}
              {negociosData.length === 1 ? "profesional encontrado" : "profesionales encontrados"}{" "}
              en {bar.nombre}
            </p>
          </div>
        </div>
      </section>

      {/* Business Listings */}
      <section className="container py-10 md:py-14">
        {negociosData.length > 0 ? (
          <>
            {/* Filters bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortOption);
                    setCurrentPage(1);
                  }}
                  className="text-sm bg-secondary border border-border rounded-md px-2 py-1.5 text-foreground"
                >
                  <option value="rating">Mejor valoración</option>
                  <option value="reviews">Más reseñas</option>
                  <option value="name">Nombre A-Z</option>
                </select>
              </div>

              {/* Min rating filter */}
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-muted-foreground" />
                <select
                  value={minRating}
                  onChange={(e) => {
                    setMinRating(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="text-sm bg-secondary border border-border rounded-md px-2 py-1.5 text-foreground"
                >
                  <option value={0}>Todas las valoraciones</option>
                  <option value={4}>4+ estrellas</option>
                  <option value={4.5}>4.5+ estrellas</option>
                </select>
              </div>

              <span className="text-xs text-muted-foreground ml-auto">
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {paginated.map((negocio, index) => (
                <motion.div
                  key={negocio.slug}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                >
                  <NegocioCard negocio={negocio} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-sm font-medium rounded-md transition-colors ${
                      page === currentPage
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card hover:bg-secondary"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Aún no hay {cat.nombre.toLowerCase()} registrados en {bar.nombre}, {ciu.nombre}.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
