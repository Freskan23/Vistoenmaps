import { useState } from "react";
import { Mail, Send } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.nombre.trim()) errors.nombre = "El nombre es obligatorio";
    if (!formData.email.trim()) errors.email = "El email es obligatorio";
    if (!formData.asunto) errors.asunto = "Selecciona un asunto";
    if (!formData.mensaje.trim()) errors.mensaje = "El mensaje es obligatorio";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const subject = `[Visto en Maps] ${formData.asunto}`;
    const body = [
      `Nombre: ${formData.nombre}`,
      `Email: ${formData.email}`,
      `Asunto: ${formData.asunto}`,
      ``,
      `Mensaje:`,
      formData.mensaje,
    ].join("\n");

    window.location.href = `mailto:contacto@vistoenmaps.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.success("Abriendo tu cliente de correo...");
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

      {/* Form section */}
      <section className="container py-10 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-lg"
        >
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-6 md:p-8">
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

              <button
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0f2035] to-[#1a3a5c] text-white font-semibold py-3.5 rounded-full hover:from-[#142d45] hover:to-[#1f4468] shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Send className="w-5 h-5" />
                Enviar mensaje
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
