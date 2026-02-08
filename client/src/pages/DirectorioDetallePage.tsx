import { Link, useParams } from "wouter";
import {
  Globe,
  Star,
  ExternalLink,
  Check,
  Crown,
  BookOpen,
  Briefcase,
  Home as HomeIcon,
  Users,
  MapPin,
  Shield,
  ArrowRight,
  Tag,
  CreditCard,
  Info,
} from "lucide-react";
import {
  directorios,
  categoriaDirectorio,
  type Directorio,
} from "@/data/directorios";
import Breadcrumb from "@/components/Breadcrumb";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import NotFound from "./NotFound";

const categoryIcons: Record<string, React.ReactNode> = {
  general: <Globe className="w-4 h-4" />,
  resenas: <Star className="w-4 h-4" />,
  servicios: <Briefcase className="w-4 h-4" />,
  reformas: <HomeIcon className="w-4 h-4" />,
  b2b: <Briefcase className="w-4 h-4" />,
  social: <Users className="w-4 h-4" />,
  regional: <MapPin className="w-4 h-4" />,
};

const alcanceLabels: Record<string, string> = {
  local: "Local",
  regional: "Regional",
  nacional: "Nacional",
  europeo: "Europa",
  internacional: "Internacional",
  global: "Global",
};

const tipoDirectorioLabels: Record<string, string> = {
  tematico: "Temático",
  local: "Local",
  generalista: "Generalista",
};

const costeLabels: Record<string, string> = {
  gratis: "Gratis",
  freemium: "Gratis (con opciones de pago)",
  pago: "De pago",
};

export default function DirectorioDetallePage() {
  const { slug } = useParams<{ slug: string }>();
  const directorio = directorios.find((d) => d.slug === slug);

  if (!directorio) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title={`${directorio.nombre} - Ficha del Directorio | Visto en Maps`}
        description={`Información sobre ${directorio.nombre}: tipo de directorio, coste, alcance y cómo registrar tu negocio.`}
        canonical={`https://vistoenmaps.com/directorios/${directorio.slug}`}
      />
      <Header />

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: directorio.nombre,
            url: directorio.url,
            description: directorio.descripcion,
          }),
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#142d45] text-primary-foreground py-12 md:py-16">
         {/* Ambient orbs */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px]" />
        </div>

        <div className="container relative z-10">
          <Breadcrumb
            items={[
              { label: "Directorios", href: "/directorios" },
              { label: directorio.nombre },
            ]}
            variant="dark"
          />

          <div className="mt-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-xl backdrop-blur-sm">
               <Globe className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  {directorio.nombre}
                </h1>
                {directorio.tipo === "premium" && (
                  <span className="bg-accent text-accent-foreground text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Crown className="w-3 h-3" /> Premium
                  </span>
                )}
              </div>
              <p className="text-primary-foreground/80 text-lg max-w-2xl">
                {directorio.descripcion}
              </p>
              <a
                href={directorio.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-white/90 hover:text-white mt-2 transition-colors"
              >
                {directorio.dominio} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Wave SVG separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 60V20C240 45 480 0 720 20C960 40 1200 10 1440 30V60H0Z" fill="#fafaf7" />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">

            {/* General Info Card */}
            <div className="bg-white border border-gray-200/80 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Información General
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <Tag className="w-4 h-4" /> Tipo de Directorio
                  </span>
                  <p className="text-base font-semibold capitalize">
                    {tipoDirectorioLabels[directorio.tipoDirectorio] || directorio.tipoDirectorio}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    {categoryIcons[directorio.categoria] || <Briefcase className="w-4 h-4" />}
                    Categoría
                  </span>
                  <p className="text-base font-semibold">
                    {categoriaDirectorio[directorio.categoria]}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Alcance
                  </span>
                  <p className="text-base font-semibold">
                    {alcanceLabels[directorio.alcance] || directorio.alcance}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <Star className="w-4 h-4" /> Permite Reseñas
                  </span>
                  <p className="text-base font-semibold">
                    {directorio.permiteResenas ? "Sí" : "No"}
                  </p>
                </div>
              </div>
            </div>

            {/* Cost & Registration Card */}
            <div className="bg-white border border-gray-200/80 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Coste y Registro
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">Modelo de Precios</span>
                  <div className="flex items-center gap-2">
                    {directorio.coste === "gratis" ? (
                      <span className="flex items-center gap-1.5 text-sm bg-green-500/10 text-green-700 dark:text-green-400 font-bold px-3 py-1 rounded-full">
                        <Check className="w-3.5 h-3.5" /> Gratis
                      </span>
                    ) : directorio.coste === "freemium" ? (
                      <span className="flex items-center gap-1.5 text-sm bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold px-3 py-1 rounded-full">
                        <Info className="w-3.5 h-3.5" /> Freemium
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold px-3 py-1 rounded-full">
                        <CreditCard className="w-3.5 h-3.5" /> De Pago
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {costeLabels[directorio.coste]}
                  </p>
                </div>

                {directorio.precio && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">Precio Aproximado</span>
                    <p className="text-base font-semibold">{directorio.precio}</p>
                  </div>
                )}

                <div className="md:col-span-2 pt-4 flex flex-col sm:flex-row gap-3">
                   {directorio.urlRegistro ? (
                      <a
                        href={directorio.urlRegistro}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                      >
                        Registrar mi negocio <ArrowRight className="w-4 h-4" />
                      </a>
                   ) : (
                     <a
                        href={directorio.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                      >
                        Visitar sitio web <ExternalLink className="w-4 h-4" />
                      </a>
                   )}

                   {directorio.urlRegistro && (
                      <a
                        href={directorio.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-secondary/80 transition-colors"
                      >
                        Ver directorio <ExternalLink className="w-4 h-4" />
                      </a>
                   )}
                </div>
              </div>
            </div>

            {/* Tips / Info */}
            <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl p-5">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">¿Por qué estar en este directorio?</h3>
                  <p className="text-sm text-blue-800/80 dark:text-blue-400/80 leading-relaxed">
                    Estar presente en directorios como <strong>{directorio.nombre}</strong> ayuda a mejorar tu SEO Local mediante citaciones NAP (Nombre, Dirección, Teléfono) consistentes, aumentando tu autoridad y visibilidad en Google Maps.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200/80 rounded-xl p-5 sticky top-24 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="font-bold mb-4">Otros directorios {directorio.categoria}</h3>
              <div className="space-y-3">
                 {directorios
                    .filter(d => d.categoria === directorio.categoria && d.slug !== directorio.slug)
                    .sort((a, b) => b.popularidad - a.popularidad)
                    .slice(0, 5)
                    .map(d => (
                      <Link key={d.slug} href={`/directorios/${d.slug}`}>
                        <a className="block p-3 rounded-lg hover:bg-[#fafaf7] border border-transparent hover:border-gray-200/80 transition-all duration-200 group">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm group-hover:text-primary transition-colors">{d.nombre}</span>
                            {d.tipo === 'premium' && <Crown className="w-3 h-3 text-accent" />}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                             <span>{costeLabels[d.coste]}</span>
                             <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                             <span>{alcanceLabels[d.alcance]}</span>
                          </div>
                        </a>
                      </Link>
                    ))
                 }
                 <Link href="/directorios">
                   <a className="block text-center text-xs font-semibold text-primary mt-4 hover:underline">
                     Ver todos los directorios
                   </a>
                 </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
