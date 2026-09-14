import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Search, Phone, Clock, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import indice from "@/data/costesIndice.json";

/**
 * Indice de las guias "antes de contratar".
 *
 * Solo aparecen las combinaciones sector+ciudad con 12 o mas profesionales Y con
 * datos utiles (telefonos u horarios). Sin ese filtro salian cosas como las 604
 * inmobiliarias de Madrid, todas sin telefono, sin horario y sin web: una guia
 * asi no ayuda a nadie.
 */

const fmt = new Intl.NumberFormat("es-ES");

function normalizar(s: string) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export default function CostesIndicePage() {
  const [texto, setTexto] = useState("");
  const lista = indice as any[];

  const filtradas = useMemo(() => {
    const q = normalizar(texto).trim();
    if (!q) return lista;
    return lista.filter((g) => {
      const heno = normalizar(g.categoria_nombre + " " + g.ciudad_nombre);
      return q.split(/\s+/).every((p) => heno.includes(p));
    });
  }, [lista, texto]);

  const porSector = useMemo(() => {
    const m = new Map<string, any[]>();
    filtradas.forEach((g) => {
      const l = m.get(g.categoria_nombre) || [];
      l.push(g);
      m.set(g.categoria_nombre, l);
    });
    return Array.from(m.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [filtradas]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7]">
      <SEOHead
        title="Antes de contratar: qué preguntar y cuántos hay en tu ciudad | Visto en Maps"
        description="Guías por sector y ciudad: cuántos profesionales hay, cuántos atienden urgencias, qué preguntar antes de contratar y cómo detectar un sobreprecio."
        canonical="https://vistoenmaps.com/precios"
      />
      <Header />

      <section className="bg-primary text-primary-foreground">
        <div className="container py-10 md:py-14">
          <p className="text-[11px] font-bold uppercase tracking-widest text-accent">
            Antes de contratar
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold leading-tight max-w-2xl">
            Qué preguntar antes de llamar a un profesional
          </h1>
          <p className="mt-3 text-primary-foreground/80 max-w-2xl leading-relaxed">
            {fmt.format(lista.length)} guías por sector y ciudad: cuánta
            competencia hay, cuántos atienden urgencias, qué preguntar por
            teléfono y cómo detectar que te están clavando.
          </p>
        </div>
      </section>

      <main className="container py-8 flex-1">
        <div className="rounded-2xl border border-border/60 bg-white p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Buscar: cerrajeros Madrid, reformas Barcelona…"
              aria-label="Buscar guía por sector o ciudad"
              className="w-full h-11 pl-9 pr-3 rounded-xl border border-border bg-white text-sm outline-none focus:border-primary"
            />
          </div>
          {texto && (
            <p className="mt-3 text-sm text-muted-foreground">
              {filtradas.length === 0
                ? "Ninguna guía coincide"
                : `${filtradas.length} ${filtradas.length === 1 ? "guía" : "guías"}`}
            </p>
          )}
        </div>

        {porSector.map(([sector, guias]) => (
          <section key={sector} className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {sector}
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {guias.map((g) => (
                <Link
                  key={g.slug}
                  href={`/precios/${g.slug}`}
                  className="group rounded-2xl border border-border/60 bg-white p-4 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {g.categoria_nombre} en {g.ciudad_nombre}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {fmt.format(g.total)} profesionales · {String(g.media).replace(".", ",")} de media
                  </p>
                  {g.urgencias > 0 && (
                    <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-accent">
                      <Clock className="w-3 h-3" />
                      {g.urgencias} atienden 24 horas
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))}

        <p className="mt-10 text-xs text-muted-foreground max-w-2xl leading-relaxed">
          Solo publicamos guía cuando hay al menos 12 profesionales y datos
          suficientes para que sirva de algo. No incluimos tarifas porque no las
          tenemos: las fichas de Google Maps no las publican.{" "}
          <Link href="/criterios" className="text-primary font-semibold hover:underline">
            Cómo trabajamos con los datos
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
