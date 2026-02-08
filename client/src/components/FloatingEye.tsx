import { useLocation } from "wouter";
import EyeLogo from "@/components/EyeLogo";

/**
 * Mascota flotante — EyeLogo grande fijo en la esquina inferior-derecha.
 * Siempre visible en páginas públicas, oculto en admin/dashboard.
 */
export default function FloatingEye() {
  const [location] = useLocation();

  // No mostrar en páginas que tienen su propio EyeLogo integrado
  const hidden =
    location.startsWith("/admin") ||
    location.startsWith("/dashboard") ||
    location === "/login" ||
    location === "/register" ||
    location === "/contacto" ||
    location === "/";

  if (hidden) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[90] group pointer-events-none"
    >
      {/* Glow aura */}
      <div
        className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: "radial-gradient(circle, rgba(0,210,235,0.18) 0%, rgba(252,196,78,0.08) 40%, transparent 70%)",
          transform: "scale(2.5) translate(10%, 10%)",
          pointerEvents: "none",
        }}
      />

      {/* Eye — big and proud */}
      <div className="relative pointer-events-auto cursor-pointer drop-shadow-2xl hover:scale-105 transition-transform duration-300">
        <EyeLogo size={140} glow />
      </div>
    </div>
  );
}
