import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Tag, Building2, Store, LocateFixed, LoaderCircle } from "lucide-react";
import { Link } from "wouter";
import { searchDirectory, type SearchResult } from "@/data";
import { useSearchNegocios } from "@/hooks/useSupabaseNegocios";
import { useUserLocation } from "@/context/UserLocationContext";

const typeIcons: Record<SearchResult["type"], typeof Search> = {
  negocio: Store,
  categoria: Tag,
  ciudad: Building2,
  barrio: MapPin,
};

interface SearchBarProps {
  variant?: "hero" | "header";
}

function distanceLabel(km?: number): string {
  if (km === undefined) return "";
  if (km < 1) return ` · a ${Math.max(100, Math.round(km * 1000 / 100) * 100)} m`;
  return ` · a ${Math.round(km)} km`;
}

export default function SearchBar({ variant = "header" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const allNegocios = useSearchNegocios();
  const { point, nearestCity, status, requestLocation } = useUserLocation();

  useEffect(() => {
    setResults(searchDirectory(query, 10, allNegocios, point));
    setIsOpen(query.length >= 2);
  }, [query, allNegocios, point]);

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
  const locating = status === "requesting";
  const locationText = nearestCity?.nombre || (status === "denied" ? "Dar permiso" : "Cerca de mí");
  const placeholder = nearestCity
    ? `Buscar cerca de ${nearestCity.nombre}...`
    : "Buscar servicio o profesional...";

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2">
        <div
          className={
            isHero
              ? "flex flex-1 min-w-0 items-center gap-3 bg-white/12 backdrop-blur-md rounded-full px-5 h-14 border border-white/20 shadow-lg"
              : "flex flex-1 min-w-0 items-center gap-2 bg-secondary rounded-full px-4 py-2"
          }
        >
          <Search
            className={
              isHero ? "w-5 h-5 text-white/60 shrink-0" : "w-4 h-4 text-muted-foreground shrink-0"
            }
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder={placeholder}
            aria-label="Buscar servicios, profesionales o ciudades"
            className={
              isHero
                ? "min-w-0 flex-1 bg-transparent text-white placeholder:text-white/50 text-base outline-none"
                : "min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
            }
          />
        </div>

        <button
          type="button"
          onClick={requestLocation}
          disabled={locating}
          aria-label={nearestCity ? `Ubicación detectada: ${nearestCity.nombre}` : "Usar mi ubicación"}
          title={nearestCity ? `Buscando primero cerca de ${nearestCity.nombre}` : "Usar mi ubicación"}
          className={
            isHero
              ? "h-14 max-w-[148px] shrink-0 flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 text-sm font-semibold text-white/85 backdrop-blur-md transition hover:bg-white/20 disabled:opacity-60"
              : "h-9 max-w-[130px] shrink-0 flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 text-xs font-semibold text-foreground shadow-sm transition hover:border-primary/40 hover:bg-secondary disabled:opacity-60"
          }
        >
          {locating ? (
            <LoaderCircle className="h-4 w-4 animate-spin shrink-0" />
          ) : (
            <LocateFixed className={nearestCity ? "h-4 w-4 text-emerald-500 shrink-0" : "h-4 w-4 text-primary shrink-0"} />
          )}
          <span className="truncate">{locating ? "Localizando" : locationText}</span>
        </button>
      </div>

      {status === "denied" && (
        <p className={isHero ? "mt-2 px-4 text-xs text-amber-200/90" : "mt-1 px-3 text-[11px] text-amber-700"}>
          Activa la ubicación del navegador para ver primero lo que tienes cerca.
        </p>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/60 rounded-xl shadow-xl z-[120] max-h-80 overflow-y-auto">
          {nearestCity && (
            <div className="flex items-center gap-2 border-b border-border/50 bg-emerald-500/5 px-4 py-2 text-xs font-medium text-emerald-700">
              <LocateFixed className="h-3.5 w-3.5" />
              Primero, resultados cerca de {nearestCity.nombre}
            </div>
          )}
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
                    <p className="text-sm font-medium text-foreground truncate">{result.label}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.sublabel}{distanceLabel(result.distanceKm)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/60 rounded-xl shadow-xl z-[120] p-4">
          <p className="text-sm text-muted-foreground text-center">
            No se encontraron resultados para "{query}"
          </p>
        </div>
      )}
    </div>
  );
}
