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
    <div className="min-h-screen flex flex-col">
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

      <section className="bg-primary">
        <div className="container py-10 md:py-14">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">Contacto</h1>
              <p className="text-white/70 mt-0.5 text-sm">
                Escríbenos y te responderemos lo antes posible
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-10 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-lg"
        >
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground">
                Nombre <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Tu nombre"
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formErrors.nombre && <p className="text-xs text-destructive mt-1">{formErrors.nombre}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tu@email.com"
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formErrors.email && <p className="text-xs text-destructive mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Asunto <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.asunto}
                onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecciona un asunto</option>
                <option value="Añadir mi negocio">Añadir mi negocio al directorio</option>
                <option value="Sugerencia">Sugerencia de mejora</option>
                <option value="Reportar error">Reportar un error</option>
                <option value="Colaboración">Propuesta de colaboración</option>
                <option value="Otro">Otro</option>
              </select>
              {formErrors.asunto && <p className="text-xs text-destructive mt-1">{formErrors.asunto}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Mensaje <span className="text-destructive">*</span>
              </label>
              <textarea
                value={formData.mensaje}
                onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                placeholder="Cuéntanos en qué podemos ayudarte..."
                rows={5}
                className="mt-1 w-full text-sm bg-secondary border border-border rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              {formErrors.mensaje && <p className="text-xs text-destructive mt-1">{formErrors.mensaje}</p>}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              <Send className="w-5 h-5" />
              Enviar mensaje
            </button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
