import { useState } from "react";
import { useLocation } from "wouter";
import EyeLogo from "@/components/EyeLogo";

/**
 * Mascota flotante — EyeLogo fijo en la esquina inferior-derecha.
 * Siempre visible en páginas públicas, oculto en admin/dashboard.
 * Click para expandir/contraer con un sutil bounce.
 */
export default function FloatingEye() {
  const [location] = useLocation();
  const [expanded, setExpanded] = useState(false);

  // No mostrar en admin, dashboard, login, register
  const hidden =
    location.startsWith("/admin") ||
    location.startsWith("/dashboard") ||
    location === "/login" ||
    location === "/register";

  if (hidden) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[90] group"
      style={{ pointerEvents: "auto" }}
    >
      {/* Glow ring behind */}
      <div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle, rgba(0,210,235,0.15) 0%, transparent 70%)",
          transform: "scale(2.2)",
          pointerEvents: "none",
        }}
      />

      {/* Eye container */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-[#fcc44e]/90 via-[#f5a623]/90 to-[#C45B28]/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300 border border-white/20"
        style={{
          width: expanded ? 72 : 52,
          height: expanded ? 72 : 52,
          transition: "width 0.3s ease-out, height 0.3s ease-out, box-shadow 0.3s ease-out",
        }}
        aria-label="Visto en Maps"
      >
        <EyeLogo size={expanded ? 64 : 46} />
      </button>
    </div>
  );
}
