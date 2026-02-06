import { Link } from "wouter";
import { MapPin, ArrowRight } from "lucide-react";
import { categorias } from "@/data";
import CategoryIcon from "@/components/CategoryIcon";
import SearchBar from "@/components/SearchBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Visto en Maps — Directorio de profesionales y negocios locales"
        description="Encuentra profesionales y negocios locales verificados en Google Maps. Cerrajeros, fontaneros, electricistas y más servicios cerca de ti en toda España."
        canonical="https://vistoenmaps.com"
      />
      <Header variant="transparent" />

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

      {/* Hero Section — Mesh gradient with ambient orbs */}
      <section className="relative overflow-hidden -mt-16 pt-16">
        {/* Base background */}
        <div className="absolute inset-0 bg-primary" />
        {/* Ambient gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-primary-foreground/5 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative container py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Text + Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-5 h-5 text-accent" />
                <span className="text-sm font-semibold text-primary-foreground/70 uppercase tracking-wider">
                  Directorio local verificado
                </span>
              </div>
              <motion.h1
                initial={{ opacity: 0, letterSpacing: "0.02em" }}
                animate={{ opacity: 1, letterSpacing: "-0.03em" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-[clamp(2.5rem,5vw+1rem,4.5rem)] leading-[1.05] font-extrabold text-white mb-6"
              >
                Encuentra profesionales{" "}
                <span className="text-accent">cerca de ti</span>
              </motion.h1>
              <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-lg">
                El directorio de profesionales y negocios locales con presencia verificada en Google Maps.
              </p>
              <div className="max-w-md">
                <SearchBar variant="hero" />
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2 mt-5">
                {categorias.slice(0, 4).map((cat) => (
                  <Link key={cat.slug} href={`/${cat.slug}`}>
                    <span className="px-3.5 py-1.5 bg-white/10 backdrop-blur-sm text-white/80 text-sm rounded-full border border-white/15 hover:bg-white/20 hover:text-white transition-colors cursor-pointer">
                      {cat.nombre}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Right: Category quick-access grid (desktop only) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-3">
                {categorias.map((cat, index) => (
                  <motion.div
                    key={cat.slug}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                  >
                    <Link href={`/${cat.slug}`}>
                      <div className="group flex items-center gap-3 bg-white/8 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/15 transition-all duration-200 cursor-pointer">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                          <CategoryIcon iconName={cat.icono} className="w-5 h-5 text-white/80" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-white font-medium text-sm block">{cat.nombre}</span>
                          <span className="text-white/40 text-xs block truncate">{cat.descripcion.split('.')[0]}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container py-16 md:py-24">
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-2">
            Categorías de servicios
          </h2>
          <p className="text-muted-foreground">
            Explora profesionales por tipo de servicio en toda España
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categorias.map((cat, index) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <Link href={`/${cat.slug}`}>
                <div className="group relative bg-card border border-border/60 shadow-sm hover:shadow-lg rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
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
      <section className="bg-gradient-to-b from-background via-secondary/30 to-background">
        <div className="container py-14 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-3xl font-extrabold text-primary tracking-tight mb-1">100%</div>
              <p className="text-sm text-muted-foreground">Negocios verificados en Google Maps</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="text-3xl font-extrabold text-primary tracking-tight mb-1">24/7</div>
              <p className="text-sm text-muted-foreground">Servicios de urgencia disponibles</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="text-3xl font-extrabold text-primary tracking-tight mb-1">España</div>
              <p className="text-sm text-muted-foreground">Cobertura en ciudades y barrios</p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
