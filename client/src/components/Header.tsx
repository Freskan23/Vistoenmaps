import { Link, useLocation } from "wouter";
import { Menu, User, ArrowRight, BookOpen, Mail, X, Search, ArrowLeft } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { categorias } from "@/data";
import SearchBar from "@/components/SearchBar";
import CategoryIcon from "@/components/CategoryIcon";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import EyeLogo from "@/components/EyeLogo";

/* ------------------------------------------------------------------ */
/*  Accent colors per category (matches CiudadPage pattern)           */
/* ------------------------------------------------------------------ */
const CAT_ACCENTS = [
  { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", hover: "hover:bg-blue-500/15" },
  { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", hover: "hover:bg-emerald-500/15" },
  { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", hover: "hover:bg-amber-500/15" },
  { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20", hover: "hover:bg-violet-500/15" },
  { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20", hover: "hover:bg-rose-500/15" },
  { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20", hover: "hover:bg-cyan-500/15" },
];

interface HeaderProps {
  variant?: "transparent" | "solid";
}

export default function Header({ variant = "solid" }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  // Open menu from FloatingEye tap
  useEffect(() => {
    const open = () => setMenuOpen(true);
    window.addEventListener("openMobileMenu", open);
    return () => window.removeEventListener("openMobileMenu", open);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, []);

  const isTransparent = variant === "transparent" && !scrolled;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isTransparent
            ? "bg-transparent border-b border-transparent"
            : "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm"
        )}
      >
        <div className="container">
          <div
            className={cn(
              "flex items-center justify-between transition-all duration-300",
              scrolled ? "h-14" : "h-16"
            )}
          >
            {/* Logo — EyeLogo + brand name with fun typography */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="group-hover:scale-105 transition-transform">
                <EyeLogo size={44} />
              </div>
              <div className="flex flex-col leading-none">
                <span className={cn(
                  "text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]",
                  isTransparent ? "text-white/60" : "text-muted-foreground"
                )}>
                  Visto en
                </span>
                <span
                  className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-[#fcc44e] via-[#f5a623] to-[#C45B28] bg-clip-text text-transparent"
                  style={{ fontFamily: "'Outfit', 'Inter', sans-serif", lineHeight: 1.1 }}
                >
                  Maps
                </span>
              </div>
            </Link>

            {/* Search */}
            <div className="hidden md:block w-64">
              <SearchBar variant="header" />
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {categorias.slice(0, 3).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isTransparent
                      ? "text-white/70 hover:text-white"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {cat.nombre}
                </Link>
              ))}
              <Link
                href="/directorios"
                className={cn(
                  "text-sm font-medium transition-colors",
                  isTransparent
                    ? "text-white/70 hover:text-white"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                Directorios
              </Link>

              {isAuthenticated ? (
                <Link
                  href={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all",
                    isTransparent
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  <User className="w-4 h-4" />
                  {user?.role === 'admin' ? 'Admin' : 'Mi Cuenta'}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isTransparent
                      ? "text-white/70 hover:text-white"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  Acceso Negocios
                </Link>
              )}
            </nav>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMenuOpen(true)}
              className={cn(
                "md:hidden p-2 rounded-xl transition-colors",
                isTransparent
                  ? "text-white hover:bg-white/10"
                  : "text-foreground hover:bg-secondary"
              )}
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ================================================================ */}
      {/*  MOBILE MENU — Full-screen dark overlay with EyeLogo             */}
      {/* ================================================================ */}

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={closeMenu}
      />

      {/* Slide-in panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[101] w-[85vw] max-w-[360px] md:hidden",
          "transition-transform duration-300 ease-out",
          menuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Dark gradient background with texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#142d45]">
          {/* Ambient orbs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-32 -left-16 w-56 h-56 bg-cyan-500/6 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Dot grid pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col overflow-x-hidden overflow-y-auto">

          {/* ---- Top bar: Close + Search icon ---- */}
          <div className="flex items-center justify-between px-4 pt-4">
            {/* Search toggle / back button */}
            {searchOpen ? (
              <button
                onClick={() => setSearchOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Volver"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-cyan-400/80 hover:text-cyan-300 hover:bg-white/10 transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* Close button */}
            <button
              onClick={closeMenu}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ---- Search mode: SearchBar + Maper visible ---- */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-400 ease-out",
              searchOpen ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="px-5 pt-4 pb-2 flex items-center gap-3">
              <div className="shrink-0">
                <EyeLogo size={52} />
              </div>
              <div className="flex-1">
                <SearchBar variant="hero" />
              </div>
            </div>
          </div>

          {/* ---- Logo Section (hidden when search is open) ---- */}
          <div
            className={cn(
              "w-full px-6 flex flex-col items-center transition-all duration-400 ease-out",
              searchOpen ? "max-h-0 opacity-0 overflow-hidden pt-0 pb-0" : "max-h-[200px] opacity-100 pt-8 pb-3"
            )}
          >
            <div
              className={cn(
                "transition-all duration-500 ease-out",
                menuOpen && !searchOpen ? "opacity-100 scale-100" : "opacity-0 scale-75"
              )}
              style={{ transitionDelay: menuOpen && !searchOpen ? "200ms" : "0ms" }}
            >
              <EyeLogo size={80} />
            </div>
            <div
              className={cn(
                "w-full mt-2 text-center transition-all duration-500 ease-out",
                menuOpen && !searchOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              )}
              style={{ transitionDelay: menuOpen && !searchOpen ? "300ms" : "0ms" }}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 block">
                Visto en
              </span>
              <span
                className="block text-xl font-black tracking-tight bg-gradient-to-r from-[#fcc44e] via-[#f5a623] to-[#C45B28] bg-clip-text text-transparent"
                style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
              >
                Maps
              </span>
            </div>
          </div>

          {/* ---- Divider ---- */}
          <div className="mx-5 border-t border-white/[0.08]" />

          {/* ---- Categories ---- */}
          <div className="px-5 pt-4 pb-2">
            <p
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3 transition-all duration-400 ease-out",
                menuOpen ? "opacity-100" : "opacity-0"
              )}
              style={{ transitionDelay: menuOpen ? "300ms" : "0ms" }}
            >
              Servicios
            </p>
            <div className="space-y-1.5">
              {categorias.map((cat, i) => {
                const accent = CAT_ACCENTS[i % CAT_ACCENTS.length];
                return (
                  <Link
                    key={cat.slug}
                    href={`/${cat.slug}`}
                    onClick={closeMenu}
                    className={cn(
                      "flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-300 group",
                      accent.hover,
                      menuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
                    )}
                    style={{
                      transitionDelay: menuOpen ? `${320 + i * 50}ms` : "0ms",
                    }}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center border transition-colors duration-300",
                      accent.bg, accent.border
                    )}>
                      <CategoryIcon iconName={cat.icono} className={cn("w-4 h-4", accent.text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                        {cat.nombre}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-300" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ---- Divider ---- */}
          <div className="mx-5 border-t border-white/[0.06] my-2" />

          {/* ---- Extra Links ---- */}
          <div className="px-5 pb-4">
            <div className="space-y-1">
              <Link
                href="/directorios"
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/5 transition-all duration-300 group",
                  menuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
                )}
                style={{ transitionDelay: menuOpen ? `${320 + categorias.length * 50}ms` : "0ms" }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                  <BookOpen className="w-4 h-4 text-white/50" />
                </div>
                <span className="text-sm font-semibold text-white/70 group-hover:text-white/90 transition-colors">
                  Directorios
                </span>
              </Link>
              <Link
                href="/contacto"
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/5 transition-all duration-300 group",
                  menuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
                )}
                style={{ transitionDelay: menuOpen ? `${370 + categorias.length * 50}ms` : "0ms" }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                  <Mail className="w-4 h-4 text-white/50" />
                </div>
                <span className="text-sm font-semibold text-white/70 group-hover:text-white/90 transition-colors">
                  Contacto
                </span>
              </Link>
            </div>
          </div>

          {/* ---- Spacer ---- */}
          <div className="flex-1 min-h-4" />

          {/* ---- Auth CTA (bottom) ---- */}
          <div
            className={cn(
              "px-5 pb-6 transition-all duration-500 ease-out",
              menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: menuOpen ? `${420 + categorias.length * 50}ms` : "0ms" }}
          >
            {isAuthenticated ? (
              <Link
                href={user?.role === 'admin' ? '/admin' : '/dashboard'}
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#fcc44e] via-[#f5a623] to-[#e88d0c] text-[#0a1628] hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300"
              >
                <User className="w-4 h-4" />
                {user?.role === 'admin' ? 'Panel Admin' : 'Mi Cuenta'}
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#fcc44e] via-[#f5a623] to-[#e88d0c] text-[#0a1628] hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300"
              >
                <User className="w-4 h-4" />
                Acceso Negocios
              </Link>
            )}

            {/* Brand tagline */}
            <p className="text-center text-[10px] text-white/20 mt-3 tracking-wide">
              Profesionales verificados en Google Maps
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
