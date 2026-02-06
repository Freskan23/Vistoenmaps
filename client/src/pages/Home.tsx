/*
  DESIGN: Cartografía Urbana — Home Page
  - Hero section with city background image + overlay
  - Category grid with icons and descriptions
  - Professional, mobile-first, clean
*/

import { Link } from "wouter";
import { MapPin, ArrowRight } from "lucide-react";
import { categorias } from "@/data";
import CategoryIcon from "@/components/CategoryIcon";
import SearchBar from "@/components/SearchBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

const HERO_IMAGE =
  "https://private-us-east-1.manuscdn.com/sessionFile/dX6SBMBocKkjtDRru3fhPH/sandbox/xHrEqZrZeTAgHeY9OGAYfw-img-1_1770366973000_na1fn_aGVyby1zcGFpbi1jaXR5.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZFg2U0JNQm9jS2tqdERScnUzZmhQSC9zYW5kYm94L3hIckVxWnJaZVRBZ0hlWTlPR0FZZnctaW1nLTFfMTc3MDM2Njk3MzAwMF9uYTFmbl9hR1Z5YnkxemNHRnBiaTFqYVhSNS5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NPxPgYudr1d8QRUf7BlzHz26G7VvDPCoLbR66t4XidX1GhTlprtcs1ZSgvpp3e2tlFl~0S6k4zhXUTyIrz-Q5eylCY2Hi2rDSn9ioK6iFQSOQmWpFI9Byfg8fLUgwozTUe1okSjq8ng1VTDD1UeVF4j28n3w437b23WXHd6Y8hjEh0edsWcd0XQXQMBWRfufo6WgXfIR0svEle3Icxkk8P6vF8uOwzpoDuRMKD9d34iWb2kcMSa~052nWbdSgznJdgVWxIpKbyWg1WVG~ZfAdWcYe7CJga0kJSdUv-bb81cxJphv0pRM5SDRMeAKUu2b-XKO~Grl1JgK9e9hwlLz4w__";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Visto en Maps — Directorio de profesionales y negocios locales"
        description="Encuentra profesionales y negocios locales verificados en Google Maps. Cerrajeros, fontaneros, electricistas y más servicios cerca de ti en toda España."
        canonical="https://vistoenmaps.com"
      />
      <Header />

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Visto en Maps",
            url: "https://vistoenmaps.com",
            description:
              "Directorio de profesionales y negocios locales verificados en Google Maps en toda España.",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://vistoenmaps.com/?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Categorías de servicios",
            itemListElement: categorias.map((cat, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: cat.nombre,
              url: `https://vistoenmaps.com/${cat.slug}`,
            })),
          }),
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary/90" />
        <div className="relative container py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold text-primary-foreground/80 uppercase tracking-wider">
                Directorio local verificado
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
              Encuentra profesionales{" "}
              <span className="text-accent">cerca de ti</span>
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-lg">
              El directorio de profesionales y negocios locales con presencia verificada en Google Maps. 
              Cerrajeros, fontaneros, electricistas y más.
            </p>
            <div className="max-w-md">
              <SearchBar variant="hero" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container py-14 md:py-20">
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
            Categorías de servicios
          </h2>
          <p className="text-muted-foreground">
            Explora profesionales por tipo de servicio en toda España
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.map((cat, index) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
            >
              <Link href={`/${cat.slug}`}>
                <div className="group relative bg-card border-2 border-border hover:border-primary/40 rounded-lg p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  {/* Category image background (if available) */}
                  {cat.imagen && (
                    <div className="absolute inset-0 rounded-lg overflow-hidden opacity-0 group-hover:opacity-5 transition-opacity">
                      <img src={cat.imagen} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <CategoryIcon iconName={cat.icono} className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-1.5 group-hover:text-primary transition-colors">
                      {cat.nombre}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                      {cat.descripcion}
                    </p>
                    <div className="flex items-center gap-1 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver profesionales
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-secondary/50 border-y border-border">
        <div className="container py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-extrabold text-primary mb-1">100%</div>
              <p className="text-sm text-muted-foreground">Negocios verificados en Google Maps</p>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-primary mb-1">24/7</div>
              <p className="text-sm text-muted-foreground">Servicios de urgencia disponibles</p>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-primary mb-1">España</div>
              <p className="text-sm text-muted-foreground">Cobertura en ciudades y barrios</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
