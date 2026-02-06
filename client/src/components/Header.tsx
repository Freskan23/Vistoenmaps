import { Link } from "wouter";
import { MapPin, Menu, X } from "lucide-react";
import { useState } from "react";
import { categorias } from "@/data";
import SearchBar from "@/components/SearchBar";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-primary/10">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-foreground tracking-tight">
                Visto en Maps
              </span>
            </div>
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
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {cat.nombre}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-border py-4 space-y-2">
            {categorias.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="block py-2 px-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.nombre}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
