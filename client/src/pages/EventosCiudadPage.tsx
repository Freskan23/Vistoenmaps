/*
  DESIGN: City-specific Events Listing Page
  - Route: /eventos/:ciudad
  - Dark gradient hero with city name + wave separator
  - Breadcrumb: Inicio > Eventos > {Ciudad}
  - Classification filter pills (no city filter)
  - Events grid with EventoCard components
  - Schema.org JSON-LD for EventList
*/

import { useState } from "react";
import { useParams } from "wouter";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import Breadcrumb from "@/components/Breadcrumb";
import EventoCard from "@/components/EventoCard";
import { useEventos } from "@/hooks/useEventos";
import { cn } from "@/lib/utils";
import NotFound from "./NotFound";

/* ------------------------------------------------------------------ */
/*  City slug -> proper name mapping                                   */
/* ------------------------------------------------------------------ */
const CIUDAD_NOMBRES: Record<string, string> = {
  madrid: "Madrid",
  barcelona: "Barcelona",
  valencia: "Valencia",
  sevilla: "Sevilla",
  malaga: "Malaga",
};

const CLASIFICACIONES = [
  { label: "Todos", value: undefined },
  { label: "Musica", value: "Music" },
  { label: "Deportes", value: "Sports" },
  { label: "Artes", value: "Arts" },
] as const;

export default function EventosCiudadPage() {
  const { ciudad } = useParams<{ ciudad: string }>();
  const [selectedClassification, setSelectedClassification] = useState<
    string | undefined
  >(undefined);

  const ciudadNombre = CIUDAD_NOMBRES[ciudad || ""];

  const { eventos, loading, error } = useEventos({
    ciudad: ciudadNombre,
    clasificacion: selectedClassification,
  });

  if (!ciudadNombre) return <NotFound />;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title={`Eventos en ${ciudadNombre} | Visto en Maps`}
        description={`Descubre los proximos eventos en ${ciudadNombre}. Conciertos, deportes, artes y mas.`}
        canonical={`https://vistoenmaps.com/eventos/${ciudad}`}
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
                name: "Eventos",
                item: "https://vistoenmaps.com/eventos",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: ciudadNombre,
                item: `https://vistoenmaps.com/eventos/${ciudad}`,
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
            name: `Eventos en ${ciudadNombre}`,
            description: `Proximos eventos en ${ciudadNombre}, Espana`,
            numberOfItems: eventos.length,
            itemListElement: eventos.map((e, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Event",
                name: e.nombre,
                startDate: e.fecha,
                url: e.url_compra,
                location: {
                  "@type": "Place",
                  name: e.lugar,
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: e.ciudad,
                    addressCountry: "ES",
                  },
                },
                ...(e.imagen ? { image: e.imagen } : {}),
                ...(e.precio_min != null
                  ? {
                      offers: {
                        "@type": "Offer",
                        price: e.precio_min,
                        priceCurrency: "EUR",
                        availability: "https://schema.org/InStock",
                        url: e.url_compra,
                      },
                    }
                  : {}),
              },
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

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative container py-14 md:py-20">
          <Breadcrumb
            items={[
              { label: "Eventos", href: "/eventos" },
              { label: ciudadNombre },
            ]}
            variant="dark"
          />
          <div className="flex items-center gap-5 mt-3">
            <div className="w-14 h-14 bg-white/[0.08] backdrop-blur-sm border border-white/[0.06] rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
              <Calendar className="w-7 h-7 text-sky-300" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold text-white tracking-tight leading-tight">
                Eventos en {ciudadNombre}
              </h1>
              <p className="text-sky-200/60 mt-1.5 text-base md:text-lg">
                Descubre los proximos eventos en {ciudadNombre}
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

      {/* Classification filter */}
      <section className="container pt-10 pb-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Categoria
          </p>
          <div className="flex flex-wrap gap-2">
            {CLASIFICACIONES.map((c) => (
              <button
                key={c.label}
                onClick={() => setSelectedClassification(c.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  selectedClassification === c.value
                    ? "bg-gradient-to-r from-[#0f2035] to-[#1a3a5c] text-white shadow-md shadow-primary/20"
                    : "bg-white text-muted-foreground border border-border/60 hover:border-primary/30 hover:text-foreground hover:shadow-sm"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events grid */}
      <section className="container py-8 pb-14">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-gray-100 animate-pulse h-[300px]"
              />
            ))}
          </div>
        ) : error || eventos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              No hay eventos proximos en {ciudadNombre}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {error
                ? "Ha ocurrido un error al cargar los eventos. Intenta de nuevo mas tarde."
                : "No se han encontrado eventos con los filtros seleccionados. Prueba con otra categoria."}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {eventos.map((evento) => (
              <EventoCard key={evento.id} evento={evento} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
