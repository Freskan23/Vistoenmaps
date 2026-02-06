import { Link } from "wouter";
import { MapPin, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { categorias } from "@/data";
import SearchBar from "@/components/SearchBar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface HeaderProps {
  variant?: "transparent" | "solid";
}

export default function Header({ variant = "solid" }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isTransparent = variant === "transparent" && !scrolled;

  return (
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
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <span
              className={cn(
                "text-lg font-bold tracking-tight transition-colors",
                isTransparent ? "text-white" : "text-foreground"
              )}
            >
              Visto en Maps
            </span>
          </Link>

          {/* Search */}
          <div className="hidden md:block w-64">
            <SearchBar variant="header" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {categorias.slice(0, 4).map((cat) => (
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
          </nav>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "md:hidden p-2 rounded-xl transition-colors",
                  isTransparent
                    ? "text-white hover:bg-white/10"
                    : "text-foreground hover:bg-secondary"
                )}
                aria-label="Menú"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-1 mt-8">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  Categorías
                </p>
                {categorias.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/${cat.slug}`}
                    className="block py-2.5 px-3 text-sm font-medium text-foreground hover:text-primary hover:bg-secondary rounded-xl transition-colors"
                  >
                    {cat.nombre}
                  </Link>
                ))}
                <div className="border-t border-border/50 my-3" />
                <Link
                  href="/contacto"
                  className="block py-2.5 px-3 text-sm font-medium text-foreground hover:text-primary hover:bg-secondary rounded-xl transition-colors"
                >
                  Contacto
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
