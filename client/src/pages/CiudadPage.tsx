/*
  DESIGN: Cartografía Urbana — Ciudad Hub
  - Lists barrios/districts with business counts
  - City hero with image
  - Barrio cards in grid
*/

import { Link, useParams } from "wouter";
import { MapPin, ArrowRight, Users } from "lucide-react";
import {
  getCategoria,
  getCiudad,
  getBarriosByCiudad,
  countNegociosByBarrio,
  getNegociosByCiudad,
} from "@/data";
import CategoryIcon from "@/components/CategoryIcon";
import Breadcrumb from "@/components/Breadcrumb";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "./NotFound";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

export default function CiudadPage() {
  const { categoria, ciudad } = useParams<{ categoria: string; ciudad: string }>();
  const cat = getCategoria(categoria);
  const ciu = getCiudad(ciudad);

  if (!cat || !ciu) return <NotFound />;

  const barriosData = getBarriosByCiudad(ciu.slug);
  const totalNegocios = getNegociosByCiudad(cat.slug, ciu.slug).length;

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={`${cat.nombre} en ${ciu.nombre} | Visto en Maps`}
        description={`Encuentra ${cat.nombre.toLowerCase()} en ${ciu.nombre}. ${totalNegocios} profesionales en ${barriosData.length} barrios. Directorio verificado en Google Maps.`}
        canonical={`https://vistoenmaps.com/${cat.slug}/${ciu.slug}`}
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
              {
                "@type": "ListItem",
                position: 3,
                name: ciu.nombre,
                item: `https://vistoenmaps.com/${cat.slug}/${ciu.slug}`,
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
            name: `${cat.nombre} en ${ciu.nombre}`,
            description: `${totalNegocios} profesionales en ${barriosData.length} barrios de ${ciu.nombre}`,
            itemListElement: barriosData.map((barrio, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: `${cat.nombre} en ${barrio.nombre}`,
              url: `https://vistoenmaps.com/${cat.slug}/${ciu.slug}/${barrio.slug}`,
            })),
          }),
        }}
      />

      {/* City Hero */}
      <section className="relative overflow-hidden bg-primary">
        {ciu.imagen && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: `url(${ciu.imagen})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/70" />
          </>
        )}
        <div className="relative container py-12 md:py-16">
          <Breadcrumb
            items={[
              { label: cat.nombre, href: `/${cat.slug}` },
              { label: ciu.nombre },
            ]}
            variant="dark"
          />
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-2">
              <CategoryIcon iconName={cat.icono} className="w-5 h-5 text-white/70" />
              <span className="text-sm font-medium text-white/70">{cat.nombre}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
              {cat.nombre} en {ciu.nombre}
            </h1>
            <p className="text-white/70 mt-2">
              {totalNegocios} {totalNegocios === 1 ? "profesional" : "profesionales"} en{" "}
              {barriosData.length} {barriosData.length === 1 ? "barrio" : "barrios"} de {ciu.nombre}
            </p>
          </div>
        </div>
      </section>

      {/* Barrios Grid */}
      <section className="container py-10 md:py-14">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Barrios de {ciu.nombre}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {barriosData.map((barrio, index) => {
            const count = countNegociosByBarrio(cat.slug, ciu.slug, barrio.slug);
            return (
              <motion.div
                key={barrio.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
              >
                <Link href={`/${cat.slug}/${ciu.slug}/${barrio.slug}`}>
                  <div className="group bg-card border-2 border-border hover:border-primary/40 rounded-lg p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                            {barrio.nombre}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Users className="w-3 h-3" />
                            <span>
                              {count} {count === 1 ? "profesional" : "profesionales"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {barriosData.length === 0 && (
          <div className="text-center py-16">
            <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Aún no hay barrios registrados para {cat.nombre} en {ciu.nombre}.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
