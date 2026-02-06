import { useParams } from "wouter";
import { Star, Phone, Clock, MapPin, ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import {
  getCategoria,
  getCiudad,
  getBarrio,
  getNegocio,
} from "@/data";
import CategoryIcon from "@/components/CategoryIcon";
import Breadcrumb from "@/components/Breadcrumb";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "./NotFound";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

export default function NegocioPage() {
  const { categoria, ciudad, barrio, negocio: negocioSlug } = useParams<{
    categoria: string;
    ciudad: string;
    barrio: string;
    negocio: string;
  }>();

  const cat = getCategoria(categoria);
  const ciu = getCiudad(ciudad);
  const bar = getBarrio(barrio, ciudad);
  const neg = getNegocio(categoria, ciudad, barrio, negocioSlug);

  if (!cat || !ciu || !bar || !neg) return <NotFound />;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: neg.nombre,
    address: {
      "@type": "PostalAddress",
      streetAddress: neg.direccion,
      addressLocality: ciu.nombre,
      addressRegion: ciu.comunidad_autonoma,
      addressCountry: "ES",
    },
    telephone: neg.telefono,
    geo: {
      "@type": "GeoCoordinates",
      latitude: neg.coordenadas.lat,
      longitude: neg.coordenadas.lng,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: neg.valoracion_media,
      reviewCount: neg.num_resenas,
      bestRating: 5,
    },
    openingHours: neg.horario,
    url: neg.url_google_maps,
  };

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
      {
        "@type": "ListItem",
        position: 5,
        name: neg.nombre,
        item: `https://vistoenmaps.com/${cat.slug}/${ciu.slug}/${bar.slug}/${neg.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={`${neg.nombre} — ${cat.nombre} en ${bar.nombre}, ${ciu.nombre} | Visto en Maps`}
        description={`${neg.nombre}: ${cat.nombre.toLowerCase()} en ${bar.nombre}, ${ciu.nombre}. ${neg.valoracion_media} estrellas, ${neg.num_resenas} reseñas. ${neg.direccion}. Tel: ${neg.telefono}.`}
        canonical={`https://vistoenmaps.com/${cat.slug}/${ciu.slug}/${bar.slug}/${neg.slug}`}
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

      {/* Hero */}
      <section className="bg-primary">
        <div className="container py-10 md:py-14">
          <Breadcrumb
            items={[
              { label: cat.nombre, href: `/${cat.slug}` },
              { label: ciu.nombre, href: `/${cat.slug}/${ciu.slug}` },
              { label: bar.nombre, href: `/${cat.slug}/${ciu.slug}/${bar.slug}` },
              { label: neg.nombre },
            ]}
            variant="dark"
          />
          <div className="mt-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <CategoryIcon iconName={cat.icono} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                {neg.nombre}
              </h1>
              <p className="text-white/70 mt-0.5 text-sm">
                {cat.nombre} en {bar.nombre}, {ciu.nombre}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container py-10 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl"
        >
          {/* Rating */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold">{neg.valoracion_media}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {neg.num_resenas} reseñas en Google
            </span>
          </div>

          {/* Info card */}
          <div className="bg-card border-2 border-border rounded-lg p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                  <p className="text-foreground">{neg.direccion}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                  <a
                    href={`tel:${neg.telefono.replace(/\s/g, "")}`}
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {neg.telefono}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Horario</p>
                  <p className="text-foreground">{neg.horario}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Servicios */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground mb-3">Servicios destacados</h2>
            <div className="flex flex-wrap gap-2">
              {neg.servicios_destacados.map((servicio) => (
                <span
                  key={servicio}
                  className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-md font-medium"
                >
                  {servicio}
                </span>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-3">
            <a
              href={`tel:${neg.telefono.replace(/\s/g, "")}`}
              className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Phone className="w-5 h-5" />
              Llamar ahora
            </a>
            <a
              href={neg.url_google_maps}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="w-5 h-5" />
              Ver en Google Maps
            </a>
          </div>

          {/* Back link */}
          <Link
            href={`/${cat.slug}/${ciu.slug}/${bar.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-8 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Ver todos los {cat.nombre.toLowerCase()} en {bar.nombre}
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
