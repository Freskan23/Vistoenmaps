import { useState, useCallback, useRef } from "react";
import { useParams } from "wouter";
import { Star, Phone, Clock, MapPin, ExternalLink, ArrowLeft, FileText, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import {
  getCategoria,
} from "@/data";
import { useFindNegocio, useAllBarrios, useAllCiudades } from "@/hooks/useSupabaseNegocios";
import CategoryIcon from "@/components/CategoryIcon";
import Breadcrumb from "@/components/Breadcrumb";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "./NotFound";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { MapView } from "@/components/Map";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\s/g, "").replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("34")) return "+" + digits;
  return "+34" + digits;
}

export default function NegocioPage() {
  const { categoria, ciudad, barrio, negocio: negocioSlug } = useParams<{
    categoria: string;
    ciudad: string;
    barrio: string;
    negocio: string;
  }>();

  const [showPresupuesto, setShowPresupuesto] = useState(false);
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
  const { negocio: neg, loaded } = useFindNegocio(categoria, ciudad, barrio, negocioSlug);

  const ciu = allCiudades.find((c) => c.slug === ciudad);
  const bar = allBarrios.find((b) => b.slug === barrio && b.ciudad_slug === ciudad);

  // Esperar a que carguen los datos de Supabase antes de mostrar NotFound
  if (!cat) return <NotFound />;
  if ((!ciu || !bar || !neg) && !loaded) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafaf7]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </div>
      </div>
    );
  }
  if (!ciu || !bar || !neg) return <NotFound />;

  const hasApiKey = !!import.meta.env.VITE_FRONTEND_FORGE_API_KEY;

  const handleMapReady = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: neg.coordenadas.lat, lng: neg.coordenadas.lng },
        title: neg.nombre,
      });
    },
    [neg]
  );

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.nombre.trim()) errors.nombre = "El nombre es obligatorio";
    if (!formData.telefono.trim()) errors.telefono = "El teléfono es obligatorio";
    if (!formData.descripcion.trim()) errors.descripcion = "Describe el servicio que necesitas";
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
      formData.horario_contacto ? `Preferencia horaria: ${formData.horario_contacto}` : "",
      `Mi teléfono: ${formData.telefono}`,
      "",
      `(Enviado desde vistoenmaps.com)`,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`, "_blank");
    toast.success("Redirigiendo a WhatsApp...");
    setShowPresupuesto(false);
    setFormData({ nombre: "", telefono: "", email: "", descripcion: "", horario_contacto: "" });
  };

  const handleEmail = () => {
    if (!validateForm()) return;

    const subject = `Solicitud de presupuesto — ${cat.nombre} en ${bar.nombre}, ${ciu.nombre}`;
    const body = [
      `Nombre: ${formData.nombre}`,
      `Teléfono: ${formData.telefono}`,
      formData.email ? `Email: ${formData.email}` : "",
      ``,
      `Servicio necesitado:`,
      formData.descripcion,
      ``,
      formData.horario_contacto ? `Horario preferido de contacto: ${formData.horario_contacto}` : "",
      ``,
      `Negocio: ${neg.nombre}`,
      `Dirección: ${neg.direccion}`,
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.success("Abriendo tu cliente de correo...");
    setShowPresupuesto(false);
  };

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
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
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
      <section className="relative bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#142d45] overflow-hidden">
        {/* Ambient light orbs */}
        <div className="absolute top-[-40%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[-5%] w-[400px] h-[400px] bg-cyan-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[20%] right-[20%] w-[200px] h-[200px] bg-indigo-400/6 rounded-full blur-2xl pointer-events-none" />

        <div className="relative container py-10 md:py-14">
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
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/5">
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

        {/* Wave separator */}
        <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0 60V20C240 45 480 0 720 20C960 40 1200 10 1440 30V60H0Z" fill="#fafaf7" />
        </svg>
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
          <div className="bg-white border border-border/60 shadow-sm rounded-xl p-6 mb-6 hover:shadow-md transition-shadow duration-300">
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <MapPin className="w-[18px] h-[18px] text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Direcci&oacute;n</p>
                  <p className="text-foreground mt-0.5">{neg.direccion}</p>
                </div>
              </div>
              <hr className="border-border/40" />
              <div className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Phone className="w-[18px] h-[18px] text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Tel&eacute;fono</p>
                  <a
                    href={`tel:${neg.telefono.replace(/\s/g, "")}`}
                    className="text-foreground hover:text-primary transition-colors mt-0.5 inline-block"
                  >
                    {neg.telefono}
                  </a>
                </div>
              </div>
              <hr className="border-border/40" />
              <div className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Clock className="w-[18px] h-[18px] text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Horario</p>
                  <p className="text-foreground mt-0.5">{neg.horario}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mb-6 rounded-xl overflow-hidden border border-border/60 shadow-sm">
            {hasApiKey ? (
              <MapView
                initialCenter={neg.coordenadas}
                initialZoom={16}
                onMapReady={handleMapReady}
                className="h-[250px]"
              />
            ) : (
              <div className="h-[250px] bg-secondary flex flex-col items-center justify-center gap-3">
                <MapPin className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{neg.direccion}</p>
                <a
                  href={neg.url_google_maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Ver en Google Maps
                </a>
              </div>
            )}
          </div>

          {/* Servicios */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground mb-3">Servicios destacados</h2>
            <div className="flex flex-wrap gap-2">
              {neg.servicios_destacados.map((servicio) => (
                <span
                  key={servicio}
                  className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-full font-medium"
                >
                  {servicio}
                </span>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`tel:${neg.telefono.replace(/\s/g, "")}`}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white font-semibold py-3 rounded-xl shadow-md shadow-orange-500/20 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200"
            >
              <Phone className="w-5 h-5" />
              Llamar ahora
            </a>
            <button
              onClick={() => setShowPresupuesto(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold py-3 rounded-xl shadow-md shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200"
            >
              <FileText className="w-5 h-5" />
              Pedir presupuesto
            </button>
            <a
              href={neg.url_google_maps}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#0f2035] text-white font-semibold py-3 rounded-xl shadow-md shadow-[#0f2035]/20 hover:bg-[#142d45] hover:shadow-lg hover:shadow-[#0f2035]/30 transition-all duration-200"
            >
              <ExternalLink className="w-5 h-5" />
              Ver en Maps
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

      {/* Presupuesto Dialog */}
      <Dialog open={showPresupuesto} onOpenChange={setShowPresupuesto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pedir presupuesto</DialogTitle>
            <DialogDescription>
              Contacta con {neg.nombre} para solicitar un presupuesto sin compromiso.
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
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Tu nombre"
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-full px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formErrors.nombre && <p className="text-xs text-destructive mt-1">{formErrors.nombre}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Tel&eacute;fono <span className="text-destructive">*</span>
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Tu teléfono de contacto"
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-full px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formErrors.telefono && <p className="text-xs text-destructive mt-1">{formErrors.telefono}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tu@email.com (opcional)"
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-full px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Describe el servicio que necesitas <span className="text-destructive">*</span>
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Ej: Necesito cambiar la cerradura de mi puerta principal..."
                rows={3}
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-full px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              {formErrors.descripcion && <p className="text-xs text-destructive mt-1">{formErrors.descripcion}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Horario preferido de contacto</label>
              <select
                value={formData.horario_contacto}
                onChange={(e) => setFormData({ ...formData, horario_contacto: e.target.value })}
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-full px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Sin preferencia</option>
                <option value="Mañanas (9:00-13:00)">Mañanas (9:00-13:00)</option>
                <option value="Tardes (13:00-18:00)">Tardes (13:00-18:00)</option>
                <option value="Noches (18:00-21:00)">Noches (18:00-21:00)</option>
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
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
              >
                <FileText className="w-4 h-4" />
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
