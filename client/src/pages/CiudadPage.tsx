/*
  DESIGN: Cartografia Urbana -- Ciudad Hub (Vibrant Edition)
  - Lists barrios/districts with business counts
  - Dramatic gradient hero with ambient orbs + dot grid + wave separator
  - Vibrant barrio cards with rotating color accents
*/

import { Link, useParams } from "wouter";
import { MapPin, ArrowRight, Users } from "lucide-react";
import {
  getCategoria,
} from "@/data";
import { useAllNegocios, useAllBarrios, useAllCiudades, filterByCiudad, countByBarrio } from "@/hooks/useSupabaseNegocios";
import CategoryIcon from "@/components/CategoryIcon";
import Breadcrumb from "@/components/Breadcrumb";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "./NotFound";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

const CARD_ACCENTS = [
  { border: "hover:border-blue-400", bg: "group-hover:bg-blue-500/10", text: "text-blue-500", icon: "group-hover:text-blue-500", ring: "hover:ring-blue-400/20" },
  { border: "hover:border-emerald-400", bg: "group-hover:bg-emerald-500/10", text: "text-emerald-500", icon: "group-hover:text-emerald-500", ring: "hover:ring-emerald-400/20" },
  { border: "hover:border-violet-400", bg: "group-hover:bg-violet-500/10", text: "text-violet-500", icon: "group-hover:text-violet-500", ring: "hover:ring-violet-400/20" },
  { border: "hover:border-amber-400", bg: "group-hover:bg-amber-500/10", text: "text-amber-500", icon: "group-hover:text-amber-500", ring: "hover:ring-amber-400/20" },
  { border: "hover:border-rose-400", bg: "group-hover:bg-rose-500/10", text: "text-rose-500", icon: "group-hover:text-rose-500", ring: "hover:ring-rose-400/20" },
  { border: "hover:border-cyan-400", bg: "group-hover:bg-cyan-500/10", text: "text-cyan-500", icon: "group-hover:text-cyan-500", ring: "hover:ring-cyan-400/20" },
];

export default function CiudadPage() {
  const { categoria, ciudad } = useParams<{ categoria: string; ciudad: string }>();
  const cat = getCategoria(categoria);
  const { allNegocios } = useAllNegocios();
  const { allBarrios } = useAllBarrios();
  const { allCiudades } = useAllCiudades();

  const ciu = allCiudades.find((c) => c.slug === ciudad);

  if (!cat || !ciu) return <NotFound />;

  const barriosData = allBarrios.filter((b) => b.ciudad_slug === ciu.slug);
  const totalNegocios = filterByCiudad(allNegocios, cat.slug, ciu.slug).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
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

      {/* City Hero -- dramatic gradient with ambient orbs + dot grid */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#142d45]">
        {/* City background image (faint) */}
        {ciu.imagen && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10"
              style={{ backgroundImage: `url(${ciu.imagen})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628]/80 via-[#0f2035]/70 to-[#142d45]/60" />
          </>
        )}

        {/* Ambient light orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Dot grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative container py-14 md:py-20">
          <Breadcrumb
            items={[
              { label: cat.nombre, href: `/${cat.slug}` },
              { label: ciu.nombre },
            ]}
            variant="dark"
          />
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-lg flex items-center justify-center">
                <CategoryIcon iconName={cat.icono} className="w-4 h-4 text-blue-300/80" />
              </div>
              <span className="text-sm font-medium text-blue-200/70 tracking-wide uppercase">
                {cat.nombre}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              {cat.nombre} en{" "}
              <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                {ciu.nombre}
              </span>
            </h1>
            <p className="text-blue-100/50 mt-3 text-base md:text-lg max-w-xl">
              {totalNegocios} {totalNegocios === 1 ? "profesional" : "profesionales"} en{" "}
              {barriosData.length} {barriosData.length === 1 ? "barrio" : "barrios"} de {ciu.nombre}
            </p>
          </div>
        </div>

        {/* Wave SVG separator */}
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60V20C240 45 480 0 720 20C960 40 1200 10 1440 30V60H0Z"
            fill="#fafaf7"
          />
        </svg>
      </section>

      {/* Barrios Grid */}
      <section className="container py-10 md:py-14">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Barrios de {ciu.nombre}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {barriosData.map((barrio, index) => {
            const count = countByBarrio(allNegocios, cat.slug, ciu.slug, barrio.slug);
            const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
            return (
              <motion.div
                key={barrio.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Link href={`/${cat.slug}/${ciu.slug}/${barrio.slug}`}>
                  <div
                    className={`group relative bg-white border border-gray-200/80 shadow-sm rounded-xl p-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.03] hover:ring-2 cursor-pointer ${accent.border} ${accent.ring}`}
                  >
                    {/* Colored top accent bar */}
                    <div
                      className={`absolute top-0 left-4 right-4 h-[2px] rounded-b-full bg-current opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${accent.text}`}
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center transition-colors duration-300 ${accent.bg}`}
                        >
                          <MapPin className={`w-5 h-5 text-gray-400 transition-colors duration-300 ${accent.icon}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground group-hover:text-gray-900 transition-colors">
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
                      <div className="flex flex-col items-end gap-1">
                        <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 ${accent.text}`} />
                        <span className={`text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap ${accent.text}`}>
                          Ver profesionales
                        </span>
                      </div>
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
              Aun no hay barrios registrados para {cat.nombre} en {ciu.nombre}.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
