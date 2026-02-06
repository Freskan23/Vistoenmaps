/*
  DESIGN: Cartografía Urbana — Categoría Hub
  - Lists cities where this category has businesses
  - Category hero with image
  - City cards with business count
*/

import { Link, useParams } from "wouter";
import { MapPin, ArrowRight, Building2 } from "lucide-react";
import { getCategoria, ciudades, getNegociosByCiudad } from "@/data";
import CategoryIcon from "@/components/CategoryIcon";
import Breadcrumb from "@/components/Breadcrumb";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "./NotFound";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

export default function CategoriaPage() {
  const { categoria } = useParams<{ categoria: string }>();
  const cat = getCategoria(categoria);

  if (!cat) return <NotFound />;

  return (
    <div className="min-h-screen flex flex-col">
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
            itemListElement: ciudades.map((ciudad, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: `${cat.nombre} en ${ciudad.nombre}`,
              url: `https://vistoenmaps.com/${cat.slug}/${ciudad.slug}`,
            })),
          }),
        }}
      />

      {/* Category Hero */}
      <section className="relative overflow-hidden bg-primary">
        {cat.imagen && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: `url(${cat.imagen})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/70" />
          </>
        )}
        <div className="relative container py-12 md:py-16">
          <Breadcrumb
            items={[{ label: cat.nombre }]}
            variant="dark"
          />
          <div className="flex items-center gap-4 mt-2">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
              <CategoryIcon iconName={cat.icono} className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                {cat.nombre} en España
              </h1>
              <p className="text-white/70 mt-1">{cat.descripcion}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="container py-10 md:py-14">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Selecciona una ciudad
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ciudades.map((ciudad, index) => {
            const negociosCount = getNegociosByCiudad(cat.slug, ciudad.slug).length;
            return (
              <motion.div
                key={ciudad.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
              >
                <Link href={`/${cat.slug}/${ciudad.slug}`}>
                  <div className="group bg-card border-2 border-border hover:border-primary/40 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer">
                    {/* City image */}
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
                    <div className="p-4">
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
