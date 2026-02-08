import { useState, useCallback, useRef, useMemo } from "react";
import { useParams, Link } from "wouter";
import {
  Star,
  Phone,
  Clock,
  MapPin,
  ExternalLink,
  ArrowLeft,
  FileText,
  MessageCircle,
  Globe,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  CheckCircle2,
  Award,
  Calendar,
  Image,
  Play,
  Building2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Briefcase,
  Package,
  Sparkles,
  Users,
  Quote,
  Newspaper,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getCategoria } from "@/data";
import { directorios } from "@/data/directorios";
import {
  useFindNegocio,
  useAllBarrios,
  useAllCiudades,
} from "@/hooks/useSupabaseNegocios";
import CategoryIcon from "@/components/CategoryIcon";
import Breadcrumb from "@/components/Breadcrumb";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { MapView } from "@/components/Map";
import NotFound from "./NotFound";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\s/g, "").replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("34")) return "+" + digits;
  return "+34" + digits;
}

function renderStars(rating: number, size = "w-4 h-4") {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${size} ${
            i <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function NegocioPage() {
  const { categoria, ciudad, barrio, negocio: negocioSlug } = useParams<{
    categoria: string;
    ciudad: string;
    barrio: string;
    negocio: string;
  }>();

  const [showPresupuesto, setShowPresupuesto] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    descripcion: "",
    horario_contacto: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const mapRef = useRef<google.maps.Map | null>(null);

  const cat = getCategoria(categoria);
  const { allCiudades } = useAllCiudades();
  const { allBarrios } = useAllBarrios();
  const { negocio: neg, loaded } = useFindNegocio(
    categoria,
    ciudad,
    barrio,
    negocioSlug
  );

  const ciu = allCiudades.find((c) => c.slug === ciudad);
  const bar = allBarrios.find(
    (b) => b.slug === barrio && b.ciudad_slug === ciudad
  );

  /* ---- Build visible tabs dynamically ---- */
  const visibleTabs = useMemo(() => {
    if (!neg) return [];
    const tabs: { id: string; label: string; icon: React.ReactNode }[] = [];
    tabs.push({
      id: "info",
      label: "Informacion",
      icon: <Building2 className="w-4 h-4" />,
    });
    if (
      (neg.resenas_clientes && neg.resenas_clientes.length > 0) ||
      (neg.resenas_empleados && neg.resenas_empleados.length > 0)
    ) {
      tabs.push({
        id: "resenas",
        label: "Resenas",
        icon: <Quote className="w-4 h-4" />,
      });
    }
    if (
      (neg.fotos && neg.fotos.length > 0) ||
      (neg.youtube_videos && neg.youtube_videos.length > 0)
    ) {
      tabs.push({
        id: "media",
        label: "Fotos y Videos",
        icon: <Image className="w-4 h-4" />,
      });
    }
    if (
      (neg.citaciones && neg.citaciones.length > 0) ||
      (neg.menciones_medios && neg.menciones_medios.length > 0)
    ) {
      tabs.push({
        id: "presencia",
        label: "Presencia Digital",
        icon: <Globe className="w-4 h-4" />,
      });
    }
    return tabs;
  }, [neg]);

  /* ---- Citaciones cross-referenced with directorios ---- */
  const citacionesRicas = useMemo(() => {
    if (!neg?.citaciones) return [];
    return neg.citaciones
      .map((slug) => directorios.find((d) => d.slug === slug))
      .filter(Boolean) as (typeof directorios)[number][];
  }, [neg?.citaciones]);

  /* ---- Guards ---- */
  if (!cat) return <NotFound />;
  if ((!ciu || !bar || !neg) && !loaded) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafaf7]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#1B4965]/20 border-t-[#1B4965] rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm animate-pulse">
              Cargando negocio...
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (!ciu || !bar || !neg) return <NotFound />;

  const hasApiKey = !!import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
  const heroPhoto = neg.fotos?.[0];

  /* ---- Map handler ---- */
  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: neg.coordenadas.lat, lng: neg.coordenadas.lng },
      title: neg.nombre,
    });
  };

  /* ---- Form validation ---- */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.nombre.trim()) errors.nombre = "El nombre es obligatorio";
    if (!formData.telefono.trim())
      errors.telefono = "El telefono es obligatorio";
    if (!formData.descripcion.trim())
      errors.descripcion = "Describe el servicio que necesitas";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleWhatsApp = () => {
    if (!validateForm()) return;
    const waPhone = formatPhoneForWhatsApp(neg.telefono);
    const message = [
      `Hola, me llamo ${formData.nombre}.`,
      `Necesito un presupuesto para: ${formData.descripcion}`,
      formData.email ? `Mi email: ${formData.email}` : "",
      formData.horario_contacto
        ? `Preferencia horaria: ${formData.horario_contacto}`
        : "",
      `Mi telefono: ${formData.telefono}`,
      "",
      `(Enviado desde vistoenmaps.com)`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(
      `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
    toast.success("Redirigiendo a WhatsApp...");
    setShowPresupuesto(false);
    setFormData({
      nombre: "",
      telefono: "",
      email: "",
      descripcion: "",
      horario_contacto: "",
    });
  };

  const handleEmail = () => {
    if (!validateForm()) return;
    const subject = `Solicitud de presupuesto — ${cat.nombre} en ${bar.nombre}, ${ciu.nombre}`;
    const body = [
      `Nombre: ${formData.nombre}`,
      `Telefono: ${formData.telefono}`,
      formData.email ? `Email: ${formData.email}` : "",
      ``,
      `Servicio necesitado:`,
      formData.descripcion,
      ``,
      formData.horario_contacto
        ? `Horario preferido de contacto: ${formData.horario_contacto}`
        : "",
      ``,
      `Negocio: ${neg.nombre}`,
      `Direccion: ${neg.direccion}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.success("Abriendo tu cliente de correo...");
    setShowPresupuesto(false);
  };

  /* ---- Social helpers ---- */
  const socialLinks = neg.redes_sociales
    ? Object.entries(neg.redes_sociales).filter(([, url]) => !!url)
    : [];

  const socialMeta: Record<
    string,
    { icon: React.ReactNode; bg: string; label: string }
  > = {
    instagram: {
      icon: <Instagram className="w-5 h-5" />,
      bg: "bg-gradient-to-br from-purple-500 to-pink-500 text-white",
      label: "Instagram",
    },
    facebook: {
      icon: <Facebook className="w-5 h-5" />,
      bg: "bg-[#1877F2] text-white",
      label: "Facebook",
    },
    twitter: {
      icon: <Twitter className="w-5 h-5" />,
      bg: "bg-black text-white",
      label: "X / Twitter",
    },
    youtube: {
      icon: <Youtube className="w-5 h-5" />,
      bg: "bg-red-600 text-white",
      label: "YouTube",
    },
    linkedin: {
      icon: <Linkedin className="w-5 h-5" />,
      bg: "bg-[#0A66C2] text-white",
      label: "LinkedIn",
    },
    tiktok: {
      icon: <Play className="w-5 h-5" />,
      bg: "bg-black text-white",
      label: "TikTok",
    },
  };

  /* ---- Schema.org ---- */
  const sameAsUrls = socialLinks.map(([, url]) => url).filter(Boolean) as string[];
  if (neg.web) sameAsUrls.push(neg.web);

  const schemaData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: neg.nombre,
    description: neg.descripcion || `${cat.nombre} en ${bar.nombre}, ${ciu.nombre}`,
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
    url: neg.web || neg.url_google_maps,
    sameAs: sameAsUrls.length > 0 ? sameAsUrls : undefined,
    image: neg.fotos && neg.fotos.length > 0 ? neg.fotos[0] : undefined,
    email: neg.email || undefined,
  };

  if (neg.resenas_clientes && neg.resenas_clientes.length > 0) {
    schemaData.review = neg.resenas_clientes.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.nombre },
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.valoracion,
        bestRating: 5,
      },
      reviewBody: r.texto,
      datePublished: r.fecha || undefined,
    }));
  }

  if (neg.productos && neg.productos.length > 0) {
    schemaData.makesOffer = neg.productos.map((p) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: p.nombre,
        description: p.descripcion || undefined,
        image: p.imagen || undefined,
      },
      price: p.precio || undefined,
      priceCurrency: "EUR",
    }));
  }

  if (neg.servicios_detallados && neg.servicios_detallados.length > 0) {
    schemaData.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: "Servicios",
      itemListElement: neg.servicios_detallados.map((s) => ({
        "@type": "OfferCatalog",
        name: s.nombre,
        description: s.descripcion || undefined,
      })),
    };
  }

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

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */
  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title={`${neg.nombre} — ${cat.nombre} en ${bar.nombre}, ${ciu.nombre} | Visto en Maps`}
        description={`${neg.nombre}: ${cat.nombre.toLowerCase()} en ${bar.nombre}, ${ciu.nombre}. ${neg.valoracion_media} estrellas, ${neg.num_resenas} resenas. ${neg.direccion}. Tel: ${neg.telefono}.`}
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

      {/* ============================================================ */}
      {/*  1. EPIC HERO                                                */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden">
        {/* Background */}
        {heroPhoto ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroPhoto})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/85 via-[#0a1628]/75 to-[#0a1628]/90" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#142d45]" />
        )}

        {/* Ambient light orbs */}
        <div className="absolute top-[-40%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[-5%] w-[400px] h-[400px] bg-cyan-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[20%] right-[20%] w-[200px] h-[200px] bg-indigo-400/6 rounded-full blur-2xl pointer-events-none" />

        <div className="relative container py-10 md:py-16">
          <Breadcrumb
            items={[
              { label: cat.nombre, href: `/${cat.slug}` },
              { label: ciu.nombre, href: `/${cat.slug}/${ciu.slug}` },
              {
                label: bar.nombre,
                href: `/${cat.slug}/${ciu.slug}/${bar.slug}`,
              },
              { label: neg.nombre },
            ]}
            variant="dark"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-4"
          >
            {/* Name + icon */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 shrink-0">
                <CategoryIcon
                  iconName={cat.icono}
                  className="w-7 h-7 md:w-8 md:h-8 text-white"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
                  {neg.nombre}
                </h1>
                <p className="text-white/60 mt-1 text-base md:text-lg">
                  {cat.nombre} en {bar.nombre}, {ciu.nombre}
                </p>
              </div>
            </div>

            {/* Floating badges */}
            <div className="flex flex-wrap items-center gap-2.5 mt-6">
              {/* Rating badge */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 backdrop-blur-sm border border-amber-400/20 rounded-full px-4 py-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-white font-bold text-sm">
                  {neg.valoracion_media}
                </span>
                <span className="text-white/60 text-sm">
                  · {neg.num_resenas} resenas
                </span>
              </div>

              {/* Years badge */}
              {neg.anos_experiencia && neg.anos_experiencia > 0 && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                  <Calendar className="w-4 h-4 text-blue-300" />
                  <span className="text-white/90 text-sm font-medium">
                    {neg.anos_experiencia} anos de experiencia
                  </span>
                </div>
              )}

              {/* Certifications badge */}
              {neg.certificaciones && neg.certificaciones.length > 0 && (
                <div className="flex items-center gap-2 bg-emerald-500/15 backdrop-blur-sm border border-emerald-400/20 rounded-full px-4 py-2">
                  <Award className="w-4 h-4 text-emerald-300" />
                  <span className="text-white/90 text-sm font-medium">
                    {neg.certificaciones[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <a
                href={`tel:${neg.telefono.replace(/\s/g, "")}`}
                className="flex-1 flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/35 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm md:text-base"
              >
                <Phone className="w-5 h-5" />
                Llamar ahora
              </a>
              <button
                onClick={() => setShowPresupuesto(true)}
                className="flex-1 flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 text-sm md:text-base"
              >
                <FileText className="w-5 h-5" />
                Pedir presupuesto
              </button>
              <a
                href={neg.url_google_maps}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white font-semibold py-3.5 rounded-xl hover:bg-white/20 transition-all duration-200 text-sm md:text-base"
              >
                <ExternalLink className="w-5 h-5" />
                Ver en Maps
              </a>
            </div>
          </motion.div>
        </div>

        {/* Wave separator */}
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

      {/* ============================================================ */}
      {/*  2. VALUE PROPOSITION BAR                                    */}
      {/* ============================================================ */}
      {neg.valor_anadido && neg.valor_anadido.length > 0 && (
        <motion.section
          {...fadeIn}
          className="bg-white border-b border-border/40"
        >
          <div className="container py-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {neg.valor_anadido.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-sm font-medium text-foreground/80"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ============================================================ */}
      {/*  3. TWO-COLUMN LAYOUT                                        */}
      {/* ============================================================ */}
      <section className="container py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ----- MAIN CONTENT (2/3) ----- */}
          <motion.div
            className="lg:col-span-2"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <Tabs defaultValue="info" className="w-full">
              {/* Tab triggers */}
              <TabsList className="bg-white border border-border/60 shadow-sm rounded-xl h-auto p-1.5 w-full flex flex-wrap justify-start gap-1">
                {visibleTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-[#1B4965] data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-2"
                  >
                    {tab.icon}
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* ---- TAB: Informacion ---- */}
              <TabsContent value="info" className="mt-6 space-y-6">
                {/* Description */}
                {neg.descripcion && (
                  <motion.div
                    {...fadeIn}
                    className="bg-white rounded-xl border border-border/60 shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[#1B4965]" />
                      Sobre {neg.nombre}
                    </h2>
                    <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                      {neg.descripcion}
                    </p>
                  </motion.div>
                )}

                {/* Servicios detallados */}
                {neg.servicios_detallados &&
                neg.servicios_detallados.length > 0 ? (
                  <motion.div {...fadeIn}>
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-[#1B4965]" />
                      Servicios
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {neg.servicios_detallados.map((s, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-xl border border-border/60 shadow-sm p-5 hover:shadow-md transition-shadow group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#1B4965]/8 flex items-center justify-center shrink-0 group-hover:bg-[#1B4965]/15 transition-colors">
                              <Sparkles className="w-5 h-5 text-[#1B4965]" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-foreground text-sm">
                                {s.nombre}
                              </h3>
                              {s.descripcion && (
                                <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                                  {s.descripcion}
                                </p>
                              )}
                              {s.precio && (
                                <span className="inline-block mt-2 text-xs font-bold text-[#C45B28] bg-[#C45B28]/10 px-2.5 py-1 rounded-full">
                                  {s.precio}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  /* Fallback: servicios_destacados as tags */
                  neg.servicios_destacados &&
                  neg.servicios_destacados.length > 0 && (
                    <motion.div {...fadeIn}>
                      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-[#1B4965]" />
                        Servicios destacados
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {neg.servicios_destacados.map((s, i) => (
                          <span
                            key={i}
                            className="text-sm bg-[#1B4965]/8 text-[#1B4965] px-3.5 py-1.5 rounded-full font-medium border border-[#1B4965]/10"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )
                )}

                {/* Productos */}
                {neg.productos && neg.productos.length > 0 && (
                  <motion.div {...fadeIn}>
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#1B4965]" />
                      Productos
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {neg.productos.map((p, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-xl border border-border/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                        >
                          {p.imagen && (
                            <div className="aspect-video overflow-hidden bg-gray-100">
                              <img
                                src={p.imagen}
                                alt={p.nombre}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-5">
                            <h3 className="font-semibold text-foreground text-sm">
                              {p.nombre}
                            </h3>
                            {p.descripcion && (
                              <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                                {p.descripcion}
                              </p>
                            )}
                            {p.precio && (
                              <span className="inline-block mt-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#C45B28] to-[#d4703f] px-3 py-1 rounded-full">
                                {p.precio}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </TabsContent>

              {/* ---- TAB: Resenas ---- */}
              <TabsContent value="resenas" className="mt-6 space-y-8">
                {/* Client reviews */}
                {neg.resenas_clientes && neg.resenas_clientes.length > 0 && (
                  <motion.div {...fadeIn}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#1B4965]" />
                        Opiniones de clientes
                      </h2>
                      <div className="flex items-center gap-2 text-sm">
                        {renderStars(
                          neg.resenas_clientes.reduce(
                            (acc, r) => acc + r.valoracion,
                            0
                          ) / neg.resenas_clientes.length
                        )}
                        <span className="text-muted-foreground font-medium">
                          (
                          {(
                            neg.resenas_clientes.reduce(
                              (acc, r) => acc + r.valoracion,
                              0
                            ) / neg.resenas_clientes.length
                          ).toFixed(1)}
                          )
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {neg.resenas_clientes.map((r, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-xl border border-border/60 shadow-sm p-5 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B4965] to-[#2a6f97] flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {r.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-foreground text-sm">
                                    {r.nombre}
                                  </p>
                                  {r.servicio && (
                                    <p className="text-xs text-muted-foreground">
                                      {r.servicio}
                                    </p>
                                  )}
                                </div>
                                {r.fecha && (
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    {r.fecha}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1.5">
                                {renderStars(r.valoracion, "w-3.5 h-3.5")}
                              </div>
                              <p className="text-foreground/80 text-sm mt-2.5 leading-relaxed">
                                {r.texto}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Employee reviews */}
                {neg.resenas_empleados &&
                  neg.resenas_empleados.length > 0 && (
                    <motion.div {...fadeIn}>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-[#1B4965]" />
                          El equipo opina
                        </h2>
                        <div className="flex items-center gap-2 text-sm">
                          {renderStars(
                            neg.resenas_empleados.reduce(
                              (acc, r) => acc + r.valoracion,
                              0
                            ) / neg.resenas_empleados.length
                          )}
                          <span className="text-muted-foreground font-medium">
                            (
                            {(
                              neg.resenas_empleados.reduce(
                                (acc, r) => acc + r.valoracion,
                                0
                              ) / neg.resenas_empleados.length
                            ).toFixed(1)}
                            )
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {neg.resenas_empleados.map((r, i) => (
                          <div
                            key={i}
                            className="bg-white rounded-xl border border-border/60 shadow-sm p-5 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3.5">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {r.nombre.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <div>
                                    <p className="font-semibold text-foreground text-sm">
                                      {r.nombre}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {r.cargo}
                                    </p>
                                  </div>
                                  {r.fecha && (
                                    <span className="text-xs text-muted-foreground shrink-0">
                                      {r.fecha}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1.5">
                                  {renderStars(r.valoracion, "w-3.5 h-3.5")}
                                </div>
                                <p className="text-foreground/80 text-sm mt-2.5 leading-relaxed">
                                  {r.texto}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
              </TabsContent>

              {/* ---- TAB: Fotos y Videos ---- */}
              <TabsContent value="media" className="mt-6 space-y-8">
                {/* Photos */}
                {neg.fotos && neg.fotos.length > 0 && (
                  <motion.div {...fadeIn}>
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Image className="w-5 h-5 text-[#1B4965]" />
                      Fotos
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {neg.fotos.map((foto, i) => (
                        <button
                          key={i}
                          onClick={() => setLightboxPhoto(foto)}
                          className="relative rounded-xl overflow-hidden aspect-square group cursor-pointer border border-border/40"
                        >
                          <img
                            src={foto}
                            alt={`${neg.nombre} foto ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                            <Image className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* YouTube videos */}
                {neg.youtube_videos && neg.youtube_videos.length > 0 && (
                  <motion.div {...fadeIn}>
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Play className="w-5 h-5 text-[#1B4965]" />
                      Videos
                    </h2>
                    <div className="space-y-4">
                      {neg.youtube_videos.map((url, i) => {
                        const videoId =
                          url.match(
                            /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/
                          )?.[1] || url;
                        return (
                          <div
                            key={i}
                            className="relative rounded-xl overflow-hidden border border-border/60 shadow-sm"
                            style={{ paddingBottom: "56.25%" }}
                          >
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title={`${neg.nombre} video ${i + 1}`}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="absolute inset-0 w-full h-full"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </TabsContent>

              {/* ---- TAB: Presencia Digital ---- */}
              <TabsContent value="presencia" className="mt-6 space-y-8">
                {/* Citaciones */}
                {citacionesRicas.length > 0 && (
                  <motion.div {...fadeIn}>
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-[#1B4965]" />
                      Registrado en
                    </h2>
                    <div className="space-y-3">
                      {citacionesRicas.map((dir, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-xl border border-border/60 shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-4"
                        >
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${dir.dominio}&sz=32`}
                            alt={dir.nombre}
                            className="w-8 h-8 rounded-lg shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground text-sm truncate">
                                {dir.nombre}
                              </p>
                              <Badge
                                className={`text-[10px] px-2 py-0.5 rounded-full border-0 ${
                                  dir.tipo === "premium"
                                    ? "bg-amber-100 text-amber-700"
                                    : dir.tipo === "social"
                                      ? "bg-violet-100 text-violet-700"
                                      : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {dir.tipo}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {dir.dominio}
                            </p>
                          </div>
                          <a
                            href={dir.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0"
                          >
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Menciones en medios */}
                {neg.menciones_medios &&
                  neg.menciones_medios.length > 0 && (
                    <motion.div {...fadeIn}>
                      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-[#1B4965]" />
                        En los medios
                      </h2>
                      <div className="space-y-3">
                        {neg.menciones_medios.map((m, i) => (
                          <a
                            key={i}
                            href={m.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white rounded-xl border border-border/60 shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-4 group block"
                          >
                            <div className="w-10 h-10 rounded-lg bg-[#1B4965]/8 flex items-center justify-center shrink-0 group-hover:bg-[#1B4965]/15 transition-colors">
                              <Newspaper className="w-5 h-5 text-[#1B4965]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                {m.medio}
                              </p>
                              <p className="font-semibold text-foreground text-sm truncate group-hover:text-[#1B4965] transition-colors">
                                {m.titulo}
                              </p>
                              {m.fecha && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {m.fecha}
                                </p>
                              )}
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-[#1B4965] transition-colors" />
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* ----- SIDEBAR (1/3) ----- */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-5">
              {/* Contact Card */}
              <motion.div
                {...fadeIn}
                className="bg-white rounded-xl border border-border/60 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-base">
                  <Phone className="w-4.5 h-4.5 text-[#1B4965]" />
                  Contacto
                </h3>
                <div className="space-y-0">
                  {/* Address */}
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1B4965]/8 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-[#1B4965]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                        Direccion
                      </p>
                      <p className="text-foreground text-sm mt-0.5">
                        {neg.direccion}
                      </p>
                    </div>
                  </div>
                  <Separator />

                  {/* Phone */}
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1B4965]/8 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-[#1B4965]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                        Telefono
                      </p>
                      <a
                        href={`tel:${neg.telefono.replace(/\s/g, "")}`}
                        className="text-foreground hover:text-[#1B4965] transition-colors text-sm mt-0.5 inline-block font-medium"
                      >
                        {neg.telefono}
                      </a>
                    </div>
                  </div>
                  <Separator />

                  {/* Hours */}
                  <div className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1B4965]/8 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-[#1B4965]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                        Horario
                      </p>
                      <p className="text-foreground text-sm mt-0.5">
                        {neg.horario}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  {neg.email && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3 py-3">
                        <div className="w-8 h-8 rounded-lg bg-[#1B4965]/8 flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4 text-[#1B4965]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                            Email
                          </p>
                          <a
                            href={`mailto:${neg.email}`}
                            className="text-foreground hover:text-[#1B4965] transition-colors text-sm mt-0.5 inline-block font-medium truncate block"
                          >
                            {neg.email}
                          </a>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Web */}
                  {neg.web && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3 py-3">
                        <div className="w-8 h-8 rounded-lg bg-[#1B4965]/8 flex items-center justify-center shrink-0">
                          <Globe className="w-4 h-4 text-[#1B4965]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                            Web
                          </p>
                          <a
                            href={neg.web}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1B4965] hover:underline text-sm mt-0.5 inline-block font-medium truncate block"
                          >
                            {neg.web.replace(/^https?:\/\/(www\.)?/, "")}
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Map Card */}
              <motion.div
                {...fadeIn}
                className="rounded-xl overflow-hidden border border-border/60 shadow-sm"
              >
                {hasApiKey ? (
                  <MapView
                    initialCenter={neg.coordenadas}
                    initialZoom={16}
                    onMapReady={handleMapReady}
                    className="h-[220px]"
                  />
                ) : (
                  <div className="h-[220px] bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#1B4965]/10 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-[#1B4965]" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center px-4">
                      {neg.direccion}
                    </p>
                    <a
                      href={neg.url_google_maps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[#1B4965] hover:underline flex items-center gap-1"
                    >
                      Ver en Google Maps
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </motion.div>

              {/* Social Media Card */}
              {socialLinks.length > 0 && (
                <motion.div
                  {...fadeIn}
                  className="bg-white rounded-xl border border-border/60 shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold text-foreground mb-3 text-sm">
                    Redes sociales
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map(([platform, url]) => {
                      const meta = socialMeta[platform];
                      if (!meta || !url) return null;
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={meta.label}
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${meta.bg} hover:opacity-80 transition-opacity shadow-sm`}
                        >
                          {meta.icon}
                        </a>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* CTA Card */}
              <motion.div
                {...fadeIn}
                className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-lg shadow-emerald-500/15"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      Presupuesto gratis
                    </h3>
                    <p className="text-white/70 text-xs">
                      Sin compromiso
                    </p>
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-4">
                  Solicita tu presupuesto personalizado sin ningun compromiso.
                </p>
                <button
                  onClick={() => setShowPresupuesto(true)}
                  className="w-full bg-white text-emerald-700 font-bold py-2.5 rounded-lg hover:bg-white/90 transition-colors text-sm shadow-sm"
                >
                  Pedir presupuesto
                </button>
              </motion.div>

              {/* Trust Badge */}
              <motion.div
                {...fadeIn}
                className="bg-white rounded-xl border border-border/60 shadow-sm p-4 flex items-center gap-3"
              >
                <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    Verificado en Google Maps
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {neg.valoracion_media} estrellas de {neg.num_resenas}{" "}
                    resenas
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  4. BACK LINK                                                */}
        {/* ============================================================ */}
        <motion.div {...fadeIn} className="mt-12">
          <Link
            href={`/${cat.slug}/${ciu.slug}/${bar.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B4965] hover:underline group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Ver todos los {cat.nombre.toLowerCase()} en {bar.nombre}
          </Link>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  5. PHOTO LIGHTBOX DIALOG                                    */}
      {/* ============================================================ */}
      <Dialog
        open={!!lightboxPhoto}
        onOpenChange={() => setLightboxPhoto(null)}
      >
        <DialogContent className="sm:max-w-3xl p-2 bg-black/95 border-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Foto de {neg.nombre}</DialogTitle>
            <DialogDescription>Vista ampliada de la foto</DialogDescription>
          </DialogHeader>
          {lightboxPhoto && (
            <img
              src={lightboxPhoto}
              alt={neg.nombre}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/*  6. PRESUPUESTO DIALOG                                       */}
      {/* ============================================================ */}
      <Dialog open={showPresupuesto} onOpenChange={setShowPresupuesto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pedir presupuesto</DialogTitle>
            <DialogDescription>
              Contacta con {neg.nombre} para solicitar un presupuesto sin
              compromiso.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Nombre <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Tu nombre"
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
              />
              {formErrors.nombre && (
                <p className="text-xs text-destructive mt-1">
                  {formErrors.nombre}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Telefono <span className="text-destructive">*</span>
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                placeholder="Tu telefono de contacto"
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
              />
              {formErrors.telefono && (
                <p className="text-xs text-destructive mt-1">
                  {formErrors.telefono}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="tu@email.com (opcional)"
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Describe el servicio que necesitas{" "}
                <span className="text-destructive">*</span>
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                placeholder="Ej: Necesito cambiar la cerradura de mi puerta principal..."
                rows={3}
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1B4965] resize-none"
              />
              {formErrors.descripcion && (
                <p className="text-xs text-destructive mt-1">
                  {formErrors.descripcion}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Horario preferido de contacto
              </label>
              <select
                value={formData.horario_contacto}
                onChange={(e) =>
                  setFormData({ ...formData, horario_contacto: e.target.value })
                }
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
              >
                <option value="">Sin preferencia</option>
                <option value="Mananas (9:00-13:00)">
                  Mananas (9:00-13:00)
                </option>
                <option value="Tardes (13:00-18:00)">
                  Tardes (13:00-18:00)
                </option>
                <option value="Noches (18:00-21:00)">
                  Noches (18:00-21:00)
                </option>
                <option value="Cualquier hora">Cualquier hora</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-2.5 rounded-xl hover:bg-emerald-700 transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Enviar por WhatsApp
              </button>
              <button
                onClick={handleEmail}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1B4965] text-white font-semibold py-2.5 rounded-xl hover:bg-[#15384e] transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                Enviar por Email
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
