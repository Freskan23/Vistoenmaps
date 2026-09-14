import { useState } from "react";
import { Mail, Send, MessageCircle, Heart, Loader2, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import EyeLogo from "@/components/EyeLogo";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: "",
    empresa: "", // trampa anti-robots: una persona nunca lo ve ni lo rellena
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.nombre.trim()) errors.nombre = "Dinos cómo te llamas";
    if (!formData.email.trim()) {
      errors.email = "Necesitamos tu correo para contestarte";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim())) {
      errors.email = "Ese correo no parece válido";
    }
    if (!formData.asunto) errors.asunto = "Elige un asunto";
    if (!formData.mensaje.trim()) {
      errors.mensaje = "Cuéntanos qué necesitas";
    } else if (formData.mensaje.trim().length < 10) {
      errors.mensaje = "Escribe un poco más para poder ayudarte";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * ANTES esto no enviaba NADA: montaba un `mailto:` y abria el programa de
   * correo del visitante. En el movil abre una app sin configurar, en el
   * ordenador abre Outlook aunque se use Gmail, y si no hay cliente de correo
   * no pasa nada. Mensajes perdidos y sensacion de web rota.
   * AHORA se envia de verdad contra /api/contacto (Resend).
   */
  const handleSubmit = async () => {
    if (enviando || !validateForm()) return;
    setEnviando(true);
    try {
      const r = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const datos = await r.json().catch(() => ({}));

      if (!r.ok) {
        toast.error(datos.error || "No hemos podido enviarlo. Inténtalo en unos minutos.");
        return;
      }
      setEnviado(true);
      setFormData({ nombre: "", email: "", asunto: "", mensaje: "", empresa: "" });
      toast.success("Mensaje enviado. Te hemos mandado una copia.");
    } catch {
      toast.error("Parece que no hay conexión. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contacto — Visto en Maps",
    description: "Contacta con el equipo de Visto en Maps. Sugerencias, añadir tu negocio o reportar errores.",
    url: "https://vistoenmaps.com/contacto",
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title="Contacto | Visto en Maps"
        description="Contacta con el equipo de Visto en Maps. Sugerencias, añadir tu negocio al directorio o reportar errores."
        canonical="https://vistoenmaps.com/contacto"
      />
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Hero section with dramatic gradient, ambient orbs, and wave separator */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#142d45]">
        {/* Ambient orbs */}
        <div className="absolute top-[-80px] left-[-60px] w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-40px] right-[-40px] w-56 h-56 bg-cyan-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container relative z-10 py-14 md:py-20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Contacto
              </h1>
              <p className="text-white/60 mt-1 text-sm md:text-base">
                Escríbenos y te responderemos lo antes posible
              </p>
            </div>
          </div>
        </div>

        {/* Wave SVG separator */}
        <div className="absolute bottom-0 left-0 w-full leading-[0]">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path
              d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z"
              fill="#fafaf7"
            />
          </svg>
        </div>
      </section>

      {/* Form + Eye section */}
      <section className="container py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left: Form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-6 md:p-8">
              {/*
                CONFIRMACION. Antes, tras pulsar Enviar solo salia un aviso
                pasajero ("Abriendo tu cliente de correo") y el formulario se
                quedaba igual: nadie sabia si habia llegado. Ahora el formulario
                se sustituye por una confirmacion clara.
              */}
              {enviado ? (
                <div className="py-8 text-center">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="mt-4 text-xl font-extrabold text-foreground">
                    Mensaje enviado
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    Te hemos mandado una copia a tu correo. Te contestamos lo
                    antes posible, normalmente en menos de 48 horas.
                  </p>
                  <button
                    onClick={() => setEnviado(false)}
                    className="mt-5 text-sm font-semibold text-primary hover:underline"
                  >
                    Escribir otro mensaje
                  </button>
                </div>
              ) : (
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Tu nombre"
                    className="mt-1.5 w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                  />
                  {formErrors.nombre && <p className="text-xs text-red-500 mt-1">{formErrors.nombre}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@email.com"
                    className="mt-1.5 w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                  />
                  {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Asunto <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.asunto}
                    onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                    className="mt-1.5 w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="Añadir mi negocio">Añadir mi negocio al directorio</option>
                    <option value="Sugerencia">Sugerencia de mejora</option>
                    <option value="Reportar error">Reportar un error</option>
                    <option value="Colaboración">Propuesta de colaboración</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {formErrors.asunto && <p className="text-xs text-red-500 mt-1">{formErrors.asunto}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Mensaje <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    placeholder="Cuéntanos en qué podemos ayudarte..."
                    rows={5}
                    className="mt-1.5 w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all resize-none"
                  />
                  {formErrors.mensaje && <p className="text-xs text-red-500 mt-1">{formErrors.mensaje}</p>}
                </div>

                {/* Trampa anti-robots: invisible para una persona. Si llega
                    relleno, el servidor descarta el mensaje en silencio. */}
                <input
                  type="text"
                  name="empresa"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
                />

                <button
                  onClick={handleSubmit}
                  disabled={enviando}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0f2035] to-[#1a3a5c] text-white font-semibold py-3.5 rounded-full hover:from-[#142d45] hover:to-[#1f4468] shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar mensaje
                    </>
                  )}
                </button>

                <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                  Te contestamos al correo que nos dejes, normalmente en menos de
                  48 horas. No lo usamos para nada más.
                </p>
              </div>
              )}
            </div>
          </motion.div>

          {/* Right: EyeLogo companion */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:flex flex-col items-center justify-center sticky top-28"
          >
            <div className="flex flex-col items-center gap-6">
              {/* The eye — big, watching the form, happy */}
              <div className="relative">
                <EyeLogo size={220} glow />
              </div>

              {/* Friendly message */}
              <div className="text-center max-w-[260px]">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-cyan-500" />
                  <span className="text-sm font-bold text-gray-800">
                    Te escuchamos
                  </span>
                  <Heart className="w-4 h-4 text-rose-400" />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Nuestro equipo revisa cada mensaje personalmente.
                  Responderemos lo antes posible.
                </p>
              </div>

              {/* Subtle stats */}
              <div className="flex gap-6 mt-2">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800">&lt; 24h</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Respuesta</p>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800">100%</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Leídos</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
