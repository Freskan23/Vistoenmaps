import { Link } from "wouter";
import { MapPin, ArrowRight, CheckCircle2, Clock, Shield, Star, Eye, Calendar, Newspaper } from "lucide-react";
import { superCategorias } from "@/data/superCategorias";
import { categorias } from "@/data";
import SuperCategoriaCard from "@/components/SuperCategoriaCard";
import EventoCard from "@/components/EventoCard";
import BlogPostCard from "@/components/BlogPostCard";
import SearchBar from "@/components/SearchBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EyeLogo from "@/components/EyeLogo";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { useEventos } from "@/hooks/useEventos";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import AdSlot from "@/components/ads/AdSlot";

export default function Home() {
  const { eventos, loading: eventosLoading } = useEventos({ limit: 4 });
  const { posts: blogPosts, loaded: blogLoaded } = useBlogPosts();

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title="Visto en Maps — Profesionales verificados en Google Maps"
        description="Cerrajeros, fontaneros, dentistas, restaurantes... Solo negocios reales con reseñas verificadas en Google Maps. Encuentra al mejor profesional de tu ciudad en segundos."
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

      {/* ===== HERO: EL OJO COMO PROTAGONISTA ABSOLUTO ===== */}
      <section className="relative overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0f2035] to-[#142d45]" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[120px]" />
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-amber-500/12 rounded-full blur-[80px]" />
          <div className="absolute -top-20 right-[10%] w-[300px] h-[300px] bg-accent/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-[30%] left-[5%] w-[300px] h-[300px] bg-cyan-500/8 rounded-full blur-[100px]" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative container py-12 md:py-16 lg:py-20">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: -120, scale: 0.6 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative mb-4"
            >
              <motion.div
                initial={{ opacity: 0, scaleX: 0.3 }}
                animate={{ opacity: 0.3, scaleX: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-3 bg-black/40 rounded-[50%] blur-sm"
              />
              <EyeLogo size={160} glow />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="inline-flex items-center gap-2 bg-accent/15 backdrop-blur-sm border border-accent/25 rounded-full px-4 py-1.5 mb-5"
            >
              <Eye className="w-3.5 h-3.5 text-accent" />
              <span className="text-[11px] font-bold text-accent uppercase tracking-widest">
                +175 negocios verificados en Google Maps
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-[clamp(2rem,5vw+0.5rem,3.8rem)] leading-[1.08] font-extrabold text-white mb-4 max-w-3xl"
            >
              El profesional que necesitas,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-accent">
                a un clic
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.85 }}
              className="text-base md:text-lg text-white/50 leading-relaxed mb-8 max-w-xl"
            >
              Deja de buscar en Google y rezar. Aquí solo aparecen negocios reales, con reseñas reales y ubicación verificada en Maps. Sin sorpresas.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="w-full max-w-lg mb-6"
            >
              <SearchBar variant="hero" />
            </motion.div>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {categorias.slice(0, 4).map((cat, i) => (
                <Link key={cat.slug} href={`/${cat.slug}`}>
                  <motion.span
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.1 + i * 0.08 }}
                    className="px-3.5 py-1.5 bg-white/8 backdrop-blur-sm text-white/70 text-sm rounded-full border border-white/10 hover:bg-white/15 hover:text-white hover:border-white/25 transition-all cursor-pointer"
                  >
                    {cat.nombre}
                  </motion.span>
                </Link>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.3 }}
              className="flex items-center justify-center gap-6 pt-4 border-t border-white/8"
            >
              <div className="flex items-center gap-1.5 text-white/40 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/80" />
                <span>Solo negocios reales</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/40 text-xs">
                <Clock className="w-3.5 h-3.5 text-blue-400/80" />
                <span>Contacto directo</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/40 text-xs">
                <MapPin className="w-3.5 h-3.5 text-accent/80" />
                <span>5 ciudades de España</span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 60V20C240 45 480 0 720 20C960 40 1200 10 1440 30V60H0Z" fill="#fafaf7" />
          </svg>
        </div>
      </section>

      {/* ===== DIRECTORIO: SUPER-CATEGORÍAS ===== */}
      <section className="container py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-accent rounded-full" />
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Directorio</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              ¿Qué necesitas hoy?
            </h2>
            <p className="text-muted-foreground mt-1">
              Elige categoría, tu ciudad y contacta directamente. Así de fácil.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {superCategorias.map((sc, index) => (
            <motion.div
              key={sc.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <SuperCategoriaCard superCategoria={sc} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== AD SLOT: after directorio ===== */}
      <div className="container pb-4">
        <AdSlot slot="home-after-directorio" />
      </div>

      {/* ===== EVENTOS PREVIEW ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fafaf7] via-purple-500/[0.03] to-[#fafaf7]" />
        <div className="relative container py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex items-end justify-between mb-8"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-purple-500 rounded-full" />
                <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">Eventos</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                No te lo pierdas
              </h2>
              <p className="text-muted-foreground mt-1">
                Conciertos, deporte y planes que se agotan. Mira qué hay cerca de ti.
              </p>
            </div>
            <Link
              href="/eventos"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-purple-500 hover:text-purple-600 transition-colors"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {eventosLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-[280px] animate-pulse border border-border/50" />
              ))}
            </div>
          ) : eventos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {eventos.slice(0, 4).map((evento, i) => (
                <motion.div
                  key={evento.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <EventoCard evento={evento} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-10 h-10 text-purple-300 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Cargando los próximos eventos...</p>
            </div>
          )}

          <div className="flex sm:hidden justify-center mt-6">
            <Link
              href="/eventos"
              className="inline-flex items-center gap-2 text-sm font-semibold text-purple-500 hover:text-purple-600 transition-colors"
            >
              Ver todos los eventos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== AD SLOT: after eventos ===== */}
      <div className="container pb-4">
        <AdSlot slot="home-after-eventos" />
      </div>

      {/* ===== BLOG PREVIEW ===== */}
      {blogLoaded && blogPosts.length > 0 && (
        <section className="container py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex items-end justify-between mb-8"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-amber-500 rounded-full" />
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Blog</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                Los mejores de tu ciudad
              </h2>
              <p className="text-muted-foreground mt-1">
                Rankings basados en reseñas reales de Google. Sin pagar, sin trucos.
              </p>
            </div>
            <Link
              href="/blog"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-amber-500 hover:text-amber-600 transition-colors"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {blogPosts.slice(0, 3).map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <BlogPostCard post={post} />
              </motion.div>
            ))}
          </div>

          <div className="flex sm:hidden justify-center mt-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-500 hover:text-amber-600 transition-colors"
            >
              Ver todos los artículos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ===== AD SLOT: before trust ===== */}
      <div className="container pb-4">
        <AdSlot slot="home-before-trust" />
      </div>

      {/* ===== TRUST / WHY US SECTION ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fafaf7] via-primary/[0.04] to-[#fafaf7]" />
        <div className="relative container py-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 mb-4">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Sin trucos, sin letra pequeña
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              ¿Por qué la gente confía en nosotros?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: CheckCircle2,
                color: "text-emerald-500",
                bg: "from-emerald-500/15 to-emerald-500/5",
                title: "Solo negocios reales",
                desc: "Nada de perfiles fantasma. Si aparece aquí, existe en Google Maps con reseñas y dirección verificada.",
              },
              {
                icon: Clock,
                color: "text-blue-500",
                bg: "from-blue-500/15 to-blue-500/5",
                title: "Contacto en 10 segundos",
                desc: "Teléfono, web y ubicación a un clic. Sin registros, sin formularios interminables.",
              },
              {
                icon: Star,
                color: "text-amber-500",
                bg: "from-amber-500/15 to-amber-500/5",
                title: "Rankings que no se compran",
                desc: "El orden lo deciden las estrellas y reseñas de Google, no quién paga más.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white border border-border/50 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION with EyeLogo ===== */}
      <section className="container pb-12 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#142d45] rounded-3xl p-8 md:p-12 overflow-hidden"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-accent/15 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-[200px] h-[200px] bg-cyan-500/10 rounded-full blur-[60px]" />
          </div>
          <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="shrink-0 hidden md:block">
              <EyeLogo size={80} glow />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-extrabold text-white mb-2">
                ¿Tienes un negocio y no apareces aquí?
              </h2>
              <p className="text-white/50 text-sm md:text-base">
                Tus competidores ya están. Regístrate gratis y empieza a recibir clientes que buscan exactamente lo que tú ofreces.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-accent/25 shrink-0"
            >
              Aparecer en el directorio
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
