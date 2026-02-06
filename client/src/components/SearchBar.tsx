import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Tag, Building2, Store } from "lucide-react";
import { Link } from "wouter";
import { searchDirectory, type SearchResult } from "@/data";

const typeIcons: Record<SearchResult["type"], typeof Search> = {
  negocio: Store,
  categoria: Tag,
  ciudad: Building2,
  barrio: MapPin,
};

interface SearchBarProps {
  variant?: "hero" | "header";
}

export default function SearchBar({ variant = "header" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(searchDirectory(query));
    setIsOpen(query.length >= 2);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isHero = variant === "hero";

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={
          isHero
            ? "flex items-center gap-3 bg-white/12 backdrop-blur-md rounded-full px-5 h-14 border border-white/20 shadow-lg"
            : "flex items-center gap-2 bg-secondary rounded-full px-4 py-2"
        }
      >
        <Search
          className={
            isHero ? "w-5 h-5 text-white/60" : "w-4 h-4 text-muted-foreground"
          }
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Buscar servicio o profesional..."
          className={
            isHero
              ? "flex-1 bg-transparent text-white placeholder:text-white/50 text-base outline-none"
              : "flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
          }
        />
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/60 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
          {results.map((result, i) => {
            const Icon = typeIcons[result.type];
            return (
              <Link
                key={`${result.type}-${result.href}-${i}`}
                href={result.href}
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
              >
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors cursor-pointer border-b border-border/30 last:border-b-0">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {result.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.sublabel}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/60 rounded-xl shadow-xl z-50 p-4">
          <p className="text-sm text-muted-foreground text-center">
            No se encontraron resultados para "{query}"
          </p>
        </div>
      )}
    </div>
  );
}
