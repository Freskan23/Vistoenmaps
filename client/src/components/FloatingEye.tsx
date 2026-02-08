import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import EyeLogo from "@/components/EyeLogo";

/**
 * Mascota flotante — EyeLogo grande fijo en la esquina inferior-derecha.
 * En Home: oculto arriba, desliza desde la derecha al hacer scroll.
 * Oculto en admin/dashboard/login/register/contacto.
 * Siempre visible en el resto de páginas.
 */
export default function FloatingEye() {
  const [location] = useLocation();
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  const isHome = location === "/";

  // Páginas que tienen su propio EyeLogo integrado (no Home)
  const hidden =
    location.startsWith("/admin") ||
    location.startsWith("/dashboard") ||
    location === "/login" ||
    location === "/register" ||
    location === "/contacto";

  // En Home: detectar scroll para mostrar/ocultar
  useEffect(() => {
    if (!isHome) {
      setScrolledPastHero(false);
      return;
    }

    const handleScroll = () => {
      // El hero ocupa ~100vh aprox. Umbral: 60% del viewport
      const threshold = window.innerHeight * 0.6;
      setScrolledPastHero(window.scrollY > threshold);
    };

    // Comprobar estado inicial
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  if (hidden) return null;

  // En Home: mostrar solo si pasó el hero. En resto: siempre visible.
  const visible = isHome ? scrolledPastHero : true;

  return (
    <div
      className="fixed bottom-4 right-4 z-[90] group pointer-events-none transition-transform duration-700 ease-out"
      style={{
        transform: visible ? "translateX(0)" : "translateX(calc(100% + 2rem))",
      }}
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

      {/* Eye — big and proud. Tap opens mobile menu */}
      <div
        className="relative pointer-events-auto cursor-pointer drop-shadow-2xl hover:scale-105 transition-transform duration-300"
        onClick={() => window.dispatchEvent(new CustomEvent("openMobileMenu"))}
      >
        <EyeLogo size={140} glow />
      </div>
    </div>
  );
}
