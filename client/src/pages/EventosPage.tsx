/*
  DESIGN: Eventos Listing Page
  - Dark gradient hero with Calendar icon + wave separator
  - City filter tabs + classification filter pills
  - Events grid with EventoCard components
  - Schema.org JSON-LD for EventList
  - Warm off-white page background (#fafaf7)
*/

import { useState } from "react";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import Breadcrumb from "@/components/Breadcrumb";
import EventoCard from "@/components/EventoCard";
import { useEventos } from "@/hooks/useEventos";
import { cn } from "@/lib/utils";
import AdSlot from "@/components/ads/AdSlot";

/* ------------------------------------------------------------------ */
/*  Filter options                                                     */
/* ------------------------------------------------------------------ */
const CIUDADES = [
  { label: "Todos", value: undefined },
  { label: "Madrid", value: "Madrid" },
  { label: "Barcelona", value: "Barcelona" },
  { label: "Valencia", value: "Valencia" },
  { label: "Sevilla", value: "Sevilla" },
  // El label es lo que ve la gente; el value viaja a Ticketmaster: NO tocarlo.
  { label: "Málaga", value: "Malaga" },
  { label: "Bilbao", value: "Bilbao" },
  { label: "Zaragoza", value: "Zaragoza" },
  { label: "Granada", value: "Granada" },
] as const;

const CLASIFICACIONES = [
  { label: "Todos", value: undefined },
  { label: "Música", value: "Music" },
  { label: "Deportes", value: "Sports" },
  { label: "Artes", value: "Arts" },
] as const;

export default function EventosPage() {
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const [selectedClassification, setSelectedClassification] = useState<string | undefined>(undefined);

  const { eventos, loading, error } = useEventos({
    ciudad: selectedCity,
    clasificacion: selectedClassification,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title="Eventos | Visto en Maps"
        description="Descubre los proximos eventos en tu ciudad. Conciertos, deportes, artes y mas en las principales ciudades de Espana."
        canonical="https://vistoenmaps.com/eventos"
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
            name: "Eventos en Espana",
            description:
              "Proximos eventos en las principales ciudades de Espana",
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

      {/*
        CABECERA COMPACTA.
        Antes: 4 luces de colores desenfocadas, rejilla de fondo, icono de 56px
        en una caja, titular de 44px y una ola SVG de 3 capas. Entre eso, los dos
        bloques de filtros y un anuncio, el primer evento quedaba FUERA de la
        pantalla. Ahora la cabecera ocupa un tercio.
      */}
      <section className="bg-gradient-to-br from-[#0a1628] to-[#142d45]">
        <div className="container py-6 md:py-8">
          <Breadcrumb items={[{ label: "Eventos" }]} variant="dark" />
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Eventos en España
            </h1>
            <p className="text-sm text-sky-200/50">
              Conciertos, deporte y cultura, con entradas a la venta.
            </p>
          </div>
        </div>
      </section>

      {/*
        FILTROS en una sola linea. Antes iban en dos bloques con etiquetas
        "CIUDAD" y "CATEGORIA" en mayusculas, que ocupaban el doble y no hacian
        falta: se entiende sin que nadie lo explique.
      */}
      <section className="container pt-5 pb-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {CIUDADES.map((c) => (
            <button
              key={c.label}
              onClick={() => setSelectedCity(c.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm transition-colors",
                selectedCity === c.value
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-white text-muted-foreground border border-border/60 hover:border-primary/40 hover:text-foreground"
              )}
            >
              {c.label}
            </button>
          ))}

          <span className="mx-1 h-5 w-px bg-border/70" aria-hidden="true" />

          {CLASIFICACIONES.map((c) => (
            <button
              key={c.label}
              onClick={() => setSelectedClassification(c.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm transition-colors",
                selectedClassification === c.value
                  ? "bg-accent text-white font-semibold"
                  : "bg-white text-muted-foreground border border-border/60 hover:border-accent/40 hover:text-foreground"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>


      {/* Ad slot */}
      <div className="container py-4">
      </div>

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
              Sin resultados para estos filtros
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {error
                ? "Estamos actualizando los eventos. Vuelve en unos minutos."
                : "Prueba con otra ciudad o categoría. Hay cientos de eventos esperándote."}
            </p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {eventos.map((evento) => (
                <EventoCard key={evento.id} evento={evento} />
              ))}
            </div>

            {/*
              AVISO DE AFILIACION. Es obligatorio decirlo: si compras desde aqui
              nos llevamos una comision. La ley de competencia desleal lo exige
              y las redes de afiliados tambien. Ademas juega a favor: decirlo
              claro da mas confianza que esconderlo.
            */}
            <p className="mt-8 text-xs text-muted-foreground leading-relaxed max-w-3xl">
              Las entradas se compran en Ticketmaster. Si compras desde aquí,
              nosotros nos llevamos una pequeña comisión y a ti no te cuesta ni
              un céntimo más. No elegimos los eventos por eso: salen ordenados
              por fecha, primero los más cercanos.
            </p>
          </>
        )}
      </section>

      {/* El anuncio para negocios va DESPUES de los eventos: quien entra a ver
          conciertos no quiere que le vendan nada antes de ver el contenido. */}
      <div className="container pb-8">
        <AdSlot slot="eventos-after-filters" />
      </div>

      <Footer />
    </div>
  );
}
