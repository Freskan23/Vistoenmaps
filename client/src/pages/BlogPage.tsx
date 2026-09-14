import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Search, MapPin, Star, ChevronRight, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useBlogPosts } from "@/hooks/useBlogPosts";

/**
 * Portada del blog: las guias «los mejores X de Y».
 *
 * ANTES (y por que se rehizo): volcaba las 241 guias de golpe, con decenas de
 * botones de filtro apilados arriba. Edu: «parece cualquier cosa menos util
 * para el usuario». Ademas el HTML que veia Google estaba VACIO: 0 enlaces a
 * las guias, asi que ninguna se encontraba desde aqui.
 *
 * AHORA, pensado para quien busca algo concreto:
 *  - dos desplegables (sector y ciudad), no cincuenta botones
 *  - buscador de texto que filtra por las dos cosas a la vez
 *  - accesos rapidos a las guias con mas opiniones detras
 *  - de 24 en 24, con boton de ver mas
 *  - cada tarjeta dice algo util: cuantos sitios y quien va primero
 */

const POR_PAGINA = 24;

function normalizar(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function BlogPage() {
  const { posts, loaded } = useBlogPosts();
  const loading = !loaded;
  const [texto, setTexto] = useState("");
  const [sector, setSector] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [visibles, setVisibles] = useState(POR_PAGINA);

  const fmt = new Intl.NumberFormat("es-ES");

  const sectores = useMemo(() => {
    const m = new Map<string, string>();
    posts.forEach((p: any) => m.set(p.categoria_slug, p.categoria_nombre));
    return Array.from(m.entries()).sort((a, b) => a[1].localeCompare(b[1], "es"));
  }, [posts]);

  const ciudades = useMemo(() => {
    const m = new Map<string, { nombre: string; n: number }>();
    posts.forEach((p: any) => {
      const e = m.get(p.ciudad_slug);
      if (e) e.n++;
      else m.set(p.ciudad_slug, { nombre: p.ciudad_nombre, n: 1 });
    });
    // primero las ciudades con mas guias: es lo que la gente busca
    return Array.from(m.entries()).sort(
      (a, b) => b[1].n - a[1].n || a[1].nombre.localeCompare(b[1].nombre, "es")
    );
  }, [posts]);

  const filtradas = useMemo(() => {
    const q = normalizar(texto).trim();
    return posts.filter((p: any) => {
      if (sector && p.categoria_slug !== sector) return false;
      if (ciudad && p.ciudad_slug !== ciudad) return false;
      if (!q) return true;
      const heno = normalizar(p.categoria_nombre + " " + p.ciudad_nombre + " " + p.titulo);
      return q.split(/\s+/).every((palabra) => heno.includes(palabra));
    });
  }, [posts, texto, sector, ciudad]);

  // Accesos rapidos: las guias con mas opiniones acumuladas = las mas utiles
  const destacadas = useMemo(() => posts.slice(0, 6), [posts]);

  const hayFiltro = Boolean(texto || sector || ciudad);
  const mostradas = filtradas.slice(0, visibles);

  const limpiar = () => {
    setTexto("");
    setSector("");
    setCiudad("");
    setVisibles(POR_PAGINA);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title="Guías: los mejores de cada ciudad | Visto en Maps"
        description="Guías de los mejores negocios y sitios de cada ciudad de España, ordenados por las valoraciones publicadas en Google Maps."
        canonical="https://vistoenmaps.com/blog"
      />
      <Header />

      {/* Cabecera: directa, sin adornos que estorben */}
      <section className="bg-primary text-primary-foreground">
        <div className="container py-10 md:py-14">
          <p className="text-[11px] font-bold uppercase tracking-widest text-accent">
            Guías
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold leading-tight max-w-2xl">
            Los mejores de cada ciudad
          </h1>
          <p className="mt-3 text-primary-foreground/80 max-w-xl leading-relaxed">
            {loading
              ? "Cargando guías…"
              : `${fmt.format(posts.length)} guías ordenadas por las valoraciones publicadas en Google Maps, teniendo en cuenta cuánta gente ha opinado.`}
          </p>
          <Link
            href="/criterios"
            className="mt-3 inline-flex items-center gap-1 text-sm text-accent font-semibold hover:underline"
          >
            Cómo las ordenamos
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <main className="container py-8 flex-1">
        {/* ===== Buscar: un campo de texto y dos desplegables ===== */}
        <div className="rounded-2xl border border-border/60 bg-white p-4 md:p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value);
                  setVisibles(POR_PAGINA);
                }}
                placeholder="Buscar: fontaneros Málaga, parques Madrid…"
                aria-label="Buscar guía por sector o ciudad"
                className="w-full h-11 pl-9 pr-3 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary"
              />
            </div>

            <select
              value={sector}
              onChange={(e) => {
                setSector(e.target.value);
                setVisibles(POR_PAGINA);
              }}
              aria-label="Filtrar por sector"
              className="h-11 px-3 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary min-w-[9.5rem]"
            >
              <option value="">Todos los sectores</option>
              {sectores.map(([slug, nombre]) => (
                <option key={slug} value={slug}>
                  {nombre}
                </option>
              ))}
            </select>

            <select
              value={ciudad}
              onChange={(e) => {
                setCiudad(e.target.value);
                setVisibles(POR_PAGINA);
              }}
              aria-label="Filtrar por ciudad"
              className="h-11 px-3 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary min-w-[9.5rem]"
            >
              <option value="">Todas las ciudades</option>
              {ciudades.map(([slug, info]) => (
                <option key={slug} value={slug}>
                  {info.nombre}
                </option>
              ))}
            </select>
          </div>

          {hayFiltro && (
            <div className="mt-3 flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">
                {filtradas.length === 0
                  ? "Ninguna guía coincide"
                  : `${fmt.format(filtradas.length)} ${filtradas.length === 1 ? "guía" : "guías"}`}
              </span>
              <button
                onClick={limpiar}
                className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
              >
                <X className="w-3.5 h-3.5" />
                Quitar filtros
              </button>
            </div>
          )}
        </div>

        {/* ===== Accesos rapidos (solo sin filtrar) ===== */}
        {!hayFiltro && destacadas.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Las más consultadas
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {destacadas.map((p: any) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-2 text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  {p.categoria_nombre} en {p.ciudad_nombre}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ===== Listado ===== */}
        <section className="mt-8">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-2xl border border-border/60 bg-white animate-pulse"
                />
              ))}
            </div>
          ) : filtradas.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-white p-8 text-center">
              <p className="font-semibold text-foreground">
                No hay ninguna guía con esa búsqueda
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Prueba con otro sector o con una ciudad más grande. Solo
                publicamos guía cuando hay suficientes negocios comprobados.
              </p>
              <button
                onClick={limpiar}
                className="mt-4 inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Ver todas las guías
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mostradas.map((p: any) => {
                  const primero = p.negocios?.[0];
                  return (
                    <Link
                      key={p.slug}
                      href={`/blog/${p.slug}`}
                      className="group rounded-2xl border border-border/60 bg-white p-5 hover:border-primary/40 hover:shadow-sm transition-all flex flex-col"
                    >
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-accent">
                        <MapPin className="w-3.5 h-3.5" />
                        {p.ciudad_nombre}
                      </div>
                      <h3 className="mt-2 font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                        {p.titulo}
                      </h3>

                      {primero ? (
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                          Encabeza <strong className="text-foreground">{primero.nombre}</strong>
                          {primero.valoracion_media ? (
                            <>
                              {" "}
                              <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {String(primero.valoracion_media).replace(".", ",")}
                              </span>
                              {primero.num_resenas ? (
                                <span className="text-muted-foreground">
                                  {" "}
                                  ({fmt.format(primero.num_resenas)} opiniones)
                                </span>
                              ) : null}
                            </>
                          ) : null}
                        </p>
                      ) : null}

                      <span className="mt-auto pt-3 text-xs font-semibold text-muted-foreground">
                        {p.numNegocios} {p.numNegocios === 1 ? "sitio" : "sitios"} comparados
                      </span>
                    </Link>
                  );
                })}
              </div>

              {visibles < filtradas.length && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setVisibles((v) => v + POR_PAGINA)}
                    className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Ver más guías
                  </button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {fmt.format(mostradas.length)} de {fmt.format(filtradas.length)}
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
