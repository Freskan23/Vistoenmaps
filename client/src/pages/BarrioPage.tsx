/*
  DESIGN: Cartografia Urbana — Barrio Page
  - Lists businesses in a specific neighborhood
  - Business cards with ratings, phone, maps CTA
  - Advanced filters, sorting, pagination
  - Interactive map with markers
  - Schema.org JSON-LD for each business
*/

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useParams } from "wouter";
import { MapPin, ArrowUpDown, Star, Clock, Zap, Filter, X, ChevronDown, Map as MapIcon } from "lucide-react";
import {
  getCategoria,
} from "@/data";
import { useAllNegocios, useAllBarrios, useAllCiudades, filterByBarrio } from "@/hooks/useSupabaseNegocios";
import Breadcrumb from "@/components/Breadcrumb";
import NegocioCard from "@/components/NegocioCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "./NotFound";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { MapView } from "@/components/Map";

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
  const [is24h, setIs24h] = useState(false);
  const [isUrgente, setIsUrgente] = useState(false);
  const [minReviews, setMinReviews] = useState<number>(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const perPage = 10;

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  const cat = getCategoria(categoria);
  const { allNegocios } = useAllNegocios();
  const { allBarrios } = useAllBarrios();
  const { allCiudades } = useAllCiudades();

  const ciu = allCiudades.find((c) => c.slug === ciudad);
  const bar = allBarrios.find((b) => b.slug === barrio && b.ciudad_slug === ciudad);

  if (!cat || !ciu || !bar) return <NotFound />;

  const negociosData = filterByBarrio(allNegocios, cat.slug, ciu.slug, bar.slug);

  // Extract unique services for filter badges
  const allServices = useMemo(() => {
    const set = new Set<string>();
    negociosData.forEach((n) =>
      n.servicios_destacados.forEach((s) => set.add(s))
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [negociosData]);

  const hasActiveFilters = is24h || isUrgente || minReviews > 0 || minRating > 0 || selectedServices.length > 0;

  const filtered = useMemo(() => {
    let list = [...negociosData];

    if (minRating > 0) {
      list = list.filter((n) => n.valoracion_media >= minRating);
    }
    if (is24h) {
      list = list.filter((n) => n.horario.toLowerCase().includes("24 horas"));
    }
    if (isUrgente) {
      list = list.filter((n) =>
        n.servicios_destacados.some(
          (s) => s.toLowerCase().includes("urgente") || s.toLowerCase().includes("urgencia")
        )
      );
    }
    if (minReviews > 0) {
      list = list.filter((n) => n.num_resenas >= minReviews);
    }
    if (selectedServices.length > 0) {
      list = list.filter((n) =>
        selectedServices.some((sel) => n.servicios_destacados.includes(sel))
      );
    }

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
  }, [negociosData, sortBy, minRating, is24h, isUrgente, minReviews, selectedServices]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const clearFilters = () => {
    setMinRating(0);
    setIs24h(false);
    setIsUrgente(false);
    setMinReviews(0);
    setSelectedServices([]);
    setCurrentPage(1);
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
    setCurrentPage(1);
  };

  // Map: scroll to card when marker clicked
  const scrollToCard = useCallback((slug: string) => {
    const el = cardRefs.current[slug];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-accent");
      setTimeout(() => el.classList.remove("ring-2", "ring-accent"), 2000);
    }
  }, []);

  // Map: update markers when filtered results change
  const updateMarkers = useCallback(
    (map: google.maps.Map) => {
      // Clear old markers
      markersRef.current.forEach((m) => (m.map = null));
      markersRef.current = [];

      filtered.forEach((neg) => {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: neg.coordenadas.lat, lng: neg.coordenadas.lng },
          title: neg.nombre,
        });
        marker.addListener("click", () => scrollToCard(neg.slug));
        markersRef.current.push(marker);
      });

      // Fit bounds if multiple markers
      if (filtered.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        filtered.forEach((n) =>
          bounds.extend({ lat: n.coordenadas.lat, lng: n.coordenadas.lng })
        );
        map.fitBounds(bounds, { top: 30, right: 30, bottom: 30, left: 30 });
      }
    },
    [filtered, scrollToCard]
  );

  // Re-sync markers when filter changes and map already loaded
  useEffect(() => {
    if (mapRef.current) {
      updateMarkers(mapRef.current);
    }
  }, [updateMarkers]);

  const handleMapReady = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      updateMarkers(map);
    },
    [updateMarkers]
  );

  const hasApiKey = !!import.meta.env.VITE_FRONTEND_FORGE_API_KEY;

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
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title={`${cat.nombre} en ${bar.nombre}, ${ciu.nombre} | Visto en Maps`}
        description={`${negociosData.length} ${cat.nombre.toLowerCase()} en ${bar.nombre}, ${ciu.nombre}. Telefonos, horarios, valoraciones y direccion. Verificados en Google Maps.`}
        canonical={`https://vistoenmaps.com/${cat.slug}/${ciu.slug}/${bar.slug}`}
      />
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Barrio Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#142d45]">
        {/* Ambient light orbs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-56 h-56 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container py-10 md:py-14">
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

        {/* Wave separator */}
        <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0 60V20C240 45 480 0 720 20C960 40 1200 10 1440 30V60H0Z" fill="#fafaf7" />
        </svg>
      </section>

      {/* Interactive Map */}
      {negociosData.length > 0 && (
        <section className="container pt-6">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <MapIcon className="w-4 h-4" />
              {showMap ? "Ocultar mapa" : "Mostrar mapa"}
            </button>
          </div>
          {showMap && (
            <div className="rounded-xl overflow-hidden border border-border/60 shadow-sm">
              {hasApiKey ? (
                <MapView
                  initialCenter={bar.coordenadas}
                  initialZoom={14}
                  onMapReady={handleMapReady}
                  className="h-[300px] md:h-[400px]"
                />
              ) : (
                <div className="h-[300px] md:h-[400px] bg-secondary flex flex-col items-center justify-center gap-3">
                  <MapPin className="w-10 h-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Mapa no disponible</p>
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(cat.nombre + " " + bar.nombre + " " + ciu.nombre)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Ver en Google Maps
                  </a>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Business Listings */}
      <section className="container py-6 md:py-10">
        {negociosData.length > 0 ? (
          <>
            {/* Filters */}
            <div className="mb-6 space-y-4">
              {/* Sort + basic controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as SortOption);
                      setCurrentPage(1);
                    }}
                    className="text-sm bg-white border border-border/60 rounded-xl px-3 py-2 text-foreground shadow-sm hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                  >
                    <option value="rating">Mejor valoracion</option>
                    <option value="reviews">Mas resenas</option>
                    <option value="name">Nombre A-Z</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={minRating}
                    onChange={(e) => {
                      setMinRating(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="text-sm bg-white border border-border/60 rounded-xl px-3 py-2 text-foreground shadow-sm hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                  >
                    <option value={0}>Todas las valoraciones</option>
                    <option value={4}>4+ estrellas</option>
                    <option value={4.5}>4.5+ estrellas</option>
                  </select>
                </div>

                {/* Advanced filters toggle (mobile-friendly) */}
                <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <CollapsibleTrigger className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    <Filter className="w-4 h-4" />
                    Mas filtros
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                </Collapsible>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 font-medium transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Limpiar filtros
                  </button>
                )}

                <span className="text-xs text-muted-foreground ml-auto">
                  {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Advanced filters panel */}
              <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                <CollapsibleContent>
                  <div className="bg-white/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 space-y-4 shadow-sm">
                    {/* Toggle filters row */}
                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <Switch
                          checked={is24h}
                          onCheckedChange={(checked) => {
                            setIs24h(checked);
                            setCurrentPage(1);
                          }}
                        />
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Disponible 24h</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <Switch
                          checked={isUrgente}
                          onCheckedChange={(checked) => {
                            setIsUrgente(checked);
                            setCurrentPage(1);
                          }}
                        />
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Servicio urgente</span>
                        </div>
                      </label>

                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-muted-foreground" />
                        <select
                          value={minReviews}
                          onChange={(e) => {
                            setMinReviews(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="text-sm bg-white border border-border/60 rounded-xl px-3 py-2 text-foreground shadow-sm hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                        >
                          <option value={0}>Todas las resenas</option>
                          <option value={50}>50+ resenas</option>
                          <option value={100}>100+ resenas</option>
                          <option value={200}>200+ resenas</option>
                        </select>
                      </div>
                    </div>

                    {/* Service badges */}
                    {allServices.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Filtrar por servicio:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {allServices.map((service) => (
                            <button
                              key={service}
                              onClick={() => toggleService(service)}
                            >
                              <Badge
                                variant={selectedServices.includes(service) ? "default" : "outline"}
                                className="cursor-pointer text-xs"
                              >
                                {service}
                              </Badge>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {paginated.map((negocio, index) => (
                <motion.div
                  key={negocio.slug}
                  ref={(el) => { cardRefs.current[negocio.slug] = el; }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className="transition-all duration-300 rounded-xl"
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
                  className="px-4 py-1.5 text-sm font-medium rounded-full border border-border/60 bg-card hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-sm font-medium rounded-full transition-colors ${
                      page === currentPage
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/60 bg-card hover:bg-secondary"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-1.5 text-sm font-medium rounded-full border border-border/60 bg-card hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
              Aun no hay {cat.nombre.toLowerCase()} registrados en {bar.nombre}, {ciu.nombre}.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
