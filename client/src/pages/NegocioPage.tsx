import { useState, useCallback, useRef } from "react";
import { useParams } from "wouter";
import { Star, Phone, Clock, MapPin, ExternalLink, ArrowLeft, FileText, MessageCircle } from "lucide-react";
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
  const ciu = getCiudad(ciudad);
  const bar = getBarrio(barrio, ciudad);
  const neg = getNegocio(categoria, ciudad, barrio, negocioSlug);

  if (!cat || !ciu || !bar || !neg) return <NotFound />;

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

          {/* Map */}
          <div className="mb-6 rounded-lg overflow-hidden border-2 border-border">
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
                  className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-md font-medium"
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
              className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Phone className="w-5 h-5" />
              Llamar ahora
            </a>
            <button
              onClick={() => setShowPresupuesto(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <FileText className="w-5 h-5" />
              Pedir presupuesto
            </button>
            <a
              href={neg.url_google_maps}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
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
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formErrors.nombre && <p className="text-xs text-destructive mt-1">{formErrors.nombre}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Teléfono <span className="text-destructive">*</span>
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Tu teléfono de contacto"
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              {formErrors.descripcion && <p className="text-xs text-destructive mt-1">{formErrors.descripcion}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Horario preferido de contacto</label>
              <select
                value={formData.horario_contacto}
                onChange={(e) => setFormData({ ...formData, horario_contacto: e.target.value })}
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Enviar por WhatsApp
              </button>
              <button
                onClick={handleEmail}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm"
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
